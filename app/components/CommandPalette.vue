<template>
  <div>
    <button
      type="button"
      class="palette-trigger no-print"
      aria-haspopup="dialog"
      :aria-expanded="open"
      @click="show"
    >
      <Icon name="search" />
      <span class="hidden lg:inline">Search</span>
      <kbd class="hidden lg:inline palette-kbd">{{ hintKey }}K</kbd>
      <span class="sr-only-text">Open command palette</span>
    </button>

    <Teleport to="body">
      <div
        v-if="open"
        class="palette-backdrop"
        role="dialog"
        aria-modal="true"
        aria-label="Command palette"
        @click.self="hide"
      >
        <div ref="panel" class="palette-panel" @keydown="onKeydown">
          <label class="sr-only-text" for="palette-input">Search pages and links</label>
          <input
            id="palette-input"
            ref="input"
            v-model="query"
            type="text"
            class="palette-input"
            placeholder="Jump to a page, paper, or repository…"
            autocomplete="off"
            role="combobox"
            aria-controls="palette-list"
            :aria-expanded="results.length > 0"
            :aria-activedescendant="activeId"
          />

          <ul id="palette-list" class="palette-list" role="listbox" aria-label="Results">
            <li
              v-for="(item, i) in results"
              :id="`palette-opt-${i}`"
              :key="item.label + item.group"
              role="option"
              :aria-selected="i === cursor"
              class="palette-item"
              :class="{ 'is-active': i === cursor }"
              @click="run(item)"
              @mousemove="cursor = i"
            >
              <span class="palette-item-label">{{ item.label }}</span>
              <span class="palette-item-group">{{ item.group }}</span>
            </li>
            <li v-if="!results.length" role="option" aria-disabled="true" aria-selected="false" class="palette-empty">No matches.</li>
          </ul>

          <p class="palette-foot">
            <kbd class="palette-kbd">↑</kbd><kbd class="palette-kbd">↓</kbd> to move
            <kbd class="palette-kbd">↵</kbd> to open
            <kbd class="palette-kbd">esc</kbd> to close
          </p>
        </div>
      </div>
    </Teleport>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, watch, onMounted, onBeforeUnmount, nextTick } from 'vue'
// @ts-ignore - Nuxt auto-imports
import { useRouter } from '#imports'

interface Item {
  label: string
  group: string
  to?: string
  href?: string
}

const ITEMS: Item[] = [
  { label: 'Home', group: 'Pages', to: '/' },
  { label: 'OpenSkill playground', group: 'Pages', to: '/openskill' },
  { label: 'ARC-AGI', group: 'Pages', to: '/arc' },
  { label: 'Dense Ordinal Replica Loss', group: 'Pages', to: '/ordinal-replica' },
  { label: 'ATHENA-TIR prompt ensembles', group: 'Pages', to: '/ensemble' },
  { label: 'Resume', group: 'Pages', to: '/resume' },
  { label: 'OpenSkill MCP server', group: 'Pages', to: '/mcp' },
  { label: 'Provenance', group: 'Pages', to: '/provenance' },
  { label: 'OpenSkill documentation', group: 'OpenSkill', href: 'https://openskill.me' },
  { label: 'openskill.py source', group: 'OpenSkill', href: 'https://github.com/vivekjoshy/openskill.py' },
  { label: 'JOSS paper (DOI 10.21105/joss.05901)', group: 'Publications', href: 'https://doi.org/10.21105/joss.05901' },
  { label: 'arXiv:2401.05451 preprint', group: 'Publications', href: 'https://arxiv.org/abs/2401.05451' },
  { label: 'OpenGrammar', group: 'Repositories', href: 'https://github.com/vivekjoshy/OpenGrammar' },
  { label: 'TyleDSL', group: 'Repositories', href: 'https://github.com/vivekjoshy/TyleDSL' },
  { label: 'GitHub profile', group: 'Elsewhere', href: 'https://github.com/vivekjoshy' },
  { label: 'Email', group: 'Elsewhere', href: 'mailto:contact@vivekjoshy.com' },
  { label: 'Download resume PDF', group: 'Elsewhere', href: '/assets/resume.pdf' }
]

const router = useRouter()
const open = ref(false)
const query = ref('')
const cursor = ref(0)
const input = ref<HTMLInputElement | null>(null)
const panel = ref<HTMLElement | null>(null)
let lastFocused: HTMLElement | null = null

const hintKey = ref('⌘')

const results = computed(() => {
  const q = query.value.trim().toLowerCase()
  if (!q) return ITEMS
  return ITEMS.filter((i) => `${i.label} ${i.group}`.toLowerCase().includes(q))
})

const activeId = computed(() => (results.value.length ? `palette-opt-${cursor.value}` : undefined))

watch(results, () => {
  cursor.value = 0
})

async function show() {
  lastFocused = document.activeElement as HTMLElement
  document.body.style.overflow = 'hidden'
  open.value = true
  query.value = ''
  cursor.value = 0
  await nextTick()
  input.value?.focus()
}

function hide() {
  open.value = false
  document.body.style.overflow = ''
  // Return focus where it came from, per WCAG 2.4.3.
  lastFocused?.focus()
}

function run(item: Item) {
  hide()
  if (item.to) router.push(item.to)
  else if (item.href?.startsWith('mailto:') || item.href?.startsWith('/')) window.location.href = item.href
  else if (item.href) window.open(item.href, '_blank', 'noopener,noreferrer')
}

function onKeydown(e: KeyboardEvent) {
  if (e.key === 'Escape') {
    e.preventDefault()
    hide()
  } else if (e.key === 'ArrowDown') {
    e.preventDefault()
    cursor.value = (cursor.value + 1) % Math.max(results.value.length, 1)
  } else if (e.key === 'ArrowUp') {
    e.preventDefault()
    cursor.value = (cursor.value - 1 + results.value.length) % Math.max(results.value.length, 1)
  } else if (e.key === 'Enter') {
    e.preventDefault()
    const item = results.value[cursor.value]
    if (item) run(item)
  } else if (e.key === 'Tab') {
    // Only the input is focusable inside, so keep focus in the dialog.
    e.preventDefault()
  }
}

function onGlobalKey(e: KeyboardEvent) {
  if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'k') {
    e.preventDefault()
    open.value ? hide() : show()
  }
}

onMounted(() => {
  hintKey.value = /Mac|iPhone|iPad/.test(navigator.platform) ? '⌘' : 'Ctrl '
  window.addEventListener('keydown', onGlobalKey)
})
onBeforeUnmount(() => window.removeEventListener('keydown', onGlobalKey))
</script>
