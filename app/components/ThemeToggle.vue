<template>
  <button
    type="button"
    class="btn btn-ghost btn-sm"
    :aria-label="`Theme: ${label}. Activate to switch to ${next}.`"
    :title="`Switch to ${next} theme`"
    @click="cycle"
  >
    <Icon :name="icon" />
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
  mode.value === 'light' ? 'sun' : mode.value === 'dark' ? 'moon' : 'system'
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
