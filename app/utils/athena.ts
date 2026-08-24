/**
 * ATHENA-TIR — Advanced Token-aware Heuristic ENsembler with Tool-Integrated
 * Reasoning. Ported from athena.ipynb (AIMO-3).
 *
 * The pipeline: 8 prompts each encoding a different mathematical approach x 2
 * vLLM sampling strategies (temp 0.7 and 0.3) x n=4 samples = 64 generations.
 * Every generation is Python, and every program is executed — wrong code fails
 * and filters itself out, so there is no regex ambiguity about the answer.
 *
 * What survives is then weighted by token-level confidence and pooled into a
 * Bayesian posterior over answers. The MAP estimate is the submission.
 */

export const BASE_CONFIDENCE = 0.8

export const EVIDENCE_WEIGHTS = {
  meanConfidence: 0.25,
  geometricConfidence: 0.35,
  criticalTokenConfidence: 0.4
} as const

export const ATHENA_DEFAULTS = { beta: 0.15, priorStrength: 1.5 }

export interface ConfidenceMetrics {
  meanConfidence: number
  meanSurprise: number
  surpriseVariance: number
  geometricConfidence: number
  minConfidence: number
  criticalTokenConfidence: number
}

export interface Solution {
  answer: number
  prompt: number
  evidence: number
}

const clip = (x: number, lo: number, hi: number) => Math.max(lo, Math.min(hi, x))

/**
 * Aggregate token metrics.
 *
 * `confidences` are top-k concentration per token — how dominant the chosen
 * token was among the top-5 logprobs. `surprises` are -log P(token).
 */
export function confidenceMetrics(confidences: number[], surprises: number[]): ConfidenceMetrics {
  if (!confidences.length) {
    return {
      meanConfidence: BASE_CONFIDENCE,
      meanSurprise: 1.0,
      surpriseVariance: 0.0,
      geometricConfidence: BASE_CONFIDENCE,
      minConfidence: BASE_CONFIDENCE,
      criticalTokenConfidence: BASE_CONFIDENCE
    }
  }
  const n = confidences.length
  const meanConfidence = confidences.reduce((a, b) => a + b, 0) / n
  const meanSurprise = surprises.reduce((a, b) => a + b, 0) / surprises.length
  const surpriseVariance =
    surprises.reduce((a, s) => a + (s - meanSurprise) ** 2, 0) / surprises.length

  // Geometric mean of confidences — logarithmic pooling over tokens, so one
  // very unsure token drags the whole solution down.
  const geometricConfidence = Math.exp(
    confidences.reduce((a, c) => a + Math.log(c + 1e-10), 0) / n
  )

  // The last quarter of a generation usually contains the answer itself.
  const nCritical = Math.max(1, Math.floor(n / 4))
  const critical = confidences.slice(n - nCritical)

  return {
    meanConfidence,
    meanSurprise,
    surpriseVariance,
    geometricConfidence,
    minConfidence: Math.min(...confidences),
    criticalTokenConfidence: critical.reduce((a, b) => a + b, 0) / critical.length
  }
}

/**
 * Evidence strength: a weighted blend of the three confidence views, damped by
 * how erratic the surprise trace was.
 */
export function evidenceStrength(m: ConfidenceMetrics): number {
  const evidence =
    EVIDENCE_WEIGHTS.meanConfidence * m.meanConfidence +
    EVIDENCE_WEIGHTS.geometricConfidence * m.geometricConfidence +
    EVIDENCE_WEIGHTS.criticalTokenConfidence * m.criticalTokenConfidence
  const penalty = clip(m.surpriseVariance / 10.0, 0.0, 0.3)
  return evidence * (1.0 - penalty)
}

/**
 * Answers reached from several different prompt styles are worth more than the
 * same prompt agreeing with itself, which is mostly one opinion resampled.
 */
export function diversityBonus(solutions: Solution[]): Map<number, number> {
  const promptsPerAnswer = new Map<number, Set<number>>()
  for (const s of solutions) {
    if (!promptsPerAnswer.has(s.answer)) promptsPerAnswer.set(s.answer, new Set())
    promptsPerAnswer.get(s.answer)!.add(s.prompt)
  }
  const total = new Set(solutions.map((s) => s.prompt)).size
  const out = new Map<number, number>()
  if (total <= 1) {
    for (const a of promptsPerAnswer.keys()) out.set(a, 1.0)
    return out
  }
  for (const [a, prompts] of promptsPerAnswer) {
    out.set(a, 1.0 + 0.5 * Math.log1p((prompts.size / total) * 3))
  }
  return out
}

export interface EnsembleResult {
  posteriors: Map<number, number>
  evidenceByAnswer: Map<number, number[]>
  bonus: Map<number, number>
  logLikelihoods: Map<number, number>
}

/**
 * Bayesian posterior over answers.
 *
 * Note the prior is uniform: every answer receives the same pseudocount, so it
 * is a constant factor that cancels on normalisation. priorStrength therefore
 * does not affect the result — verified in scripts/verify-athena.mjs.
 */
export function ensemble(
  solutions: Solution[],
  beta = ATHENA_DEFAULTS.beta,
  priorStrength = ATHENA_DEFAULTS.priorStrength
): EnsembleResult {
  const evidenceByAnswer = new Map<number, number[]>()
  for (const s of solutions) {
    if (!evidenceByAnswer.has(s.answer)) evidenceByAnswer.set(s.answer, [])
    evidenceByAnswer.get(s.answer)!.push(s.evidence)
  }
  const empty: EnsembleResult = {
    posteriors: new Map(), evidenceByAnswer, bonus: new Map(), logLikelihoods: new Map()
  }
  if (!solutions.length) return empty

  const bonus = diversityBonus(solutions)
  const pseudocount = priorStrength / evidenceByAnswer.size

  const logLikelihoods = new Map<number, number>()
  for (const [a, ev] of evidenceByAnswer) {
    const scaled = ev.map((e) => (e * (bonus.get(a) ?? 1)) / beta)
    const m = Math.max(...scaled)
    logLikelihoods.set(a, m + Math.log(scaled.reduce((acc, x) => acc + Math.exp(x - m), 0)))
  }

  const maxLL = Math.max(...logLikelihoods.values())
  const unnorm = new Map<number, number>()
  for (const [a, ll] of logLikelihoods) unnorm.set(a, Math.exp(ll - maxLL) * pseudocount)
  const z = [...unnorm.values()].reduce((a, b) => a + b, 0)

  const posteriors = new Map<number, number>()
  for (const [a, v] of unnorm) posteriors.set(a, v / z)
  return { posteriors, evidenceByAnswer, bonus, logLikelihoods }
}

/** Maximum a posteriori answer. */
export function mapAnswer(solutions: Solution[], beta = ATHENA_DEFAULTS.beta): number | null {
  const { posteriors } = ensemble(solutions, beta)
  if (!posteriors.size) return null
  return [...posteriors.entries()].reduce((best, e) => (e[1] > best[1] ? e : best))[0]
}
