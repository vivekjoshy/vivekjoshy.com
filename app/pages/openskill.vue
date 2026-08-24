<template>
  <div class="py-8 max-w-5xl mx-auto bg-white">
    <div class="mb-10">
      <h1 class="text-4xl font-bold mb-3">
        <span class="font-thin">OPEN</span><span class="font-black">SKILL</span>
      </h1>
      <p class="text-lg mb-2">
        A live implementation of the Weng&ndash;Lin rating models. Build a match,
        set the result, and watch the posterior move.
      </p>
      <p class="text-subheading">
        Ported from
        <a href="https://github.com/vivekjoshy/openskill.py" target="_blank" rel="noopener noreferrer" class="text-accent hover:underline">openskill.py</a>
        and checked against the library on every build &mdash; if this page and the
        package ever disagree by more than 1e-6, the build fails.
      </p>
    </div>

    <!-- Evidence -->
    <section class="mb-10 border-y border-gray-100 py-5">
      <div class="grid grid-cols-2 md:grid-cols-4 gap-5 mb-4">
        <div>
          <div class="text-3xl font-black text-accent tabular-nums">{{ fmt(evidence.pypi?.lastMonth) }}</div>
          <div class="text-subheading text-sm">PyPI downloads / month</div>
        </div>
        <div>
          <div class="text-3xl font-black text-accent tabular-nums">{{ fmt(evidence.npm?.lastMonth) }}</div>
          <div class="text-subheading text-sm">npm downloads / month <span class="opacity-60">(JS port)</span></div>
        </div>
        <div>
          <div class="text-3xl font-black text-accent tabular-nums">{{ fmt(evidence.paper?.citations) }}</div>
          <div class="text-subheading text-sm">academic citations</div>
        </div>
        <div>
          <div class="text-3xl font-black text-accent tabular-nums">{{ fmt(evidence.github?.stars) }}</div>
          <div class="text-subheading text-sm">GitHub stars</div>
        </div>
      </div>
      <p class="text-subheading text-sm">
        Ported independently to {{ evidence.ports.length }} languages:
        <template v-for="(p, i) in evidence.ports" :key="p.name"><a :href="p.url" target="_blank" rel="noopener noreferrer" class="text-accent hover:underline">{{ p.lang }}</a><span v-if="i < evidence.ports.length - 1">, </span></template>.
        Figures fetched at build time, {{ evidence.fetchedAt }}.
      </p>
    </section>

    <!-- Model selector -->
    <section class="mb-8">
      <h2 class="section-heading mb-3 text-base">Model</h2>
      <div class="flex flex-wrap gap-2">
        <button
          v-for="m in MODELS"
          :key="m.id"
          class="btn btn-sm"
          :class="model === m.id ? 'btn-accent text-white' : 'btn-outline'"
          @click="model = m.id"
        >
          {{ m.label }}
        </button>
      </div>
      <p class="text-subheading mt-2">{{ activeModel.blurb }}</p>
    </section>

    <!-- Teams -->
    <section class="mb-8">
      <div class="flex items-baseline justify-between mb-3">
        <h2 class="section-heading text-base">Match</h2>
        <div class="flex gap-2">
          <button class="btn btn-xs btn-outline" :disabled="teams.length >= 4" @click="addTeam">+ team</button>
          <button class="btn btn-xs btn-outline" :disabled="teams.length <= 2" @click="teams.pop()">&minus; team</button>
        </div>
      </div>

      <div class="grid grid-cols-1 md:grid-cols-2 gap-5">
        <div
          v-for="(team, ti) in teams"
          :key="ti"
          class="border border-gray-200 rounded p-4"
          :class="{ 'border-accent': team.rank === bestRank }"
        >
          <div class="flex items-center justify-between mb-3">
            <h3 class="subsection-heading">Team {{ ti + 1 }}</h3>
            <label class="flex items-center gap-2">
              <span class="text-subheading text-sm">place</span>
              <input
                v-model.number="team.rank"
                type="number"
                min="1"
                :max="teams.length"
                class="input input-bordered input-xs w-16"
              />
            </label>
          </div>

          <div v-for="(p, pi) in team.players" :key="pi" class="mb-3 pb-3 border-b border-gray-100 last:border-0 last:mb-0 last:pb-0">
            <div class="flex items-baseline justify-between mb-1">
              <span class="font-medium">{{ p.name }}</span>
              <span class="text-subheading text-sm">
                ordinal {{ ordinal(p).toFixed(2) }}
              </span>
            </div>
            <div class="flex gap-3">
              <label class="flex items-center gap-1 text-sm">
                <span class="text-subheading">&mu;</span>
                <input v-model.number="p.mu" type="number" step="0.1" class="input input-bordered input-xs w-20" />
              </label>
              <label class="flex items-center gap-1 text-sm">
                <span class="text-subheading">&sigma;</span>
                <input v-model.number="p.sigma" type="number" step="0.1" min="0.01" class="input input-bordered input-xs w-20" />
              </label>
              <span v-if="lastDelta[ti]?.[pi]" class="text-sm self-center" :class="lastDelta[ti][pi].mu >= 0 ? 'text-accent' : 'text-subheading'">
                {{ lastDelta[ti][pi].mu >= 0 ? '+' : '' }}{{ lastDelta[ti][pi].mu.toFixed(2) }}&mu;
                &nbsp;{{ lastDelta[ti][pi].sigma >= 0 ? '+' : '' }}{{ lastDelta[ti][pi].sigma.toFixed(2) }}&sigma;
              </span>
            </div>
          </div>

          <div class="flex gap-2 mt-3">
            <button class="btn btn-xs btn-outline" :disabled="team.players.length >= 3" @click="addPlayer(ti)">+ player</button>
            <button class="btn btn-xs btn-outline" :disabled="team.players.length <= 1" @click="team.players.pop()">&minus; player</button>
          </div>
        </div>
      </div>
    </section>

    <!-- Prediction -->
    <section class="mb-8">
      <h2 class="section-heading mb-3 text-base">Predicted outcome</h2>
      <div class="space-y-2">
        <div v-for="(p, i) in winProbabilities" :key="i" class="flex items-center gap-3">
          <span class="w-20 text-subheading">Team {{ i + 1 }}</span>
          <div class="flex-1 bg-base-200 rounded h-5 overflow-hidden">
            <div class="bg-accent h-full transition-all duration-500" :style="{ width: (p * 100).toFixed(1) + '%' }" />
          </div>
          <span class="w-16 text-right tabular-nums">{{ (p * 100).toFixed(1) }}%</span>
        </div>
      </div>
    </section>

    <div class="flex flex-wrap gap-3 mb-10">
      <button class="btn btn-accent text-white" @click="applyResult">Rate this result</button>
      <button class="btn btn-outline" @click="reset">Reset</button>
      <span v-if="rounds" class="self-center text-subheading">{{ rounds }} match{{ rounds === 1 ? '' : 'es' }} rated</span>
    </div>

    <section v-if="history.length" class="mb-10">
      <h2 class="section-heading mb-3 text-base">History</h2>
      <div class="overflow-x-auto">
        <table class="table table-sm">
          <thead>
            <tr>
              <th>#</th>
              <th>Model</th>
              <th>Result</th>
              <th>Largest move</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="h in [...history].reverse()" :key="h.n">
              <td>{{ h.n }}</td>
              <td>{{ h.model }}</td>
              <td>{{ h.result }}</td>
              <td class="tabular-nums">{{ h.biggest }}</td>
            </tr>
          </tbody>
        </table>
      </div>
    </section>
  </div>
