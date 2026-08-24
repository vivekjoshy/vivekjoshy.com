# Site roadmap

Working list for the `repositioning-2026` branch. Ordered by value, not effort.

## Done

- [x] Dependency updates + Nuxt 4 / Tailwind 4 / DaisyUI 5 migration
- [x] Repositioning copy, meta, OG image, PDF regeneration
- [x] OpenSkill playground (`/openskill`) with build-gated numerical verification
- [x] Build-time evidence panel (PyPI, npm, GitHub, Semantic Scholar)
- [x] ARC-AGI page (`/arc`) — scaffold and finding
- [x] System/light/dark theming, WCAG 2.2 AA gate, reduced-motion, skip link
- [x] Editorial homepage layout, monogram header
- [x] `llms.txt` + robots pointer

## In flight

- [x] Print stylesheet for `/resume`
- [x] Command palette (⌘K), verified keyboard-operable
- [x] LaTeX formatting: flush-left paragraphs, ragged-right, link row fits
- [x] Dense Ordinal Replica Loss visualizer, incl. the circular-vs-dense comparison
- [x] KaTeX for maths (SSR-rendered, MathML for screen readers)
- [x] ARC architecture survey from real branches
- [x] Prompt ensemble visualizer — built as ATHENA-TIR from `athena.ipynb`, the
      real system. Two findings surfaced from the source: the uniform prior is
      mathematically inert, and critical-token weighting can outrank geometric
      confidence.
- [x] Mobile responsiveness — verified no horizontal page overflow at 375px
      across all seven routes.
- [ ] **MCP server** — expose OpenSkill as agent-callable tools (`rate_match`,
      `predict_win`, `compare_models`) so an agent can use the library without
      installing it. Reuses `app/utils/openskill.ts`, so it inherits the same
      build-time verification.
- [x] Provenance manifest and `/provenance` page
- [ ] **Anchor the manifest** — run `ots stamp app/data/provenance.json` and commit
      the resulting `.ots`. Needs to be done by Vivek; re-run after any change to
      a hashed artifact.
- [ ] **OpenSkill ecosystem graph** — the library at the centre, ports and
      citations radiating out, rendered from `app/data/evidence.json`.

## Blocked — needs Vivek

- [ ] **ARC failure entries + a benchmark score.** The architecture survey is
      done — 18 architectures across 9 families, sourced from real branches in
      Opinion / OpinionAI / TyleDSL, 3,072 commits between them. What is still
      missing is *where each one broke*, and any benchmark number: nothing in
      any branch records a solve rate. To an ARC-literate reader, silence on the
      score reads as the score being bad. Fine for a negative result — but only
      if stated.

      Git log gives *signals* of what each architecture fought, not why it was
      abandoned: the transformer branch ends on "Fix gradient explosion in
      ElasticConv1d" after replacing O(n²) attention with an O(n) adaptive CNN;
      the LLM branch ends on EOS-fallback and repeated token-limit increases;
      nca and traditional-transformer both flip between L1 and L2. Those are
      hypotheses about failure modes, not statements of it, so they are not on
      the page.
- [x] ~~Ordinal replica loss — definition.~~ Found: `DenseOrdinalReplicaLoss` in
      Opinion commit `3773f4e` (2025-10-26), with `CircularReplicaLoss` on
      `Opinion@nca` as its predecessor. Both are now implemented and compared.
- [x] ~~Theoretical neuroscience server.~~ discord.gg/neuroscience, 6,940+ members.
- [ ] **`/uses` page — confirm what's publishable.** The local toolchain is
      readable from this machine, but publishing someone's setup is their call.

## Deferred

- [ ] **Glia** — every reference removed until there is a preprint.
- [ ] **Coupled minimax loss visualizer** — separate from ordinal replica loss.
      The gist formalising additive vs soft-max vs MGDA/Pareto descent is strong
      material: a 2D loss plane showing additive permitting a trade while the
      min-norm common-descent direction refuses one.
