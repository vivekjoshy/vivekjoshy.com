<template>
  <div>
    <!-- Decorative: the same data follows as a list, which is what a screen
         reader reads. -->
    <div class="ecosystem-wrap" aria-hidden="true">
      <svg :viewBox="`0 0 ${W} ${H}`" class="w-full" role="presentation">
        <g v-for="n in nodes" :key="`e${n.id}`">
          <path
            :d="edge(n)"
            fill="none"
            :stroke="'var(--color-hairline)'"
            stroke-width="1"
          />
        </g>

        <g v-for="s in sectors" :key="`s${s.key}`">
          <text
            :x="s.labelX" :y="s.labelY"
            :text-anchor="s.anchor"
            class="ecosystem-sector"
            :fill="'var(--color-accent)'"
          >{{ s.label.toUpperCase() }}</text>
        </g>

        <g v-for="n in nodes" :key="`n${n.id}`">
          <circle :cx="n.x" :cy="n.y" :r="3.5" :fill="'var(--color-accent)'" />
          <text
            :x="n.x + (n.side === 'left' ? -9 : 9)"
            :y="n.y + 3.5"
            :text-anchor="n.side === 'left' ? 'end' : 'start'"
            class="ecosystem-label"
            :fill="'var(--color-primary)'"
          >{{ n.label }}</text>
        </g>

        <circle :cx="CX" :cy="CY" :r="34" :fill="'var(--color-accent)'" />
        <text :x="CX" :y="CY - 2" text-anchor="middle" class="ecosystem-hub" fill="#fff">openskill</text>
        <text :x="CX" :y="CY + 11" text-anchor="middle" class="ecosystem-hub-sub" fill="#fff">.py</text>
      </svg>
    </div>

    <div class="grid grid-cols-1 md:grid-cols-3 gap-6 mt-6">
      <div v-for="s in sectors" :key="`l${s.key}`">
        <h3 class="section-heading text-sm mb-2">{{ s.label }} ({{ s.items.length }})</h3>
        <ul class="list-none m-0 p-0 space-y-1">
          <li v-for="i in s.items" :key="i.label" class="text-sm">
            <a
              v-if="i.url"
              :href="i.url" target="_blank" rel="noopener noreferrer"
              class="text-accent link-underline"
            >{{ i.label }}</a>
            <span v-else>{{ i.label }}</span>
            <span v-if="i.note" class="text-subheading"> — {{ i.note }}</span>
          </li>
        </ul>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import evidence from '~/data/evidence.json'

const W = 900
const H = 560
const CX = W / 2
const CY = H / 2

interface Item { label: string; url?: string | null; note?: string | null }

// Ray and Neural MMO are checkable in those projects' dependency manifests;
// they are the two adoptions that need nobody's word.
const DEPENDENTS: Item[] = [
  { label: 'Ray / RLlib', url: 'https://github.com/ray-project/ray', note: 'pinned openskill==6.0.0' },
  { label: 'Neural MMO', url: 'https://github.com/NeuralMMO/environment', note: 'rating layer' }
]

/**
 * Venue names come back in full from Semantic Scholar. Matched by substring
 * rather than equality: the exact strings carry years, workshop suffixes and
 * punctuation that vary between records.
 */
const VENUE_ABBREV: [string, string][] = [
  ['arXiv', 'arXiv'],
  ['Transactions on Games', 'IEEE ToG'],
  ['SIGGRAPH Asia', 'SIGGRAPH Asia'],
  ['Computational Linguistics', 'COLING'],
  ['Royal Statistical Society', 'JRSS-C'],
  ['Winter Conference on Applications of Computer Vision', 'WACV'],
  ['Distributed Artificial Intelligence', 'DAI'],
  ['Advanced Modeling and Simulation in Engineering Sciences', 'AMSES']
]

const shortVenue = (v: string | null) => {
  if (!v) return null
  const hit = VENUE_ABBREV.find(([needle]) => v.includes(needle))
  if (hit) return hit[1]
  return v.length > 24 ? v.slice(0, 22) + '…' : v
}

/**
 * Node labels need to be distinct: four papers share the venue "arXiv", so
 * labelling by venue produces four identical nodes. Most of these papers name
 * a system before a colon or dash — that name is both distinct and the thing
 * a reader recognises.
 */
const shortName = (title: string, venue: string | null) => {
  const m = title.match(/^([A-Za-z][\w.\-]{1,18})\s*[:—–-]\s/)
  if (m) return m[1]
  const known = title.match(/\b(Evalica|Generals\.io)\b/)
  if (known) return known[1]
  return shortVenue(venue) ?? '?'
}

const sectorsRaw = computed(() => [
  {
    key: 'ports',
    label: 'Ports',
    items: evidence.ports.map((p) => ({ label: p.lang, url: p.url, note: p.name })) as Item[]
  },
  {
    key: 'citations',
    label: 'Citations',
    items: (evidence.citing ?? []).map((c) => ({
      label: shortName(c.title, c.venue),
      url: c.arxiv ? `https://arxiv.org/abs/${c.arxiv}` : c.doi ? `https://doi.org/${c.doi}` : null,
      note: [shortVenue(c.venue), c.year].filter(Boolean).join(' ')
    })) as Item[]
  },
  { key: 'dependents', label: 'Dependents', items: DEPENDENTS }
])

/**
 * Three sectors around the hub. Ports left, citations right, dependents top —
 * spread over arcs sized to how many items each holds.
 */
const SECTOR_ARCS: Record<string, { from: number; to: number; r: number }> = {
  ports: { from: 130, to: 230, r: 210 },
  citations: { from: -55, to: 55, r: 210 },
  dependents: { from: 232, to: 308, r: 165 }
}

const nodes = computed(() => {
  const out: { id: string; x: number; y: number; label: string; side: 'left' | 'right' }[] = []
  for (const s of sectorsRaw.value) {
    const arc = SECTOR_ARCS[s.key]!
    const n = s.items.length
    s.items.forEach((item, i) => {
      const t = n === 1 ? 0.5 : i / (n - 1)
      const deg = arc.from + t * (arc.to - arc.from)
      const rad = (deg * Math.PI) / 180
      const x = CX + Math.cos(rad) * arc.r
      const y = CY + Math.sin(rad) * arc.r
      out.push({ id: `${s.key}-${i}`, x, y, label: item.label, side: x < CX ? 'left' : 'right' })
    })
  }
  return out
})

// Gentle curve so many edges from one hub stay distinguishable.
const edge = (n: { x: number; y: number }) => {
  const mx = (CX + n.x) / 2
  const my = (CY + n.y) / 2
  const dx = n.x - CX
  const dy = n.y - CY
  return `M ${CX} ${CY} Q ${mx - dy * 0.12} ${my + dx * 0.12} ${n.x} ${n.y}`
}

const sectors = computed(() =>
  sectorsRaw.value.map((s) => {
    const arc = SECTOR_ARCS[s.key]!
    const mid = ((arc.from + arc.to) / 2) * (Math.PI / 180)
    const r = arc.r + 74
    const x = CX + Math.cos(mid) * r
    const y = CY + Math.sin(mid) * r
    return {
      ...s,
      labelX: x,
      labelY: y,
      anchor: x < CX - 20 ? 'end' : x > CX + 20 ? 'start' : 'middle'
    }
  })
)
</script>
