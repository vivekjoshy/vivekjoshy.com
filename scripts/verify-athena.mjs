/** Verifies app/utils/athena.ts against scripts/athena-reference.json. */
import { readFileSync } from 'node:fs'
import { build } from 'esbuild'

const TOL = 1e-10
const bundle = await build({
  entryPoints: ['app/utils/athena.ts'], bundle: true, write: false,
  format: 'esm', platform: 'neutral'
})
const mod = await import(
  `data:text/javascript;base64,${Buffer.from(bundle.outputFiles[0].text).toString('base64')}`
)
const ref = JSON.parse(readFileSync('scripts/athena-reference.json', 'utf8'))
const failures = []
let checks = 0
const near = (g, w, l) => { checks++; if (!(Math.abs(g - w) <= TOL)) failures.push(`${l}: ${g} vs ${w}`) }

const KEYMAP = {
  mean_confidence: 'meanConfidence', mean_surprise: 'meanSurprise',
  surprise_variance: 'surpriseVariance', geometric_confidence: 'geometricConfidence',
  min_confidence: 'minConfidence', critical_token_confidence: 'criticalTokenConfidence'
}

for (const [name, c] of Object.entries(ref.tokenCases)) {
  const m = mod.confidenceMetrics(c.confidences, c.surprises)
  for (const [py, ts] of Object.entries(KEYMAP)) near(m[ts], c.metrics[py], `${name}/${ts}`)
  near(mod.evidenceStrength(m), c.evidence, `${name}/evidence`)
}

for (const [name, s] of Object.entries(ref.solutionSets)) {
  const { posteriors, bonus } = mod.ensemble(s.solutions)
  for (const [a, w] of Object.entries(s.posteriors)) near(posteriors.get(Number(a)), w, `${name}/post[${a}]`)
  for (const [a, w] of Object.entries(s.diversityBonus)) near(bonus.get(Number(a)), w, `${name}/bonus[${a}]`)
  checks++
  const sum = [...posteriors.values()].reduce((x, y) => x + y, 0)
  if (Math.abs(sum - 1) > 1e-9) failures.push(`${name}: posteriors sum to ${sum}`)
}

// The uniform prior cancels: priorStrength must not change the posterior.
{
  const sols = ref.solutionSets.diverse_minority.solutions
  const a = mod.ensemble(sols, 0.15, 1.5).posteriors
  const b = mod.ensemble(sols, 0.15, 99).posteriors
  for (const [k, v] of a) near(b.get(k), v, `priorInertness[${k}]`)
  checks++
  if (!ref.priorInertness.identical) failures.push('reference says prior is NOT inert')
}

if (failures.length) {
  console.error(`\n✖ athena port diverges (${failures.length}/${checks}):`)
  failures.slice(0, 10).forEach((f) => console.error('   ' + f))
  process.exit(1)
}
console.log(`✔ athena port matches the reference on all ${checks} checks`)
