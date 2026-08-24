<template>
  <div class="py-8 max-w-5xl mx-auto">
    <div class="mb-10">
      <h1 class="text-3xl sm:text-4xl font-bold mb-3">
        <span class="font-thin">ATHENA</span><span class="font-black">-TIR</span>
      </h1>
      <p class="lede balance mb-3">
        Ask one model the same maths problem sixty-four times, in eight different
        mathematical voices, and make every answer prove itself by executing.
        Then pool what survives by how sure the model sounded.
      </p>
      <p class="text-subheading text-sm">
        Token-aware heuristic ensembler with tool-integrated reasoning, built for
        AIMO-3. Ported from the notebook and checked against it on every build.
      </p>
    </div>

    <!-- Pipeline -->
    <section class="mb-10">
      <h2 class="rule-heading section-heading mb-5 text-base"><span>The pipeline</span></h2>
      <div class="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-5">
        <div v-for="s in PIPELINE" :key="s.n" class="surface-card rounded p-4">
          <div class="text-2xl sm:text-3xl font-black text-accent tick mb-1">{{ s.n }}</div>
          <div class="subsection-heading text-sm mb-1">{{ s.label }}</div>
          <p class="text-subheading text-xs m-0">{{ s.detail }}</p>
        </div>
      </div>
      <p class="text-subheading text-sm">
        Every generation is Python, and every program is run. Wrong code raises or
        prints nothing and removes itself &mdash; so there is no regex guessing about
        what the answer was.
      </p>
    </section>

    <!-- Token confidence -->
    <section class="mb-10">
      <h2 class="rule-heading section-heading mb-5 text-base"><span>What the tokens say</span></h2>
      <p class="mb-5 max-w-3xl">
        vLLM returns the top-5 logprobs per token. Two things are read off them:
        <Katex :expr="TEX.surprise" /> for how unexpected a token was, and how much of
        the probability mass the chosen token took.
      </p>

      <div class="flex flex-wrap gap-2 mb-5">
        <button
          v-for="t in TOKEN_CASES" :key="t.id"
          class="btn btn-sm" :class="tokenCase === t.id ? 'btn-accent' : 'btn-outline'"
          :aria-pressed="tokenCase === t.id"
          @click="tokenCase = t.id"
        >{{ t.label }}</button>
      </div>
      <p class="text-subheading mb-5">{{ activeToken.blurb }}</p>

      <!-- token trace -->
      <div class="surface-card rounded p-4 sm:p-5 mb-5 overflow-x-auto">
        <div class="flex items-end gap-1 h-28 min-w-[420px]">
          <div
            v-for="(c, i) in activeToken.confidences" :key="i"
            class="flex-1 rounded-t transition-all duration-300"
            :class="i >= criticalStart ? 'bg-accent' : 'series-secondary'"
            :style="{ height: `${8 + 92 * c}%` }"
            :title="`token ${i}: confidence ${c.toFixed(2)}, surprise ${activeToken.surprises[i].toFixed(2)}`"
          ></div>
        </div>
        <div class="flex justify-between mt-2 text-xs text-subheading">
          <span>token 0</span>
          <span class="text-accent">last 25% — where the answer usually is</span>
        </div>
      </div>

      <div class="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div v-for="m in metricCards" :key="m.label">
          <div class="text-xl sm:text-2xl font-black tick" :class="m.accent ? 'text-accent' : ''">
            {{ m.value }}
          </div>
          <div class="text-subheading text-xs">{{ m.label }}</div>
        </div>
      </div>

      <div class="mt-5 overflow-x-auto"><Katex display :expr="TEX.evidence" /></div>
      <p class="text-subheading text-sm">
        The heaviest weight is on the closing tokens, not the average. A solution that
        rambles then commits scores above one that is smooth throughout and wavers at
        the end &mdash; compare the last two presets.
      </p>
    </section>

    <!-- Ensembling -->
    <section class="mb-10">
      <h2 class="rule-heading section-heading mb-5 text-base"><span>Pooling the survivors</span></h2>

      <div class="flex flex-wrap gap-2 mb-5">
        <button
          v-for="s in SOLUTION_SETS" :key="s.id"
          class="btn btn-sm" :class="solutionSet === s.id ? 'btn-accent' : 'btn-outline'"
          :aria-pressed="solutionSet === s.id"
          @click="solutionSet = s.id"
        >{{ s.label }}</button>
      </div>
      <p class="text-subheading mb-5">{{ activeSet.blurb }}</p>

      <div class="max-w-md mb-6">
        <div class="flex items-baseline justify-between mb-1">
          <label for="beta" class="text-subheading text-sm">Sharpness</label>
          <code class="provenance">β = {{ beta.toFixed(3) }}</code>
        </div>
        <input id="beta" v-model.number="beta" type="range" min="0.05" max="1" step="0.01"
               class="range range-accent range-sm w-full" aria-describedby="beta-note" />
        <p id="beta-note" class="text-subheading text-xs mt-1 h-4 leading-4">
          {{ Math.abs(beta - ATHENA_DEFAULTS.beta) < 0.005 ? 'the notebook default — very sharp' : beta < ATHENA_DEFAULTS.beta ? 'sharper than the default' : 'flatter: evidence differences matter less' }}
        </p>
      </div>

      <div class="overflow-x-auto">
        <table class="table table-sm w-full min-w-[520px]">
          <thead>
            <tr>
              <th>Answer</th>
              <th class="text-right">Runs</th>
              <th class="text-right">Prompts</th>
              <th class="text-right">Mean evidence</th>
              <th class="text-right">Diversity ×</th>
              <th class="text-right">P(answer)</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="r in rows" :key="r.answer" :class="r.isMap ? 'font-semibold' : ''">
              <td class="tick">{{ r.answer }}<span v-if="r.isMap" class="text-accent ml-2">MAP</span></td>
              <td class="text-right tick">{{ r.runs }}</td>
              <td class="text-right tick">{{ r.prompts }}</td>
              <td class="text-right tick">{{ r.meanEvidence.toFixed(3) }}</td>
              <td class="text-right tick">{{ r.bonus.toFixed(3) }}</td>
              <td class="text-right tick" :class="r.isMap ? 'text-accent' : ''">{{ r.posterior.toFixed(4) }}</td>
            </tr>
          </tbody>
        </table>
      </div>
      <p class="text-subheading text-sm mt-3">{{ activeSet.lesson }}</p>
    </section>

    <!-- Honest notes -->
    <section class="mb-10">
      <h2 class="rule-heading section-heading mb-5 text-base"><span>Two properties worth knowing</span></h2>
      <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div class="surface-card rounded p-5">
          <h3 class="subsection-heading mb-2">The prior does nothing</h3>
          <p class="text-sm mb-2">
            Every answer receives the same pseudocount
            <Katex :expr="TEX.prior" />, so it is a constant factor that cancels when
            the posterior is normalised.
          </p>
          <p class="text-subheading text-sm m-0">
            Verified: <code class="provenance">priorStrength</code> 1.5 and 99 give
            identical posteriors to 1e-12. Harmless, but the knob is inert.
          </p>
        </div>
        <div class="surface-card rounded p-5">
          <h3 class="subsection-heading mb-2">Geometric mean is log pooling</h3>
          <p class="text-sm mb-2">
            <Katex :expr="TEX.geo" /> is a weighted geometric mean over tokens, which is
            logarithmic opinion pooling.
          </p>
          <p class="text-subheading text-sm m-0">
            One badly unsure token therefore drags the whole solution down, where an
            arithmetic mean would let confident neighbours hide it. That veto is the
            point, not a side effect.
          </p>
        </div>
      </div>
    </section>

    <p class="text-subheading text-sm">
      Qwen 3 30B A3B Instruct via vLLM, top-5 logprobs, temperatures 0.7 and 0.3,
      β = {{ ATHENA_DEFAULTS.beta }}. Ported from <code class="provenance">athena.ipynb</code>.
    </p>
  </div>
