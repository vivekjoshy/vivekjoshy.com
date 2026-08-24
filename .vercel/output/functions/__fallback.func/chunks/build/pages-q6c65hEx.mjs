import { N as NuxtLink } from '../virtual/entry.mjs';
import { u as usePageSeo } from './pages-yrXgqx3L.mjs';
import { e as evidence_default } from './evidence-bKK79_eG.mjs';
import { defineComponent, withCtx, createTextVNode, toDisplayString, useSSRContext } from 'vue';
import { ssrRenderAttrs, ssrRenderComponent, ssrRenderList, ssrInterpolate, ssrRenderClass, ssrRenderAttr } from 'vue/server-renderer';
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

//#region app/pages/index.vue?vue&type=script&setup=true&lang.ts
var index_vue_vue_type_script_setup_true_lang_default = /*@__PURE__*/ defineComponent({
	__name: "index",
	__ssrInlineRender: true,
	setup(__props) {
		const fmt = (n) => typeof n === "number" ? n.toLocaleString("en-US") : "—";
		const stats = [
			{
				label: "PyPI downloads / month",
				value: fmt(evidence_default.pypi?.lastMonth)
			},
			{
				label: "academic citations",
				value: fmt(evidence_default.paper?.citations)
			},
			{
				label: "independent ports",
				value: String(evidence_default.ports.length)
			}
		];
		const artifacts = [
			{
				title: "OpenSkill",
				wide: true,
				body: "Bayesian rating library for asymmetric multi-team, multiplayer matches, implementing the Weng–Lin models. Pinned as a dependency in Ray/RLlib and the rating layer in Neural MMO — both checkable in those projects' manifests. Reported in production at OpenAI, MultiVersus, Hunt: Showdown, and BeyondAllReason.",
				links: [
					{
						label: "Interactive playground",
						to: "/openskill",
						primary: true
					},
					{
						label: "Docs",
						href: "https://openskill.me"
					},
					{
						label: "Source",
						href: "https://github.com/vivekjoshy/openskill.py"
					},
					{
						label: "Paper",
						href: "https://doi.org/10.21105/joss.05901"
					},
					{
						label: "arXiv",
						href: "https://arxiv.org/abs/2401.05451"
					}
				]
			},
			{
				title: "ARC-AGI",
				body: "Two years across eighteen solver architectures in nine families, converging on one negative result about where the difficulty in ARC actually lives.",
				links: [{
					label: "The finding",
					to: "/arc",
					primary: true
				}]
			},
			{
				title: "Boundary kernel theory",
				body: "Grammar induction, monograph in progress. The line of work runs back to OpenGrammar in 2022. Open quantities: k*, the interaction order, and the renormalizability conjectures.",
				links: [{
					label: "OpenGrammar",
					href: "https://github.com/vivekjoshy/OpenGrammar"
				}]
			}
		];
		usePageSeo({
			title: "Home",
			description: "Vivek Joshy - Lead Scientist, Data & ML at Vairified Corp. Formal methods, grammar induction, neuro-symbolic computation, and interpretable AI. Maintainer of OpenSkill."
		});
		return (_ctx, _push, _parent, _attrs) => {
			const _component_NuxtLink = NuxtLink;
			_push(`<div${ssrRenderAttrs(_attrs)}><section class="py-16 md:py-24 grid grid-cols-1 md:grid-cols-12 gap-8 items-end"><div class="md:col-span-8"><h1 class="display font-bold mb-7 rise"><span class="font-thin">VIVEK</span><span class="font-black">JOSHY</span></h1><p class="lede balance mb-5 rise rise-1"> Formal methods, grammar induction, and neuro-symbolic computation — systems that show their reasoning instead of asserting it. </p><p class="text-subheading pretty max-w-[52ch] rise rise-2"> Lead Scientist, Data &amp; ML at Vairified Corp. I maintain `);
			_push(ssrRenderComponent(_component_NuxtLink, {
				to: "/openskill",
				class: "text-accent link-underline"
			}, {
				default: withCtx((_, _push, _parent, _scopeId) => {
					if (_push) _push(`OpenSkill`);
					else return [createTextVNode("OpenSkill")];
				}),
				_: 1
			}, _parent));
			_push(`, and it runs in production under the platform I build. </p></div><div class="md:col-span-4 rise rise-3"><dl class="grid grid-cols-2 md:grid-cols-1 gap-x-6 gap-y-5 m-0"><!--[-->`);
			ssrRenderList(stats, (stat) => {
				_push(`<div><dt class="text-subheading text-sm order-2">${ssrInterpolate(stat.label)}</dt><dd class="text-3xl md:text-4xl font-black text-accent tick m-0">${ssrInterpolate(stat.value)}</dd></div>`);
			});
			_push(`<!--]--></dl></div></section><section class="py-10"><h2 class="rule-heading section-heading mb-8 text-base"><span>Things I&#39;ve built</span></h2><div class="grid grid-cols-1 md:grid-cols-2 gap-6"><!--[-->`);
			ssrRenderList(artifacts, (a, i) => {
				_push(`<article class="${ssrRenderClass([a.wide ? "md:col-span-2" : "", "surface-card lift rounded p-6 flex flex-col"])}"><div class="flex items-baseline justify-between mb-2"><h3 class="subsection-heading text-xl">${ssrInterpolate(a.title)}</h3><span class="text-subheading text-sm tick">${ssrInterpolate(String(i + 1).padStart(2, "0"))}</span></div><p class="mb-4 flex-1">${ssrInterpolate(a.body)}</p><div class="flex flex-wrap gap-x-4 gap-y-1"><!--[-->`);
				ssrRenderList(a.links, (l) => {
					_push(`<!--[-->`);
					if (l.to) _push(ssrRenderComponent(_component_NuxtLink, {
						to: l.to,
						class: ["text-accent link-underline", l.primary ? "font-semibold" : ""]
					}, {
						default: withCtx((_, _push, _parent, _scopeId) => {
							if (_push) _push(`${ssrInterpolate(l.label)}`);
							else return [createTextVNode(toDisplayString(l.label), 1)];
						}),
						_: 2
					}, _parent));
					else _push(`<a${ssrRenderAttr("href", l.href)} target="_blank" rel="noopener noreferrer" class="${ssrRenderClass([l.primary ? "font-semibold" : "", "text-accent link-underline"])}">${ssrInterpolate(l.label)}</a>`);
					_push(`<!--]-->`);
				});
				_push(`<!--]--></div></article>`);
			});
			_push(`<!--]--></div></section></div>`);
		};
	}
});
//#endregion
//#region app/pages/index.vue
var _sfc_setup = index_vue_vue_type_script_setup_true_lang_default.setup;
index_vue_vue_type_script_setup_true_lang_default.setup = (props, ctx) => {
	const ssrContext = useSSRContext();
	(ssrContext.modules || (ssrContext.modules = /* @__PURE__ */ new Set())).add("pages/index.vue");
	return _sfc_setup ? _sfc_setup(props, ctx) : void 0;
};
var pages_default = index_vue_vue_type_script_setup_true_lang_default;

export { pages_default as default };
//# sourceMappingURL=pages-q6c65hEx.mjs.map
