<template>
  <span v-if="!display" class="katex-inline" v-html="html" />
  <div v-else class="katex-block" v-html="html" />
</template>

<script setup lang="ts">
import { computed } from 'vue'
import katex from 'katex'

const props = withDefaults(
  defineProps<{
    expr: string
    display?: boolean
    /** Accessible description; KaTeX's own MathML is announced otherwise. */
    label?: string
  }>(),
  { display: false, label: undefined }
)

// renderToString works under SSR, so formulas are in the initial HTML rather
// than appearing after hydration.
const html = computed(() =>
  katex.renderToString(props.expr, {
    displayMode: props.display,
    throwOnError: false,
    output: 'htmlAndMathml',
    strict: 'ignore'
  })
)
</script>