</template>

<script setup lang="ts">
// @ts-ignore - Nuxt auto-imports
import { definePageMeta, useHead } from '#imports'
import { ref, computed } from 'vue'
import {
  confidenceMetrics, evidenceStrength, ensemble, ATHENA_DEFAULTS, type Solution
} from '~/utils/athena'

definePageMeta({ layout: 'default' })

useStructuredData([
  {
    '@type': 'TechArticle',
    headline: 'ATHENA-TIR: prompt ensembling with tool-integrated reasoning',
    description:
      'Eight mathematical prompt styles, executed Python, and a Bayesian posterior over answers weighted by token-level confidence.',
    url: `${SITE}/ensemble`,
    author: { '@id': PERSON_ID },
    isPartOf: { '@id': SITE_ID },
    inLanguage: 'en'
  },
  breadcrumbs([{ name: 'Home', path: '/' }, { name: 'ATHENA-TIR', path: '/ensemble' }])
])


const TEX = {
  surprise: String.raw`-\log P(t)`,
  evidence: String.raw`E \;=\; \bigl(0.25\,\bar{c} \;+\; 0.35\,c_{\text{geo}} \;+\; 0.40\,c_{\text{crit}}\bigr)\,\bigl(1 - \mathrm{clip}(\sigma^2_{s}/10,\,0,\,0.3)\bigr)`,
  prior: String.raw`\alpha/|A|`,
  geo: String.raw`c_{\text{geo}} = \exp\!\bigl(\tfrac{1}{n}\textstyle\sum_i \log c_i\bigr)`
}

const PIPELINE = [
  { n: '8', label: 'prompts', detail: 'sympy, number theory, combinatorics, enumeration, equations, direct, recursion, analysis' },
  { n: '2', label: 'strategies', detail: 'temperature 0.7 for breadth, 0.3 for precision' },
  { n: '4', label: 'samples each', detail: "vLLM's n parameter, batched" },
  { n: '64', label: 'executions', detail: 'every one runs; failures filter themselves out' }
]

