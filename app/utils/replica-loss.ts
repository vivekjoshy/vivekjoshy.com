/**
 * Browser port of the Dense Ordinal Replica Loss, ported from
 * Opinion@nca `opinion/loss.py` (LossUtilities + CircularReplicaLoss).
 *
 * The idea: ARC's ten colours are treated as a *circle*, not ten unrelated
 * labels. Each colour is given R replica classes, and the training target is a
 * soft distribution that leaks a little mass onto nearby colours, weighted by
 * inverse circular distance. That gives the network a gradient in colour space
 * instead of a one-hot cliff.
 *
 * Verified against scripts/replica-reference.json on every build.
 */

export const NUM_COLORS = 10
export const NUM_REPLICAS = 10

export const REPLICA_DEFAULTS = {
  spillover: 0.03,
  entropyWeight: 0.01,
  focalGamma: 2.0
}

/** The ten ARC colours, in index order. */
export const ARC_COLORS = [
  '#000000', '#0074D9', '#FF4136', '#2ECC40', '#FFDC00',
  '#AAAAAA', '#F012BE', '#FF851B', '#7FDBFF', '#870C25'
]

/**
 * Distance around the colour circle: d(a,b) = min(|a-b|, N-|a-b|).
 * So d(0,9) = 1, because the palette wraps.
 */
export function circularDistance(a: number, b: number, numColors = NUM_COLORS): number {
  const direct = Math.abs(a - b)
  return Math.min(direct, numColors - direct)
}

/**
 * Soft target distribution over numColors*numReplicas classes.
 *
 * For target colour c*:
 *   own replicas      -> (1 - s) / R each
 *   colour c replicas -> (s * w(d(c,c*))) / R each,  w(d) = 1/d, normalised
 */
export function createTargetDistributions(
  numColors = NUM_COLORS,
  numReplicas = NUM_REPLICAS,
  spillover = REPLICA_DEFAULTS.spillover
): number[][] {
  const total = numColors * numReplicas
  const out: number[][] = []

  for (let target = 0; target < numColors; target++) {
    const row = new Array(total).fill(0)
    const distances = Array.from({ length: numColors }, (_, c) => circularDistance(target, c, numColors))

    let weights = distances.map((d) => (d === 0 ? 0 : 1 / d))
    const sum = weights.reduce((a, b) => a + b, 0)
    if (sum > 0) weights = weights.map((w) => w / sum)

    for (let c = 0; c < numColors; c++) {
      const per = c === target ? (1 - spillover) / numReplicas : (spillover * weights[c]!) / numReplicas
      const start = c * numReplicas
      for (let i = start; i < start + numReplicas; i++) row[i] = per
    }
    out.push(row)
  }
  return out
}

/** Total probability mass each colour receives, collapsing its replicas. */
export function massPerColor(row: number[], numColors = NUM_COLORS, numReplicas = NUM_REPLICAS): number[] {
  return Array.from({ length: numColors }, (_, c) =>
    row.slice(c * numReplicas, (c + 1) * numReplicas).reduce((a, b) => a + b, 0)
  )
}

/** Numerically stable log-softmax. */
export function logSoftmax(logits: number[]): number[] {
  const max = Math.max(...logits)
  const shifted = logits.map((l) => l - max)
  const logSum = Math.log(shifted.reduce((a, l) => a + Math.exp(l), 0))
  return shifted.map((l) => l - logSum)
}

export function softmax(logits: number[]): number[] {
  return logSoftmax(logits).map(Math.exp)
}

/**
 * The loss as implemented: cross-entropy against the soft target, plus an
 * entropy bonus. L = KL - lambda*H, matching `CircularReplicaLoss.forward`.
 */
export function replicaLoss(
  logits: number[],
  softTarget: number[],
  entropyWeight = REPLICA_DEFAULTS.entropyWeight
): { total: number; kl: number; entropy: number } {
  const logProbs = logSoftmax(logits)
  const probs = logProbs.map(Math.exp)
  const kl = -softTarget.reduce((acc, t, i) => acc + t * logProbs[i]!, 0)
  const entropy = -probs.reduce((acc, p, i) => acc + p * logProbs[i]!, 0)
  return { total: kl - entropyWeight * entropy, kl, entropy }
}

/** One-hot baseline, for the side-by-side comparison. */
export function oneHot(target: number, numColors = NUM_COLORS, numReplicas = NUM_REPLICAS): number[] {
  const row = new Array(numColors * numReplicas).fill(0)
  const start = target * numReplicas
  for (let i = start; i < start + numReplicas; i++) row[i] = 1 / numReplicas
  return row
}

/* ------------------------------------------------------------------ */
/* DenseOrdinalReplicaLoss — Opinion commit 3773f4e (2025-10-26)       */
/* ------------------------------------------------------------------ */

/**
 * Hybrid distance from each of the N*R classes to the target colour.
 *
 * Within the target colour's own block, distance is linear from that block's
 * middle replica — a genuine ordinal continuum. Every other colour gets a flat
 * Hamming penalty of R. This deliberately drops the circular-topology
 * assumption: ARC colour indices are labels, not a scale, so treating colour 4
 * as "nearer" colour 3 than colour 8 encodes a relationship that isn't there.
 */
export function denseOrdinalDistance(
  targetColor: number,
  numColors = NUM_COLORS,
  numReplicas = NUM_REPLICAS
): number[] {
  const total = numColors * numReplicas
  const middle = targetColor * numReplicas + Math.floor(numReplicas / 2)
  return Array.from({ length: total }, (_, r) =>
    Math.floor(r / numReplicas) === targetColor ? Math.abs(r - middle) : numReplicas
  )
}

/**
 * Expected distance under the predicted distribution: L = sum_i p_i * d_i.
 * Note this is an expected-distance objective, not a KL against a soft target —
 * a different shape of loss from CircularReplicaLoss.
 */
export function denseOrdinalLoss(
  logits: number[],
  targetColor: number,
  numColors = NUM_COLORS,
  numReplicas = NUM_REPLICAS
): number {
  if (logits.length !== numColors * numReplicas) {
    throw new Error(
      `logits must have ${numColors * numReplicas} entries, got ${logits.length}`
    )
  }
  const p = softmax(logits)
  const d = denseOrdinalDistance(targetColor, numColors, numReplicas)
  return p.reduce((acc, pi, i) => acc + pi * d[i]!, 0)
}
