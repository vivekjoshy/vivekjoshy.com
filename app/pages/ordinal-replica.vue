<template>
  <div class="py-8 max-w-5xl mx-auto">
    <div class="mb-10">
      <h1 class="text-4xl font-bold mb-3">
        <span class="font-thin">DENSE ORDINAL</span> <span class="font-black">REPLICA LOSS</span>
      </h1>
      <p class="lede balance mb-3">
        ARC's ten colours are not ten unrelated labels &mdash; they sit on a circle.
        This loss teaches the network that, by leaking a little probability mass
        onto nearby colours instead of using a one-hot cliff.
      </p>
      <p class="text-subheading text-sm">
        Ported from <code class="provenance">Opinion@nca</code> (CircularReplicaLoss)
        and <code class="provenance">Opinion 3773f4e</code> (DenseOrdinalReplicaLoss),
        checked against references generated from those sources on every build.
      </p>
    </div>

    <!-- The recorded result -->
    <section class="mb-12 border-l-4 border-accent pl-5">
      <h2 class="section-heading mb-2 text-base">Recorded effect</h2>
      <p class="text-3xl leading-snug">
        <span class="text-subheading tick">1.36%</span>
        <span class="text-subheading mx-2">&rarr;</span>
        <span class="text-accent font-black tick">64.66%</span>
      </p>
      <p class="text-subheading mt-2">
        Grid accuracy, swapping one-hot targets for the circular replica targets below.
        The figure is recorded in the loss module itself.
      </p>
    </section>

    <!-- The two losses side by side -->
    <section class="mb-12">
      <h2 class="rule-heading section-heading mb-5 text-base"><span>Circular, then dense ordinal</span></h2>

      <div class="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
        <div class="surface-card rounded p-5">
          <h3 class="subsection-heading mb-1">CircularReplicaLoss</h3>
          <p class="text-subheading text-xs mb-3 tick">Opinion@nca &middot; earlier</p>
          <p class="mb-3">
            Treats the ten colours as a ring. Target mass leaks onto neighbouring
            <em>colours</em>, weighted by inverse circular distance.
          </p>
          <div class="mb-3"><Katex display :expr="TEX.dist" /></div>
          <p class="text-subheading text-sm">
            Smooth between colours. But it asserts that colour 4 is nearer colour 3
            than colour 8 &mdash; and in ARC, colour indices are arbitrary labels.
          </p>
        </div>

        <div class="surface-card rounded p-5">
          <h3 class="subsection-heading mb-1">DenseOrdinalReplicaLoss</h3>
          <p class="text-subheading text-xs mb-3 tick">Opinion 3773f4e &middot; 2025-10-26</p>
          <p class="mb-3">
            Keeps the replicas, drops the ring. Distance is linear <em>within</em> a
            colour's own replica block, and a flat Hamming penalty everywhere else.
          </p>
          <div class="mb-3"><Katex display :expr="TEX.dense" /></div>
          <p class="text-subheading text-sm">
            Smoothness lives where it is real &mdash; replica index is a genuine
            continuum &mdash; and every wrong colour is equally wrong.
          </p>
        </div>
      </div>

      <div class="surface-card rounded p-5">
        <h3 class="subsection-heading mb-3">Distance to every one of the {{ NUM_COLORS * NUM_REPLICAS }} classes</h3>
        <p class="text-subheading text-sm mb-4">
          Target colour {{ target }}. Each cell is one class; darker means further from the target.
        </p>

        <div class="mb-4">
          <p class="text-subheading text-xs mb-1 tick">circular — mass spreads across colour blocks</p>
          <div class="flex gap-px h-8 rounded overflow-hidden border hairline">
            <div
              v-for="(v, i) in row" :key="`c${i}`" class="flex-1"
              :style="{ background: ARC_COLORS[Math.floor(i / NUM_REPLICAS)], opacity: 0.15 + 0.85 * Math.sqrt(v / maxV) }"
              :title="`class ${i}: ${(v * 100).toFixed(4)}%`"
            ></div>
          </div>
        </div>

        <div>
          <p class="text-subheading text-xs mb-1 tick">dense ordinal — a V inside one block, flat elsewhere</p>
          <div class="flex gap-px h-8 rounded overflow-hidden border hairline">
            <div
              v-for="(d, i) in denseDist" :key="`d${i}`" class="flex-1"
              :style="{ background: ARC_COLORS[Math.floor(i / NUM_REPLICAS)], opacity: 1 - 0.85 * (d / NUM_REPLICAS) }"
              :title="`class ${i}: distance ${d}`"
            ></div>
          </div>
        </div>

        <p class="text-subheading text-sm mt-4">
          The dense version has structure in exactly one block &mdash; a V centred on
          replica {{ Math.floor(NUM_REPLICAS / 2) }} of colour {{ target }} &mdash; and is
          deliberately featureless across the other {{ NUM_COLORS - 1 }} colours. That
          flatness is the claim: nothing is known about how colours relate, so nothing
          is encoded.
        </p>
      </div>
    </section>

    <!-- Controls -->
    <section class="mb-8">
      <h2 class="rule-heading section-heading mb-5 text-base"><span>Target colour</span></h2>
      <div class="flex flex-wrap gap-2 mb-6">
        <button
          v-for="c in NUM_COLORS"
          :key="c - 1"
          class="swatch"
          :class="{ 'is-selected': target === c - 1 }"
          :style="{ background: ARC_COLORS[c - 1] }"
          :aria-pressed="target === c - 1"
          :aria-label="`Target colour ${c - 1}`"
          @click="target = c - 1"
        >
          <span class="swatch-index">{{ c - 1 }}</span>
        </button>
      </div>

      <div class="max-w-md">
        <div class="flex items-baseline justify-between mb-1">
          <label for="spillover" class="text-subheading text-sm">Spillover</label>
          <code class="provenance">s = {{ spillover.toFixed(3) }}</code>
        </div>
        <input
          id="spillover"
          v-model.number="spillover"
          type="range"
          min="0"
          max="0.35"
          step="0.005"
          class="range range-accent range-sm w-full"
          aria-describedby="spillover-note"
        />
        <!-- Fixed height: the note changes length, and without this the slider
             jumps sideways as you drag it. -->
        <p id="spillover-note" class="text-subheading text-xs mt-1 h-4 leading-4">
          {{ spilloverNote }}
        </p>
      </div>
    </section>

    <!-- Colour circle + mass -->
    <section class="mb-10 grid grid-cols-1 md:grid-cols-2 gap-10 items-start">
      <div>
        <h3 class="section-heading mb-4 text-sm">The colour circle</h3>
        <svg viewBox="-130 -130 260 260" class="w-full max-w-xs" role="img"
             :aria-label="`Colour circle with target ${target}; ring thickness shows probability mass`">
          <circle cx="0" cy="0" r="88" fill="none" :stroke="'var(--color-hairline)'" stroke-width="1" />
          <g v-for="(c, i) in ARC_COLORS" :key="i">
            <line
              v-if="i !== target"
              :x1="pos(target).x" :y1="pos(target).y" :x2="pos(i).x" :y2="pos(i).y"
              :stroke="'var(--color-accent)'"
              :stroke-width="0.4 + 26 * mass[i]"
              :opacity="0.5"
            />
          </g>
          <g v-for="(c, i) in ARC_COLORS" :key="`n${i}`">
            <circle
              :cx="pos(i).x" :cy="pos(i).y"
              :r="i === target ? 19 : 13"
              :fill="c"
              :stroke="i === target ? 'var(--color-accent)' : 'var(--color-hairline)'"
              :stroke-width="i === target ? 3 : 1"
            />
            <text
              :x="pos(i).x" :y="pos(i).y + 4"
              text-anchor="middle" font-size="11"
              :fill="isDark(c) ? '#fff' : '#000'"
            >{{ i }}</text>
          </g>
        </svg>
        <p class="text-subheading text-sm mt-3">
          Line thickness is the mass colour {{ target }} donates. Note that
          {{ (target + 9) % 10 }} and {{ (target + 1) % 10 }} are equally close —
          the palette wraps.
        </p>
        <div class="mt-3">
          <Katex display :expr="TEX.dist" />
        </div>
      </div>

      <div>
        <h3 class="section-heading mb-4 text-sm">Target mass per colour</h3>
        <div class="space-y-1.5">
          <div v-for="(m, i) in mass" :key="i" class="flex items-center gap-3">
            <span class="w-5 h-5 rounded-sm border hairline shrink-0" :style="{ background: ARC_COLORS[i] }"></span>
            <span class="w-6 text-subheading text-sm tick">{{ i }}</span>
            <span class="w-8 text-subheading text-xs tick">d{{ circularDistance(target, i) }}</span>
            <div class="flex-1 surface-soft rounded h-4 overflow-hidden">
              <div class="bg-accent h-full transition-all duration-300" :style="{ width: barWidth(m) }"></div>
            </div>
            <span class="w-20 text-right tick text-sm">{{ (m * 100).toFixed(3) }}%</span>
          </div>
        </div>
        <p class="text-subheading text-sm mt-3">
          Bars are on a shared square-root scale so the spillover stays visible next to the
          {{ ((1 - spillover) * 100).toFixed(1) }}% on the target itself.
        </p>
      </div>
    </section>

    <!-- Why replicas -->
    <section class="mb-10">
      <h2 class="rule-heading section-heading mb-5 text-base"><span>Why replicas</span></h2>
      <div class="mb-5 overflow-x-auto">
        <Katex display :expr="TEX.target" />
        <p class="text-subheading text-sm mt-2">
          with inverse-distance weights
          <Katex :expr="TEX.weight" /> normalised so that
          <Katex :expr="TEX.normalised" />.
        </p>
      </div>

      <p class="mb-4 max-w-3xl">
        Each colour owns {{ NUM_REPLICAS }} output classes rather than one, so the head predicts
        over {{ NUM_COLORS * NUM_REPLICAS }} classes. Mass is split evenly inside a colour's block
        and spread <em>across</em> blocks by circular distance &mdash; the spillover is between
        colours, never between replicas of the same colour.
      </p>
      <div class="flex gap-px h-12 rounded overflow-hidden border hairline" role="img"
           :aria-label="`Target distribution over ${NUM_COLORS * NUM_REPLICAS} classes`">
        <div
          v-for="(v, i) in row"
          :key="i"
          class="flex-1"
          :style="{
            background: ARC_COLORS[Math.floor(i / NUM_REPLICAS)],
            opacity: 0.25 + 0.75 * Math.sqrt(v / maxV)
          }"
          :title="`class ${i} (colour ${Math.floor(i / NUM_REPLICAS)}): ${(v * 100).toFixed(4)}%`"
        ></div>
      </div>
      <p class="text-subheading text-sm mt-2">
        {{ NUM_COLORS * NUM_REPLICAS }} classes, ten per colour. Opacity is the probability
        assigned to each class.
      </p>
    </section>

    <!-- Gradient comparison -->
    <section class="mb-10">
      <h2 class="rule-heading section-heading mb-5 text-base"><span>What the network feels</span></h2>
      <p class="mb-4 max-w-3xl">
        A prediction that is <em>wrong but adjacent</em> should be penalised less than one that is
        wrong and far away. One-hot cannot express that. Below, the answer is colour
        {{ target }} and the model confidently predicts each colour in turn.
      </p>

      <div class="surface-card rounded p-5 mb-4">
        <p class="text-subheading text-sm mb-4">
          Cost of confidently predicting each <em>wrong</em> colour. The right answer is excluded:
          it costs {{ correctLoss.toFixed(2) }} against roughly {{ wrongMean.toFixed(1) }} for a
          miss, and at that scale the differences between misses would be invisible.
        </p>

        <!-- Explicit track height: percentage heights need a definite parent. -->
        <div class="flex items-end gap-2">
          <div v-for="w in wrongColors" :key="w.color" class="flex-1 flex flex-col items-center gap-1">
            <div class="w-full h-40 flex items-end gap-1">
              <div
                class="flex-1 rounded-t transition-all duration-300"
                :style="{ height: barH(w.hard, 'hard'), background: 'var(--color-hairline)' }"
                :title="`one-hot: ${w.hard.toFixed(4)}`"
              ></div>
              <div
                class="flex-1 rounded-t bg-accent transition-all duration-300"
                :style="{ height: barH(w.soft, 'soft') }"
                :title="`replica: ${w.soft.toFixed(4)}`"
              ></div>
            </div>
            <span class="w-4 h-4 rounded-sm border hairline" :style="{ background: ARC_COLORS[w.color] }"></span>
            <span class="text-subheading text-xs tick">d{{ w.dist }}</span>
          </div>
        </div>

        <div class="flex flex-wrap gap-5 mt-4 text-sm items-center">
          <span class="flex items-center gap-2">
            <span class="w-3 h-3 rounded-sm" style="background: var(--color-hairline)"></span>
            <span class="text-subheading">one-hot</span>
          </span>
          <span class="flex items-center gap-2">
            <span class="w-3 h-3 rounded-sm bg-accent"></span>
            <span class="text-subheading">replica</span>
          </span>
          <span class="text-subheading ml-auto tick text-xs">
            each column scaled to its own range &mdash; spread: one-hot
            {{ hardSpread.toFixed(4) }}, replica {{ softSpread.toFixed(4) }}
          </span>
        </div>
      </div>

      <p class="text-subheading text-sm max-w-3xl">
        Under one-hot every wrong colour costs <em>exactly</em> the same &mdash; the grey bars are
        flat, so the gradient carries no information about which colours are close. Under the
        replica target the cost rises with circular distance, giving a V centred on the answer.
        At the default s = {{ DEFAULTS.spillover }} the effect is deliberately small; raise the
        spillover slider above and the V deepens.
      </p>
    </section>

    <section class="mt-12 pt-8 border-t hairline">
      <h2 class="rule-heading section-heading mb-5 text-base"><span>The loss</span></h2>
      <div class="overflow-x-auto">
        <Katex display :expr="TEX.loss" />
      </div>
      <p class="text-subheading text-sm mt-2">
        with <Katex :expr="TEX.lambda" />,
        <Katex :expr="TEX.s" />,
        <Katex :expr="TEX.R" /> and
        <Katex :expr="TEX.N" /> colours, giving
        <Katex :expr="TEX.classes" /> output classes.
      </p>
    </section>
  </div>
