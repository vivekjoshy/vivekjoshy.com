<template>
  <div class="py-8 max-w-4xl mx-auto">
    <div class="text-center mb-12">
      <h1 class="text-5xl font-bold mb-4">
        <span class="font-thin">VIVEK</span><span class="font-black">JOSHY</span>
      </h1>
      <div class="flex flex-wrap justify-center gap-4 text-subheading text-lg">
        <a href="mailto:contact@vivekjoshy.com" class="flex items-center hover:text-accent">
          <i class="fa-regular fa-envelope mr-2"></i> contact@vivekjoshy.com
        </a>
        <span class="hidden md:inline">&bull;</span>
        <a href="https://github.com/vivekjoshy" target="_blank" rel="noopener noreferrer" class="flex items-center hover:text-accent">
          <i class="fa-brands fa-github mr-2"></i> github.com/vivekjoshy
        </a>
      </div>
    </div>

    <!-- OpenSkill Section -->
    <section class="mb-10">
      <h2 class="section-heading border-b border-accent pb-1 mb-6 text-xl">OpenSkill</h2>

      <div class="mb-8">
        <div class="flex flex-col md:flex-row md:justify-between md:items-baseline mb-2">
          <h3 class="subsection-heading text-lg">Bayesian Multiplayer Rating Library</h3>
          <span>2024</span>
        </div>
        <p class="text-lg mb-2">
          Open-source Bayesian rating library for asymmetric multi-team, multiplayer
          matches, implementing the Weng&ndash;Lin models with extensions. Published in
          the Journal of Open Source Software; preprint on arXiv since January 2024.
        </p>
        <p class="text-lg mb-2">
          Independently ported to {{ portLanguages.length }} languages by other people &mdash;
          {{ portList }}. Cited {{ citations }} times, including in IEEE Transactions on
          Games, COLING, and the Journal of the Royal Statistical Society.
          {{ downloads }} PyPI downloads a month.
        </p>
        <p class="text-lg mb-2">
          Pinned as a dependency in Ray/RLlib and used as the rating layer in Neural MMO;
          both are checkable in those projects' dependency manifests. Reported in
          production use at OpenAI, MultiVersus, Hunt: Showdown, and BeyondAllReason,
          and the rating engine behind the Vairified platform.
        </p>
        <p class="text-lg">
          <a href="https://openskill.me" target="_blank" rel="noopener noreferrer" class="text-accent hover:underline">openskill.me</a>
          &nbsp;&bull;&nbsp;
          <a href="https://github.com/vivekjoshy/openskill.py" target="_blank" rel="noopener noreferrer" class="text-accent hover:underline">github.com/vivekjoshy/openskill.py</a>
          &nbsp;&bull;&nbsp;
          <a href="https://doi.org/10.21105/joss.05901" target="_blank" rel="noopener noreferrer" class="text-accent hover:underline">DOI: 10.21105/joss.05901</a>
          &nbsp;&bull;&nbsp;
          <a href="https://arxiv.org/abs/2401.05451" target="_blank" rel="noopener noreferrer" class="text-accent hover:underline">arXiv:2401.05451</a>
        </p>
      </div>
    </section>

    <!-- Professional Experience Section -->
    <section class="mb-10">
      <h2 class="section-heading border-b border-accent pb-1 mb-6 text-xl">Professional Experience</h2>

      <div class="mb-8">
        <div class="flex flex-col md:flex-row md:justify-between md:items-baseline mb-2">
          <h3 class="subsection-heading text-lg">Vairified Corp</h3>
          <span>January 2025 &ndash; Present</span>
        </div>
        <div class="flex flex-col md:flex-row md:justify-between md:items-baseline mb-3">
          <h4 class="subsubsection-heading text-lg">Lead Scientist, Data &amp; ML</h4>
          <span class="italic">Naples, Florida</span>
        </div>
        <ul class="list-disc pl-5 space-y-2 text-lg">
          <li>Own the backend ML platform: shipped the Partner API to production behind OAuth and scoped API keys, with maintained Python and TypeScript SDKs.</li>
          <li>Built VAIR, the production rating engine: Thurstone&ndash;Mosteller via OpenSkill, with score-margin weighting and adaptive uncertainty.</li>
          <li>Built Sentinel: extracts implicit business logic from three codebases by AST analysis and renders it in natural language for non-engineer review &mdash; the interpretability problem in miniature, on a real system.</li>
          <li>Led the legacy PHP migration off a 184-file codebase.</li>
          <li>Delivered multisport sport-filtering end to end, from schema through cross-sport search to per-sport rating buckets.</li>
        </ul>
      </div>

      <div class="mb-8">
        <div class="flex flex-col md:flex-row md:justify-between md:items-baseline mb-2">
          <h3 class="subsection-heading text-lg">Pickleball Players Network</h3>
          <span>October 2023 &ndash; December 2024</span>
        </div>
        <div class="flex flex-col md:flex-row md:justify-between md:items-baseline mb-3">
          <h4 class="subsubsection-heading text-lg">Data Scientist</h4>
          <span class="italic">Los Angeles, California</span>
        </div>
        <ul class="list-disc pl-5 space-y-2 text-lg">
          <li>Created matchmaking algorithms and skill assessment models.</li>
          <li>Built prototype system using Python and PostgreSQL.</li>
        </ul>
      </div>

      <div class="mb-8">
        <div class="flex flex-col md:flex-row md:justify-between md:items-baseline mb-2">
          <h3 class="subsection-heading text-lg">Open Source Development</h3>
          <span>2016 &ndash; Present</span>
        </div>
        <ul class="list-disc pl-5 space-y-2 text-lg">
          <li>Maintain OpenSkill, a peer-reviewed Bayesian rating library with production deployments across games and sports.</li>
          <li>Contributed role icon support to <a href="https://github.com/hikari-py/hikari/pull/838" target="_blank" rel="noopener noreferrer" class="text-accent link-underline">hikari</a>, a Python Discord API library (merged, 2021).</li>
        </ul>
      </div>
    </section>

    <!-- Research Section -->
    <section id="research" class="mb-10 scroll-mt-24">
      <h2 class="section-heading border-b border-accent pb-1 mb-6 text-xl">Research</h2>

      <div class="mb-8">
        <div class="flex flex-col md:flex-row md:justify-between md:items-baseline mb-2">
          <h3 class="subsection-heading text-lg">Boundary Kernel Theory &amp; Grammar Induction</h3>
          <span class="italic">In progress</span>
        </div>
        <p class="text-lg">
          Monograph in progress; the line of work runs back to OpenGrammar (2022).
          Open quantities: k*, the interaction order, and the renormalizability
          conjectures.
        </p>
      </div>

      <div class="mb-8">
        <div class="flex flex-col md:flex-row md:justify-between md:items-baseline mb-2">
          <h3 class="subsection-heading text-lg">ARC-AGI</h3>
          <span class="italic">Ongoing</span>
        </div>
        <p class="text-lg">
          Two years across eighteen solver architectures in nine families. Finding: the
          binding constraint is object-level relational structure that is not
          recoverable from pixel context &mdash; not compute.
        </p>
      </div>
    </section>

    <!-- Technical Projects Section -->
    <section class="mb-10">
      <h2 class="section-heading border-b border-accent pb-1 mb-6 text-xl">Technical Projects</h2>

      <div class="mb-8">
        <div class="flex flex-col md:flex-row md:justify-between md:items-baseline mb-2">
          <h3 class="subsection-heading text-lg">NeurIPS 2024 &mdash; Predict New Medicines with BELKA</h3>
          <span>2024</span>
        </div>
        <ul class="list-disc pl-5 space-y-2 text-lg">
          <li>Silver medal: 61st of 1,950 teams.</li>
          <li>Implemented domain adversarial training with gradient reversal.</li>
          <li>Designed a custom molecular data processing architecture.</li>
        </ul>
      </div>

      <div class="mb-8">
        <div class="flex flex-col md:flex-row md:justify-between md:items-baseline mb-2">
          <h3 class="subsection-heading text-lg">SAT/SMT Solver</h3>
          <span>2024</span>
        </div>
        <ul class="list-disc pl-5 space-y-2 text-lg">
          <li>Built CDCL-based reinforcement learning system for SAT/SMT problems.</li>
          <li>Custom rewards created for efficient solution space exploration.</li>
        </ul>
      </div>

      <div class="mb-8">
        <div class="flex flex-col md:flex-row md:justify-between md:items-baseline mb-2">
          <h3 class="subsection-heading text-lg">Prompt Ensemble Framework</h3>
          <span>2024</span>
        </div>
        <ul class="list-disc pl-5 space-y-2 text-lg">
          <li>Built an entropy-based framework for token evidence aggregation.</li>
          <li>Created logarithmic pooling for confidence scoring.</li>
        </ul>
      </div>
    </section>

    <!-- Skills Section -->
    <section class="mb-10">
      <h2 class="section-heading border-b border-accent pb-1 mb-6 text-xl">Skills</h2>

      <div class="space-y-4">
        <div>
          <h3 class="subsection-heading mb-1 text-lg inline-block">Technologies:</h3>
          <p class="text-lg inline-block ml-2">PyTorch, Polars/Pandas, FastAPI, Ray/RLlib, TypeScript, NestJS</p>
        </div>

        <div>
          <h3 class="subsection-heading mb-1 text-lg inline-block">DevOps &amp; Data:</h3>
          <p class="text-lg inline-block ml-2">Git, Docker, AWS, GCP, PostgreSQL, MongoDB, TypeDB, RDF/SPARQL</p>
        </div>

        <div>
          <h3 class="subsection-heading mb-1 text-lg inline-block">Core:</h3>
          <p class="text-lg inline-block ml-2">Formal Methods, Grammar Induction, Neuro-Symbolic Computation, Interpretable AI, Bayesian Inference</p>
        </div>
      </div>
    </section>

    <!-- Community Section -->
    <section class="mb-10">
      <h2 class="section-heading border-b border-accent pb-1 mb-6 text-xl">Community</h2>

      <div class="mb-8">
        <div class="flex flex-col md:flex-row md:justify-between md:items-baseline mb-2">
          <h3 class="subsection-heading text-lg">Theoretical Neuroscience Community</h3>
          <span>Present</span>
        </div>
        <p class="text-lg">Owner and administrator of <a href="https://discord.gg/neuroscience" target="_blank" rel="noopener noreferrer" class="text-accent link-underline">discord.gg/neuroscience</a>, the largest theoretical neuroscience community on Discord, with over 6,940 members.</p>
      </div>

      <div class="mb-8">
        <div class="flex flex-col md:flex-row md:justify-between md:items-baseline mb-2">
          <h3 class="subsection-heading text-lg">Machine Learning Street Talk</h3>
          <span>Present</span>
        </div>
        <p class="text-lg">Expert role on the MLST community server.</p>
      </div>

      <div class="mb-8">
        <div class="flex flex-col md:flex-row md:justify-between md:items-baseline mb-2">
          <h3 class="subsection-heading text-lg">The Hitchhiker's Guide to Python</h3>
          <span>2017</span>
        </div>
        <p class="text-lg">Contributed to the Common Gotchas chapter (<a href="https://docs.python-guide.org/writing/gotchas/" class="text-accent hover:underline" target="_blank" rel="noopener noreferrer">docs.python-guide.org</a>)</p>
      </div>
    </section>

    <!-- Education Section -->
    <section class="mb-10">
      <h2 class="section-heading border-b border-accent pb-1 mb-6 text-xl">Education</h2>

      <div class="mb-8">
        <div class="flex flex-col md:flex-row md:justify-between md:items-baseline mb-2">
          <h3 class="subsection-heading text-lg">Mahatma Gandhi University</h3>
          <span>2024</span>
        </div>
        <div class="flex flex-col md:flex-row md:justify-between md:items-baseline">
          <p class="italic text-lg">Bachelor of Science in Bioinformatics</p>
          <span>Aluva, India</span>
        </div>
      </div>
    </section>

    <div class="flex justify-center mt-10">
      <a href="/assets/resume.pdf" download="Vivek_Joshy_Resume.pdf" class="btn btn-accent text-white btn-lg">Download PDF Resume</a>
    </div>
  </div>
</template>

<script setup lang="ts">
// @ts-ignore - Nuxt auto-imports
import { definePageMeta, useHead } from '#imports';
import { computed } from 'vue';
import evidence from '~/data/evidence.json';

const portLanguages = [...new Set(evidence.ports.map((p) => p.lang))];
const portList = computed(() => {
  const l = portLanguages;
  return l.slice(0, -1).join(', ') + ', and ' + l[l.length - 1];
});
const citations = computed(() => evidence.paper?.citations ?? '\u2014');
const downloads = computed(() =>
  evidence.pypi?.lastMonth ? `~${Math.round(evidence.pypi.lastMonth / 1000)}k` : '\u2014'
);

definePageMeta({
  layout: "default"
});

usePageSeo({
  title: 'Resume',
  description: 'Resume of Vivek Joshy - Lead Scientist, Data & ML at Vairified Corp. Formal methods, grammar induction, neuro-symbolic computation, and interpretable AI. Maintainer of OpenSkill.'
});
</script>
