/**
 * Verifies the WebMCP tool descriptors against the W3C shape, and checks that
 * each tool's execute() agrees with openskill.py's reference vectors.
 *
 * The browser API is behind a flag, so this exercises the descriptors directly
 * rather than through document.modelContext. Runs in prebuild.
 */
import { readFileSync } from 'node:fs'
import { build } from 'esbuild'

// onMounted is a Nuxt auto-import; stub it so the module loads outside Nuxt.
const bundle = await build({
  entryPoints: ['app/composables/useWebMcp.ts'],
  bundle: true, write: false, format: 'esm', platform: 'neutral',
  alias: { '~/utils/openskill': './app/utils/openskill.ts' },
  banner: { js: 'const onMounted = () => {};' }
})
const mod = await import(
  `data:text/javascript;base64,${Buffer.from(bundle.outputFiles[0].text).toString('base64')}`
)

const ref = JSON.parse(readFileSync('scripts/openskill-reference.json', 'utf8'))
const tools = mod.buildWebMcpTools()
const failures = []
let checks = 0

const check = (cond, msg) => { checks++; if (!cond) failures.push(msg) }

check(tools.length >= 3, `expected at least 3 tools, got ${tools.length}`)

for (const t of tools) {
  check(typeof t.name === 'string' && t.name.length > 0, `tool missing name`)
  check(typeof t.description === 'string' && t.description.length > 0, `${t.name}: missing description`)
  check(typeof t.execute === 'function', `${t.name}: execute must be a function`)
  check(!!t.inputSchema && t.inputSchema.type === 'object', `${t.name}: inputSchema must be an object schema`)
  // These are pure functions; the spec's readOnlyHint tells an agent it can
  // call them without side effects.
  check(t.annotations?.readOnlyHint === true, `${t.name}: expected readOnlyHint true`)
}

const names = tools.map((t) => t.name)
check(new Set(names).size === names.length, `duplicate tool names: ${names}`)

// rate_match must match the library exactly.
const rateTool = tools.find((t) => t.name === 'openskill-rate-match')
for (const c of ref.plackett_luce) {
  const out = await rateTool.execute({
    teams: c.input.map((team) => team.map(([mu, sigma]) => ({ mu, sigma }))),
    ranks: c.ranks,
    model: 'plackett_luce'
  })
  c.output.forEach((team, ti) => {
    team.forEach(([mu, sigma], pi) => {
      const got = out.teams[ti][pi]
      checks += 2
      if (Math.abs(got.mu - mu) > 1e-6) failures.push(`${c.name} t${ti}p${pi} mu: ${got.mu} vs ${mu}`)
      if (Math.abs(got.sigma - sigma) > 1e-6) failures.push(`${c.name} t${ti}p${pi} sigma: ${got.sigma} vs ${sigma}`)
    })
  })
}

// predict_win must match too.
const predictTool = tools.find((t) => t.name === 'openskill-predict-win')
{
  const out = await predictTool.execute({
    teams: [[{ mu: 25.0, sigma: 8.333 }], [{ mu: 30.0, sigma: 4.0 }]]
  })
  ref.plackett_luce_predict_win.forEach((p, i) => {
    checks++
    if (Math.abs(out.probabilities[i] - p) > 1e-6)
      failures.push(`predict_win[${i}]: ${out.probabilities[i]} vs ${p}`)
  })
}

// Input bounds must be enforced, same as the HTTP endpoint.
for (const [label, input] of [
  ['too many teams', { teams: Array.from({ length: 65 }, () => [{ mu: 25, sigma: 8 }]), ranks: [] }],
  ['negative sigma', { teams: [[{ mu: 25, sigma: -1 }], [{ mu: 25, sigma: 8 }]], ranks: [1, 2] }],
  ['one team', { teams: [[{ mu: 25, sigma: 8 }]], ranks: [1] }]
]) {
  checks++
  let threw = false
  try { await rateTool.execute(input) } catch { threw = true }
  if (!threw) failures.push(`${label}: should have thrown`)
}

if (failures.length) {
  console.error(`\n✖ webmcp tools diverge (${failures.length}/${checks}):`)
  failures.slice(0, 10).forEach((f) => console.error('   ' + f))
  process.exit(1)
}
console.log(`✔ webmcp tools valid and matching the library on all ${checks} checks`)
