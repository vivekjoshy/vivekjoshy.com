<template>
  <div class="min-h-screen flex flex-col" style="background-color: var(--color-page)">
    <a href="#main" class="skip-link">Skip to content</a>

    <header class="site-header">
      <div class="container mx-auto px-3 sm:px-4 flex items-center gap-2 sm:gap-4 h-14 sm:h-16">
        <!-- Monogram, not the full wordmark: the pages carry their own titles. -->
        <NuxtLink to="/" class="monogram" aria-label="VJ — Vivek Joshy, home">
          <span class="font-thin">V</span><span class="font-black">J</span>
        </NuxtLink>

        <nav class="flex-1 min-w-0 nav-fade" aria-label="Main">
          <ul class="flex items-center gap-0.5 md:gap-2 list-none m-0 p-0 text-sm md:text-base nav-scroll">
            <li v-for="item in NAV" :key="item.to">
              <NuxtLink :to="item.to" class="nav-link">{{ item.label }}</NuxtLink>
            </li>
          </ul>
        </nav>

        <CommandPalette />
        <ThemeToggle />
      </div>
    </header>

    <main id="main" tabindex="-1" class="flex-grow container mx-auto px-4 py-4 scroll-mt-20 outline-none">
      <slot />
    </main>

    <p class="sr-only-text" role="status" aria-live="polite">{{ announcement }}</p>

    <footer class="mt-16 border-t hairline" style="background-color: var(--color-surface)">
      <div class="container mx-auto px-4 py-8 flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <p class="text-subheading text-sm m-0">
          &copy; {{ new Date().getFullYear() }} Vivek Joshy
        </p>
        <ul class="flex gap-5 list-none m-0 p-0">
          <li>
            <a href="mailto:contact@vivekjoshy.com" class="text-accent hover:opacity-75">
              <i class="fa-regular fa-envelope" aria-hidden="true"></i>
              <span class="sr-only-text">Email Vivek Joshy</span>
            </a>
          </li>
          <li>
            <a
              href="https://github.com/vivekjoshy"
              target="_blank"
              rel="noopener noreferrer"
              class="text-accent hover:opacity-75"
            >
              <i class="fa-brands fa-github" aria-hidden="true"></i>
              <span class="sr-only-text">Vivek Joshy on GitHub (opens in a new tab)</span>
            </a>
          </li>
          <li>
            <a
              href="https://arxiv.org/abs/2401.05451"
              target="_blank"
              rel="noopener noreferrer"
              class="text-accent hover:opacity-75"
            >
              <i class="fa-solid fa-file-lines" aria-hidden="true"></i>
              <span class="sr-only-text">OpenSkill paper on arXiv (opens in a new tab)</span>
            </a>
          </li>
        </ul>
      </div>
    </footer>
  </div>
</template>

<script setup lang="ts">
import { ref, nextTick } from 'vue'
// @ts-ignore - Nuxt auto-imports
import { useRouter } from '#imports'

// Client-side navigation announces nothing and leaves focus on the link that
// was followed.
const announcement = ref('')
const router = useRouter()
router.afterEach(async () => {
  await nextTick()
  announcement.value = document.title
  document.getElementById('main')?.focus()
})

const NAV = [
  { to: '/', label: 'Home' },
  { to: '/openskill', label: 'Playground' },
  { to: '/arc', label: 'ARC' },
  { to: '/ordinal-replica', label: 'Replica Loss' },
  { to: '/ensemble', label: 'ATHENA' },
  { to: '/resume', label: 'Resume' },
  { to: '/mcp', label: 'MCP' },
  { to: '/provenance', label: 'Provenance' }
]
</script>
