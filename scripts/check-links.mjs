/**
 * Audits every link the built site emits.
 *
 * Run against a running dev server or preview:
 *     npm run dev &  &&  node scripts/check-links.mjs
 *
 * Deliberately NOT in prebuild: it needs the network and a live server, and a
 * rate-limited third party should never be able to fail a deploy. Run it before
 * shipping, and after any change that adds links.
 */
const BASE = process.env.BASE_URL ?? 'http://localhost:3000'
const ROUTES = ['/', '/openskill', '/arc', '/ordinal-replica', '/ensemble', '/resume', '/provenance']
const SKIP_EXTERNAL = process.argv.includes('--internal-only')

const internal = new Map()
const external = new Map()

for (const r of ROUTES) {
  const res = await fetch(BASE + r)
  if (!res.ok) {
    console.error(`✖ route ${r} returned ${res.status}`)
    process.exit(1)
  }
  const html = await res.text()
  for (const [, h] of html.matchAll(/href="([^"]+)"/g)) {
    if (h.startsWith('http')) {
      if (!external.has(h)) external.set(h, new Set())
      external.get(h).add(r)
    } else if (h.startsWith('/')) {
      if (!internal.has(h)) internal.set(h, new Set())
      internal.get(h).add(r)
    }
  }
}

const problems = []

for (const [h, from] of internal) {
  const [path, frag] = h.split('#')
  const res = await fetch(BASE + path)
  if (!res.ok) {
    problems.push(`${h} -> ${res.status}  (linked from ${[...from].join(', ')})`)
  } else if (frag) {
    const html = await res.text()
    if (!new RegExp(`id="${frag}"`).test(html)) {
      problems.push(`${h} -> fragment #${frag} missing  (from ${[...from].join(', ')})`)
    }
  }
}
console.log(`internal: ${internal.size} unique targets checked`)

if (!SKIP_EXTERNAL) {
  for (const [h, from] of external) {
    try {
      const res = await fetch(h, { redirect: 'follow', signal: AbortSignal.timeout(15000) })
      // 429/403 are rate limits or bot walls, not broken links.
      if (!res.ok && res.status !== 429 && res.status !== 403) {
        problems.push(`${h} -> ${res.status}  (linked from ${[...from].join(', ')})`)
      }
    } catch (e) {
      problems.push(`${h} -> ${e.message}  (from ${[...from].join(', ')})`)
    }
  }
  console.log(`external: ${external.size} unique targets checked`)
}

if (problems.length) {
  console.error(`\n✖ ${problems.length} broken link(s):`)
  problems.forEach((p) => console.error('   ' + p))
  process.exit(1)
}
console.log('✔ every link resolves')