</template>

<script setup lang="ts">
// @ts-ignore - Nuxt auto-imports
import { definePageMeta, useHead } from '#imports'
import { ref, computed } from 'vue'
import {
  NUM_COLORS, NUM_REPLICAS, DEFAULTS, ARC_COLORS,
  circularDistance, createTargetDistributions, massPerColor, replicaLoss, oneHot,
  denseOrdinalDistance
} from '~/utils/replica-loss'

definePageMeta({ layout: 'default' })

// LaTeX lives here, not in template attributes: inside an HTML attribute a
// backslash is literal, so "\\min" reaches KaTeX as a line break plus "min".
const TEX = {
  dist: String.raw`d(a,b)=\min\bigl(|a-b|,\; N-|a-b|\bigr)`,
  dense: String.raw`d(r, c^{\star}) = \begin{cases} |r - m^{\star}| & \lfloor r/R \rfloor = c^{\star} \\[0.5em] R & \text{otherwise} \end{cases}`,
  target: String.raw`p(r \mid c^{\star}) = \begin{cases}
    \dfrac{1-s}{R} & r \in [c^{\star}R,\; (c^{\star}+1)R) \\[1.1em]
    \dfrac{s\, \tilde{w}\bigl(d(c,c^{\star})\bigr)}{R} & r \in [cR,\; (c+1)R),\; c \neq c^{\star}
  \end{cases}`,
  weight: String.raw`w(d)=1/d`,
  normalised: String.raw`\textstyle\sum_{c \neq c^{\star}} \tilde{w} = 1`,
  loss: String.raw`\mathcal{L} \;=\; \underbrace{\mathrm{KL}\bigl(p^{\star} \,\|\, p_{\theta}\bigr)}_{\text{soft cross-entropy}} \;-\; \lambda \underbrace{H(p_{\theta})}_{\text{entropy bonus}}`,
  lambda: String.raw`\lambda = 0.01`,
  s: String.raw`s = 0.03`,
  R: String.raw`R = 10`,
  N: String.raw`N = 10`,
  classes: String.raw`N \cdot R = 100`
}