const TOKEN_CASES = [
  { id: 'confident', label: 'Confident throughout',
    blurb: 'The model is sure at every step. All three confidence views agree.',
    confidences: [...Array(8).fill(0.95), ...Array(4).fill(0.98)],
    surprises: Array(12).fill(0.05) },
  { id: 'wobbly', label: 'Wobbly',
    blurb: 'Alternating certainty. High surprise variance damps the evidence.',
    confidences: [0.9, 0.4, 0.85, 0.3, 0.92, 0.35, 0.88, 0.45],
    surprises: [0.1, 2.0, 0.2, 2.5, 0.1, 2.2, 0.15, 1.9] },
  { id: 'late_collapse', label: 'Collapses at the end',
    blurb: 'Smooth reasoning, then loses its nerve exactly where the answer is printed.',
    confidences: [...Array(8).fill(0.95), ...Array(4).fill(0.3)],
    surprises: [...Array(8).fill(0.05), ...Array(4).fill(2.5)] },
  { id: 'late_certain', label: 'Commits at the end',
    blurb: 'Meanders, then states the answer with conviction. Scores higher than the case above despite worse geometric confidence.',
    confidences: [...Array(8).fill(0.4), ...Array(4).fill(0.97)],
    surprises: [...Array(8).fill(2.0), ...Array(4).fill(0.03)] }
]

const SOLUTION_SETS = [
  { id: 'consensus', label: 'Broad consensus',
    blurb: 'Five runs from five different prompts all reach 42.',
    lesson: 'Nothing to arbitrate — one answer, maximum diversity, posterior near certainty.',
    solutions: [[42, 0, 0.8], [42, 1, 0.78], [42, 2, 0.82], [42, 3, 0.79], [42, 4, 0.81]] },
  { id: 'repeat', label: 'One prompt, repeated',
    blurb: 'Five runs of 42 all from prompt 0, against a single run of 17 from prompt 1.',
    lesson: 'Five samples of one prompt is close to one opinion resampled. The diversity bonus refuses to treat it as five independent votes.',
    solutions: [[42, 0, 0.8], [42, 0, 0.79], [42, 0, 0.81], [42, 0, 0.78], [42, 0, 0.8], [17, 1, 0.76]] },
  { id: 'minority', label: 'Diverse minority',
    blurb: 'Answer 42 has higher evidence but comes from one prompt; 17 is weaker per-run but reached three different ways.',
    lesson: 'The minority wins. Agreement across genuinely different approaches outweighs stronger evidence from a single line of attack — the central bet of the whole design.',
    solutions: [[42, 0, 0.85], [42, 0, 0.84], [42, 0, 0.86], [17, 1, 0.72], [17, 2, 0.71], [17, 3, 0.73]] }
]

const tokenCase = ref('confident')
const solutionSet = ref('consensus')
const beta = ref(ATHENA_DEFAULTS.beta)

const activeToken = computed(() => TOKEN_CASES.find((t) => t.id === tokenCase.value)!)
const criticalStart = computed(() => {
  const n = activeToken.value.confidences.length
  return n - Math.max(1, Math.floor(n / 4))
})
const metrics = computed(() =>
  confidenceMetrics(activeToken.value.confidences, activeToken.value.surprises)
)
const metricCards = computed(() => [
  { label: 'mean confidence', value: metrics.value.meanConfidence.toFixed(3) },
  { label: 'geometric confidence', value: metrics.value.geometricConfidence.toFixed(3) },
  { label: 'critical-token confidence', value: metrics.value.criticalTokenConfidence.toFixed(3) },
  { label: 'evidence strength', value: evidenceStrength(metrics.value).toFixed(4), accent: true }
])

const activeSet = computed(() => SOLUTION_SETS.find((s) => s.id === solutionSet.value)!)
const solutions = computed<Solution[]>(() =>
  activeSet.value.solutions.map(([answer, prompt, evidence]) => ({ answer, prompt, evidence }))
)
const result = computed(() => ensemble(solutions.value, beta.value))
const rows = computed(() => {
  const { posteriors, evidenceByAnswer, bonus } = result.value
  const promptsPer = new Map<number, Set<number>>()
  for (const s of solutions.value) {
    if (!promptsPer.has(s.answer)) promptsPer.set(s.answer, new Set())
    promptsPer.get(s.answer)!.add(s.prompt)
  }
  const best = [...posteriors.entries()].reduce((a, b) => (b[1] > a[1] ? b : a))[0]
  return [...posteriors.entries()]
    .sort((a, b) => b[1] - a[1])
    .map(([answer, posterior]) => {
      const ev = evidenceByAnswer.get(answer)!
      return {
        answer, posterior, runs: ev.length,
        prompts: promptsPer.get(answer)!.size,
        meanEvidence: ev.reduce((a, b) => a + b, 0) / ev.length,
        bonus: bonus.get(answer) ?? 1,
        isMap: answer === best
      }
    })
})

usePageSeo({
  title: 'ATHENA-TIR',
  description: 'ATHENA-TIR: prompt ensembling with tool-integrated reasoning for AIMO-3. Eight mathematical prompt styles, executed Python, token-level confidence, and a Bayesian posterior over answers.'
})
</script>
