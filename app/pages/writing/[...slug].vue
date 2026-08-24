<template>
  <div class="py-8 max-w-3xl mx-auto bg-white">
    <template v-if="post">
      <NuxtLink to="/writing" class="text-accent hover:underline">&larr; Writing</NuxtLink>

      <h1 class="text-4xl font-bold mt-6 mb-2">{{ post.title }}</h1>
      <p class="text-subheading mb-10">{{ formatDate(post.date) }}</p>

      <article class="prose-resume">
        <ContentRenderer :value="post" />
      </article>
    </template>

    <template v-else>
      <h1 class="text-3xl font-semibold mb-4">Not found</h1>
      <NuxtLink to="/writing" class="text-accent hover:underline">Back to Writing</NuxtLink>
    </template>
  </div>
</template>

<script setup lang="ts">
// @ts-ignore - Nuxt auto-imports
import { definePageMeta, useHead, useAsyncData, useRoute, queryCollection } from '#imports';

definePageMeta({
  layout: "default"
});

const route = useRoute();

const { data: post } = await useAsyncData(`writing-${route.path}`, () =>
  queryCollection('writing').path(route.path).first()
);

const formatDate = (d: string) =>
  new Date(d).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' });

useHead(() => ({
  title: post.value?.title ?? 'Writing',
  meta: [
    { name: 'description', content: post.value?.description ?? '' }
  ]
}));
</script>
