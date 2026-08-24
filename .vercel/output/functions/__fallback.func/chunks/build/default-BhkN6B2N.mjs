import { a as useRouter, N as NuxtLink } from '../virtual/entry.mjs';
import { defineComponent, ref, nextTick, mergeProps, withCtx, createVNode, createTextVNode, toDisplayString, computed, watch, useSSRContext } from 'vue';
import { ssrRenderAttrs, ssrRenderComponent, ssrRenderList, ssrInterpolate, ssrRenderSlot, ssrRenderStyle, ssrRenderAttr, ssrRenderTeleport, ssrRenderClass } from 'vue/server-renderer';
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

//#region app/components/CommandPalette.vue?vue&type=script&setup=true&lang.ts
var CommandPalette_vue_vue_type_script_setup_true_lang_default = /*@__PURE__*/ defineComponent({
	__name: "CommandPalette",
	__ssrInlineRender: true,
	setup(__props) {
		const ITEMS = [
			{
				label: "Home",
				group: "Pages",
				to: "/"
			},
			{
				label: "OpenSkill playground",
				group: "Pages",
				to: "/openskill"
			},
			{
				label: "ARC-AGI",
				group: "Pages",
				to: "/arc"
			},
			{
				label: "Dense Ordinal Replica Loss",
				group: "Pages",
				to: "/ordinal-replica"
			},
			{
				label: "ATHENA-TIR prompt ensembles",
				group: "Pages",
				to: "/ensemble"
			},
			{
				label: "Resume",
				group: "Pages",
				to: "/resume"
			},
			{
				label: "OpenSkill MCP server",
				group: "Pages",
				to: "/mcp"
			},
			{
				label: "Provenance",
				group: "Pages",
				to: "/provenance"
			},
			{
				label: "OpenSkill documentation",
				group: "OpenSkill",
				href: "https://openskill.me"
			},
			{
				label: "openskill.py source",
				group: "OpenSkill",
				href: "https://github.com/vivekjoshy/openskill.py"
			},
			{
				label: "JOSS paper (DOI 10.21105/joss.05901)",
				group: "Publications",
				href: "https://doi.org/10.21105/joss.05901"
			},
			{
				label: "arXiv:2401.05451 preprint",
				group: "Publications",
				href: "https://arxiv.org/abs/2401.05451"
			},
			{
				label: "OpenGrammar",
				group: "Repositories",
				href: "https://github.com/vivekjoshy/OpenGrammar"
			},
			{
				label: "TyleDSL",
				group: "Repositories",
				href: "https://github.com/vivekjoshy/TyleDSL"
			},
			{
				label: "GitHub profile",
				group: "Elsewhere",
				href: "https://github.com/vivekjoshy"
			},
			{
				label: "Email",
				group: "Elsewhere",
				href: "mailto:contact@vivekjoshy.com"
			},
			{
				label: "Download resume PDF",
				group: "Elsewhere",
				href: "/assets/resume.pdf"
			}
		];
		useRouter();
		const open = ref(false);
		const query = ref("");
		const cursor = ref(0);
		ref(null);
		ref(null);
		const hintKey = ref("⌘");
		const results = computed(() => {
			const q = query.value.trim().toLowerCase();
			if (!q) return ITEMS;
			return ITEMS.filter((i) => `${i.label} ${i.group}`.toLowerCase().includes(q));
		});
		const activeId = computed(() => results.value.length ? `palette-opt-${cursor.value}` : void 0);
		watch(results, () => {
			cursor.value = 0;
		});
		return (_ctx, _push, _parent, _attrs) => {
			_push(`<div${ssrRenderAttrs(_attrs)}><button type="button" class="palette-trigger no-print" aria-haspopup="dialog"${ssrRenderAttr("aria-expanded", open.value)}><i class="fa-solid fa-magnifying-glass" aria-hidden="true"></i><span class="hidden lg:inline">Search</span><kbd class="hidden lg:inline palette-kbd">${ssrInterpolate(hintKey.value)}K</kbd><span class="sr-only-text">Open command palette</span></button>`);
			ssrRenderTeleport(_push, (_push) => {
				if (open.value) {
					_push(`<div class="palette-backdrop" role="dialog" aria-modal="true" aria-label="Command palette"><div class="palette-panel"><label class="sr-only-text" for="palette-input">Search pages and links</label><input id="palette-input"${ssrRenderAttr("value", query.value)} type="text" class="palette-input" placeholder="Jump to a page, paper, or repository…" autocomplete="off" role="combobox" aria-controls="palette-list"${ssrRenderAttr("aria-expanded", results.value.length > 0)}${ssrRenderAttr("aria-activedescendant", activeId.value)}><ul id="palette-list" class="palette-list" role="listbox" aria-label="Results"><!--[-->`);
					ssrRenderList(results.value, (item, i) => {
						_push(`<li${ssrRenderAttr("id", `palette-opt-${i}`)} role="option"${ssrRenderAttr("aria-selected", i === cursor.value)} class="${ssrRenderClass([{ "is-active": i === cursor.value }, "palette-item"])}"><span class="palette-item-label">${ssrInterpolate(item.label)}</span><span class="palette-item-group">${ssrInterpolate(item.group)}</span></li>`);
					});
					_push(`<!--]-->`);
					if (!results.value.length) _push(`<li role="option" aria-disabled="true" aria-selected="false" class="palette-empty">No matches.</li>`);
					else _push(`<!---->`);
					_push(`</ul><p class="palette-foot"><kbd class="palette-kbd">↑</kbd><kbd class="palette-kbd">↓</kbd> to move <kbd class="palette-kbd">↵</kbd> to open <kbd class="palette-kbd">esc</kbd> to close </p></div></div>`);
				} else _push(`<!---->`);
			}, "body", false, _parent);
			_push(`</div>`);
		};
	}
});
//#endregion
//#region app/components/CommandPalette.vue
var _sfc_setup$2 = CommandPalette_vue_vue_type_script_setup_true_lang_default.setup;
CommandPalette_vue_vue_type_script_setup_true_lang_default.setup = (props, ctx) => {
	const ssrContext = useSSRContext();
	(ssrContext.modules || (ssrContext.modules = /* @__PURE__ */ new Set())).add("components/CommandPalette.vue");
	return _sfc_setup$2 ? _sfc_setup$2(props, ctx) : void 0;
};
var CommandPalette_default = Object.assign(CommandPalette_vue_vue_type_script_setup_true_lang_default, { __name: "CommandPalette" });
//#endregion
//#region app/components/ThemeToggle.vue?vue&type=script&setup=true&lang.ts
var ThemeToggle_vue_vue_type_script_setup_true_lang_default = /*@__PURE__*/ defineComponent({
	__name: "ThemeToggle",
	__ssrInlineRender: true,
	setup(__props) {
		const mode = ref("system");
		const ORDER = [
			"system",
			"light",
			"dark"
		];
		const label = computed(() => mode.value);
		const next = computed(() => ORDER[(ORDER.indexOf(mode.value) + 1) % ORDER.length]);
		const icon = computed(() => mode.value === "light" ? "fa-sun" : mode.value === "dark" ? "fa-moon" : "fa-circle-half-stroke");
		return (_ctx, _push, _parent, _attrs) => {
			_push(`<button${ssrRenderAttrs(mergeProps({
				type: "button",
				class: "btn btn-ghost btn-sm",
				"aria-label": `Theme: ${label.value}. Activate to switch to ${next.value}.`,
				title: `Switch to ${next.value} theme`
			}, _attrs))}><i class="${ssrRenderClass([icon.value, "fa-solid"])}" aria-hidden="true"></i></button>`);
		};
	}
});
//#endregion
//#region app/components/ThemeToggle.vue
var _sfc_setup$1 = ThemeToggle_vue_vue_type_script_setup_true_lang_default.setup;
ThemeToggle_vue_vue_type_script_setup_true_lang_default.setup = (props, ctx) => {
	const ssrContext = useSSRContext();
	(ssrContext.modules || (ssrContext.modules = /* @__PURE__ */ new Set())).add("components/ThemeToggle.vue");
	return _sfc_setup$1 ? _sfc_setup$1(props, ctx) : void 0;
};
var ThemeToggle_default = Object.assign(ThemeToggle_vue_vue_type_script_setup_true_lang_default, { __name: "ThemeToggle" });
//#endregion
//#region app/layouts/default.vue?vue&type=script&setup=true&lang.ts
var default_vue_vue_type_script_setup_true_lang_default = /*@__PURE__*/ defineComponent({
	__name: "default",
	__ssrInlineRender: true,
	setup(__props) {
		const announcement = ref("");
		useRouter().afterEach(async () => {
			await nextTick();
			announcement.value = (void 0).title;
			(void 0).getElementById("main")?.focus();
		});
		const NAV = [
			{
				to: "/",
				label: "Home"
			},
			{
				to: "/openskill",
				label: "Playground"
			},
			{
				to: "/arc",
				label: "ARC"
			},
			{
				to: "/ordinal-replica",
				label: "Replica Loss"
			},
			{
				to: "/ensemble",
				label: "ATHENA"
			},
			{
				to: "/resume",
				label: "Resume"
			},
			{
				to: "/mcp",
				label: "MCP"
			},
			{
				to: "/provenance",
				label: "Provenance"
			}
		];
		return (_ctx, _push, _parent, _attrs) => {
			const _component_NuxtLink = NuxtLink;
			const _component_CommandPalette = CommandPalette_default;
			const _component_ThemeToggle = ThemeToggle_default;
			_push(`<div${ssrRenderAttrs(mergeProps({
				class: "min-h-screen flex flex-col",
				style: { "background-color": "var(--color-page)" }
			}, _attrs))}><a href="#main" class="skip-link">Skip to content</a><header class="site-header"><div class="container mx-auto px-3 sm:px-4 flex items-center gap-2 sm:gap-4 h-14 sm:h-16">`);
			_push(ssrRenderComponent(_component_NuxtLink, {
				to: "/",
				class: "monogram",
				"aria-label": "Vivek Joshy, home"
			}, {
				default: withCtx((_, _push, _parent, _scopeId) => {
					if (_push) _push(`<span class="font-thin"${_scopeId}>V</span><span class="font-black"${_scopeId}>J</span>`);
					else return [createVNode("span", { class: "font-thin" }, "V"), createVNode("span", { class: "font-black" }, "J")];
				}),
				_: 1
			}, _parent));
			_push(`<nav class="flex-1 min-w-0 nav-fade" aria-label="Main"><ul class="flex items-center gap-0.5 md:gap-2 list-none m-0 p-0 text-sm md:text-base nav-scroll"><!--[-->`);
			ssrRenderList(NAV, (item) => {
				_push(`<li>`);
				_push(ssrRenderComponent(_component_NuxtLink, {
					to: item.to,
					class: "nav-link"
				}, {
					default: withCtx((_, _push, _parent, _scopeId) => {
						if (_push) _push(`${ssrInterpolate(item.label)}`);
						else return [createTextVNode(toDisplayString(item.label), 1)];
					}),
					_: 2
				}, _parent));
				_push(`</li>`);
			});
			_push(`<!--]--></ul></nav>`);
			_push(ssrRenderComponent(_component_CommandPalette, null, null, _parent));
			_push(ssrRenderComponent(_component_ThemeToggle, null, null, _parent));
			_push(`</div></header><main id="main" tabindex="-1" class="flex-grow container mx-auto px-4 py-4 scroll-mt-20 outline-none">`);
			ssrRenderSlot(_ctx.$slots, "default", {}, null, _push, _parent);
			_push(`</main><p class="sr-only-text" role="status" aria-live="polite">${ssrInterpolate(announcement.value)}</p><footer class="mt-16 border-t hairline" style="${ssrRenderStyle({ "background-color": "var(--color-surface)" })}"><div class="container mx-auto px-4 py-8 flex flex-col md:flex-row md:items-center md:justify-between gap-4"><p class="text-subheading text-sm m-0"> © ${ssrInterpolate((/* @__PURE__ */ new Date()).getFullYear())} Vivek Joshy </p><ul class="flex gap-5 list-none m-0 p-0"><li><a href="mailto:contact@vivekjoshy.com" class="text-accent hover:opacity-75"><i class="fa-regular fa-envelope" aria-hidden="true"></i><span class="sr-only-text">Email Vivek Joshy</span></a></li><li><a href="https://github.com/vivekjoshy" target="_blank" rel="noopener noreferrer" class="text-accent hover:opacity-75"><i class="fa-brands fa-github" aria-hidden="true"></i><span class="sr-only-text">Vivek Joshy on GitHub (opens in a new tab)</span></a></li><li><a href="https://arxiv.org/abs/2401.05451" target="_blank" rel="noopener noreferrer" class="text-accent hover:opacity-75"><i class="fa-solid fa-file-lines" aria-hidden="true"></i><span class="sr-only-text">OpenSkill paper on arXiv (opens in a new tab)</span></a></li></ul></div></footer></div>`);
		};
	}
});
//#endregion
//#region app/layouts/default.vue
var _sfc_setup = default_vue_vue_type_script_setup_true_lang_default.setup;
default_vue_vue_type_script_setup_true_lang_default.setup = (props, ctx) => {
	const ssrContext = useSSRContext();
	(ssrContext.modules || (ssrContext.modules = /* @__PURE__ */ new Set())).add("layouts/default.vue");
	return _sfc_setup ? _sfc_setup(props, ctx) : void 0;
};
var default_default = default_vue_vue_type_script_setup_true_lang_default;

export { default_default as default };
//# sourceMappingURL=default-BhkN6B2N.mjs.map
