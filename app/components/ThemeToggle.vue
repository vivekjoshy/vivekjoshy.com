<template>
  <button
    type="button"
    class="btn btn-ghost btn-sm"
    :aria-label="`Switch to ${next} theme`"
    :title="`Switch to ${next} theme`"
    @click="cycle"
  >
    <i class="fa-solid" :class="icon" aria-hidden="true"></i>
    <span class="sr-only-text">Current theme: {{ label }}</span>
  </button>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'

type Mode = 'system' | 'light' | 'dark'

const mode = ref<Mode>('system')

const ORDER: Mode[] = ['system', 'light', 'dark']
const label = computed(() => mode.value)
const next = computed(() => ORDER[(ORDER.indexOf(mode.value) + 1) % ORDER.length] as Mode)
const icon = computed(() =>
  mode.value === 'light' ? 'fa-sun' : mode.value === 'dark' ? 'fa-moon' : 'fa-circle-half-stroke'
)

function apply(m: Mode) {
  const root = document.documentElement
  if (m === 'system') root.removeAttribute('data-theme')
  else root.setAttribute('data-theme', m)
  try {
    localStorage.setItem('theme', m)
  } catch {
    /* private mode; the in-memory choice still applies for this visit */
  }
}

function cycle() {
  mode.value = next.value
  apply(mode.value)
}

onMounted(() => {
  let stored: string | null = null
  try {
    stored = localStorage.getItem('theme')
  } catch {
    /* ignore */
  }
  mode.value = stored === 'light' || stored === 'dark' ? stored : 'system'
  apply(mode.value)
})
</script>
