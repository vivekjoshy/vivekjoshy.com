import { u as usePageSeo } from './pages-yrXgqx3L.mjs';
import { defineComponent, computed, mergeProps, unref, useSSRContext } from 'vue';
import { ssrRenderAttrs, ssrInterpolate, ssrRenderList, ssrRenderAttr } from 'vue/server-renderer';
import '../virtual/entry.mjs';
import 'nostics';
import 'nostics/formatters/ansi';
import '../nitro/nitro.mjs';
import 'node:http';
import 'node:https';
import 'node:events';
import 'node:buffer';
import 'node:fs';
import 'node:path';
import 'node:crypto';
import '../routes/renderer.mjs';
import 'vue-bundle-renderer/runtime';
import 'devalue';
import 'vue-router';

var arc_architectures_default = {
	finding: "The binding constraint is object-level relational structure that is not recoverable from pixel context — not compute.",
	span: "Two years, 18 solver architectures across 9 families.",
	note: "Each entry is a real branch in the Opinion, OpinionAI or TyleDSL repositories. Most of these repositories are private, so branch names are given as provenance rather than links. 'What it fought' is summarised from the commits unique to that branch — it is what the history shows each approach wrestling with, not a stated conclusion. Where it finally broke, and the benchmark numbers, are still to be written up: no branch records a solve rate.",
	architectures: [
		{
			"name": "Latent-process CNN",
			"repo": "OpinionAI",
			"branch": "main",
			"family": "End-to-end neural",
			"span": "2024-08 – 2024-10",
			"commits": 77,
			"approach": "Pixel-level embeddings with no downsampling, primitive selection over 64 operations, cross-attention between demonstrations and test input, and coupled shape/content heads.",
			"public": null,
			"failure": null,
			"uniqueCommits": null,
			"fought": "Pixel-level embeddings with no downsampling, and selection over 64 primitive operations. The base both later OpinionAI branches fork from."
		},
		{
			"name": "Meta-learning",
			"repo": "OpinionAI",
			"branch": "meta-learning",
			"family": "Meta-learning",
			"span": "2024-08 – 2024-10",
			"commits": 88,
			"approach": "Treat each task as an episode and learn an initialisation that adapts from the demonstration pairs alone.",
			"public": null,
			"failure": null,
			"uniqueCommits": null,
			"fought": "Episodic adaptation from the demonstration pairs alone. Shares the base history; no commits unique to the line."
		},
		{
			"name": "Reinforcement learning",
			"repo": "OpinionAI",
			"branch": "rl",
			"family": "RL",
			"span": "2024-08 – 2024-10",
			"commits": 141,
			"approach": "Grid construction as a sequential decision problem, with reward shaping tuned to give usable gradients rather than sparse terminal signal.",
			"public": null,
			"failure": null,
			"uniqueCommits": 53,
			"fought": "Reward shaping. Granular reward functions, rewards retuned specifically to give usable gradients, and repeated reverts to previously working prediction and evaluation code."
		},
		{
			"name": "Active inference",
			"repo": "OpinionAI",
			"branch": "active-inference",
			"family": "Bayesian",
			"span": "2024-08 – 2024-11",
			"commits": 90,
			"approach": "Free-energy formulation: pick the action that minimises expected surprise over the predicted grid.",
			"public": null,
			"failure": null,
			"uniqueCommits": 2,
			"fought": "Two commits on the line: a deeper network, and meta-learning combined with active inference. Dropped almost immediately."
		},
		{
			"name": "Hypergraph GNN + meta-learning",
			"repo": "OpinionAI",
			"branch": "gnn-meta",
			"family": "Relational",
			"span": "2024-08 – 2025-06",
			"commits": 130,
			"approach": "Grids as hypergraphs over cells and regions, message passing with HypergraphConv, wrapped in a meta-learning outer loop.",
			"public": null,
			"failure": null,
			"uniqueCommits": 43,
			"fought": "Getting MAML right, a distance-based loss, and predicting discrete grid heights and widths rather than regressing them."
		},
		{
			"name": "SAT / hypergraph",
			"repo": "OpinionAI",
			"branch": "sat",
			"family": "Program synthesis",
			"span": "2024-08 – 2025-06",
			"commits": 122,
			"approach": "Constraint framing over a hypergraph encoding of the grid, searching for an assignment consistent with every demonstration.",
			"public": null,
			"failure": null,
			"uniqueCommits": 35,
			"fought": "Hypergraph convolutions under a meta-learning loop, latent projector capacity, and penalties built around exact matches — inverse scaling and a multiplicative perfect-match penalty."
		},
		{
			"name": "CNN-only baseline",
			"repo": "OpinionAI",
			"branch": "cnn-only",
			"family": "End-to-end neural",
			"span": "2024-08 – 2025-09",
			"commits": 141,
			"approach": "Deliberately stripped convolutional baseline, to establish what pixel-context alone can reach.",
			"public": null,
			"failure": null,
			"uniqueCommits": 54,
			"fought": "A full codebase overhaul: content- and shape-aware encoders, a joint decoder, and shape prediction for the N-latent variant."
		},
		{
			"name": "Combinator grammar (SKI)",
			"repo": "Opinion",
			"branch": "grammar",
			"family": "Program synthesis",
			"span": "2025-09 – 2025-10",
			"commits": 75,
			"approach": "Grammar-constrained combinator learning: select and compose formal operations from the demonstration pairs, replacing the prototype-based architecture.",
			"public": null,
			"failure": null,
			"uniqueCommits": 4,
			"fought": "Probabilistic SKI, then robustness and device fixes. Four commits on this line before it was left."
		},
		{
			"name": "Traditional transformer",
			"repo": "Opinion",
			"branch": "traditional-transformer",
			"family": "Transformer",
			"span": "2025-09 – 2025-10",
			"commits": 208,
			"approach": "Standard encoder-decoder over serialised grids with a dense per-cell loss.",
			"public": null,
			"failure": null,
			"uniqueCommits": 137,
			"fought": "The loss formulation, circularly. L2 replaced L1, then L1 was restored, then a dense per-cell loss replaced both."
		},
		{
			"name": "Vision encoder",
			"repo": "Opinion",
			"branch": "vision",
			"family": "End-to-end neural",
			"span": "2025-09 – 2025-10",
			"commits": 223,
			"approach": "Treat the grid as an image and lean on vision-style feature extraction.",
			"public": null,
			"failure": null,
			"uniqueCommits": 152,
			"fought": "Padding, and variable grid size. PAD removed from the vocabulary, then reweighted, then supervised; grids cropped properly; then device management and multiprocessing."
		},
		{
			"name": "Neural cellular automaton",
			"repo": "Opinion",
			"branch": "nca",
			"family": "Cellular automata",
			"span": "2025-09 – 2025-11",
			"commits": 230,
			"approach": "Output shape learned implicitly through CA dynamics rather than predicted: seed the test input at the centre of a 30×30 canvas, evolve, and let the automaton learn where to stop.",
			"public": null,
			"failure": null,
			"uniqueCommits": 159,
			"fought": "The loss and the automaton's dynamics. L1 against L2, coverage switched to L1, automatic interpolation, demo-conditioned features, and perturbations to the evolving state."
		},
		{
			"name": "LLM + LoRA",
			"repo": "Opinion",
			"branch": "llm",
			"family": "LLM",
			"span": "2025-09 – 2025-10",
			"commits": 271,
			"approach": "Low-rank adaptation of a pretrained language model over serialised grids.",
			"public": null,
			"failure": null,
			"uniqueCommits": 200,
			"fought": "Termination and length. EOS fallback handling, repeated token-limit and max-length increases, evaluation fixes, and eventually a dedicated diagnosis command to see why generations were failing."
		},
		{
			"name": "Reptile meta-learning",
			"repo": "Opinion",
			"branch": "meta-learning",
			"family": "Meta-learning",
			"span": "2025-09 – 2025-10",
			"commits": 78,
			"approach": "Reptile-style first-order meta-learning across tasks.",
			"public": null,
			"failure": null,
			"uniqueCommits": 7,
			"fought": "Five reformulations in seven commits: VQ-VAE, Gumbel-Softmax VQ-VAE, fewer codes, a 64-element basis, then Reptile."
		},
		{
			"name": "Elastic transformer",
			"repo": "Opinion",
			"branch": "transformer",
			"family": "Transformer",
			"span": "2025-09 – 2026-01",
			"commits": 341,
			"approach": "Transformer over an ElasticConv1d front end sized to variable grid dimensions.",
			"public": null,
			"failure": null,
			"uniqueCommits": 270,
			"fought": "Attention cost first, then stability. O(n^2) attention was replaced by an O(n) adaptive CNN, a PVR refinement loop with a verifier and refiner was added, a cosine schedule with linear warmup after that — and the line ends on gradient explosion in ElasticConv1d."
		},
		{
			"name": "Variational solver",
			"repo": "Opinion",
			"branch": "main",
			"family": "Bayesian",
			"span": "2025-09 – 2026-03",
			"commits": 285,
			"approach": "A variational encoder distils the transformation rule from the demonstration pairs into a latent z; a FiLM-conditioned delta decoder applies z. Trained on an ELBO with a coupled constraint forcing demo reconstruction and test prediction to improve together.",
			"public": null,
			"failure": null,
			"uniqueCommits": 214,
			"fought": "Converged on the variational solver: a coupled ELBO forcing demo reconstruction and test prediction down together, under cosine annealing."
		},
		{
			"name": "Relational model",
			"repo": "Opinion",
			"branch": "relational",
			"family": "Relational",
			"span": "2025-09 – 2026-04",
			"commits": 286,
			"approach": "Explicit relational structure over grid objects, with the coupled loss and D4 symmetry augmentation. Migrated back from OpinionAI.",
			"public": null,
			"failure": null,
			"uniqueCommits": 215,
			"fought": "The loss, again. DenseOrdinalReplicaLoss with adaptive class weighting and focal loss, mask-signal weighting, a balance penalty, bounding-box predictions, and debug logging added to see what training was actually doing."
		},
		{
			"name": "Statistical inversion",
			"repo": "Opinion",
			"branch": "claude/arc-agi-bayesian-approach",
			"family": "Bayesian",
			"span": "2025-09 – 2026-05",
			"commits": 286,
			"approach": "Experiment harness treating the task as inverting a statistical generating process.",
			"public": null,
			"failure": null,
			"uniqueCommits": null,
			"fought": "An experiment harness for treating the task as inverting a statistical generating process. Branched from the variational line."
		},
		{
			"name": "TyleDSL",
			"repo": "TyleDSL",
			"branch": "main",
			"family": "Program synthesis",
			"span": "2025-06",
			"commits": null,
			"approach": "A typed reformulation of Michael Hodel's ARC-DSL, using the type system to prune the space of candidate programs.",
			"public": "https://github.com/vivekjoshy/TyleDSL",
			"failure": null,
			"uniqueCommits": null,
			"fought": "A typed reformulation of the ARC-DSL. The type system prunes candidate programs before they are ever evaluated."
		}
	],
	effortNote: "Commit counts are those unique to each branch, measured from the common ancestor. Total branch length would count shared history many times over and flatter every approach equally."
};
//#endregion
//#region app/pages/arc.vue?vue&type=script&setup=true&lang.ts
var arc_vue_vue_type_script_setup_true_lang_default = /*@__PURE__*/ defineComponent({
	__name: "arc",
	__ssrInlineRender: true,
	setup(__props) {
		const families = computed(() => [...new Set(arc_architectures_default.architectures.map((a) => a.family))]);
		const byFamily = (f) => arc_architectures_default.architectures.filter((a) => a.family === f);
		const totalCommits = computed(() => arc_architectures_default.architectures.reduce((sum, a) => sum + (a.uniqueCommits ?? 0), 0));
		usePageSeo({
			title: "ARC-AGI",
			description: `ARC-AGI solver architectures and where each one broke. ${arc_architectures_default.finding}`
		});
		return (_ctx, _push, _parent, _attrs) => {
			_push(`<div${ssrRenderAttrs(mergeProps({ class: "py-8 max-w-4xl mx-auto" }, _attrs))}><div class="mb-10"><h1 class="text-4xl font-bold mb-3"><span class="font-thin">ARC-</span><span class="font-black">AGI</span></h1><p class="text-subheading text-lg">${ssrInterpolate(unref(arc_architectures_default).span)}</p></div><section class="mb-12 border-l-4 border-accent pl-5"><h2 class="section-heading mb-2 text-base">The finding</h2><p class="text-2xl leading-snug balance">${ssrInterpolate(unref(arc_architectures_default).finding)}</p></section><section class="mb-12 grid grid-cols-3 gap-6"><div><div class="text-3xl font-black text-accent tick">${ssrInterpolate(unref(arc_architectures_default).architectures.length)}</div><div class="text-subheading text-sm">architectures</div></div><div><div class="text-3xl font-black text-accent tick">${ssrInterpolate(families.value.length)}</div><div class="text-subheading text-sm">distinct families</div></div><div><div class="text-3xl font-black text-accent tick">${ssrInterpolate(totalCommits.value.toLocaleString("en-US"))}</div><div class="text-subheading text-sm">commits unique to those lines</div></div></section><p class="text-subheading text-sm mb-10 -mt-6">${ssrInterpolate(unref(arc_architectures_default).effortNote)}</p><!--[-->`);
			ssrRenderList(families.value, (family) => {
				_push(`<section class="mb-10"><h2 class="rule-heading section-heading mb-5 text-base"><span>${ssrInterpolate(family)}</span></h2><!--[-->`);
				ssrRenderList(byFamily(family), (a) => {
					_push(`<div class="mb-6 pb-6 border-b hairline last:border-0"><div class="flex flex-col md:flex-row md:justify-between md:items-baseline mb-1 gap-1"><h3 class="subsection-heading text-lg">`);
					if (a.public) _push(`<a${ssrRenderAttr("href", a.public)} target="_blank" rel="noopener noreferrer" class="link-underline hover:text-accent">${ssrInterpolate(a.name)}</a>`);
					else _push(`<span>${ssrInterpolate(a.name)}</span>`);
					_push(`</h3><span class="text-subheading text-sm tick">${ssrInterpolate(a.span)}`);
					if (a.uniqueCommits) _push(`<!--[--> · ${ssrInterpolate(a.uniqueCommits)} commits<!--]-->`);
					else _push(`<!---->`);
					_push(`</span></div><p class="text-subheading text-sm mb-2"><code class="provenance">${ssrInterpolate(a.repo)}@${ssrInterpolate(a.branch)}</code></p><p class="text-lg mb-3">${ssrInterpolate(a.approach)}</p>`);
					if (a.fought) _push(`<div class="mb-3"><span class="section-heading text-sm">What it fought</span><p class="text-lg m-0">${ssrInterpolate(a.fought)}</p></div>`);
					else _push(`<!---->`);
					if (a.failure) _push(`<div><span class="section-heading text-sm">Where it broke</span><p class="text-lg m-0">${ssrInterpolate(a.failure)}</p></div>`);
					else _push(`<!---->`);
					_push(`</div>`);
				});
				_push(`<!--]--></section>`);
			});
			_push(`<!--]--><p class="text-subheading text-sm">${ssrInterpolate(unref(arc_architectures_default).note)}</p></div>`);
		};
	}
});
//#endregion
//#region app/pages/arc.vue
var _sfc_setup = arc_vue_vue_type_script_setup_true_lang_default.setup;
arc_vue_vue_type_script_setup_true_lang_default.setup = (props, ctx) => {
	const ssrContext = useSSRContext();
	(ssrContext.modules || (ssrContext.modules = /* @__PURE__ */ new Set())).add("pages/arc.vue");
	return _sfc_setup ? _sfc_setup(props, ctx) : void 0;
};
var arc_default = arc_vue_vue_type_script_setup_true_lang_default;

export { arc_default as default };
//# sourceMappingURL=arc-D7W9oeBg.mjs.map
