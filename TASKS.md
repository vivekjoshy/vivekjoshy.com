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

- [ ] **Print stylesheet for `/resume`** — make the web page print correctly so the
      PDF is a convenience, not the only good artifact.
- [ ] **Command palette (⌘K)** — keyboard navigation across pages and artifacts.
      Must be fully operable by keyboard and screen reader, not just mouse.
- [ ] **Prompt ensemble visualizer** — Vivek's own idea. Show N samples from one
      model (vLLM-style sampling) versus N distinct models, then entropy-weighted
      aggregation and logarithmic pooling collapsing them to one calibrated answer.
      The interesting question to surface: when does ensembling add signal, and
      when does it average the signal away?
- [ ] **MCP server** — expose OpenSkill as agent-callable tools (`rate_match`,
      `predict_win`, `compare_models`) so an agent can use the library without
      installing it. Reuses `app/utils/openskill.ts`, so it inherits the same
      build-time verification.
- [ ] **OpenSkill ecosystem graph** — the library at the centre, ports and
      citations radiating out, rendered from `app/data/evidence.json`.

## Blocked — needs Vivek

- [ ] **ARC failure entries + a benchmark score.** The page currently states a
      thesis and shows "Write-up pending" three times, with no score anywhere.
      The review's strongest point: to an ARC-literate reader, silence on the
      score reads as the score being bad. Fine for a negative result — but only
      if stated. Needs at least three real `failure` fields and one honest number.
- [ ] **Ordinal replica loss — definition.** Wanted as a visualizer. Opinion's
      current `loss.py` is an ELBO with a coupled minimax constraint; OpinionAI's
      README says "Dense Ordinal + Geometric Coupling". Neither is this. Not
      guessing at someone else's invention.
- [ ] **Theoretical neuroscience server — name and member count.** Currently
      written as "the largest theoretical neuroscience server on Discord", which
      is exactly the unverifiable superlative the review flags elsewhere. A name
      and a number turn it into evidence.
- [ ] **`/uses` page — confirm what's publishable.** The local toolchain is
      readable from this machine, but publishing someone's setup is their call.

## Deferred

- [ ] **Glia** — every reference removed until there is a preprint.
- [ ] **Coupled minimax loss visualizer** — separate from ordinal replica loss.
      The gist formalising additive vs soft-max vs MGDA/Pareto descent is strong
      material: a 2D loss plane showing additive permitting a trade while the
      min-norm common-descent direction refuses one.
