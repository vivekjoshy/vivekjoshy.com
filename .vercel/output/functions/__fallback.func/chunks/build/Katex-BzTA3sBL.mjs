import { defineComponent, computed, mergeProps, useSSRContext } from 'vue';
import { ssrRenderAttrs } from 'vue/server-renderer';
import katex from 'katex';

//#region app/components/Katex.vue?vue&type=script&setup=true&lang.ts
var Katex_vue_vue_type_script_setup_true_lang_default = /*@__PURE__*/ defineComponent({
	__name: "Katex",
	__ssrInlineRender: true,
	props: {
		expr: {},
		display: {
			type: Boolean,
			default: false
		},
		label: { default: void 0 }
	},
	setup(__props) {
		const props = __props;
		const html = computed(() => katex.renderToString(props.expr, {
			displayMode: props.display,
			throwOnError: false,
			output: "htmlAndMathml",
			strict: "ignore"
		}));
		return (_ctx, _push, _parent, _attrs) => {
			if (!__props.display) _push(`<span${ssrRenderAttrs(mergeProps({ class: "katex-inline" }, _attrs))}>${html.value ?? ""}</span>`);
			else _push(`<div${ssrRenderAttrs(mergeProps({ class: "katex-block" }, _attrs))}>${html.value ?? ""}</div>`);
		};
	}
});
//#endregion
//#region app/components/Katex.vue
var _sfc_setup = Katex_vue_vue_type_script_setup_true_lang_default.setup;
Katex_vue_vue_type_script_setup_true_lang_default.setup = (props, ctx) => {
	const ssrContext = useSSRContext();
	(ssrContext.modules || (ssrContext.modules = /* @__PURE__ */ new Set())).add("components/Katex.vue");
	return _sfc_setup ? _sfc_setup(props, ctx) : void 0;
};
var Katex_default = Object.assign(Katex_vue_vue_type_script_setup_true_lang_default, { __name: "Katex" });

export { Katex_default as K };
//# sourceMappingURL=Katex-BzTA3sBL.mjs.map