const target = ref(0)
const spillover = ref(DEFAULTS.spillover)
const spilloverNote = computed(() => {
  if (spillover.value === 0) return 'one-hot — no colour structure at all'
  if (spillover.value === DEFAULTS.spillover) return 'the default used in training'
  return spillover.value > DEFAULTS.spillover ? 'more mass on neighbours' : 'less mass on neighbours'
})

const denseDist = computed(() => denseOrdinalDistance(target.value))
const row = computed(() => createTargetDistributions(NUM_COLORS, NUM_REPLICAS, spillover.value)[target.value]!)
const mass = computed(() => massPerColor(row.value))
const maxV = computed(() => Math.max(...row.value))

// Shared sqrt scale: linear bars would render 0.6% as invisible next to 97%.
const barWidth = (m: number) => `${Math.sqrt(m) * 100}%`

const pos = (i: number) => {
  const a = (i / NUM_COLORS) * Math.PI * 2 - Math.PI / 2
  return { x: Math.cos(a) * 88, y: Math.sin(a) * 88 }
}

const isDark = (hex: string) => {
  const n = parseInt(hex.slice(1), 16)
  const [r, g, b] = [(n >> 16) & 255, (n >> 8) & 255, n & 255]
  return 0.299 * r + 0.587 * g + 0.114 * b < 140
}

