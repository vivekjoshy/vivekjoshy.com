<template>
  <div class="min-h-screen flex flex-col items-center justify-center p-6 text-center"
       style="background-color: var(--color-page)">
    <div class="max-w-md">
      <p class="text-7xl sm:text-8xl font-black text-accent tick mb-2">{{ status }}</p>
      <h1 class="text-2xl font-semibold mb-4">{{ heading }}</h1>
      <p class="mb-8 text-subheading">{{ detail }}</p>
      <NuxtLink to="/" class="btn btn-accent" @click="clear">Return home</NuxtLink>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
// @ts-ignore - Nuxt auto-imports
import { clearError } from '#imports'

const props = defineProps<{ error?: { statusCode?: number; statusMessage?: string } }>()

// The scaffold hardcoded 404, so a 500 announced itself as "Page Not Found".
const status = computed(() => props.error?.statusCode ?? 404)
const heading = computed(() => (status.value === 404 ? 'Page not found' : 'Something went wrong'))
const detail = computed(() =>
  status.value === 404
    ? "That page doesn't exist, or it moved."
    : props.error?.statusMessage || 'An unexpected error occurred.'
)

const clear = () => clearError({ redirect: '/' })
</script>
