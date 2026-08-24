/**
 * Verifies app/utils/replica-loss.ts against scripts/replica-reference.json,
 * generated from the Python in Opinion@nca. Runs in prebuild.
 */
import { readFileSync } from 'node:fs'
import { build } from 'esbuild'

const TOL = 1e-12
const bundle = await build({
  entryPoints: ['app/utils/replica-loss.ts'],
  bundle: true, write: false, format: 'esm', platform: 'neutral'
})
const mod = await import(
  `data:text/javascript;base64,${Buffer.from(bundle.outputFiles[0].text).toString('base64')}`
)

const ref = JSON.parse(readFileSync('scripts/replica-reference.json', 'utf8'))
const failures = []
let checks = 0

for (const { a, b, d } of ref.circular_distance) {
  checks++
  const got = mod.circularDistance(a, b)
  if (got !== d) failures.push(`circularDistance(${a},${b}) = ${got}, want ${d}`)
}

for (const [s, want] of Object.entries(ref.distributions)) {
  const got = mod.createTargetDistributions(ref._constants.num_colors, ref._constants.num_replicas, Number(s))
  want.forEach((row, t) => {
    row.forEach((v, i) => {
      checks++
      if (Math.abs(got[t][i] - v) > TOL) {
        failures.push(`spillover=${s} target=${t} class=${i}: ${got[t][i]} vs ${v}`)
      }
    })
    // every row must remain a distribution
    const sum = got[t].reduce((x, y) => x + y, 0)
    checks++
    if (Math.abs(sum - 1) > 1e-10) failures.push(`spillover=${s} target=${t} sums to ${sum}`)
  })
}

if (failures.length) {
  console.error(`\n✖ replica-loss port diverges (${failures.length}/${checks}):`)
  failures.slice(0, 10).forEach((f) => console.error('   ' + f))
  process.exit(1)
}
console.log(`✔ replica-loss port matches the reference on all ${checks} checks`)
