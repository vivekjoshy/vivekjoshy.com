import { u as usePageSeo } from './pages-yrXgqx3L.mjs';
import { K as Katex_default } from './Katex-BzTA3sBL.mjs';
import { defineComponent, ref, computed, mergeProps, unref, useSSRContext } from 'vue';
import { ssrRenderAttrs, ssrRenderList, ssrInterpolate, ssrRenderComponent, ssrRenderClass, ssrRenderAttr, ssrRenderStyle } from 'vue/server-renderer';
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
import 'katex';

//#region app/utils/athena.ts
/**
* ATHENA-TIR — Advanced Token-aware Heuristic ENsembler with Tool-Integrated
* Reasoning. Ported from athena.ipynb (AIMO-3).
*
* The pipeline: 8 prompts each encoding a different mathematical approach x 2
* vLLM sampling strategies (temp 0.7 and 0.3) x n=4 samples = 64 generations.
* Every generation is Python, and every program is executed — wrong code fails
* and filters itself out, so there is no regex ambiguity about the answer.
*
* What survives is then weighted by token-level confidence and pooled into a
* Bayesian posterior over answers. The MAP estimate is the submission.
*/
var BASE_CONFIDENCE = .8;
var EVIDENCE_WEIGHTS = {
	meanConfidence: .25,
	geometricConfidence: .35,
	criticalTokenConfidence: .4
};
var ATHENA_DEFAULTS = {
	beta: .15,
	priorStrength: 1.5
};
var clip = (x, lo, hi) => Math.max(lo, Math.min(hi, x));
/**
* Aggregate token metrics.
*
* `confidences` are top-k concentration per token — how dominant the chosen
* token was among the top-5 logprobs. `surprises` are -log P(token).
*/
function confidenceMetrics(confidences, surprises) {
	if (!confidences.length) return {
		meanConfidence: BASE_CONFIDENCE,
		meanSurprise: 1,
		surpriseVariance: 0,
		geometricConfidence: BASE_CONFIDENCE,
		minConfidence: BASE_CONFIDENCE,
		criticalTokenConfidence: BASE_CONFIDENCE
	};
	const n = confidences.length;
	const meanConfidence = confidences.reduce((a, b) => a + b, 0) / n;
	const meanSurprise = surprises.reduce((a, b) => a + b, 0) / surprises.length;
	const surpriseVariance = surprises.reduce((a, s) => a + (s - meanSurprise) ** 2, 0) / surprises.length;
	const geometricConfidence = Math.exp(confidences.reduce((a, c) => a + Math.log(c + 1e-10), 0) / n);
	const nCritical = Math.max(1, Math.floor(n / 4));
	const critical = confidences.slice(n - nCritical);
	return {
		meanConfidence,
		meanSurprise,
		surpriseVariance,
		geometricConfidence,
		minConfidence: Math.min(...confidences),
		criticalTokenConfidence: critical.reduce((a, b) => a + b, 0) / critical.length
	};
}
/**
* Evidence strength: a weighted blend of the three confidence views, damped by
* how erratic the surprise trace was.
*/
function evidenceStrength(m) {
	return (EVIDENCE_WEIGHTS.meanConfidence * m.meanConfidence + EVIDENCE_WEIGHTS.geometricConfidence * m.geometricConfidence + EVIDENCE_WEIGHTS.criticalTokenConfidence * m.criticalTokenConfidence) * (1 - clip(m.surpriseVariance / 10, 0, .3));
}
/**
* Answers reached from several different prompt styles are worth more than the
* same prompt agreeing with itself, which is mostly one opinion resampled.
*/
function diversityBonus(solutions) {
	const promptsPerAnswer = /* @__PURE__ */ new Map();
	for (const s of solutions) {
		if (!promptsPerAnswer.has(s.answer)) promptsPerAnswer.set(s.answer, /* @__PURE__ */ new Set());
		promptsPerAnswer.get(s.answer).add(s.prompt);
	}
	const total = new Set(solutions.map((s) => s.prompt)).size;
	const out = /* @__PURE__ */ new Map();
	if (total <= 1) {
		for (const a of promptsPerAnswer.keys()) out.set(a, 1);
		return out;
	}
	for (const [a, prompts] of promptsPerAnswer) out.set(a, 1 + .5 * Math.log1p(prompts.size / total * 3));
	return out;
}
/**
* Bayesian posterior over answers.
*
* Note the prior is uniform: every answer receives the same pseudocount, so it
* is a constant factor that cancels on normalisation. priorStrength therefore
* does not affect the result — verified in scripts/verify-athena.mjs.
*/
function ensemble(solutions, beta = ATHENA_DEFAULTS.beta, priorStrength = ATHENA_DEFAULTS.priorStrength) {
	const evidenceByAnswer = /* @__PURE__ */ new Map();
	for (const s of solutions) {
		if (!evidenceByAnswer.has(s.answer)) evidenceByAnswer.set(s.answer, []);
		evidenceByAnswer.get(s.answer).push(s.evidence);
	}
	const empty = {
		posteriors: /* @__PURE__ */ new Map(),
		evidenceByAnswer,
		bonus: /* @__PURE__ */ new Map(),
		logLikelihoods: /* @__PURE__ */ new Map()
	};
	if (!solutions.length) return empty;
	const bonus = diversityBonus(solutions);
	const pseudocount = priorStrength / evidenceByAnswer.size;
	const logLikelihoods = /* @__PURE__ */ new Map();
	for (const [a, ev] of evidenceByAnswer) {
		const scaled = ev.map((e) => e * (bonus.get(a) ?? 1) / beta);
		const m = Math.max(...scaled);
		logLikelihoods.set(a, m + Math.log(scaled.reduce((acc, x) => acc + Math.exp(x - m), 0)));
	}
	const maxLL = Math.max(...logLikelihoods.values());
	const unnorm = /* @__PURE__ */ new Map();
	for (const [a, ll] of logLikelihoods) unnorm.set(a, Math.exp(ll - maxLL) * pseudocount);
	const z = [...unnorm.values()].reduce((a, b) => a + b, 0);
	const posteriors = /* @__PURE__ */ new Map();
	for (const [a, v] of unnorm) posteriors.set(a, v / z);
	return {
		posteriors,
		evidenceByAnswer,
		bonus,
		logLikelihoods
	};
}
//#endregion
//#region app/pages/ensemble.vue?vue&type=script&setup=true&lang.ts
var ensemble_vue_vue_type_script_setup_true_lang_default = /*@__PURE__*/ defineComponent({
	__name: "ensemble",
	__ssrInlineRender: true,
	setup(__props) {
		const TEX = {
			surprise: String.raw`-\log P(t)`,
			evidence: String.raw`E \;=\; \bigl(0.25\,\bar{c} \;+\; 0.35\,c_{\text{geo}} \;+\; 0.40\,c_{\text{crit}}\bigr)\,\bigl(1 - \mathrm{clip}(\sigma^2_{s}/10,\,0,\,0.3)\bigr)`,
			prior: String.raw`\alpha/|A|`,
			geo: String.raw`c_{\text{geo}} = \exp\!\bigl(\tfrac{1}{n}\textstyle\sum_i \log c_i\bigr)`
		};
		const PIPELINE = [
			{
				n: "8",
				label: "prompts",
				detail: "sympy, number theory, combinatorics, enumeration, equations, direct, recursion, analysis"
			},
			{
				n: "2",
				label: "strategies",
				detail: "temperature 0.7 for breadth, 0.3 for precision"
			},
			{
				n: "4",
				label: "samples each",
				detail: "vLLM's n parameter, batched"
			},
			{
				n: "64",
				label: "executions",
				detail: "every one runs; failures filter themselves out"
			}
		];
		const TOKEN_CASES = [
			{
				id: "confident",
				label: "Confident throughout",
				blurb: "The model is sure at every step. All three confidence views agree.",
				confidences: [...Array(8).fill(.95), ...Array(4).fill(.98)],
				surprises: Array(12).fill(.05)
			},
			{
				id: "wobbly",
				label: "Wobbly",
				blurb: "Alternating certainty. High surprise variance damps the evidence.",
				confidences: [
					.9,
					.4,
					.85,
					.3,
					.92,
					.35,
					.88,
					.45
				],
				surprises: [
					.1,
					2,
					.2,
					2.5,
					.1,
					2.2,
					.15,
					1.9
				]
			},
			{
				id: "late_collapse",
				label: "Collapses at the end",
				blurb: "Smooth reasoning, then loses its nerve exactly where the answer is printed.",
				confidences: [...Array(8).fill(.95), ...Array(4).fill(.3)],
				surprises: [...Array(8).fill(.05), ...Array(4).fill(2.5)]
			},
			{
				id: "late_certain",
				label: "Commits at the end",
				blurb: "Meanders, then states the answer with conviction. Scores higher than the case above despite worse geometric confidence.",
				confidences: [...Array(8).fill(.4), ...Array(4).fill(.97)],
				surprises: [...Array(8).fill(2), ...Array(4).fill(.03)]
			}
		];
		const SOLUTION_SETS = [
			{
				id: "consensus",
				label: "Broad consensus",
				blurb: "Five runs from five different prompts all reach 42.",
				lesson: "Nothing to arbitrate — one answer, maximum diversity, posterior near certainty.",
				solutions: [
					[
						42,
						0,
						.8
					],
					[
						42,
						1,
						.78
					],
					[
						42,
						2,
						.82
					],
					[
						42,
						3,
						.79
					],
					[
						42,
						4,
						.81
					]
				]
			},
			{
				id: "repeat",
				label: "One prompt, repeated",
				blurb: "Five runs of 42 all from prompt 0, against a single run of 17 from prompt 1.",
				lesson: "Five samples of one prompt is close to one opinion resampled. The diversity bonus refuses to treat it as five independent votes.",
				solutions: [
					[
						42,
						0,
						.8
					],
					[
						42,
						0,
						.79
					],
					[
						42,
						0,
						.81
					],
					[
						42,
						0,
						.78
					],
					[
						42,
						0,
						.8
					],
					[
						17,
						1,
						.76
					]
				]
			},
			{
				id: "minority",
				label: "Diverse minority",
				blurb: "Answer 42 has higher evidence but comes from one prompt; 17 is weaker per-run but reached three different ways.",
				lesson: "The minority wins. Agreement across genuinely different approaches outweighs stronger evidence from a single line of attack — the central bet of the whole design.",
				solutions: [
					[
						42,
						0,
						.85
					],
					[
						42,
						0,
						.84
					],
					[
						42,
						0,
						.86
					],
					[
						17,
						1,
						.72
					],
					[
						17,
						2,
						.71
					],
					[
						17,
						3,
						.73
					]
				]
			}
		];
		const tokenCase = ref("confident");
		const solutionSet = ref("consensus");
		const beta = ref(ATHENA_DEFAULTS.beta);
		const activeToken = computed(() => TOKEN_CASES.find((t) => t.id === tokenCase.value));
		const criticalStart = computed(() => {
			const n = activeToken.value.confidences.length;
			return n - Math.max(1, Math.floor(n / 4));
		});
		const metrics = computed(() => confidenceMetrics(activeToken.value.confidences, activeToken.value.surprises));
		const metricCards = computed(() => [
			{
				label: "mean confidence",
				value: metrics.value.meanConfidence.toFixed(3)
			},
			{
				label: "geometric confidence",
				value: metrics.value.geometricConfidence.toFixed(3)
			},
			{
				label: "critical-token confidence",
				value: metrics.value.criticalTokenConfidence.toFixed(3)
			},
			{
				label: "evidence strength",
				value: evidenceStrength(metrics.value).toFixed(4),
				accent: true
			}
		]);
		const activeSet = computed(() => SOLUTION_SETS.find((s) => s.id === solutionSet.value));
		const solutions = computed(() => activeSet.value.solutions.map(([answer, prompt, evidence]) => ({
			answer,
			prompt,
			evidence
		})));
		const result = computed(() => ensemble(solutions.value, beta.value));
		const rows = computed(() => {
			const { posteriors, evidenceByAnswer, bonus } = result.value;
			const promptsPer = /* @__PURE__ */ new Map();
			for (const s of solutions.value) {
				if (!promptsPer.has(s.answer)) promptsPer.set(s.answer, /* @__PURE__ */ new Set());
				promptsPer.get(s.answer).add(s.prompt);
			}
			const best = [...posteriors.entries()].reduce((a, b) => b[1] > a[1] ? b : a)[0];
			return [...posteriors.entries()].sort((a, b) => b[1] - a[1]).map(([answer, posterior]) => {
				const ev = evidenceByAnswer.get(answer);
				return {
					answer,
					posterior,
					runs: ev.length,
					prompts: promptsPer.get(answer).size,
					meanEvidence: ev.reduce((a, b) => a + b, 0) / ev.length,
					bonus: bonus.get(answer) ?? 1,
					isMap: answer === best
				};
			});
		});
		usePageSeo({
			title: "ATHENA-TIR",
			description: "ATHENA-TIR: prompt ensembling with tool-integrated reasoning for AIMO-3. Eight mathematical prompt styles, executed Python, token-level confidence, and a Bayesian posterior over answers."
		});
		return (_ctx, _push, _parent, _attrs) => {
			const _component_Katex = Katex_default;
			_push(`<div${ssrRenderAttrs(mergeProps({ class: "py-8 max-w-5xl mx-auto" }, _attrs))}><div class="mb-10"><h1 class="text-3xl sm:text-4xl font-bold mb-3"><span class="font-thin">ATHENA</span><span class="font-black">-TIR</span></h1><p class="lede balance mb-3"> Ask one model the same maths problem sixty-four times, in eight different mathematical voices, and make every answer prove itself by executing. Then pool what survives by how sure the model sounded. </p><p class="text-subheading text-sm"> Token-aware heuristic ensembler with tool-integrated reasoning, built for AIMO-3. Ported from the notebook and checked against it on every build. </p></div><section class="mb-10"><h2 class="rule-heading section-heading mb-5 text-base"><span>The pipeline</span></h2><div class="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-5"><!--[-->`);
			ssrRenderList(PIPELINE, (s) => {
				_push(`<div class="surface-card rounded p-4"><div class="text-2xl sm:text-3xl font-black text-accent tick mb-1">${ssrInterpolate(s.n)}</div><div class="subsection-heading text-sm mb-1">${ssrInterpolate(s.label)}</div><p class="text-subheading text-xs m-0">${ssrInterpolate(s.detail)}</p></div>`);
			});
			_push(`<!--]--></div><p class="text-subheading text-sm"> Every generation is Python, and every program is run. Wrong code raises or prints nothing and removes itself — so there is no regex guessing about what the answer was. </p></section><section class="mb-10"><h2 class="rule-heading section-heading mb-5 text-base"><span>What the tokens say</span></h2><p class="mb-5 max-w-3xl"> vLLM returns the top-5 logprobs per token. Two things are read off them: `);
			_push(ssrRenderComponent(_component_Katex, { expr: TEX.surprise }, null, _parent));
			_push(` for how unexpected a token was, and how much of the probability mass the chosen token took. </p><div class="flex flex-wrap gap-2 mb-5"><!--[-->`);
			ssrRenderList(TOKEN_CASES, (t) => {
				_push(`<button class="${ssrRenderClass([tokenCase.value === t.id ? "btn-accent" : "btn-outline", "btn btn-sm"])}"${ssrRenderAttr("aria-pressed", tokenCase.value === t.id)}>${ssrInterpolate(t.label)}</button>`);
			});
			_push(`<!--]--></div><p class="text-subheading mb-5">${ssrInterpolate(activeToken.value.blurb)}</p><div class="surface-card rounded p-4 sm:p-5 mb-5 overflow-x-auto"><div class="flex items-end gap-1 h-28 min-w-[420px]"><!--[-->`);
			ssrRenderList(activeToken.value.confidences, (c, i) => {
				_push(`<div class="${ssrRenderClass([i >= criticalStart.value ? "bg-accent" : "series-secondary", "flex-1 rounded-t transition-all duration-300"])}" style="${ssrRenderStyle({ height: `${8 + 92 * c}%` })}"${ssrRenderAttr("title", `token ${i}: confidence ${c.toFixed(2)}, surprise ${activeToken.value.surprises[i].toFixed(2)}`)}></div>`);
			});
			_push(`<!--]--></div><div class="flex justify-between mt-2 text-xs text-subheading"><span>token 0</span><span class="text-accent">last 25% — where the answer usually is</span></div></div><div class="grid grid-cols-2 lg:grid-cols-4 gap-4"><!--[-->`);
			ssrRenderList(metricCards.value, (m) => {
				_push(`<div><div class="${ssrRenderClass([m.accent ? "text-accent" : "", "text-xl sm:text-2xl font-black tick"])}">${ssrInterpolate(m.value)}</div><div class="text-subheading text-xs">${ssrInterpolate(m.label)}</div></div>`);
			});
			_push(`<!--]--></div><div class="mt-5 overflow-x-auto">`);
			_push(ssrRenderComponent(_component_Katex, {
				display: "",
				expr: TEX.evidence
			}, null, _parent));
			_push(`</div><p class="text-subheading text-sm"> The heaviest weight is on the closing tokens, not the average. A solution that rambles then commits scores above one that is smooth throughout and wavers at the end — compare the last two presets. </p></section><section class="mb-10"><h2 class="rule-heading section-heading mb-5 text-base"><span>Pooling the survivors</span></h2><div class="flex flex-wrap gap-2 mb-5"><!--[-->`);
			ssrRenderList(SOLUTION_SETS, (s) => {
				_push(`<button class="${ssrRenderClass([solutionSet.value === s.id ? "btn-accent" : "btn-outline", "btn btn-sm"])}"${ssrRenderAttr("aria-pressed", solutionSet.value === s.id)}>${ssrInterpolate(s.label)}</button>`);
			});
			_push(`<!--]--></div><p class="text-subheading mb-5">${ssrInterpolate(activeSet.value.blurb)}</p><div class="max-w-md mb-6"><div class="flex items-baseline justify-between mb-1"><label for="beta" class="text-subheading text-sm">Sharpness</label><code class="provenance">β = ${ssrInterpolate(beta.value.toFixed(3))}</code></div><input id="beta"${ssrRenderAttr("value", beta.value)} type="range" min="0.05" max="1" step="0.01" class="range range-accent range-sm w-full" aria-describedby="beta-note"><p id="beta-note" class="text-subheading text-xs mt-1 h-4 leading-4">${ssrInterpolate(Math.abs(beta.value - unref(ATHENA_DEFAULTS).beta) < .005 ? "the notebook default — very sharp" : beta.value < unref(ATHENA_DEFAULTS).beta ? "sharper than the default" : "flatter: evidence differences matter less")}</p></div><div class="overflow-x-auto"><table class="table table-sm w-full min-w-[520px]"><thead><tr><th>Answer</th><th class="text-right">Runs</th><th class="text-right">Prompts</th><th class="text-right">Mean evidence</th><th class="text-right">Diversity ×</th><th class="text-right">P(answer)</th></tr></thead><tbody><!--[-->`);
			ssrRenderList(rows.value, (r) => {
				_push(`<tr class="${ssrRenderClass(r.isMap ? "font-semibold" : "")}"><td class="tick">${ssrInterpolate(r.answer)}`);
				if (r.isMap) _push(`<span class="text-accent ml-2">MAP</span>`);
				else _push(`<!---->`);
				_push(`</td><td class="text-right tick">${ssrInterpolate(r.runs)}</td><td class="text-right tick">${ssrInterpolate(r.prompts)}</td><td class="text-right tick">${ssrInterpolate(r.meanEvidence.toFixed(3))}</td><td class="text-right tick">${ssrInterpolate(r.bonus.toFixed(3))}</td><td class="${ssrRenderClass([r.isMap ? "text-accent" : "", "text-right tick"])}">${ssrInterpolate(r.posterior.toFixed(4))}</td></tr>`);
			});
			_push(`<!--]--></tbody></table></div><p class="text-subheading text-sm mt-3">${ssrInterpolate(activeSet.value.lesson)}</p></section><section class="mb-10"><h2 class="rule-heading section-heading mb-5 text-base"><span>Two properties worth knowing</span></h2><div class="grid grid-cols-1 md:grid-cols-2 gap-6"><div class="surface-card rounded p-5"><h3 class="subsection-heading mb-2">The prior does nothing</h3><p class="text-sm mb-2"> Every answer receives the same pseudocount `);
			_push(ssrRenderComponent(_component_Katex, { expr: TEX.prior }, null, _parent));
			_push(`, so it is a constant factor that cancels when the posterior is normalised. </p><p class="text-subheading text-sm m-0"> Verified: <code class="provenance">priorStrength</code> 1.5 and 99 give identical posteriors to 1e-12. Harmless, but the knob is inert. </p></div><div class="surface-card rounded p-5"><h3 class="subsection-heading mb-2">Geometric mean is log pooling</h3><p class="text-sm mb-2">`);
			_push(ssrRenderComponent(_component_Katex, { expr: TEX.geo }, null, _parent));
			_push(` is a weighted geometric mean over tokens, which is logarithmic opinion pooling. </p><p class="text-subheading text-sm m-0"> One badly unsure token therefore drags the whole solution down, where an arithmetic mean would let confident neighbours hide it. That veto is the point, not a side effect. </p></div></div></section><p class="text-subheading text-sm"> Qwen 3 30B A3B Instruct via vLLM, top-5 logprobs, temperatures 0.7 and 0.3, β = ${ssrInterpolate(unref(ATHENA_DEFAULTS).beta)}. Ported from <code class="provenance">athena.ipynb</code>. </p></div>`);
		};
	}
});
//#endregion
//#region app/pages/ensemble.vue
var _sfc_setup = ensemble_vue_vue_type_script_setup_true_lang_default.setup;
ensemble_vue_vue_type_script_setup_true_lang_default.setup = (props, ctx) => {
	const ssrContext = useSSRContext();
	(ssrContext.modules || (ssrContext.modules = /* @__PURE__ */ new Set())).add("pages/ensemble.vue");
	return _sfc_setup ? _sfc_setup(props, ctx) : void 0;
};
var ensemble_default = ensemble_vue_vue_type_script_setup_true_lang_default;

export { ensemble_default as default };
//# sourceMappingURL=ensemble-f7RgcaRO.mjs.map