</template>

<script setup lang="ts">
// @ts-ignore - Nuxt auto-imports
import { definePageMeta, useHead } from '#imports'
import { ref, computed, reactive } from 'vue'
import { rate, predictWin, ordinal as osOrdinal, newRating, DEFAULTS, type ModelName, type Rating } from '~/utils/openskill'
import evidence from '~/data/evidence.json'

const fmt = (n?: number | null) => (typeof n === 'number' ? n.toLocaleString('en-US') : '—')

definePageMeta({ layout: 'default' })

const MODELS: { id: ModelName; label: string; blurb: string }[] = [
  {
    id: 'plackett_luce',
    label: 'Plackett-Luce',
    blurb: 'The default. Handles many teams at once by modelling the whole finishing order, rather than decomposing it into pairs.'
  },
  {
    id: 'thurstone_mosteller',
    label: 'Thurstone-Mosteller',
    blurb: 'Gaussian performance model with a draw margin. Tends to move ratings further on a surprising result than Plackett-Luce does.'
  },
  {
    id: 'bradley_terry',
    label: 'Bradley-Terry',
    blurb: 'Logistic pairwise comparisons. Agrees with Plackett-Luce for two teams, and diverges once there are three or more.'
  }
]

const model = ref<ModelName>('plackett_luce')
const activeModel = computed(() => MODELS.find((m) => m.id === model.value) as (typeof MODELS)[number])

