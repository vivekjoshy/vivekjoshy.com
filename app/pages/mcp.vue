<template>
  <div class="py-8 max-w-4xl mx-auto">
    <div class="mb-10">
      <h1 class="text-3xl sm:text-4xl font-bold mb-3">
        <span class="font-thin">OPENSKILL</span> <span class="font-black">MCP</span>
      </h1>
      <p class="lede balance mb-3">
        The rating models as agent-callable tools. An agent can rate a match or
        predict a result without installing anything.
      </p>
      <p class="text-subheading text-sm">
        The endpoint imports the same module the
        <NuxtLink to="/openskill" class="text-accent link-underline">playground</NuxtLink> uses, so
        it inherits the build-time check against <code class="provenance">openskill.py</code>.
        It cannot silently drift from the library.
      </p>
    </div>

    <section class="mb-10">
      <h2 class="rule-heading section-heading mb-4 text-base"><span>Connect</span></h2>
      <pre class="code-block mb-4"><code>{
  "mcpServers": {
    "openskill": {
      "type": "http",
      "url": "https://vivekjoshy.com/api/mcp"
    }
  }
}</code></pre>
      <p class="text-subheading text-sm">
        JSON-RPC over HTTP POST, MCP protocol {{ PROTOCOL }}. No authentication and no state
        &mdash; every call is a pure function of its arguments. Bounded at 64 teams, 512
        players and 16 messages per batch, because the rating maths is quadratic in team
        count and the endpoint is public.
      </p>
    </section>

    <section class="mb-10">
      <h2 class="rule-heading section-heading mb-4 text-base"><span>Tools</span></h2>
      <div v-for="t in TOOLS" :key="t.name" class="mb-6 pb-6 border-b hairline last:border-0">
        <h3 class="subsection-heading mb-1"><code class="provenance">{{ t.name }}</code></h3>
        <p class="mb-3">{{ t.description }}</p>
        <div class="overflow-x-auto">
          <pre class="code-block"><code>{{ t.example }}</code></pre>
        </div>
      </div>
    </section>

    <section class="mb-10">
      <h2 class="rule-heading section-heading mb-4 text-base"><span>In the browser</span></h2>
      <p class="mb-3 max-w-3xl">
        The <NuxtLink to="/openskill" class="text-accent link-underline">playground</NuxtLink> also
        registers these as <a href="https://github.com/webmachinelearning/webmcp" target="_blank" rel="noopener noreferrer" class="text-accent link-underline">WebMCP</a>
        tools on <code class="provenance">document.modelContext</code>, so an agent already looking
        at the page can call them without going over HTTP. Same three operations, same module —
        <code class="provenance">openskill-rate-match</code>,
        <code class="provenance">openskill-predict-win</code>,
        <code class="provenance">openskill-compare-models</code>, all marked
        <code class="provenance">readOnlyHint</code> since they are pure functions.
      </p>
      <p class="text-subheading text-sm">
        WebMCP is a W3C proposal and sits behind a flag in Chrome, so this is additive: browsers
        without it are unaffected. The descriptors are checked against the library on every build
        alongside everything else.
      </p>
    </section>

    <section>
      <h2 class="rule-heading section-heading mb-4 text-base"><span>Try it</span></h2>
      <pre class="code-block"><code>curl -s https://vivekjoshy.com/api/mcp \
  -H 'content-type: application/json' \
  -d '{"jsonrpc":"2.0","id":1,"method":"tools/list"}'</code></pre>
      <p class="text-subheading text-sm mt-3">
        A plain <code class="provenance">GET</code> on the same URL returns the server
        descriptor.
      </p>
    </section>
  </div>
</template>

<script setup lang="ts">
// @ts-ignore - Nuxt auto-imports
import { definePageMeta, useHead } from '#imports'

definePageMeta({ layout: 'default' })

useStructuredData([
  {
    '@type': 'WebAPI',
    name: 'OpenSkill MCP server',
    description:
      'The Weng-Lin rating models as agent-callable Model Context Protocol tools over HTTP.',
    url: `${SITE}/mcp`,
    documentation: `${SITE}/mcp`,
    provider: { '@id': PERSON_ID },
    termsOfService: `${SITE}/mcp`
  },
  breadcrumbs([{ name: 'Home', path: '/' }, { name: 'OpenSkill MCP', path: '/mcp' }])
])


const PROTOCOL = '2025-06-18'

const TOOLS = [
  {
    name: 'rate_match',
    description:
      'Update ratings from a finished match. Ranks are 1-based ascending, so [1,2] means the first team won; equal values are a draw.',
    example: `{"name":"rate_match","arguments":{
  "teams": [[{"mu":25,"sigma":8.333}], [{"mu":30,"sigma":4}]],
  "ranks": [1, 2],
  "model": "plackett_luce"
}}`
  },
  {
    name: 'predict_win',
    description:
      'Win probability per team for an upcoming match. Exact for two teams; the pairwise generalisation beyond that.',
    example: `{"name":"predict_win","arguments":{
  "teams": [[{"mu":25,"sigma":8.333}], [{"mu":30,"sigma":4}]]
}}`
  },
  {
    name: 'compare_models',
    description:
      'Rate one match under all three Weng-Lin models to see where they separate. Bradley-Terry and Plackett-Luce agree for two teams and diverge for three or more.',
    example: `{"name":"compare_models","arguments":{
  "teams": [[{"mu":25,"sigma":8.333}], [{"mu":28,"sigma":6}], [{"mu":22,"sigma":7}]],
  "ranks": [2, 1, 3]
}}`
  },
  {
    name: 'ordinal',
    description:
      'Conservative single number for display or sorting: mu minus z sigma, z=3 by default, so players the system is still unsure about rank lower.',
    example: `{"name":"ordinal","arguments":{"mu":27.6,"sigma":8.07}}`
  }
]

usePageSeo({
  title: 'OpenSkill MCP',
  description: 'OpenSkill as an MCP server: rate matches, predict outcomes and compare the Weng-Lin models from any agent, over Streamable HTTP, with no install.'
})
</script>
