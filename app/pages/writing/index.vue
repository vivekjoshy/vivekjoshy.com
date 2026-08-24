<template>
  <div class="py-8 max-w-4xl mx-auto bg-white">
    <h1 class="text-4xl font-bold mb-2">
      <span class="font-thin">WRIT</span><span class="font-black">ING</span>
    </h1>
    <p class="text-lg text-subheading mb-10">
      Notes on formal methods, grammar induction, and neuro-symbolic computation.
    </p>

    <div v-if="posts && posts.length">
      <article v-for="post in posts" :key="post.path" class="mb-8 pb-8 border-b border-gray-100 last:border-0">
        <div class="flex flex-col md:flex-row md:justify-between md:items-baseline mb-2">
          <h2 class="subsection-heading text-xl">
            <NuxtLink :to="post.path" class="hover:text-accent">{{ post.title }}</NuxtLink>
          </h2>
          <span class="text-subheading">{{ formatDate(post.date) }}</span>
        </div>
        <p class="text-lg">{{ post.description }}</p>
        <span v-if="post.draft" class="badge badge-accent badge-outline mt-3">Draft</span>
      </article>
    </div>

    <p v-else class="text-lg text-subheading">Nothing published yet.</p>
  </div>
</template>

<script setup lang="ts">
// @ts-ignore - Nuxt auto-imports
import { definePageMeta, useHead, useAsyncData, queryCollection } from '#imports';

definePageMeta({
  layout: "default"
});

const { data: posts } = await useAsyncData('writing-index', () =>
  queryCollection('writing').order('date', 'DESC').all()
);

const formatDate = (d: string) =>
  new Date(d).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' });

useHead({
  title: 'Writing',
  meta: [
    { name: 'description', content: 'Writing by Vivek Joshy on formal methods, grammar induction, neuro-symbolic computation, and interpretable AI.' }
  ]
});
</script>