interface Player extends Rating {
  name: string
}
interface Team {
  players: Player[]
  rank: number
}

let counter = 0
const nextName = () => `P${++counter}`

function freshTeams(): Team[] {
  counter = 0
  return [
    { players: [{ name: nextName(), ...newRating() }], rank: 1 },
    { players: [{ name: nextName(), ...newRating() }], rank: 2 }
  ]
}

const teams = reactive<Team[]>(freshTeams())
const rounds = ref(0)
const history = ref<{ n: number; model: string; result: string; biggest: string }[]>([])
const lastDelta = ref<Record<number, Record<number, { mu: number; sigma: number }>>>({})

const bestRank = computed(() => Math.min(...teams.map((t) => t.rank)))

const winProbabilities = computed(() =>
  predictWin(teams.map((t) => t.players.map((p) => ({ mu: p.mu, sigma: p.sigma }))))
)

function ordinal(p: Player) {
  return osOrdinal({ mu: p.mu, sigma: p.sigma })
}

function addTeam() {
  teams.push({ players: [{ name: nextName(), ...newRating() }], rank: teams.length + 1 })
}

function addPlayer(ti: number) {
  teams[ti]?.players.push({ name: nextName(), ...newRating() })
}

function applyResult() {
  const input = teams.map((t) => t.players.map((p) => ({ mu: p.mu, sigma: p.sigma })))
  const ranks = teams.map((t) => t.rank)
  const updated = rate(input, ranks, model.value)

  const deltas: Record<number, Record<number, { mu: number; sigma: number }>> = {}
  let biggest = 0
  updated.forEach((team, ti) => {
    deltas[ti] = {}
    team.forEach((r, pi) => {
      const before = teams[ti]!.players[pi]!
      const dMu = r.mu - before.mu
      const dSigma = r.sigma - before.sigma
      deltas[ti]![pi] = { mu: dMu, sigma: dSigma }
      if (Math.abs(dMu) > Math.abs(biggest)) biggest = dMu
      before.mu = r.mu
      before.sigma = r.sigma
    })
  })

  lastDelta.value = deltas
  rounds.value++
  history.value.push({
    n: rounds.value,
    model: activeModel.value.label,
    result: teams.map((t, i) => `T${i + 1}:${t.rank}`).join('  '),
    biggest: `${biggest >= 0 ? '+' : ''}${biggest.toFixed(3)} μ`
  })
}

function reset() {
  teams.splice(0, teams.length, ...freshTeams())
  rounds.value = 0
  history.value = []
  lastDelta.value = {}
}

useHead({
  title: 'OpenSkill Playground',
  meta: [
    {
      name: 'description',
      content: `Interactive Weng-Lin rating playground: Plackett-Luce, Thurstone-Mosteller and Bradley-Terry, running the same maths as openskill.py. Default mu ${DEFAULTS.mu}, sigma 25/3.`
    }
  ]
})
</script>
