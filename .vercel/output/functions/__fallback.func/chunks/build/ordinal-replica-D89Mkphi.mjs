import { u as usePageSeo } from './pages-yrXgqx3L.mjs';
import { K as Katex_default } from './Katex-BzTA3sBL.mjs';
import { defineComponent, ref, computed, mergeProps, unref, useSSRContext } from 'vue';
import { ssrRenderAttrs, ssrRenderComponent, ssrInterpolate, ssrRenderList, ssrRenderStyle, ssrRenderAttr, ssrRenderClass } from 'vue/server-renderer';
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

var REPLICA_DEFAULTS = {
	spillover: .03,
	entropyWeight: .01,
	focalGamma: 2
};
/** The ten ARC colours, in index order. */
var ARC_COLORS = [
	"#000000",
	"#0074D9",
	"#FF4136",
	"#2ECC40",
	"#FFDC00",
	"#AAAAAA",
	"#F012BE",
	"#FF851B",
	"#7FDBFF",
	"#870C25"
];
/**
* Distance around the colour circle: d(a,b) = min(|a-b|, N-|a-b|).
* So d(0,9) = 1, because the palette wraps.
*/
function circularDistance(a, b, numColors = 10) {
	const direct = Math.abs(a - b);
	return Math.min(direct, numColors - direct);
}
/**
* Soft target distribution over numColors*numReplicas classes.
*
* For target colour c*:
*   own replicas      -> (1 - s) / R each
*   colour c replicas -> (s * w(d(c,c*))) / R each,  w(d) = 1/d, normalised
*/
function createTargetDistributions(numColors = 10, numReplicas = 10, spillover = REPLICA_DEFAULTS.spillover) {
	const total = numColors * numReplicas;
	const out = [];
	for (let target = 0; target < numColors; target++) {
		const row = new Array(total).fill(0);
		let weights = Array.from({ length: numColors }, (_, c) => circularDistance(target, c, numColors)).map((d) => d === 0 ? 0 : 1 / d);
		const sum = weights.reduce((a, b) => a + b, 0);
		if (sum > 0) weights = weights.map((w) => w / sum);
		for (let c = 0; c < numColors; c++) {
			const per = c === target ? (1 - spillover) / numReplicas : spillover * weights[c] / numReplicas;
			const start = c * numReplicas;
			for (let i = start; i < start + numReplicas; i++) row[i] = per;
		}
		out.push(row);
	}
	return out;
}
/** Total probability mass each colour receives, collapsing its replicas. */
function massPerColor(row, numColors = 10, numReplicas = 10) {
	return Array.from({ length: numColors }, (_, c) => row.slice(c * numReplicas, (c + 1) * numReplicas).reduce((a, b) => a + b, 0));
}
/** Numerically stable log-softmax. */
function logSoftmax(logits) {
	const max = Math.max(...logits);
	const shifted = logits.map((l) => l - max);
	const logSum = Math.log(shifted.reduce((a, l) => a + Math.exp(l), 0));
	return shifted.map((l) => l - logSum);
}
/**
* The loss as implemented: cross-entropy against the soft target, plus an
* entropy bonus. L = KL - lambda*H, matching `CircularReplicaLoss.forward`.
*/
function replicaLoss(logits, softTarget, entropyWeight = REPLICA_DEFAULTS.entropyWeight) {
	const logProbs = logSoftmax(logits);
	const probs = logProbs.map(Math.exp);
	const kl = -softTarget.reduce((acc, t, i) => acc + t * logProbs[i], 0);
	const entropy = -probs.reduce((acc, p, i) => acc + p * logProbs[i], 0);
	return {
		total: kl - entropyWeight * entropy,
		kl,
		entropy
	};
}
/** One-hot baseline, for the side-by-side comparison. */
function oneHot(target, numColors = 10, numReplicas = 10) {
	const row = new Array(numColors * numReplicas).fill(0);
	const start = target * numReplicas;
	for (let i = start; i < start + numReplicas; i++) row[i] = 1 / numReplicas;
	return row;
}
/**
* Hybrid distance from each of the N*R classes to the target colour.
*
* Within the target colour's own block, distance is linear from that block's
* middle replica — a genuine ordinal continuum. Every other colour gets a flat
* Hamming penalty of R. This deliberately drops the circular-topology
* assumption: ARC colour indices are labels, not a scale, so treating colour 4
* as "nearer" colour 3 than colour 8 encodes a relationship that isn't there.
*/
function denseOrdinalDistance(targetColor, numColors = 10, numReplicas = 10) {
	const total = numColors * numReplicas;
	const middle = targetColor * numReplicas + Math.floor(numReplicas / 2);
	return Array.from({ length: total }, (_, r) => Math.floor(r / numReplicas) === targetColor ? Math.abs(r - middle) : numReplicas);
}
//#endregion
//#region app/pages/ordinal-replica.vue?vue&type=script&setup=true&lang.ts
var ordinal_replica_vue_vue_type_script_setup_true_lang_default = /*@__PURE__*/ defineComponent({
	__name: "ordinal-replica",
	__ssrInlineRender: true,
	setup(__props) {
		const TEX = {
			dist: String.raw`d(a,b)=\min\bigl(|a-b|,\; N-|a-b|\bigr)`,
			dense: String.raw`d(r, c^{\star}) = \begin{cases} |r - m^{\star}| & \lfloor r/R \rfloor = c^{\star} \\[0.5em] R & \text{otherwise} \end{cases}`,
			target: String.raw`p(r \mid c^{\star}) = \begin{cases}
    \dfrac{1-s}{R} & r \in [c^{\star}R,\; (c^{\star}+1)R) \\[1.1em]
    \dfrac{s\, \tilde{w}\bigl(d(c,c^{\star})\bigr)}{R} & r \in [cR,\; (c+1)R),\; c \neq c^{\star}
  \end{cases}`,
			weight: String.raw`w(d)=1/d`,
			normalised: String.raw`\textstyle\sum_{c \neq c^{\star}} \tilde{w} = 1`,
			loss: String.raw`\mathcal{L} \;=\; \underbrace{\mathrm{KL}\bigl(p^{\star} \,\|\, p_{\theta}\bigr)}_{\text{soft cross-entropy}} \;-\; \lambda \underbrace{H(p_{\theta})}_{\text{entropy bonus}}`,
			lambda: String.raw`\lambda = 0.01`,
			s: String.raw`s = 0.03`,
			R: String.raw`R = 10`,
			N: String.raw`N = 10`,
			classes: String.raw`N \cdot R = 100`
		};
		const target = ref(0);
		const spillover = ref(REPLICA_DEFAULTS.spillover);
		const spilloverNote = computed(() => {
			if (spillover.value === 0) return "one-hot — no colour structure at all";
			if (spillover.value === REPLICA_DEFAULTS.spillover) return "the default used in training";
			return spillover.value > REPLICA_DEFAULTS.spillover ? "more mass on neighbours" : "less mass on neighbours";
		});
		const denseDist = computed(() => denseOrdinalDistance(target.value));
		const row = computed(() => createTargetDistributions(10, 10, spillover.value)[target.value]);
		const mass = computed(() => massPerColor(row.value));
		const maxV = computed(() => Math.max(...row.value));
		const barWidth = (m) => `${Math.sqrt(m) * 100}%`;
		const pos = (i) => {
			const a = i / 10 * Math.PI * 2 - Math.PI / 2;
			return {
				x: Math.cos(a) * 88,
				y: Math.sin(a) * 88
			};
		};
		const isDark = (hex) => {
			const n = parseInt(hex.slice(1), 16);
			const [r, g, b] = [
				n >> 16 & 255,
				n >> 8 & 255,
				n & 255
			];
			return .299 * r + .587 * g + .114 * b < 140;
		};
		const confidentLogits = (c) => {
			const v = new Array(100).fill(0);
			for (let i = c * 10; i < (c + 1) * 10; i++) v[i] = 6;
			return v;
		};
		const softCurve = computed(() => Array.from({ length: 10 }, (_, c) => replicaLoss(confidentLogits(c), row.value).total));
		const hardCurve = computed(() => Array.from({ length: 10 }, (_, c) => replicaLoss(confidentLogits(c), oneHot(target.value)).total));
		const spreadOf = (xs) => {
			const wrong = xs.filter((_, i) => i !== target.value);
			return Math.max(...wrong) - Math.min(...wrong);
		};
		const softSpread = computed(() => spreadOf(softCurve.value));
		const hardSpread = computed(() => spreadOf(hardCurve.value));
		const wrongColors = computed(() => Array.from({ length: 10 }, (_, c) => c).filter((c) => c !== target.value).map((c) => ({
			color: c,
			dist: circularDistance(target.value, c),
			soft: softCurve.value[c],
			hard: hardCurve.value[c]
		})));
		const correctLoss = computed(() => softCurve.value[target.value]);
		const wrongMean = computed(() => wrongColors.value.reduce((a, w) => a + w.soft, 0) / wrongColors.value.length);
		const barH = (v, series) => {
			const xs = wrongColors.value.map((w) => w[series]);
			const lo = Math.min(...xs);
			const hi = Math.max(...xs);
			if (hi - lo < 1e-9) return "55%";
			return `${18 + 82 * ((v - lo) / (hi - lo))}%`;
		};
		usePageSeo({
			title: "Dense Ordinal Replica Loss",
			description: "Interactive walkthrough of the Dense Ordinal Replica Loss: circular colour topology, replica classes and inverse-distance spillover. Recorded effect on ARC grid accuracy: 1.36% to 64.66%."
		});
		return (_ctx, _push, _parent, _attrs) => {
			const _component_Katex = Katex_default;
			_push(`<div${ssrRenderAttrs(mergeProps({ class: "py-8 max-w-5xl mx-auto" }, _attrs))}><div class="mb-10"><h1 class="text-4xl font-bold mb-3"><span class="font-thin">DENSE ORDINAL</span> <span class="font-black">REPLICA LOSS</span></h1><p class="lede balance mb-3"> ARC&#39;s ten colours are not ten unrelated labels — they sit on a circle. This loss teaches the network that, by leaking a little probability mass onto nearby colours instead of using a one-hot cliff. </p><p class="text-subheading text-sm"> Ported from <code class="provenance">Opinion@nca</code> (CircularReplicaLoss) and <code class="provenance">Opinion 3773f4e</code> (DenseOrdinalReplicaLoss), checked against references generated from those sources on every build. </p></div><section class="mb-12 border-l-4 border-accent pl-5"><h2 class="section-heading mb-2 text-base">Recorded effect</h2><p class="text-3xl leading-snug"><span class="text-subheading tick">1.36%</span><span class="text-subheading mx-2">→</span><span class="text-accent font-black tick">64.66%</span></p><p class="text-subheading mt-2"> Grid accuracy, swapping one-hot targets for the circular replica targets below. The figure is recorded in the loss module itself. </p></section><section class="mb-12"><h2 class="rule-heading section-heading mb-5 text-base"><span>Circular, then dense ordinal</span></h2><div class="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6"><div class="surface-card rounded p-5"><h3 class="subsection-heading mb-1">CircularReplicaLoss</h3><p class="text-subheading text-xs mb-3 tick">Opinion@nca · earlier</p><p class="mb-3"> Treats the ten colours as a ring. Target mass leaks onto neighbouring <em>colours</em>, weighted by inverse circular distance. </p><div class="mb-3">`);
			_push(ssrRenderComponent(_component_Katex, {
				display: "",
				expr: TEX.dist
			}, null, _parent));
			_push(`</div><p class="text-subheading text-sm"> Smooth between colours. But it asserts that colour 4 is nearer colour 3 than colour 8 — and in ARC, colour indices are arbitrary labels. </p></div><div class="surface-card rounded p-5"><h3 class="subsection-heading mb-1">DenseOrdinalReplicaLoss</h3><p class="text-subheading text-xs mb-3 tick">Opinion 3773f4e · 2025-10-26</p><p class="mb-3"> Keeps the replicas, drops the ring. Distance is linear <em>within</em> a colour&#39;s own replica block, and a flat Hamming penalty everywhere else. </p><div class="mb-3">`);
			_push(ssrRenderComponent(_component_Katex, {
				display: "",
				expr: TEX.dense
			}, null, _parent));
			_push(`</div><p class="text-subheading text-sm"> Smoothness lives where it is real — replica index is a genuine continuum — and every wrong colour is equally wrong. </p></div></div><div class="surface-card rounded p-5"><h3 class="subsection-heading mb-3">Distance to every one of the ${ssrInterpolate(unref(10) * unref(10))} classes</h3><p class="text-subheading text-sm mb-4"> Target colour ${ssrInterpolate(target.value)}. Each cell is one class; darker means further from the target. </p><div class="mb-4"><p class="text-subheading text-xs mb-1 tick">circular — mass spreads across colour blocks</p><div class="flex gap-px h-8 rounded overflow-hidden border hairline"><!--[-->`);
			ssrRenderList(row.value, (v, i) => {
				_push(`<div class="flex-1" style="${ssrRenderStyle({
					background: unref(ARC_COLORS)[Math.floor(i / unref(10))],
					opacity: .15 + .85 * Math.sqrt(v / maxV.value)
				})}"${ssrRenderAttr("title", `class ${i}: ${(v * 100).toFixed(4)}%`)}></div>`);
			});
			_push(`<!--]--></div></div><div><p class="text-subheading text-xs mb-1 tick">dense ordinal — a V inside one block, flat elsewhere</p><div class="flex gap-px h-8 rounded overflow-hidden border hairline"><!--[-->`);
			ssrRenderList(denseDist.value, (d, i) => {
				_push(`<div class="flex-1" style="${ssrRenderStyle({
					background: unref(ARC_COLORS)[Math.floor(i / unref(10))],
					opacity: 1 - .85 * (d / unref(10))
				})}"${ssrRenderAttr("title", `class ${i}: distance ${d}`)}></div>`);
			});
			_push(`<!--]--></div></div><p class="text-subheading text-sm mt-4"> The dense version has structure in exactly one block — a V centred on replica ${ssrInterpolate(Math.floor(unref(10) / 2))} of colour ${ssrInterpolate(target.value)} — and is deliberately featureless across the other ${ssrInterpolate(unref(10) - 1)} colours. That flatness is the claim: nothing is known about how colours relate, so nothing is encoded. </p></div></section><section class="mb-8"><h2 class="rule-heading section-heading mb-5 text-base"><span>Target colour</span></h2><div class="flex flex-wrap gap-2 mb-6"><!--[-->`);
			ssrRenderList(unref(10), (c) => {
				_push(`<button class="${ssrRenderClass([{ "is-selected": target.value === c - 1 }, "swatch"])}" style="${ssrRenderStyle({ background: unref(ARC_COLORS)[c - 1] })}"${ssrRenderAttr("aria-pressed", target.value === c - 1)}${ssrRenderAttr("aria-label", `Target colour ${c - 1}`)}><span class="swatch-index" style="${ssrRenderStyle({ color: isDark(unref(ARC_COLORS)[c - 1]) ? "#fff" : "#000" })}">${ssrInterpolate(c - 1)}</span></button>`);
			});
			_push(`<!--]--></div><div class="max-w-md"><div class="flex items-baseline justify-between mb-1"><label for="spillover" class="text-subheading text-sm">Spillover</label><code class="provenance">s = ${ssrInterpolate(spillover.value.toFixed(3))}</code></div><input id="spillover"${ssrRenderAttr("value", spillover.value)} type="range" min="0" max="0.35" step="0.005" class="range range-accent range-sm w-full" aria-describedby="spillover-note"><p id="spillover-note" class="text-subheading text-xs mt-1 h-4 leading-4">${ssrInterpolate(spilloverNote.value)}</p></div></section><section class="mb-10 grid grid-cols-1 md:grid-cols-2 gap-10 items-start"><div><h3 class="section-heading mb-4 text-sm">The colour circle</h3><svg viewBox="-130 -130 260 260" class="w-full max-w-xs" role="img"${ssrRenderAttr("aria-label", `Colour circle with target ${target.value}; ring thickness shows probability mass`)}><circle cx="0" cy="0" r="88" fill="none"${ssrRenderAttr("stroke", "var(--color-hairline)")} stroke-width="1"></circle><!--[-->`);
			ssrRenderList(unref(ARC_COLORS), (c, i) => {
				_push(`<g>`);
				if (i !== target.value) _push(`<line${ssrRenderAttr("x1", pos(target.value).x)}${ssrRenderAttr("y1", pos(target.value).y)}${ssrRenderAttr("x2", pos(i).x)}${ssrRenderAttr("y2", pos(i).y)}${ssrRenderAttr("stroke", "var(--color-accent)")}${ssrRenderAttr("stroke-width", .4 + 26 * mass.value[i])}${ssrRenderAttr("opacity", .5)}></line>`);
				else _push(`<!---->`);
				_push(`</g>`);
			});
			_push(`<!--]--><!--[-->`);
			ssrRenderList(unref(ARC_COLORS), (c, i) => {
				_push(`<g><circle${ssrRenderAttr("cx", pos(i).x)}${ssrRenderAttr("cy", pos(i).y)}${ssrRenderAttr("r", i === target.value ? 19 : 13)}${ssrRenderAttr("fill", c)}${ssrRenderAttr("stroke", i === target.value ? "var(--color-accent)" : "var(--color-hairline)")}${ssrRenderAttr("stroke-width", i === target.value ? 3 : 1)}></circle><text${ssrRenderAttr("x", pos(i).x)}${ssrRenderAttr("y", pos(i).y + 4)} text-anchor="middle" font-size="11"${ssrRenderAttr("fill", isDark(c) ? "#fff" : "#000")}>${ssrInterpolate(i)}</text></g>`);
			});
			_push(`<!--]--></svg><p class="text-subheading text-sm mt-3"> Line thickness is the mass colour ${ssrInterpolate(target.value)} donates. Note that ${ssrInterpolate((target.value + 9) % 10)} and ${ssrInterpolate((target.value + 1) % 10)} are equally close — the palette wraps. </p><div class="mt-3">`);
			_push(ssrRenderComponent(_component_Katex, {
				display: "",
				expr: TEX.dist
			}, null, _parent));
			_push(`</div></div><div><h3 class="section-heading mb-4 text-sm">Target mass per colour</h3><div class="space-y-1.5"><!--[-->`);
			ssrRenderList(mass.value, (m, i) => {
				_push(`<div class="flex items-center gap-3"><span class="w-5 h-5 rounded-sm border hairline shrink-0" style="${ssrRenderStyle({ background: unref(ARC_COLORS)[i] })}"></span><span class="w-6 text-subheading text-sm tick">${ssrInterpolate(i)}</span><span class="w-8 text-subheading text-xs tick">d${ssrInterpolate(unref(circularDistance)(target.value, i))}</span><div class="flex-1 surface-soft rounded h-4 overflow-hidden"><div class="bg-accent h-full transition-all duration-300" style="${ssrRenderStyle({ width: barWidth(m) })}"></div></div><span class="w-20 text-right tick text-sm">${ssrInterpolate((m * 100).toFixed(3))}%</span></div>`);
			});
			_push(`<!--]--></div><p class="text-subheading text-sm mt-3"> Bars are on a shared square-root scale so the spillover stays visible next to the ${ssrInterpolate(((1 - spillover.value) * 100).toFixed(1))}% on the target itself. </p></div></section><section class="mb-10"><h2 class="rule-heading section-heading mb-5 text-base"><span>Why replicas</span></h2><div class="mb-5 overflow-x-auto">`);
			_push(ssrRenderComponent(_component_Katex, {
				display: "",
				expr: TEX.target
			}, null, _parent));
			_push(`<p class="text-subheading text-sm mt-2"> with inverse-distance weights `);
			_push(ssrRenderComponent(_component_Katex, { expr: TEX.weight }, null, _parent));
			_push(` normalised so that `);
			_push(ssrRenderComponent(_component_Katex, { expr: TEX.normalised }, null, _parent));
			_push(`. </p></div><p class="mb-4 max-w-3xl"> Each colour owns ${ssrInterpolate(unref(10))} output classes rather than one, so the head predicts over ${ssrInterpolate(unref(10) * unref(10))} classes. Mass is split evenly inside a colour&#39;s block and spread <em>across</em> blocks by circular distance — the spillover is between colours, never between replicas of the same colour. </p><div class="flex gap-px h-12 rounded overflow-hidden border hairline" role="img"${ssrRenderAttr("aria-label", `Target distribution over ${unref(10) * unref(10)} classes`)}><!--[-->`);
			ssrRenderList(row.value, (v, i) => {
				_push(`<div class="flex-1" style="${ssrRenderStyle({
					background: unref(ARC_COLORS)[Math.floor(i / unref(10))],
					opacity: .25 + .75 * Math.sqrt(v / maxV.value)
				})}"${ssrRenderAttr("title", `class ${i} (colour ${Math.floor(i / unref(10))}): ${(v * 100).toFixed(4)}%`)}></div>`);
			});
			_push(`<!--]--></div><p class="text-subheading text-sm mt-2">${ssrInterpolate(unref(10) * unref(10))} classes, ten per colour. Opacity is the probability assigned to each class. </p></section><section class="mb-10"><h2 class="rule-heading section-heading mb-5 text-base"><span>What the network feels</span></h2><p class="mb-4 max-w-3xl"> A prediction that is <em>wrong but adjacent</em> should be penalised less than one that is wrong and far away. One-hot cannot express that. Below, the answer is colour ${ssrInterpolate(target.value)} and the model confidently predicts each colour in turn. </p><div class="surface-card rounded p-5 mb-4"><p class="text-subheading text-sm mb-4"> Cost of confidently predicting each <em>wrong</em> colour. The right answer is excluded: it costs ${ssrInterpolate(correctLoss.value.toFixed(2))} against roughly ${ssrInterpolate(wrongMean.value.toFixed(1))} for a miss, and at that scale the differences between misses would be invisible. </p><div class="flex items-end gap-2"><!--[-->`);
			ssrRenderList(wrongColors.value, (w) => {
				_push(`<div class="flex-1 flex flex-col items-center gap-1"><div class="w-full h-40 flex items-end gap-1"><div class="flex-1 rounded-t transition-all duration-300 series-secondary" style="${ssrRenderStyle({ height: barH(w.hard, "hard") })}"${ssrRenderAttr("title", `one-hot: ${w.hard.toFixed(4)}`)}></div><div class="flex-1 rounded-t bg-accent transition-all duration-300" style="${ssrRenderStyle({ height: barH(w.soft, "soft") })}"${ssrRenderAttr("title", `replica: ${w.soft.toFixed(4)}`)}></div></div><span class="w-4 h-4 rounded-sm border hairline grid place-items-center text-[9px] font-bold" style="${ssrRenderStyle({
					background: unref(ARC_COLORS)[w.color],
					color: isDark(unref(ARC_COLORS)[w.color]) ? "#fff" : "#000"
				})}">${ssrInterpolate(w.color)}</span><span class="text-subheading text-xs tick">d${ssrInterpolate(w.dist)}</span></div>`);
			});
			_push(`<!--]--></div><div class="flex flex-wrap gap-5 mt-4 text-sm items-center"><span class="flex items-center gap-2"><span class="w-3 h-3 rounded-sm series-secondary"></span><span class="text-subheading">one-hot</span></span><span class="flex items-center gap-2"><span class="w-3 h-3 rounded-sm bg-accent"></span><span class="text-subheading">replica</span></span><span class="text-subheading ml-auto tick text-xs"> each column scaled to its own range — spread: one-hot ${ssrInterpolate(hardSpread.value.toFixed(4))}, replica ${ssrInterpolate(softSpread.value.toFixed(4))}</span></div></div><p class="text-subheading text-sm max-w-3xl"> Under one-hot every wrong colour costs <em>exactly</em> the same — the grey bars are flat, so the gradient carries no information about which colours are close. Under the replica target the cost rises with circular distance, giving a V centred on the answer. At the default s = ${ssrInterpolate(unref(REPLICA_DEFAULTS).spillover)} the effect is deliberately small; raise the spillover slider above and the V deepens. </p></section><section class="mt-12 pt-8 border-t hairline"><h2 class="rule-heading section-heading mb-5 text-base"><span>The loss</span></h2><div class="overflow-x-auto">`);
			_push(ssrRenderComponent(_component_Katex, {
				display: "",
				expr: TEX.loss
			}, null, _parent));
			_push(`</div><p class="text-subheading text-sm mt-2"> with `);
			_push(ssrRenderComponent(_component_Katex, { expr: TEX.lambda }, null, _parent));
			_push(`, `);
			_push(ssrRenderComponent(_component_Katex, { expr: TEX.s }, null, _parent));
			_push(`, `);
			_push(ssrRenderComponent(_component_Katex, { expr: TEX.R }, null, _parent));
			_push(` and `);
			_push(ssrRenderComponent(_component_Katex, { expr: TEX.N }, null, _parent));
			_push(` colours, giving `);
			_push(ssrRenderComponent(_component_Katex, { expr: TEX.classes }, null, _parent));
			_push(` output classes. </p></section></div>`);
		};
	}
});
//#endregion
//#region app/pages/ordinal-replica.vue
var _sfc_setup = ordinal_replica_vue_vue_type_script_setup_true_lang_default.setup;
ordinal_replica_vue_vue_type_script_setup_true_lang_default.setup = (props, ctx) => {
	const ssrContext = useSSRContext();
	(ssrContext.modules || (ssrContext.modules = /* @__PURE__ */ new Set())).add("pages/ordinal-replica.vue");
	return _sfc_setup ? _sfc_setup(props, ctx) : void 0;
};
var ordinal_replica_default = ordinal_replica_vue_vue_type_script_setup_true_lang_default;

export { ordinal_replica_default as default };
//# sourceMappingURL=ordinal-replica-D89Mkphi.mjs.map
