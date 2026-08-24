/**
 * Verifies app/utils/ensemble.ts against scripts/ensemble-reference.json.
 * Runs in prebuild.
 */
import { readFileSync } from 'node:fs'
import { build } from 'esbuild'

const TOL = 1e-10
const bundle = await build({
  entryPoints: ['app/utils/ensemble.ts'],
  bundle: true, write: false, format: 'esm', platform: 'neutral'
})
const mod = await import(
  `data:text/javascript;base64,${Buffer.from(bundle.outputFiles[0].text).toString('base64')}`
)

const ref = JSON.parse(readFileSync('scripts/ensemble-reference.json', 'utf8'))
const failures = []
let checks = 0

const near = (got, want, label) => {
  checks++
  if (!(Math.abs(got - want) <= TOL)) failures.push(`${label}: ${got} vs ${want}`)
}
const nearArr = (got, want, label) => want.forEach((w, i) => near(got[i], w, `${label}[${i}]`))

for (const [name, c] of Object.entries(ref.cases)) {
  const experts = c.experts.map((probs, i) => ({ name: `E${i}`, probs }))
  const uw = mod.uniformWeights(experts)
  const ew = mod.entropyWeights(experts)

  c.entropy.forEach((w, i) => near(mod.entropy(c.experts[i]), w, `${name}/entropy${i}`))
  c.normalisedEntropy.forEach((w, i) =>
    near(mod.normalisedEntropy(c.experts[i]), w, `${name}/normH${i}`))
  nearArr(ew, c.entropyWeights, `${name}/entropyWeights`)
  nearArr(mod.linearPool(experts, uw), c.linearUniform, `${name}/linearUniform`)
  nearArr(mod.logPool(experts, uw), c.logUniform, `${name}/logUniform`)
  nearArr(mod.linearPool(experts, ew), c.linearWeighted, `${name}/linearWeighted`)
  nearArr(mod.logPool(experts, ew), c.logWeighted, `${name}/logWeighted`)

  // every pooled result must be a distribution
  for (const [label, p] of [
    ['linearUniform', mod.linearPool(experts, uw)],
    ['logUniform', mod.logPool(experts, uw)]
  ]) {
    checks++
    const s = p.reduce((a, b) => a + b, 0)
    if (Math.abs(s - 1) > 1e-9) failures.push(`${name}/${label} sums to ${s}`)
  }
}

if (failures.length) {
  console.error(`\n✖ ensemble port diverges (${failures.length}/${checks}):`)
  failures.slice(0, 10).forEach((f) => console.error('   ' + f))
  process.exit(1)
}
console.log(`✔ ensemble port matches the reference on all ${checks} checks`)
