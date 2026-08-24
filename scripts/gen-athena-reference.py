"""
Reference vectors for app/utils/athena.ts.

Transcribed from ATHENA-TIR (athena.ipynb): Solution.get_confidence_metrics,
Solution.evidence_strength, and TokenSurpriseEnsembler.

    python scripts/gen-athena-reference.py > scripts/athena-reference.json
"""

import json
import math

BASE_CONFIDENCE = 0.80
EVIDENCE_WEIGHTS = {
    "mean_confidence": 0.25,
    "geometric_confidence": 0.35,
    "critical_token_confidence": 0.40,
}


def clip(x, lo, hi):
    return max(lo, min(hi, x))


def confidence_metrics(confidences, surprises):
    """Aggregate token-level metrics. `confidences` are top-k concentrations."""
    if not confidences:
        return {
            "mean_confidence": BASE_CONFIDENCE,
            "mean_surprise": 1.0,
            "surprise_variance": 0.0,
            "geometric_confidence": BASE_CONFIDENCE,
            "min_confidence": BASE_CONFIDENCE,
            "critical_token_confidence": BASE_CONFIDENCE,
        }
    n = len(confidences)
    mean_c = sum(confidences) / n
    mean_s = sum(surprises) / len(surprises)
    var_s = sum((s - mean_s) ** 2 for s in surprises) / len(surprises)
    geo = math.exp(sum(math.log(c + 1e-10) for c in confidences) / n)
    # Critical tokens: the last 25% usually contain the answer.
    n_crit = max(1, n // 4)
    crit = confidences[-n_crit:]
    return {
        "mean_confidence": mean_c,
        "mean_surprise": mean_s,
        "surprise_variance": var_s,
        "geometric_confidence": geo,
        "min_confidence": min(confidences),
        "critical_token_confidence": sum(crit) / len(crit),
    }


def evidence_strength(metrics):
    evidence = sum(w * metrics[k] for k, w in EVIDENCE_WEIGHTS.items())
    penalty = clip(metrics["surprise_variance"] / 10.0, 0.0, 0.3)
    return evidence * (1.0 - penalty)


def diversity_bonus(solutions):
    prompts_per_answer = {}
    for s in solutions:
        prompts_per_answer.setdefault(s["answer"], set()).add(s["prompt"])
    total = len({s["prompt"] for s in solutions})
    if total <= 1:
        return {a: 1.0 for a in prompts_per_answer}
    return {
        a: 1.0 + 0.5 * math.log1p((len(p) / total) * 3)
        for a, p in prompts_per_answer.items()
    }


def ensemble(solutions, beta=0.15, prior_strength=1.5):
    if not solutions:
        return {}
    by_answer = {}
    for s in solutions:
        by_answer.setdefault(s["answer"], []).append(s["evidence"])
    bonus = diversity_bonus(solutions)

    pseudocount = prior_strength / len(by_answer)
    prior = {a: pseudocount for a in by_answer}

    log_likelihoods = {}
    for a, ev in by_answer.items():
        scaled = [e * bonus.get(a, 1.0) / beta for e in ev]
        m = max(scaled)
        log_likelihoods[a] = m + math.log(sum(math.exp(x - m) for x in scaled))

    max_ll = max(log_likelihoods.values())
    unnorm = {a: math.exp(ll - max_ll) * prior[a] for a, ll in log_likelihoods.items()}
    z = sum(unnorm.values())
    return {a: v / z for a, v in unnorm.items()}


TOKEN_CASES = {
    "confident": ([0.95] * 8 + [0.98] * 4, [0.05] * 12),
    "wobbly": ([0.9, 0.4, 0.85, 0.3, 0.92, 0.35, 0.88, 0.45], [0.1, 2.0, 0.2, 2.5, 0.1, 2.2, 0.15, 1.9]),
    "late_collapse": ([0.95] * 8 + [0.30] * 4, [0.05] * 8 + [2.5] * 4),
    "late_certain": ([0.40] * 8 + [0.97] * 4, [2.0] * 8 + [0.03] * 4),
}

SOLUTION_SETS = {
    "consensus": [
        {"answer": 42, "prompt": p, "evidence": e}
        for p, e in [(0, 0.80), (1, 0.78), (2, 0.82), (3, 0.79), (4, 0.81)]
    ],
    "single_prompt_repeat": [
        {"answer": 42, "prompt": 0, "evidence": e} for e in (0.80, 0.79, 0.81, 0.78, 0.80)
    ] + [{"answer": 17, "prompt": 1, "evidence": 0.76}],
    "diverse_minority": [
        {"answer": 42, "prompt": 0, "evidence": 0.85},
        {"answer": 42, "prompt": 0, "evidence": 0.84},
        {"answer": 42, "prompt": 0, "evidence": 0.86},
        {"answer": 17, "prompt": 1, "evidence": 0.72},
        {"answer": 17, "prompt": 2, "evidence": 0.71},
        {"answer": 17, "prompt": 3, "evidence": 0.73},
    ],
}


def main():
    out = {"tokenCases": {}, "solutionSets": {}, "constants": {
        "beta": 0.15, "priorStrength": 1.5, "baseConfidence": BASE_CONFIDENCE,
        "evidenceWeights": EVIDENCE_WEIGHTS}}
    for name, (conf, surp) in TOKEN_CASES.items():
        m = confidence_metrics(conf, surp)
        out["tokenCases"][name] = {
            "confidences": conf, "surprises": surp,
            "metrics": m, "evidence": evidence_strength(m),
        }
    for name, sols in SOLUTION_SETS.items():
        out["solutionSets"][name] = {
            "solutions": sols,
            "diversityBonus": {str(k): v for k, v in diversity_bonus(sols).items()},
            "posteriors": {str(k): v for k, v in ensemble(sols).items()},
            "posteriorsNoBonus": {
                str(k): v for k, v in ensemble(
                    [dict(s) for s in sols], beta=0.15, prior_strength=1.5
                ).items()
            },
        }
    # Does prior_strength change anything? Uniform prior cancels on normalisation.
    base = ensemble(SOLUTION_SETS["diverse_minority"], prior_strength=1.5)
    alt = ensemble(SOLUTION_SETS["diverse_minority"], prior_strength=99.0)
    out["priorInertness"] = {
        "priorStrength1_5": {str(k): v for k, v in base.items()},
        "priorStrength99": {str(k): v for k, v in alt.items()},
        "identical": all(abs(base[k] - alt[k]) < 1e-12 for k in base),
    }
    print(json.dumps(out))


if __name__ == "__main__":
    main()
