import { u as usePageSeo } from './pages-yrXgqx3L.mjs';
import { e as evidence_default } from './evidence-bKK79_eG.mjs';
import { defineComponent, ref, computed, reactive, mergeProps, unref, useSSRContext } from 'vue';
import { ssrRenderAttrs, ssrInterpolate, ssrRenderList, ssrRenderAttr, ssrRenderComponent, ssrRenderClass, ssrRenderStyle } from 'vue/server-renderer';
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
import 'unhead/server';
import 'unhead/legacy';
import 'unhead/plugins';
import 'vue-bundle-renderer/runtime';
import 'devalue';
import 'vue-router';
import 'unhead/utils';

//#region app/components/EcosystemGraph.vue?vue&type=script&setup=true&lang.ts
var W = 900;
var H = 560;
var EcosystemGraph_vue_vue_type_script_setup_true_lang_default = /*@__PURE__*/ defineComponent({
	__name: "EcosystemGraph",
	__ssrInlineRender: true,
	setup(__props) {
		const CX = W / 2;
		const CY = H / 2;
		const DEPENDENTS = [{
			label: "Ray / RLlib",
			url: "https://github.com/ray-project/ray",
			note: "pinned openskill==6.0.0"
		}, {
			label: "Neural MMO",
			url: "https://github.com/NeuralMMO/environment",
			note: "rating layer"
		}];
		/**
		* Venue names come back in full from Semantic Scholar. Matched by substring
		* rather than equality: the exact strings carry years, workshop suffixes and
		* punctuation that vary between records.
		*/
		const VENUE_ABBREV = [
			["arXiv", "arXiv"],
			["Transactions on Games", "IEEE ToG"],
			["SIGGRAPH Asia", "SIGGRAPH Asia"],
			["Computational Linguistics", "COLING"],
			["Royal Statistical Society", "JRSS-C"],
			["Winter Conference on Applications of Computer Vision", "WACV"],
			["Distributed Artificial Intelligence", "DAI"],
			["Advanced Modeling and Simulation in Engineering Sciences", "AMSES"]
		];
		const shortVenue = (v) => {
			if (!v) return null;
			const hit = VENUE_ABBREV.find(([needle]) => v.includes(needle));
			if (hit) return hit[1];
			return v.length > 24 ? v.slice(0, 22) + "…" : v;
		};
		/**
		* Node labels need to be distinct: four papers share the venue "arXiv", so
		* labelling by venue produces four identical nodes. Most of these papers name
		* a system before a colon or dash — that name is both distinct and the thing
		* a reader recognises.
		*/
		const shortName = (title, venue) => {
			const m = title.match(/^([A-Za-z][\w.\-]{1,18})\s*[:—–-]\s/);
			if (m) return m[1];
			const known = title.match(/\b(Evalica|Generals\.io)\b/);
			if (known) return known[1];
			return shortVenue(venue) ?? "?";
		};
		const sectorsRaw = computed(() => [
			{
				key: "ports",
				label: "Ports",
				items: evidence_default.ports.map((p) => ({
					label: p.lang,
					url: p.url,
					note: p.name
				}))
			},
			{
				key: "citations",
				label: "Citations",
				items: (evidence_default.citing ?? []).map((c) => ({
					label: shortName(c.title, c.venue),
					url: c.arxiv ? `https://arxiv.org/abs/${c.arxiv}` : c.doi ? `https://doi.org/${c.doi}` : null,
					note: [shortVenue(c.venue), c.year].filter(Boolean).join(" ")
				}))
			},
			{
				key: "dependents",
				label: "Dependents",
				items: DEPENDENTS
			}
		]);
		/**
		* Three sectors around the hub. Ports left, citations right, dependents top —
		* spread over arcs sized to how many items each holds.
		*/
		const SECTOR_ARCS = {
			ports: {
				from: 130,
				to: 230,
				r: 210
			},
			citations: {
				from: -55,
				to: 55,
				r: 210
			},
			dependents: {
				from: 232,
				to: 308,
				r: 165
			}
		};
		const nodes = computed(() => {
			const out = [];
			for (const s of sectorsRaw.value) {
				const arc = SECTOR_ARCS[s.key];
				const n = s.items.length;
				s.items.forEach((item, i) => {
					const t = n === 1 ? .5 : i / (n - 1);
					const rad = (arc.from + t * (arc.to - arc.from)) * Math.PI / 180;
					const x = CX + Math.cos(rad) * arc.r;
					const y = CY + Math.sin(rad) * arc.r;
					out.push({
						id: `${s.key}-${i}`,
						x,
						y,
						label: item.label,
						side: x < CX ? "left" : "right"
					});
				});
			}
			return out;
		});
		const edge = (n) => {
			const mx = (CX + n.x) / 2;
			const my = (CY + n.y) / 2;
			const dx = n.x - CX;
			const dy = n.y - CY;
			return `M ${CX} ${CY} Q ${mx - dy * .12} ${my + dx * .12} ${n.x} ${n.y}`;
		};
		const sectors = computed(() => sectorsRaw.value.map((s) => {
			const arc = SECTOR_ARCS[s.key];
			const mid = (arc.from + arc.to) / 2 * (Math.PI / 180);
			const r = arc.r + 74;
			const x = CX + Math.cos(mid) * r;
			const y = CY + Math.sin(mid) * r;
			return {
				...s,
				labelX: x,
				labelY: y,
				anchor: x < 430 ? "end" : x > 470 ? "start" : "middle"
			};
		}));
		return (_ctx, _push, _parent, _attrs) => {
			_push(`<div${ssrRenderAttrs(_attrs)}><div class="ecosystem-wrap" tabindex="0" role="group" aria-label="Ecosystem diagram; the same data follows as text"><svg${ssrRenderAttr("viewBox", `0 0 ${W} ${H}`)} class="w-full" role="presentation" aria-hidden="true"><!--[-->`);
			ssrRenderList(nodes.value, (n) => {
				_push(`<g><path${ssrRenderAttr("d", edge(n))} fill="none"${ssrRenderAttr("stroke", "var(--color-hairline)")} stroke-width="1"></path></g>`);
			});
			_push(`<!--]--><!--[-->`);
			ssrRenderList(sectors.value, (s) => {
				_push(`<g><text${ssrRenderAttr("x", s.labelX)}${ssrRenderAttr("y", s.labelY)}${ssrRenderAttr("text-anchor", s.anchor)} class="ecosystem-sector"${ssrRenderAttr("fill", "var(--color-accent)")}>${ssrInterpolate(s.label.toUpperCase())}</text></g>`);
			});
			_push(`<!--]--><!--[-->`);
			ssrRenderList(nodes.value, (n) => {
				_push(`<g><circle${ssrRenderAttr("cx", n.x)}${ssrRenderAttr("cy", n.y)}${ssrRenderAttr("r", 3.5)}${ssrRenderAttr("fill", "var(--color-accent)")}></circle><text${ssrRenderAttr("x", n.x + (n.side === "left" ? -9 : 9))}${ssrRenderAttr("y", n.y + 3.5)}${ssrRenderAttr("text-anchor", n.side === "left" ? "end" : "start")} class="ecosystem-label"${ssrRenderAttr("fill", "var(--color-primary)")}>${ssrInterpolate(n.label)}</text></g>`);
			});
			_push(`<!--]--><circle${ssrRenderAttr("cx", CX)}${ssrRenderAttr("cy", CY)}${ssrRenderAttr("r", 34)}${ssrRenderAttr("fill", "var(--color-accent)")}></circle><text${ssrRenderAttr("x", CX)}${ssrRenderAttr("y", 278)} text-anchor="middle" class="ecosystem-hub" fill="#fff">openskill</text><text${ssrRenderAttr("x", CX)}${ssrRenderAttr("y", 291)} text-anchor="middle" class="ecosystem-hub-sub" fill="#fff">.py</text></svg></div><div class="grid grid-cols-1 md:grid-cols-3 gap-6 mt-6"><!--[-->`);
			ssrRenderList(sectors.value, (s) => {
				_push(`<div><h3 class="section-heading text-sm mb-2">${ssrInterpolate(s.label)} (${ssrInterpolate(s.items.length)})</h3><ul class="list-none m-0 p-0 space-y-1"><!--[-->`);
				ssrRenderList(s.items, (i) => {
					_push(`<li class="text-sm">`);
					if (i.url) _push(`<a${ssrRenderAttr("href", i.url)} target="_blank" rel="noopener noreferrer" class="text-accent link-underline">${ssrInterpolate(i.label)}</a>`);
					else _push(`<span>${ssrInterpolate(i.label)}</span>`);
					if (i.note) _push(`<span class="text-subheading"> — ${ssrInterpolate(i.note)}</span>`);
					else _push(`<!---->`);
					_push(`</li>`);
				});
				_push(`<!--]--></ul></div>`);
			});
			_push(`<!--]--></div></div>`);
		};
	}
});
//#endregion
//#region app/components/EcosystemGraph.vue
var _sfc_setup$1 = EcosystemGraph_vue_vue_type_script_setup_true_lang_default.setup;
EcosystemGraph_vue_vue_type_script_setup_true_lang_default.setup = (props, ctx) => {
	const ssrContext = useSSRContext();
	(ssrContext.modules || (ssrContext.modules = /* @__PURE__ */ new Set())).add("components/EcosystemGraph.vue");
	return _sfc_setup$1 ? _sfc_setup$1(props, ctx) : void 0;
};
var EcosystemGraph_default = Object.assign(EcosystemGraph_vue_vue_type_script_setup_true_lang_default, { __name: "EcosystemGraph" });
//#endregion
//#region app/utils/openskill.ts
var OPENSKILL_DEFAULTS = {
	mu: 25,
	sigma: 25 / 3,
	beta: 25 / 6};
