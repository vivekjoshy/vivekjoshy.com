<template>
  <div class="py-12 bg-white">
    <div class="hero min-h-[70vh] bg-white">
      <div class="hero-content text-center">
        <div class="max-w-2xl">
          <h1 class="text-5xl font-bold mb-8">
            <span class="font-thin">VIVEK</span><span class="font-black">JOSHY</span>
          </h1>
          <p class="text-xl mb-8">Lead Scientist, Data &amp; ML at Vairified Corp</p>
          <p class="mb-8 text-lg">
            I work on formal methods, grammar induction, and neuro-symbolic
            computation &mdash; systems that show their reasoning instead of
            asserting it. I wrote OpenSkill, the Bayesian rating library, and it
            runs in production under the platform I build at Vairified.
          </p>
          <div class="flex justify-center">
            <NuxtLink to="/resume" class="btn btn-accent text-white">View Resume</NuxtLink>
          </div>
        </div>
      </div>
    </div>

    <div class="container mx-auto mt-16">
      <h2 class="section-heading mb-8 text-center">Things I've Built</h2>
      <div class="grid grid-cols-1 md:grid-cols-3 gap-8">

        <div class="card bg-white border border-gray-100 shadow-md">
          <div class="card-body">
            <h3 class="card-title subsection-heading">OpenSkill</h3>
            <p>
              Bayesian rating system for asymmetric multi-team, multiplayer
              matches. Published in the Journal of Open Source Software. In
              production use at OpenAI, Marvel Rivals, Hunt: Showdown, and
              BeyondAllReason.
            </p>
            <div class="mt-3 flex flex-wrap gap-x-4 gap-y-1">
              <a href="https://openskill.me" target="_blank" rel="noopener noreferrer" class="text-accent hover:underline">Docs</a>
              <a href="https://github.com/vivekjoshy/openskill.py" target="_blank" rel="noopener noreferrer" class="text-accent hover:underline">Source</a>
              <a href="https://doi.org/10.21105/joss.05901" target="_blank" rel="noopener noreferrer" class="text-accent hover:underline">Paper</a>
              <a href="https://arxiv.org/abs/2401.05451" target="_blank" rel="noopener noreferrer" class="text-accent hover:underline">arXiv</a>
            </div>
          </div>
        </div>

        <div class="card bg-white border border-gray-100 shadow-md">
          <div class="card-body">
            <h3 class="card-title subsection-heading">Glia</h3>
            <p>
              Glass-box defeasible-inheritance reasoner. Settles inferences by
              graded biased competition rather than next-token prediction, and
              emits a derivation trace for every conclusion.
            </p>
            <div class="mt-3">
              <NuxtLink to="/resume#research" class="text-accent hover:underline">Research notes</NuxtLink>
            </div>
          </div>
        </div>

        <div class="card bg-white border border-gray-100 shadow-md">
          <div class="card-body">
            <h3 class="card-title subsection-heading">ARC-AGI</h3>
            <p>
              Two years across roughly twelve solver architectures, converging on
              a single negative result about where the difficulty actually lives.
            </p>
            <div class="mt-3">
              <NuxtLink to="/resume#research" class="text-accent hover:underline">Research notes</NuxtLink>
            </div>
          </div>
        </div>

      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
// @ts-ignore - Nuxt auto-imports
import { definePageMeta, useHead } from '#imports';

definePageMeta({
  layout: "default"
});

useHead({
  title: 'Home',
  meta: [
    { name: 'description', content: 'Vivek Joshy - Lead Scientist, Data & ML at Vairified Corp. Formal methods, grammar induction, neuro-symbolic computation, and interpretable AI. Author of OpenSkill.' }
  ]
});
</script>
