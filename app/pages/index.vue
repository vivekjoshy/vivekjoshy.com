<template>
  <div>
    <!-- Hero: asymmetric, left-anchored, oversized -->
    <section class="py-16 md:py-24 grid grid-cols-1 md:grid-cols-12 gap-8 items-end">
      <div class="md:col-span-8">
        <h1 class="display font-bold mb-7 rise">
          <span class="font-thin">VIVEK</span><span class="font-black">JOSHY</span>
        </h1>
        <p class="lede balance mb-5 rise rise-1">
          Formal methods, grammar induction, and neuro-symbolic computation
          &mdash; systems that show their reasoning instead of asserting it.
        </p>
        <p class="text-subheading pretty max-w-[52ch] rise rise-2">
          Lead Scientist, Data &amp; ML at Vairified Corp. I maintain
          <NuxtLink to="/openskill" class="text-accent link-underline">OpenSkill</NuxtLink>,
          and it runs in production under the platform I build.
        </p>
      </div>

      <div class="md:col-span-4 rise rise-3">
        <dl class="grid grid-cols-2 md:grid-cols-1 gap-x-6 gap-y-5 m-0">
          <div v-for="stat in stats" :key="stat.label">
            <dt class="text-subheading text-sm order-2">{{ stat.label }}</dt>
            <dd class="text-3xl md:text-4xl font-black text-accent tick m-0">{{ stat.value }}</dd>
          </div>
        </dl>
      </div>
    </section>

    <!-- Artifacts -->
    <section class="py-10">
      <h2 class="rule-heading section-heading mb-8 text-base">
        <span>Things I've built</span>
      </h2>

      <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
        <article
          v-for="(a, i) in artifacts"
          :key="a.title"
          class="surface-card lift rounded p-6 flex flex-col"
          :class="a.wide ? 'md:col-span-2' : ''"
        >
          <div class="flex items-baseline justify-between mb-2">
            <h3 class="subsection-heading text-xl">{{ a.title }}</h3>
            <span class="text-subheading text-sm tick">{{ String(i + 1).padStart(2, '0') }}</span>
          </div>
          <p class="mb-4 flex-1">{{ a.body }}</p>
          <div class="flex flex-wrap gap-x-4 gap-y-1">
            <template v-for="l in a.links" :key="l.label">
              <NuxtLink
                v-if="l.to"
                :to="l.to"
                class="text-accent link-underline"
                :class="l.primary ? 'font-semibold' : ''"
              >
                {{ l.label }}
              </NuxtLink>
              <a
                v-else
                :href="l.href"
                target="_blank"
                rel="noopener noreferrer"
                class="text-accent link-underline"
                :class="l.primary ? 'font-semibold' : ''"
              >
                {{ l.label }}
              </a>
            </template>
          </div>
        </article>
      </div>
    </section>
  </div>
</template>

<script setup lang="ts">
// @ts-ignore - Nuxt auto-imports
import { definePageMeta, useHead } from '#imports'
import evidence from '~/data/evidence.json'

definePageMeta({ layout: 'default' })

useStructuredData([
  personEntity(),
  {
    '@type': 'WebSite',
    '@id': SITE_ID,
    url: SITE,
    name: NAME,
    publisher: { '@id': PERSON_ID },
    inLanguage: 'en'
  },
  {
    // mainEntity is the only property Google requires; dateCreated and
    // dateModified are recommended. This is the single canonical profile —
    // /resume deliberately does not also claim ProfilePage, because two of them
    // for one person is two competing profiles.
    '@type': 'ProfilePage',
    url: SITE,
    name: NAME,
    isPartOf: { '@id': SITE_ID },
    mainEntity: { '@id': PERSON_ID },
    primaryImageOfPage: `${SITE}/og-image.png`,
    dateCreated: '2025-03-26T18:14:53+05:30',
    dateModified: '2026-08-25T00:26:27+05:30',
    inLanguage: 'en'
  }
])


const fmt = (n?: number | null) => (typeof n === 'number' ? n.toLocaleString('en-US') : '—')

const stats = [
  { label: 'PyPI downloads / month', value: fmt(evidence.pypi?.lastMonth) },
  { label: 'academic citations', value: fmt(evidence.paper?.citations) },
  { label: 'independent ports', value: String(evidence.ports.length) }
]

// Links are branched explicitly rather than via <component :is="'NuxtLink'">.
// A string component name does not resolve in <script setup> without
// resolveComponent, so that form emitted a literal <NuxtLink> element into the
// HTML — an unknown tag the browser will not navigate.
const artifacts = [
  {
    title: 'OpenSkill',
    wide: true,
    body:
      'Bayesian rating library for asymmetric multi-team, multiplayer matches, implementing the Weng–Lin models. ' +
      'Pinned as a dependency in Ray/RLlib and the rating layer in Neural MMO — both checkable in those ' +
      'projects\' manifests. Reported in production at OpenAI, MultiVersus, Hunt: Showdown, and BeyondAllReason.',
    links: [
      { label: 'Interactive playground', to: '/openskill', primary: true },
      { label: 'Docs', href: 'https://openskill.me' },
      { label: 'Source', href: 'https://github.com/vivekjoshy/openskill.py' },
      { label: 'Paper', href: 'https://doi.org/10.21105/joss.05901' },
      { label: 'arXiv', href: 'https://arxiv.org/abs/2401.05451' }
    ]
  },
  {
    title: 'ARC-AGI',
    body:
      'Two years across eighteen solver architectures in nine families, converging on one negative result about where the ' +
      'difficulty in ARC actually lives.',
    links: [{ label: 'The finding', to: '/arc', primary: true }]
  },
  {
    title: 'Boundary kernel theory',
    body:
      'Grammar induction, monograph in progress. The line of work runs back to OpenGrammar in 2022. Open quantities: ' +
      'k*, the interaction order, and the renormalizability conjectures.',
    links: [
      { label: 'OpenGrammar', href: 'https://github.com/vivekjoshy/OpenGrammar' }
    ]
  }
]

usePageSeo({
  title: 'Home',
  description: 'Vivek Joshy - Lead Scientist, Data & ML at Vairified Corp. Formal methods, grammar induction, neuro-symbolic computation, and interpretable AI. Maintainer of OpenSkill.'
})
</script>
