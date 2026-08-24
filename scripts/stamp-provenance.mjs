/**
 * Archives the current provenance root as a dated, immutable snapshot and
 * prints the OpenTimestamps command to anchor it.
 *
 * Stamps accumulate: each one proves the work existed at that date. An older
 * stamp is not invalidated by later changes — it simply covers an earlier
 * state, which is exactly what a timestamp is for.
 *
 *     node scripts/build-provenance.mjs
 *     node scripts/stamp-provenance.mjs
 *     ots stamp public/stamps/<file>          # then commit the .ots
 */
import { readFileSync, writeFileSync, mkdirSync, existsSync, readdirSync } from 'node:fs'

const root = readFileSync('public/provenance-root.txt', 'utf8').trim()
const manifest = JSON.parse(readFileSync('app/data/provenance.json', 'utf8'))
const short = root.slice(0, 12)
const name = `${manifest.generated}-${short}.txt`

mkdirSync('public/stamps', { recursive: true })
const path = `public/stamps/${name}`

if (existsSync(path)) {
  console.log(`= snapshot already exists: ${path}`)
} else {
  writeFileSync(path, root + '\n')
  console.log(`✔ wrote ${path}`)
}

const stamps = readdirSync('public/stamps').filter((f) => f.endsWith('.txt')).sort()
const anchored = stamps.filter((f) => existsSync(`public/stamps/${f}.ots`))
console.log(`  ${stamps.length} snapshot(s), ${anchored.length} anchored`)
if (!existsSync(`${path}.ots`)) {
  console.log(`\n  Not yet anchored. Run:\n    ots stamp ${path}\n  then commit ${path}.ots`)
}
