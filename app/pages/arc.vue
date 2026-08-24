<template>
  <div class="py-8 max-w-4xl mx-auto">
    <div class="mb-10">
      <h1 class="text-4xl font-bold mb-3">
        <span class="font-thin">ARC-</span><span class="font-black">AGI</span>
      </h1>
      <p class="text-subheading text-lg">{{ data.span }}</p>
    </div>

    <!-- The finding, stated before anything else -->
    <section class="mb-12 border-l-4 border-accent pl-5">
      <h2 class="section-heading mb-2 text-base">The finding</h2>
      <p class="text-2xl leading-snug balance">{{ data.finding }}</p>
    </section>

    <!-- Scale of the attempt -->
    <section class="mb-12 grid grid-cols-3 gap-6">
      <div>
        <div class="text-3xl font-black text-accent tick">{{ data.architectures.length }}</div>
        <div class="text-subheading text-sm">architectures</div>
      </div>
      <div>
        <div class="text-3xl font-black text-accent tick">{{ families.length }}</div>
        <div class="text-subheading text-sm">distinct families</div>
      </div>
      <div>
        <div class="text-3xl font-black text-accent tick">{{ totalCommits.toLocaleString('en-US') }}</div>
        <div class="text-subheading text-sm">commits across those branches</div>
      </div>
    </section>

    <section v-for="family in families" :key="family" class="mb-10">
      <h2 class="rule-heading section-heading mb-5 text-base">
        <span>{{ family }}</span>
      </h2>

      <div
        v-for="a in byFamily(family)"
        :key="a.repo + a.branch"
        class="mb-6 pb-6 border-b hairline last:border-0"
      >
        <div class="flex flex-col md:flex-row md:justify-between md:items-baseline mb-1 gap-1">
          <h3 class="subsection-heading text-lg">
            <a
              v-if="a.public"
              :href="a.public"
              target="_blank"
              rel="noopener noreferrer"
              class="link-underline hover:text-accent"
              >{{ a.name }}</a
            >
            <span v-else>{{ a.name }}</span>
          </h3>
          <span class="text-subheading text-sm tick">
            {{ a.span }}<template v-if="a.commits"> &middot; {{ a.commits }} commits</template>
          </span>
        </div>

        <p class="text-subheading text-sm mb-2">
          <code class="provenance">{{ a.repo }}@{{ a.branch }}</code>
        </p>

        <p class="text-lg mb-3">{{ a.approach }}</p>

        <div v-if="a.failure">
          <span class="section-heading text-sm">Where it broke</span>
          <p class="text-lg">{{ a.failure }}</p>
        </div>
        <p v-else class="text-subheading italic text-sm">Write-up pending.</p>
      </div>
    </section>

    <p class="text-subheading text-sm">{{ data.note }}</p>
  </div>
</template>

<script setup lang="ts">
// @ts-ignore - Nuxt auto-imports
import { definePageMeta, useHead } from '#imports'
import { computed } from 'vue'
import data from '~/data/arc-architectures.json'

definePageMeta({ layout: 'default' })

// First-appearance order, not alphabetical, so each family reads roughly
// chronologically.
const families = computed(() => [...new Set(data.architectures.map((a) => a.family))])
const byFamily = (f: string) => data.architectures.filter((a) => a.family === f)
const totalCommits = computed(() => data.architectures.reduce((sum, a) => sum + (a.commits ?? 0), 0))

useHead({
  title: 'ARC-AGI',
  meta: [
    { name: 'description', content: `ARC-AGI solver architectures and where each one broke. ${data.finding}` }
  ]
})
</script>
