<template>
  <div class="min-h-screen flex flex-col items-center justify-center p-4 text-center">
    <div class="max-w-md">
      <h1 class="text-9xl font-bold text-primary">404</h1>
      <h2 class="text-3xl font-semibold mb-4">Page Not Found</h2>
      <p class="mb-8 text-base-content/70">Sorry, the page you are looking for doesn't exist or has been moved.</p>
      <NuxtLink to="/" class="btn btn-primary">
        Return Home
      </NuxtLink>
    </div>
  </div>
</template>

<script setup lang="ts">
import { onMounted } from 'vue'

defineProps({
  error: Object
})

// Handle error is automatically called when component is created
onMounted(() => {
  // You could add any error tracking here
})
</script> 