/** Abramowitz & Stegun 7.1.26; max absolute error ~1.5e-7. */
function erf(x) {
	const sign = x < 0 ? -1 : 1;
	const ax = Math.abs(x);
	const a1 = .254829592;
	const a2 = -0.284496736;
	const a3 = 1.421413741;
	const a4 = -1.453152027;
	const a5 = 1.061405429;
	const t = 1 / (1 + .3275911 * ax);
	return sign * (1 - ((((a5 * t + a4) * t + a3) * t + a2) * t + a1) * t * Math.exp(-ax * ax));
}
/** Normal CDF. */
function phiMajor(x) {
	return .5 * (1 + erf(x / Math.SQRT2));
}
/** Win probability per team. Two-team case is exact; n-team is the pairwise generalization. */
function predictWin(teams) {
	const { beta } = OPENSKILL_DEFAULTS;
	const agg = teams.map((team) => {
		let mu = 0;
		let sigmaSquared = 0;
		for (const p of team) {
			mu += p.mu;
			sigmaSquared += p.sigma * p.sigma;
		}
		return {
			mu,
			sigmaSquared
		};
	});
	if (agg.length === 2) {
		const [a, b] = agg;
		const p = phiMajor((a.mu - b.mu) / Math.sqrt(2 * beta * beta + a.sigmaSquared + b.sigmaSquared));
		return [p, 1 - p];
	}
	const n = agg.length;
	const pairwise = [];
	for (let i = 0; i < n; i++) for (let j = 0; j < n; j++) {
		if (i === j) continue;
		const x = agg[i];
		const y = agg[j];
		pairwise.push(phiMajor((x.mu - y.mu) / Math.sqrt(2 * beta * beta + x.sigmaSquared + y.sigmaSquared)));
	}
	const raw = [];
	for (let i = 0; i < n; i++) {
		let s = 0;
		for (let j = i * (n - 1); j < (i + 1) * (n - 1); j++) s += pairwise[j];
		raw.push(s / (n - 1));
	}
	const total = raw.reduce((x, y) => x + y, 0);
	return raw.map((p) => p / total);
}
/** Conservative skill estimate: mu - z*sigma. */
function ordinal(r, z = 3) {
	return r.mu - z * r.sigma;
}
function newRating(mu = OPENSKILL_DEFAULTS.mu, sigma = OPENSKILL_DEFAULTS.sigma) {
	return {
		mu,
		sigma
	};
}
//#endregion
//#region app/pages/openskill.vue?vue&type=script&setup=true&lang.ts
var openskill_vue_vue_type_script_setup_true_lang_default = /*@__PURE__*/ defineComponent({
	__name: "openskill",
	__ssrInlineRender: true,
	setup(__props) {
		const fmt = (n) => typeof n === "number" ? n.toLocaleString("en-US") : "—";
		const MODELS = [
			{
				id: "plackett_luce",
				label: "Plackett-Luce",
				blurb: "The default. Handles many teams at once by modelling the whole finishing order, rather than decomposing it into pairs."
			},
			{
				id: "thurstone_mosteller",
				label: "Thurstone-Mosteller",
				blurb: "Gaussian performance model with a draw margin. Tends to move ratings further on a surprising result than Plackett-Luce does."
			},
			{
				id: "bradley_terry",
				label: "Bradley-Terry",
				blurb: "Logistic pairwise comparisons. Agrees with Plackett-Luce for two teams, and diverges once there are three or more."
			}
		];
		const model = ref("plackett_luce");
		const activeModel = computed(() => MODELS.find((m) => m.id === model.value));
		let counter = 0;
		const nextName = () => `P${++counter}`;
		function freshTeams() {
			counter = 0;
			return [{
				players: [{
					name: nextName(),
					...newRating()
				}],
				rank: 1
			}, {
				players: [{
					name: nextName(),
					...newRating()
				}],
				rank: 2
			}];
		}
		const teams = reactive(freshTeams());
		const rounds = ref(0);
		const history = ref([]);
		const lastDelta = ref({});
		const bestRank = computed(() => Math.min(...teams.map((t) => t.rank)));
		const winProbabilities = computed(() => predictWin(teams.map((t) => t.players.map((p) => ({
			mu: p.mu,
			sigma: p.sigma
		})))));
		function ordinal$1(p) {
			return ordinal({
				mu: p.mu,
				sigma: p.sigma
			});
		}
		const round3 = (n) => Math.round(n * 1e3) / 1e3;
		usePageSeo({
			title: "OpenSkill Playground",
			description: `Interactive Weng-Lin rating playground: Plackett-Luce, Thurstone-Mosteller and Bradley-Terry, running the same maths as openskill.py. Default mu ${OPENSKILL_DEFAULTS.mu}, sigma 25/3.`
		});
		return (_ctx, _push, _parent, _attrs) => {
			const _component_EcosystemGraph = EcosystemGraph_default;
			_push(`<div${ssrRenderAttrs(mergeProps({ class: "py-8 max-w-5xl mx-auto" }, _attrs))}><div class="mb-10"><h1 class="text-4xl font-bold mb-3"><span class="font-thin">OPEN</span><span class="font-black">SKILL</span></h1><p class="text-lg mb-2"> A live implementation of the Weng–Lin rating models. Build a match, set the result, and watch the posterior move. </p><p class="text-subheading"> Ported from <a href="https://github.com/vivekjoshy/openskill.py" target="_blank" rel="noopener noreferrer" class="text-accent link-underline">openskill.py</a> and checked on every build against reference vectors generated by the Python package itself. Any divergence above 1e-6 fails the build — the <a href="https://github.com/vivekjoshy/vivekjoshy.com" target="_blank" rel="noopener noreferrer" class="text-accent link-underline">check and generator</a> are both in the repo, as <code class="provenance">scripts/verify-openskill.mjs</code> and <code class="provenance">scripts/gen-openskill-reference.py</code>. </p></div><section class="mb-10 border-y hairline py-5"><div class="grid grid-cols-2 md:grid-cols-4 gap-5 mb-4"><div><div class="text-3xl font-black text-accent tabular-nums">${ssrInterpolate(fmt(unref(evidence_default).pypi?.lastMonth))}</div><div class="text-subheading text-sm">PyPI downloads / month</div></div><div><div class="text-3xl font-black text-accent tabular-nums">${ssrInterpolate(fmt(unref(evidence_default).npm?.lastMonth))}</div><div class="text-subheading text-sm">npm downloads / month <span class="opacity-60">(JS port)</span></div></div><div><div class="text-3xl font-black text-accent tabular-nums">${ssrInterpolate(fmt(unref(evidence_default).paper?.citations))}</div><div class="text-subheading text-sm">academic citations</div></div><div><div class="text-3xl font-black text-accent tabular-nums">${ssrInterpolate(fmt(unref(evidence_default).github?.stars))}</div><div class="text-subheading text-sm">GitHub stars</div></div></div><p class="text-subheading text-sm"> Ported independently to ${ssrInterpolate(unref(evidence_default).ports.length)} languages: <!--[-->`);
			ssrRenderList(unref(evidence_default).ports, (p, i) => {
				_push(`<!--[--><a${ssrRenderAttr("href", p.url)} target="_blank" rel="noopener noreferrer" class="text-accent hover:underline">${ssrInterpolate(p.lang)}</a>`);
				if (i < unref(evidence_default).ports.length - 1) _push(`<span>, </span>`);
				else _push(`<!---->`);
				_push(`<!--]-->`);
			});
			_push(`<!--]-->. Figures fetched when the site was last built. </p></section><section class="mb-12"><h2 class="rule-heading section-heading mb-5 text-base"><span>What grew around it</span></h2>`);
			_push(ssrRenderComponent(_component_EcosystemGraph, null, null, _parent));
			_push(`</section><section class="mb-8"><h2 class="section-heading mb-3 text-base">Model</h2><div class="flex flex-wrap gap-2"><!--[-->`);
			ssrRenderList(MODELS, (m) => {
				_push(`<button class="${ssrRenderClass([model.value === m.id ? "btn-accent" : "btn-outline", "btn btn-sm"])}"${ssrRenderAttr("aria-pressed", model.value === m.id)}>${ssrInterpolate(m.label)}</button>`);
			});
			_push(`<!--]--></div><p class="text-subheading mt-2">${ssrInterpolate(activeModel.value.blurb)}</p></section><section class="mb-8"><div class="flex items-baseline justify-between mb-3"><h2 class="section-heading text-base">Match</h2><div class="flex gap-2"><button class="btn btn-xs btn-outline"${ssrRenderAttr("aria-disabled", teams.length >= 4)}>+ team</button><button class="btn btn-xs btn-outline"${ssrRenderAttr("aria-disabled", teams.length <= 2)}>− team</button></div></div><div class="grid grid-cols-1 md:grid-cols-2 gap-5"><!--[-->`);
			ssrRenderList(teams, (team, ti) => {
				_push(`<div class="${ssrRenderClass([{ "border-accent": team.rank === bestRank.value }, "border rounded hairline p-4"])}"><div class="flex items-center justify-between mb-3"><h3 class="subsection-heading">Team ${ssrInterpolate(ti + 1)}</h3><label class="flex items-center gap-2"><span class="text-subheading text-sm">place</span><input${ssrRenderAttr("value", team.rank)} type="number" min="1"${ssrRenderAttr("max", teams.length)} class="input input-bordered input-xs w-16"${ssrRenderAttr("aria-label", `Team ${ti + 1} finishing place`)}></label></div><!--[-->`);
				ssrRenderList(team.players, (p, pi) => {
					_push(`<div class="mb-3 pb-3 border-b hairline last:border-0 last:mb-0 last:pb-0"><div class="flex items-baseline justify-between mb-1"><span class="font-medium">${ssrInterpolate(p.name)}</span><span class="text-subheading text-sm"> ordinal ${ssrInterpolate(ordinal$1(p).toFixed(2))}</span></div><div class="flex gap-3"><label class="flex items-center gap-1 text-sm"><span class="text-subheading">μ</span><input${ssrRenderAttr("value", p.mu)} type="number" step="0.1" class="input input-bordered input-xs w-20"${ssrRenderAttr("aria-label", `${p.name} mu`)}></label><label class="flex items-center gap-1 text-sm"><span class="text-subheading">σ</span><input${ssrRenderAttr("value", round3(p.sigma))} type="number" step="0.1" min="0.01" class="input input-bordered input-xs w-20"${ssrRenderAttr("aria-label", `${p.name} sigma`)}></label>`);
					if (lastDelta.value[ti]?.[pi]) _push(`<span class="${ssrRenderClass([lastDelta.value[ti][pi].mu >= 0 ? "text-accent" : "text-subheading", "text-sm self-center"])}">${ssrInterpolate(lastDelta.value[ti][pi].mu >= 0 ? "+" : "")}${ssrInterpolate(lastDelta.value[ti][pi].mu.toFixed(2))}μ  ${ssrInterpolate(lastDelta.value[ti][pi].sigma >= 0 ? "+" : "")}${ssrInterpolate(lastDelta.value[ti][pi].sigma.toFixed(2))}σ </span>`);
					else _push(`<!---->`);
					_push(`</div></div>`);
				});
				_push(`<!--]--><div class="flex gap-2 mt-3"><button class="btn btn-xs btn-outline"${ssrRenderAttr("aria-disabled", team.players.length >= 3)}>+ player</button><button class="btn btn-xs btn-outline"${ssrRenderAttr("aria-disabled", team.players.length <= 1)}>− player</button></div></div>`);
			});
			_push(`<!--]--></div></section><section class="mb-8"><h2 class="section-heading mb-3 text-base">Predicted outcome</h2><div class="space-y-2"><!--[-->`);
			ssrRenderList(winProbabilities.value, (p, i) => {
				_push(`<div class="flex items-center gap-3"><span class="w-20 text-subheading">Team ${ssrInterpolate(i + 1)}</span><div class="flex-1 surface-soft rounded h-5 overflow-hidden"><div class="bg-accent h-full transition-all duration-500" style="${ssrRenderStyle({ width: (p * 100).toFixed(1) + "%" })}"></div></div><span class="w-16 text-right tabular-nums">${ssrInterpolate((p * 100).toFixed(1))}%</span></div>`);
			});
			_push(`<!--]--></div></section><div class="flex flex-wrap gap-3 mb-10"><button class="btn btn-accent">Rate this result</button><button class="btn btn-outline">Reset</button>`);
			if (rounds.value) _push(`<span class="self-center text-subheading">${ssrInterpolate(rounds.value)} match${ssrInterpolate(rounds.value === 1 ? "" : "es")} rated</span>`);
			else _push(`<!---->`);
			_push(`</div>`);
			if (history.value.length) {
				_push(`<section class="mb-10"><h2 class="section-heading mb-3 text-base">History</h2><div class="overflow-x-auto"><table class="table table-sm"><thead><tr><th>#</th><th>Model</th><th>Result</th><th>Largest move</th></tr></thead><tbody><!--[-->`);
				ssrRenderList([...history.value].reverse(), (h) => {
					_push(`<tr><td>${ssrInterpolate(h.n)}</td><td>${ssrInterpolate(h.model)}</td><td>${ssrInterpolate(h.result)}</td><td class="tabular-nums">${ssrInterpolate(h.biggest)}</td></tr>`);
				});
				_push(`<!--]--></tbody></table></div></section>`);
			} else _push(`<!---->`);
			_push(`</div>`);
		};
	}
});
//#endregion
//#region app/pages/openskill.vue
var _sfc_setup = openskill_vue_vue_type_script_setup_true_lang_default.setup;
openskill_vue_vue_type_script_setup_true_lang_default.setup = (props, ctx) => {
	const ssrContext = useSSRContext();
	(ssrContext.modules || (ssrContext.modules = /* @__PURE__ */ new Set())).add("pages/openskill.vue");
	return _sfc_setup ? _sfc_setup(props, ctx) : void 0;
};
var openskill_default = openskill_vue_vue_type_script_setup_true_lang_default;

export { openskill_default as default };
//# sourceMappingURL=openskill-Dn3YCpbI.mjs.map
