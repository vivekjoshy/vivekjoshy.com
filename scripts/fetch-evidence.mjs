/**
 * Fetches live adoption evidence at build time and writes app/data/evidence.json.
 *
 * Build-time rather than runtime, deliberately: no API keys in the client, no
 * rate limits on visitors, no CORS, and the page still renders if a source is
 * down. On failure it keeps the previous committed JSON and warns, so a flaky
 * upstream can never fail a deploy or blank the page.
 */
import { readFileSync, writeFileSync, mkdirSync, existsSync } from 'node:fs'
import { dirname } from 'node:path'

const OUT = 'app/data/evidence.json'
const TIMEOUT_MS = 12000

async function getJson(url, headers = {}) {
  const ctrl = new AbortController()
  const timer = setTimeout(() => ctrl.abort(), TIMEOUT_MS)
  try {
    const res = await fetch(url, {
      signal: ctrl.signal,
      headers: { 'user-agent': 'vivekjoshy.com-build', ...headers }
    })
    if (!res.ok) throw new Error(`${res.status} ${res.statusText}`)
    return await res.json()
  } finally {
    clearTimeout(timer)
  }
}

/** Resolve each source independently so one outage can't take the rest down. */
async function settle(label, fn) {
  try {
    return { label, value: await fn() }
  } catch (err) {
    console.warn(`  ! ${label}: ${err.message}`)
    return { label, value: null }
  }
}

const [pypi, npm, repo, paper, citing] = await Promise.all([
  settle('pypi', async () => {
    const d = await getJson('https://pypistats.org/api/packages/openskill/recent')
    return { lastMonth: d.data.last_month, lastWeek: d.data.last_week, lastDay: d.data.last_day }
  }),
  settle('npm', async () => {
    const d = await getJson('https://api.npmjs.org/downloads/point/last-month/openskill')
    return { lastMonth: d.downloads }
  }),
  settle('github', async () => {
    const d = await getJson('https://api.github.com/repos/vivekjoshy/openskill.py')
    return { stars: d.stargazers_count, forks: d.forks_count }
  }),
  settle('semanticscholar', async () => {
    const d = await getJson(
      'https://api.semanticscholar.org/graph/v1/paper/DOI:10.21105/joss.05901?fields=citationCount,influentialCitationCount'
    )
    return { citations: d.citationCount, influential: d.influentialCitationCount }
  }),
  settle('citations', async () => {
    const d = await getJson(
      'https://api.semanticscholar.org/graph/v1/paper/DOI:10.21105/joss.05901/citations' +
        '?fields=title,year,venue,externalIds&limit=40'
    )
    return (d.data ?? [])
      .map((c) => c.citingPaper)
      .filter((p) => p?.title)
      .map((p) => ({
        title: p.title,
        year: p.year ?? null,
        venue: p.venue || null,
        arxiv: p.externalIds?.ArXiv ?? null,
        doi: p.externalIds?.DOI ?? null
      }))
      .sort((a, b) => (b.year ?? 0) - (a.year ?? 0))
  })
])

// Ports are a curated list: the registries can't distinguish these from the
// unrelated "agent skills" packages that now share the name.
const PORTS = [
  { name: 'openskill.js', lang: 'TypeScript', url: 'https://github.com/philihp/openskill.js' },
  { name: 'openskill.lua', lang: 'Luau', url: 'https://github.com/bstummer/openskill.lua' },
  { name: 'go-openskill', lang: 'Go', url: 'https://github.com/intinig/go-openskill' },
  { name: 'openskill.kt', lang: 'Kotlin', url: 'https://github.com/brezinajn/openskill.kt' },
  { name: 'openskill.ex', lang: 'Elixir', url: 'https://github.com/philihp/openskill.ex' },
  { name: 'openskill-java', lang: 'Java', url: 'https://github.com/pocketcombats/openskill-java' },
  { name: 'OpenSkillSharp', lang: 'C#', url: 'https://github.com/myssto/OpenSkillSharp' }
]

const previous = existsSync(OUT) ? JSON.parse(readFileSync(OUT, 'utf8')) : {}

// Keep the last good value for any source that failed this run.
const pick = (fresh, key) => fresh ?? previous[key] ?? null

const evidence = {
  fetchedAt: new Date().toISOString().slice(0, 10),
  pypi: pick(pypi.value, 'pypi'),
  npm: pick(npm.value, 'npm'),
  github: pick(repo.value, 'github'),
  paper: pick(paper.value, 'paper'),
  citing: pick(citing.value, 'citing') ?? [],
  ports: PORTS
}

const failed = [pypi, npm, repo, paper, citing].filter((r) => !r.value).map((r) => r.label)
if (failed.length === 5 && !Object.keys(previous).length) {
  console.error('✖ every evidence source failed and there is no cached copy')
  process.exit(1)
}

mkdirSync(dirname(OUT), { recursive: true })
writeFileSync(OUT, JSON.stringify(evidence, null, 2) + '\n')

console.log(
  `✔ evidence written: ${evidence.pypi?.lastMonth?.toLocaleString() ?? '?'} PyPI/mo, ` +
    `${evidence.github?.stars ?? '?'}★, ${evidence.paper?.citations ?? '?'} citations, ` +
    `${PORTS.length} ports, ${evidence.citing.length} citing papers` +
    (failed.length ? ` (kept cached: ${failed.join(', ')})` : '')
)
