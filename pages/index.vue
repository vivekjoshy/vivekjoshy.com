<template>
  <div class="py-12 bg-white">
    <div class="hero min-h-[70vh] bg-white">
      <div class="hero-content text-center">
        <div class="max-w-xl">
          <h1 class="text-5xl font-bold mb-8">
            <span class="font-thin">VIVEK</span><span class="font-black">JOSHY</span>
          </h1>
          <p class="text-xl mb-8">Data Scientist & Computational Biologist</p>
          <p class="mb-8 text-lg">
            Specialized in formal systems, deep learning, and bioinformatics.
            Developing novel computational methods for complex biological problems.
          </p>
          <div class="flex justify-center">
            <NuxtLink to="/resume" class="btn btn-accent text-white">View Resume</NuxtLink>
          </div>
        </div>
      </div>
    </div>
    
    <div class="container mx-auto mt-16">
      <h2 class="section-heading mb-8 text-center">Featured Skills</h2>
      <div class="grid grid-cols-1 md:grid-cols-3 gap-8">
        <div class="card bg-white border border-gray-100 shadow-md">
          <div class="card-body">
            <h3 class="card-title subsection-heading">Deep Learning</h3>
            <p>Developing advanced neural networks for biological sequence analysis and molecular interaction prediction.</p>
          </div>
        </div>
        
        <div class="card bg-white border border-gray-100 shadow-md">
          <div class="card-body">
            <h3 class="card-title subsection-heading">Formal Systems</h3>
            <p>Applying mathematical logic and formal verification to ensure robust computational methods.</p>
          </div>
        </div>
        
        <div class="card bg-white border border-gray-100 shadow-md">
          <div class="card-body">
            <h3 class="card-title subsection-heading">Computational Biology</h3>
            <p>Expertise in protein-molecule interactions, structural bioinformatics, and computational genomics.</p>
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
    { name: 'description', content: 'Vivek Joshy - Data Scientist & Computational Biologist specializing in formal systems, deep learning, and bioinformatics.' }
  ]
});
</script> 