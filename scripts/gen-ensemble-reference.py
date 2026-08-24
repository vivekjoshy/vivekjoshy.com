"""
Reference vectors for app/utils/ensemble.ts.

    python scripts/gen-ensemble-reference.py > scripts/ensemble-reference.json
"""

import json
import math

EPS = 1e-12


def normalise(xs):
    s = sum(xs)
    return [1 / len(xs)] * len(xs) if s <= 0 else [x / s for x in xs]


def entropy(p):
    return -sum(x * math.log(x) for x in p if x > 0)


def normalised_entropy(p):
    m = math.log(len(p))
    return entropy(p) / m if m > 0 else 0.0


def entropy_weights(experts):
    conf = [1 - normalised_entropy(e) for e in experts]
    s = sum(conf)
    return [1 / len(experts)] * len(experts) if s <= EPS else [c / s for c in conf]


def linear_pool(experts, weights):
    k = len(experts[0])
    out = [0.0] * k
    for w, e in zip(weights, experts):
        for j in range(k):
            out[j] += w * e[j]
    return normalise(out)


def log_pool(experts, weights):
    k = len(experts[0])
    logs = [0.0] * k
    for w, e in zip(weights, experts):
        for j in range(k):
            logs[j] += w * math.log(max(e[j], EPS))
    m = max(logs)
    return normalise([math.exp(l - m) for l in logs])


CASES = {
    "concordant": [[0.70, 0.20, 0.07, 0.03], [0.65, 0.25, 0.07, 0.03], [0.72, 0.18, 0.07, 0.03]],
    "split": [[0.80, 0.10, 0.05, 0.05], [0.05, 0.85, 0.05, 0.05], [0.75, 0.15, 0.05, 0.05]],
    "confident_outlier": [[0.55, 0.30, 0.10, 0.05], [0.50, 0.35, 0.10, 0.05], [0.02, 0.02, 0.02, 0.94]],
    "one_abstains": [[0.85, 0.08, 0.04, 0.03], [0.80, 0.12, 0.05, 0.03], [0.25, 0.25, 0.25, 0.25]],
    "veto": [[0.90, 0.05, 0.03, 0.02], [0.88, 0.06, 0.04, 0.02], [0.0, 0.40, 0.30, 0.30]],
}


def main():
    out = {"cases": {}}
    for name, experts in CASES.items():
        ew = entropy_weights(experts)
        uw = [1 / len(experts)] * len(experts)
        out["cases"][name] = {
            "experts": experts,
            "entropy": [entropy(e) for e in experts],
            "normalisedEntropy": [normalised_entropy(e) for e in experts],
            "entropyWeights": ew,
            "linearUniform": linear_pool(experts, uw),
            "logUniform": log_pool(experts, uw),
            "linearWeighted": linear_pool(experts, ew),
            "logWeighted": log_pool(experts, ew),
        }
    print(json.dumps(out))


if __name__ == "__main__":
    main()