// Loss for a confident prediction of each colour in turn.
const confidentLogits = (c: number) => {
  const v = new Array(NUM_COLORS * NUM_REPLICAS).fill(0)
  for (let i = c * NUM_REPLICAS; i < (c + 1) * NUM_REPLICAS; i++) v[i] = 6
  return v
}
const softCurve = computed(() =>
  Array.from({ length: NUM_COLORS }, (_, c) => replicaLoss(confidentLogits(c), row.value).total)
)
const hardCurve = computed(() =>
  Array.from({ length: NUM_COLORS }, (_, c) => replicaLoss(confidentLogits(c), oneHot(target.value)).total)
)

// Spread over the *wrong* colours only: the correct one dwarfs them.
const spreadOf = (xs: number[]) => {
  const wrong = xs.filter((_, i) => i !== target.value)
  return Math.max(...wrong) - Math.min(...wrong)
}
const softSpread = computed(() => spreadOf(softCurve.value))
const hardSpread = computed(() => spreadOf(hardCurve.value))

// Wrong answers only. Including the correct one puts every miss within 0.03 of
// its neighbours on a ~6-wide axis, which renders as ten identical bars.
const wrongColors = computed(() =>
  Array.from({ length: NUM_COLORS }, (_, c) => c)
    .filter((c) => c !== target.value)
    .map((c) => ({
      color: c,
      dist: circularDistance(target.value, c),
      soft: softCurve.value[c]!,
      hard: hardCurve.value[c]!
    }))
)

const correctLoss = computed(() => softCurve.value[target.value]!)
const wrongMean = computed(
  () => wrongColors.value.reduce((a, w) => a + w.soft, 0) / wrongColors.value.length
)

// Each series is scaled to its own range, so a flat series stays flat and a
// varying one shows its shape. A shared axis would flatten both.
const barH = (v: number, series: 'soft' | 'hard') => {
  const xs = wrongColors.value.map((w) => w[series])
  const lo = Math.min(...xs)
  const hi = Math.max(...xs)
  if (hi - lo < 1e-9) return '55%'
  return `${18 + 82 * ((v - lo) / (hi - lo))}%`
}

useHead({
  title: 'Dense Ordinal Replica Loss',
  meta: [
    {
      name: 'description',
      content:
        'Interactive walkthrough of the Dense Ordinal Replica Loss: circular colour topology, replica classes and inverse-distance spillover. Recorded effect on ARC grid accuracy: 1.36% to 64.66%.'
    }
  ]
})
</script>
