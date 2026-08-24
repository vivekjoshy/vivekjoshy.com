<template>
  <div class="py-8 max-w-4xl mx-auto bg-white">
    <div class="mb-10">
      <h1 class="text-4xl font-bold mb-3">
        <span class="font-thin">ARC-</span><span class="font-black">AGI</span>
      </h1>
      <p class="text-subheading text-lg">{{ data.span }}</p>
    </div>

    <!-- The finding, stated before anything else -->
    <section class="mb-12 border-l-4 border-accent pl-5">
      <h2 class="section-heading mb-2 text-base">The finding</h2>
      <p class="text-2xl leading-snug">{{ data.finding }}</p>
    </section>

    <section class="mb-10">
      <h2 class="section-heading border-b border-accent pb-1 mb-6 text-xl">Architectures</h2>

      <div
        v-for="a in data.architectures"
        :key="a.name"
        class="mb-8 pb-8 border-b border-gray-100 last:border-0"
      >
        <div class="flex flex-col md:flex-row md:justify-between md:items-baseline mb-1">
          <h3 class="subsection-heading text-lg">
            <a v-if="a.repo" :href="a.repo" target="_blank" rel="noopener noreferrer" class="hover:text-accent">{{ a.name }}</a>
            <span v-else>{{ a.name }}</span>
          </h3>
          <span class="text-subheading">{{ a.family }} &middot; {{ a.year }}</span>
        </div>

        <p class="text-lg mb-3">{{ a.approach }}</p>

        <div v-if="a.failure">
          <span class="section-heading text-sm">Where it broke</span>
          <p class="text-lg">{{ a.failure }}</p>
        </div>
        <p v-else class="text-subheading italic">Write-up pending.</p>
      </div>
    </section>

    <p class="text-subheading">{{ data.note }}</p>
  </div>
</template>

<script setup lang="ts">
// @ts-ignore - Nuxt auto-imports
import { definePageMeta, useHead } from '#imports'
import data from '~/data/arc-architectures.json'

definePageMeta({ layout: 'default' })

useHead({
  title: 'ARC-AGI',
  meta: [{ name: 'description', content: `ARC-AGI solver architectures and where each one broke. ${data.finding}` }]
})
</script>
