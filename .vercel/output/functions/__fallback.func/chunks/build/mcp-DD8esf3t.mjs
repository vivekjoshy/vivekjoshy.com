import { N as NuxtLink } from '../virtual/entry.mjs';
import { u as usePageSeo } from './pages-yrXgqx3L.mjs';
import { defineComponent, mergeProps, withCtx, createTextVNode, useSSRContext } from 'vue';
import { ssrRenderAttrs, ssrRenderComponent, ssrInterpolate, ssrRenderList } from 'vue/server-renderer';
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

//#region app/pages/mcp.vue?vue&type=script&setup=true&lang.ts
var PROTOCOL = "2025-06-18";
var mcp_vue_vue_type_script_setup_true_lang_default = /*@__PURE__*/ defineComponent({
	__name: "mcp",
	__ssrInlineRender: true,
	setup(__props) {
		const TOOLS = [
			{
				name: "rate_match",
				description: "Update ratings from a finished match. Ranks are 1-based ascending, so [1,2] means the first team won; equal values are a draw.",
				example: `{"name":"rate_match","arguments":{
  "teams": [[{"mu":25,"sigma":8.333}], [{"mu":30,"sigma":4}]],
  "ranks": [1, 2],
  "model": "plackett_luce"
}}`
			},
			{
				name: "predict_win",
				description: "Win probability per team for an upcoming match. Exact for two teams; the pairwise generalisation beyond that.",
				example: `{"name":"predict_win","arguments":{
  "teams": [[{"mu":25,"sigma":8.333}], [{"mu":30,"sigma":4}]]
}}`
			},
			{
				name: "compare_models",
				description: "Rate one match under all three Weng-Lin models to see where they separate. Bradley-Terry and Plackett-Luce agree for two teams and diverge for three or more.",
				example: `{"name":"compare_models","arguments":{
  "teams": [[{"mu":25,"sigma":8.333}], [{"mu":28,"sigma":6}], [{"mu":22,"sigma":7}]],
  "ranks": [2, 1, 3]
}}`
			},
			{
				name: "ordinal",
				description: "Conservative single number for display or sorting: mu minus z sigma, z=3 by default, so players the system is still unsure about rank lower.",
				example: `{"name":"ordinal","arguments":{"mu":27.6,"sigma":8.07}}`
			}
		];
		usePageSeo({
			title: "OpenSkill MCP",
			description: "OpenSkill as an MCP server: rate matches, predict outcomes and compare the Weng-Lin models from any agent, over Streamable HTTP, with no install."
		});
		return (_ctx, _push, _parent, _attrs) => {
			const _component_NuxtLink = NuxtLink;
			_push(`<div${ssrRenderAttrs(mergeProps({ class: "py-8 max-w-4xl mx-auto" }, _attrs))}><div class="mb-10"><h1 class="text-3xl sm:text-4xl font-bold mb-3"><span class="font-thin">OPENSKILL</span> <span class="font-black">MCP</span></h1><p class="lede balance mb-3"> The rating models as agent-callable tools. An agent can rate a match or predict a result without installing anything. </p><p class="text-subheading text-sm"> The endpoint imports the same module the `);
			_push(ssrRenderComponent(_component_NuxtLink, {
				to: "/openskill",
				class: "text-accent link-underline"
			}, {
				default: withCtx((_, _push, _parent, _scopeId) => {
					if (_push) _push(`playground`);
					else return [createTextVNode("playground")];
				}),
				_: 1
			}, _parent));
			_push(` uses, so it inherits the build-time check against <code class="provenance">openskill.py</code>. It cannot silently drift from the library. </p></div><section class="mb-10"><h2 class="rule-heading section-heading mb-4 text-base"><span>Connect</span></h2><pre class="code-block mb-4"><code>{
  &quot;mcpServers&quot;: {
    &quot;openskill&quot;: {
      &quot;type&quot;: &quot;http&quot;,
      &quot;url&quot;: &quot;https://vivekjoshy.com/api/mcp&quot;
    }
  }
}</code></pre><p class="text-subheading text-sm"> JSON-RPC over HTTP POST, MCP protocol ${ssrInterpolate(PROTOCOL)}. No authentication and no state — every call is a pure function of its arguments. Bounded at 64 teams, 512 players and 16 messages per batch, because the rating maths is quadratic in team count and the endpoint is public. </p></section><section class="mb-10"><h2 class="rule-heading section-heading mb-4 text-base"><span>Tools</span></h2><!--[-->`);
			ssrRenderList(TOOLS, (t) => {
				_push(`<div class="mb-6 pb-6 border-b hairline last:border-0"><h3 class="subsection-heading mb-1"><code class="provenance">${ssrInterpolate(t.name)}</code></h3><p class="mb-3">${ssrInterpolate(t.description)}</p><div class="overflow-x-auto"><pre class="code-block"><code>${ssrInterpolate(t.example)}</code></pre></div></div>`);
			});
			_push(`<!--]--></section><section><h2 class="rule-heading section-heading mb-4 text-base"><span>Try it</span></h2><pre class="code-block"><code>curl -s https://vivekjoshy.com/api/mcp \\
  -H &#39;content-type: application/json&#39; \\
  -d &#39;{&quot;jsonrpc&quot;:&quot;2.0&quot;,&quot;id&quot;:1,&quot;method&quot;:&quot;tools/list&quot;}&#39;</code></pre><p class="text-subheading text-sm mt-3"> A plain <code class="provenance">GET</code> on the same URL returns the server descriptor. </p></section></div>`);
		};
	}
});
//#endregion
//#region app/pages/mcp.vue
var _sfc_setup = mcp_vue_vue_type_script_setup_true_lang_default.setup;
mcp_vue_vue_type_script_setup_true_lang_default.setup = (props, ctx) => {
	const ssrContext = useSSRContext();
	(ssrContext.modules || (ssrContext.modules = /* @__PURE__ */ new Set())).add("pages/mcp.vue");
	return _sfc_setup ? _sfc_setup(props, ctx) : void 0;
};
var mcp_default = mcp_vue_vue_type_script_setup_true_lang_default;

export { mcp_default as default };
//# sourceMappingURL=mcp-DD8esf3t.mjs.map
