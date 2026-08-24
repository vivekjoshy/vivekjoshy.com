/**
 * Opinion pooling for prompt ensembles.
 *
 * Several "experts" — samples from one model at different temperatures or
 * seeds, or several different models — each return a distribution over the same
 * candidate tokens. This module combines them two ways and lets you see where
 * the two disagree.
 *
 *   linear pooling:      p = sum_i w_i p_i          (arithmetic mean)
 *   logarithmic pooling: p ∝ prod_i p_i^{w_i}       (weighted geometric mean)
 *
 * The difference matters. Linear pooling hedges: it keeps a candidate alive if
 * *any* expert likes it, so disagreement survives as a flat, uncertain output.
 * Logarithmic pooling multiplies: a candidate survives only if *every* expert
 * gives it some mass, so agreement sharpens and any confident dissent acts as
 * a veto. Log pooling is externally Bayesian; linear pooling is not.
 */

export interface Expert {
  name: string
  probs: number[]
}

const EPS = 1e-12

export function normalise(xs: number[]): number[] {
  const sum = xs.reduce((a, b) => a + b, 0)
  if (sum <= 0) return xs.map(() => 1 / xs.length)
  return xs.map((x) => x / sum)
}

/** Shannon entropy in nats. */
export function entropy(p: number[]): number {
  return -p.reduce((acc, x) => (x > 0 ? acc + x * Math.log(x) : acc), 0)
}

/** Entropy as a fraction of the maximum for this many candidates. */
export function normalisedEntropy(p: number[]): number {
  const max = Math.log(p.length)
  return max > 0 ? entropy(p) / max : 0
}

/**
 * Confidence weights: an expert that spreads its mass evenly knows less than
 * one that commits, so weight by how far below maximum entropy it sits.
 */
export function entropyWeights(experts: Expert[]): number[] {
  const conf = experts.map((e) => 1 - normalisedEntropy(e.probs))
  const sum = conf.reduce((a, b) => a + b, 0)
  if (sum <= EPS) return experts.map(() => 1 / experts.length)
  return conf.map((c) => c / sum)
}

export function uniformWeights(experts: Expert[]): number[] {
  return experts.map(() => 1 / experts.length)
}

/** Arithmetic mean. Any expert can keep a candidate alive on its own. */
export function linearPool(experts: Expert[], weights: number[]): number[] {
  const k = experts[0]!.probs.length
  const out = new Array(k).fill(0)
  experts.forEach((e, i) => {
    for (let j = 0; j < k; j++) out[j] += weights[i]! * e.probs[j]!
  })
  return normalise(out)
}

/**
 * Weighted geometric mean, computed in log space. A candidate that any expert
 * assigns near-zero is suppressed however enthusiastic the others are — the
 * veto property that distinguishes this from linear pooling.
 */
export function logPool(experts: Expert[], weights: number[]): number[] {
  const k = experts[0]!.probs.length
  const logs = new Array(k).fill(0)
  experts.forEach((e, i) => {
    for (let j = 0; j < k; j++) logs[j] += weights[i]! * Math.log(Math.max(e.probs[j]!, EPS))
  })
  const max = Math.max(...logs)
  return normalise(logs.map((l) => Math.exp(l - max)))
}

/** Index of the highest-probability candidate. */
export function argmax(p: number[]): number {
  return p.reduce((best, x, i) => (x > p[best]! ? i : best), 0)
}

/**
 * Total variation distance — how far apart the two pooled answers are.
 * Zero when the methods agree; large when the choice of pool decides the answer.
 */
export function totalVariation(a: number[], b: number[]): number {
  return 0.5 * a.reduce((acc, x, i) => acc + Math.abs(x - b[i]!), 0)
}
