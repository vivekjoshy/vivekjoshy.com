<template>
  <div class="py-8 max-w-4xl mx-auto">
    <div class="mb-10">
      <h1 class="text-4xl font-bold mb-3">
        <span class="font-thin">PROVE</span><span class="font-black">NANCE</span>
      </h1>
      <p class="lede balance mb-3">
        A content-addressed record of the work on this site, so that anything
        copied from it can be shown to be later.
      </p>
      <p class="text-subheading text-sm tick">
        Manifest generated {{ data.generated }} &middot; {{ data.algorithm }}
      </p>
    </div>

    <!-- Honest scope -->
    <section class="mb-10 border-l-4 border-accent pl-5">
      <h2 class="section-heading mb-2 text-base">What this does and does not prove</h2>
      <p class="mb-2">
        It proves this exact content existed by a given date. It does
        <strong>not</strong> prove nobody had the same idea earlier in private &mdash;
        no scheme can prove that.
      </p>
      <p class="text-subheading">
        That limit is not a weakness for the case that matters: if work appears
        elsewhere after the anchored timestamp, the ordering is settled and needs
        nobody's word for it.
      </p>
    </section>

    <!-- Root -->
    <section class="mb-10">
      <h2 class="rule-heading section-heading mb-4 text-base"><span>Manifest root</span></h2>
      <p class="hash-block mb-3">{{ data.root }}</p>
      <p class="text-subheading text-sm mb-4">{{ data.rootPreimage }}</p>
      <p class="mb-4">
        The root is a pure function of content, so it moves only when the work moves.
        The manifest itself is <em>not</em> what gets stamped: it embeds per-artifact
        commit metadata, which changes on every commit even when no artifact changed.
        Stamping that would go stale for no substantive reason. The root is served
        on its own at
        <a href="/provenance-root.txt" class="text-accent link-underline">/provenance-root.txt</a>.
      </p>
      <p class="mb-2">
        Anchored with <a href="https://opentimestamps.org" target="_blank" rel="noopener noreferrer" class="text-accent link-underline">OpenTimestamps</a>.
        A stamp is submitted to calendar servers first and folded into a Bitcoin block
        shortly after; only once <code class="provenance">ots upgrade</code> has attached
        that block does verification stop depending on the calendars and rest on the
        blockchain alone.
      </p>
      <pre class="code-block"><code>node scripts/build-provenance.mjs
node scripts/stamp-provenance.mjs
ots stamp   public/stamps/&lt;date&gt;-&lt;root&gt;.txt
ots upgrade public/stamps/&lt;date&gt;-&lt;root&gt;.txt.ots   # once mined
ots verify  public/stamps/&lt;date&gt;-&lt;root&gt;.txt.ots</code></pre>
      <p class="text-subheading text-sm mt-3">
        Stamps accumulate rather than replace. A later change does not invalidate an
        earlier stamp &mdash; it covers an earlier state, which is the whole point of a
        timestamp.
      </p>

      <div class="mt-5">
        <h3 class="section-heading text-sm mb-3">Stamps</h3>
        <div v-for="st in data.stamps" :key="st.file" class="mb-3">
          <p class="hash-block mb-1">{{ st.file }}</p>
          <p class="text-subheading text-sm m-0">
            covers <code class="provenance">{{ (st.covers || 'unknown').slice(0, 16) }}</code>
            <span v-if="st.coversCurrentRoot" class="text-accent"> &mdash; the current root</span>
            <span v-else> &mdash; a superseded root</span>
            &middot; {{ st.status }}
          </p>
        </div>
        <p v-if="!data.stamps.length" class="text-subheading text-sm">No stamps yet.</p>
      </div>
    </section>

    <!-- Public artifacts -->
    <section class="mb-10">
      <h2 class="rule-heading section-heading mb-4 text-base"><span>Public artifacts</span></h2>
      <p class="text-subheading text-sm mb-5">
        Hash any of these yourself with <code class="provenance">shasum -a 256 &lt;path&gt;</code>.
      </p>
      <div v-for="a in data.artifacts" :key="a.path" class="mb-5 pb-5 border-b hairline last:border-0">
        <div class="flex flex-col md:flex-row md:justify-between md:items-baseline mb-1 gap-1">
          <h3 class="subsection-heading">{{ a.label }}</h3>
          <span class="text-subheading text-sm tick">{{ a.committed?.slice(0, 10) ?? '—' }}</span>
        </div>
        <p class="text-subheading text-sm mb-2"><code class="provenance">{{ a.path }}</code></p>
        <p class="hash-block">{{ a.sha256 }}</p>
      </div>
    </section>

    <!-- Private commits -->
    <section class="mb-10">
      <h2 class="rule-heading section-heading mb-4 text-base"><span>Private-repository commits</span></h2>
      <p class="mb-5 max-w-3xl">
        These repositories are not public. A git commit SHA is itself a hash over the
        entire tree and history, so publishing one commits to that exact content while
        revealing none of it. If a repository is later opened, anyone can confirm the
        SHA matches what is claimed here.
      </p>
      <div v-for="c in data.privateCommits" :key="c.ref" class="mb-5 pb-5 border-b hairline last:border-0">
        <div class="flex flex-col md:flex-row md:justify-between md:items-baseline mb-1 gap-1">
          <h3 class="subsection-heading">{{ c.claim }}</h3>
          <span class="text-subheading text-sm tick">{{ c.repo }} &middot; {{ c.date }}</span>
        </div>
        <p class="hash-block">{{ c.ref }}</p>
      </div>
    </section>

    <section>
      <h2 class="rule-heading section-heading mb-4 text-base"><span>Corroborating records</span></h2>
      <ul class="list-disc pl-5 space-y-2">
        <li>
          <a href="https://doi.org/10.21105/joss.05901" target="_blank" rel="noopener noreferrer" class="text-accent link-underline">JOSS 10.21105/joss.05901</a>
          and <a href="https://arxiv.org/abs/2401.05451" target="_blank" rel="noopener noreferrer" class="text-accent link-underline">arXiv:2401.05451</a>
          &mdash; third-party dated records for OpenSkill, both from January 2024.
        </li>
        <li>
          The manifest is served at
          <a href="/provenance.json" class="text-accent link-underline">/provenance.json</a>,
          so archive services can capture it independently.
        </li>
      </ul>
    </section>
  </div>
</template>

<script setup lang="ts">
// @ts-ignore - Nuxt auto-imports
import { definePageMeta, useHead } from '#imports'
import data from '~/data/provenance.json'


definePageMeta({ layout: 'default' })

usePageSeo({
  title: 'Provenance',
  description: 'Content-addressed provenance for the work on this site: SHA-256 artifact hashes, private-repository commit commitments, and an OpenTimestamps-anchorable manifest root.'
})
</script>
