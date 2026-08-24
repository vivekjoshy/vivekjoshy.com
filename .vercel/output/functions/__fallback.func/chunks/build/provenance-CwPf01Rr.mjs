import { u as usePageSeo } from './pages-yrXgqx3L.mjs';
import { defineComponent, mergeProps, unref, useSSRContext } from 'vue';
import { ssrRenderAttrs, ssrInterpolate, ssrRenderList } from 'vue/server-renderer';
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

var provenance_default$1 = {
	$schema: "https://vivekjoshy.com/provenance.schema.json",
	generated: "2026-08-24",
	root: "230d510f4c2aeb9936f9ae40e378d8e3188b70294d1ce0cd663b6a19cbb714e8",
	algorithm: "sha256",
	rootPreimage: "sha256 over newline-joined, lexicographically sorted \"path:sha256\" and \"repo@commit\" entries",
	artifacts: [
		{
			"label": "Replica losses (circular and dense ordinal) — browser implementation",
			"path": "app/utils/replica-loss.ts",
			"sha256": "1d4af8272534a3903000c087271440737b559839bedd07756aa7ff56947c2750",
			"bytes": 5765,
			"commit": "9d52923fea00b47549b2686b507708f5d511837e",
			"committed": "2026-08-24T21:11:19+05:30"
		},
		{
			"label": "Weng-Lin models — browser implementation",
			"path": "app/utils/openskill.ts",
			"sha256": "ca56d9fd9513257f23c9a89e8ee3347ac0b2cb4a7b68f9f3842611ac5d21194d",
			"bytes": 10617,
			"commit": "9d52923fea00b47549b2686b507708f5d511837e",
			"committed": "2026-08-24T21:11:19+05:30"
		},
		{
			"label": "ARC solver architecture survey",
			"path": "app/data/arc-architectures.json",
			"sha256": "827f9a2891f73ebf3bf8464a0df75178d72e189dbe9ebd9713e1d9fc19ac22ab",
			"bytes": 11336,
			"commit": "df14adb5d68e3eb2b822f04a9abd7154a3aac491",
			"committed": "2026-08-24T21:02:42+05:30"
		},
		{
			"label": "Replica loss reference vectors",
			"path": "scripts/replica-reference.json",
			"sha256": "ea52b2e497fef3135dc2e9473e194ec0021ff5dc0f1ccc7bb6b612eefe6c7ab3",
			"bytes": 74708,
			"commit": "3137ad6318514ffcd50f60114a5e498a5e183a9e",
			"committed": "2026-08-24T20:07:40+05:30"
		},
		{
			"label": "OpenSkill reference vectors",
			"path": "scripts/openskill-reference.json",
			"sha256": "2b6cf67772266e9dba11df648112eb65980424b8ea7d0c256051f2a2c938a584",
			"bytes": 6354,
			"commit": "9d52923fea00b47549b2686b507708f5d511837e",
			"committed": "2026-08-24T21:11:19+05:30"
		},
		{
			"label": "Replica loss reference generator",
			"path": "scripts/gen-replica-reference.py",
			"sha256": "62a5fb7dbe499a25d324d98981cc0f2a0c9be3d748fd48a7cebf20ef05ce3470",
			"bytes": 3096,
			"commit": "3137ad6318514ffcd50f60114a5e498a5e183a9e",
			"committed": "2026-08-24T20:07:40+05:30"
		},
		{
			"label": "Dense Ordinal Replica Loss — page",
			"path": "app/pages/ordinal-replica.vue",
			"sha256": "4b71a76b3e04b2462895cd8f35f076470c1d2dfa593073f6bfea14a2adfe873f",
			"bytes": 19410,
			"commit": "9d52923fea00b47549b2686b507708f5d511837e",
			"committed": "2026-08-24T21:11:19+05:30"
		},
		{
			"label": "ARC-AGI — page",
			"path": "app/pages/arc.vue",
			"sha256": "770550352627dc31601dea35c6261b43548c3762999d439bbd9a536c77a87d2b",
			"bytes": 3661,
			"commit": "df14adb5d68e3eb2b822f04a9abd7154a3aac491",
			"committed": "2026-08-24T21:02:42+05:30"
		}
	],
	privateCommits: [
		{
			"repo": "Opinion",
			"ref": "3773f4e81ac3054b698982e1e69c408ce83fa834",
			"date": "2025-10-26",
			"claim": "DenseOrdinalReplicaLoss — hybrid ordinal/Hamming distance over replica classes"
		},
		{
			"repo": "Opinion",
			"ref": "6b31ec29e072a7ba6f0518593451ce86b12bb8ec",
			"date": "2025-11-14",
			"claim": "CircularReplicaLoss — circular colour topology with inverse-distance spillover"
		},
		{
			"repo": "Opinion",
			"ref": "5ece35a70c1a8620ded626e67c5917d2034e1e31",
			"date": "2025-10-06",
			"claim": "Combinator/SKI grammar-constrained solver"
		},
		{
			"repo": "Opinion",
			"ref": "70d13987238f4a9720c5a160235f19e38ba5384e",
			"date": "2026-04-24",
			"claim": "Relational architecture with coupled loss and D4 augmentation"
		},
		{
			"repo": "Opinion",
			"ref": "555f4fb9575c8253e7f2e0510630d7a85217f75b",
			"date": "2026-03-23",
			"claim": "Variational ARC solver, FiLM-conditioned delta decoder, coupled ELBO"
		},
		{
			"repo": "OpinionAI",
			"ref": "edc373edc8b52687ce1106c510bb125cbc46bc5a",
			"date": "2025-06-06",
			"claim": "SAT/hypergraph constraint formulation"
		},
		{
			"repo": "OpinionAI",
			"ref": "919b0b0a7af41b0cf3df0e5c5487fc7cf07359d3",
			"date": "2025-06-10",
			"claim": "Hypergraph GNN with meta-learning outer loop"
		}
	],
	stamps: [{
		"file": "stamps/2026-08-24-230d510f4c2a.txt",
		"covers": "230d510f4c2aeb9936f9ae40e378d8e3188b70294d1ce0cd663b6a19cbb714e8",
		"coversCurrentRoot": true,
		"anchored": true,
		"status": "stamped; verify with ots, and upgrade once its Bitcoin block is mined"
	}, {
		"file": "stamps/2026-08-24-manifest-132723ca7777.json",
		"covers": "132723ca7777b8b24cd1de2c193d2ed5ff7d9c9a8123872d81b3ac54d224e318",
		"coversCurrentRoot": false,
		"anchored": true,
		"status": "stamped; verify with ots, and upgrade once its Bitcoin block is mined"
	}],
	verify: {
		"artifact": "shasum -a 256 <path>  # compare with the sha256 field",
		"root": "node scripts/build-provenance.mjs  # recomputes; root must match",
		"timestamp": "ots verify public/stamps/<date>-<root>.txt.ots  # a Bitcoin anchor once upgraded",
		"privateCommit": "git cat-file -t <ref> inside the repository once it is public"
	}
};
//#endregion
//#region app/pages/provenance.vue?vue&type=script&setup=true&lang.ts
var provenance_vue_vue_type_script_setup_true_lang_default = /*@__PURE__*/ defineComponent({
	__name: "provenance",
	__ssrInlineRender: true,
	setup(__props) {
		usePageSeo({
			title: "Provenance",
			description: "Content-addressed provenance for the work on this site: SHA-256 artifact hashes, private-repository commit commitments, and an OpenTimestamps-anchorable manifest root."
		});
		return (_ctx, _push, _parent, _attrs) => {
			_push(`<div${ssrRenderAttrs(mergeProps({ class: "py-8 max-w-4xl mx-auto" }, _attrs))}><div class="mb-10"><h1 class="text-4xl font-bold mb-3"><span class="font-thin">PROVE</span><span class="font-black">NANCE</span></h1><p class="lede balance mb-3"> A content-addressed record of the work on this site, so that anything copied from it can be shown to be later. </p><p class="text-subheading text-sm tick"> Manifest generated ${ssrInterpolate(unref(provenance_default$1).generated)} · ${ssrInterpolate(unref(provenance_default$1).algorithm)}</p></div><section class="mb-10 border-l-4 border-accent pl-5"><h2 class="section-heading mb-2 text-base">What this does and does not prove</h2><p class="mb-2"> It proves this exact content existed by a given date. It does <strong>not</strong> prove nobody had the same idea earlier in private — no scheme can prove that. </p><p class="text-subheading"> That limit is not a weakness for the case that matters: if work appears elsewhere after the anchored timestamp, the ordering is settled and needs nobody&#39;s word for it. </p></section><section class="mb-10"><h2 class="rule-heading section-heading mb-4 text-base"><span>Manifest root</span></h2><p class="hash-block mb-3">${ssrInterpolate(unref(provenance_default$1).root)}</p><p class="text-subheading text-sm mb-4">${ssrInterpolate(unref(provenance_default$1).rootPreimage)}</p><p class="mb-4"> The root is a pure function of content, so it moves only when the work moves. The manifest itself is <em>not</em> what gets stamped: it embeds per-artifact commit metadata, which changes on every commit even when no artifact changed. Stamping that would go stale for no substantive reason. The root is served on its own at <a href="/provenance-root.txt" class="text-accent link-underline">/provenance-root.txt</a>. </p><p class="mb-2"> Anchored with <a href="https://opentimestamps.org" target="_blank" rel="noopener noreferrer" class="text-accent link-underline">OpenTimestamps</a>. A stamp is submitted to calendar servers first and folded into a Bitcoin block shortly after; only once <code class="provenance">ots upgrade</code> has attached that block does verification stop depending on the calendars and rest on the blockchain alone. </p><pre class="code-block"><code>node scripts/build-provenance.mjs
node scripts/stamp-provenance.mjs
ots stamp   public/stamps/&lt;date&gt;-&lt;root&gt;.txt
ots upgrade public/stamps/&lt;date&gt;-&lt;root&gt;.txt.ots   # once mined
ots verify  public/stamps/&lt;date&gt;-&lt;root&gt;.txt.ots</code></pre><p class="text-subheading text-sm mt-3"> Stamps accumulate rather than replace. A later change does not invalidate an earlier stamp — it covers an earlier state, which is the whole point of a timestamp. </p><div class="mt-5"><h3 class="section-heading text-sm mb-3">Stamps</h3><!--[-->`);
			ssrRenderList(unref(provenance_default$1).stamps, (st) => {
				_push(`<div class="mb-3"><p class="hash-block mb-1">${ssrInterpolate(st.file)}</p><p class="text-subheading text-sm m-0"> covers <code class="provenance">${ssrInterpolate((st.covers || "unknown").slice(0, 16))}</code>`);
				if (st.coversCurrentRoot) _push(`<span class="text-accent"> — the current root</span>`);
				else _push(`<span> — a superseded root</span>`);
				_push(` · ${ssrInterpolate(st.status)}</p></div>`);
			});
			_push(`<!--]-->`);
			if (!unref(provenance_default$1).stamps.length) _push(`<p class="text-subheading text-sm">No stamps yet.</p>`);
			else _push(`<!---->`);
			_push(`</div></section><section class="mb-10"><h2 class="rule-heading section-heading mb-4 text-base"><span>Public artifacts</span></h2><p class="text-subheading text-sm mb-5"> Hash any of these yourself with <code class="provenance">shasum -a 256 &lt;path&gt;</code>. </p><!--[-->`);
			ssrRenderList(unref(provenance_default$1).artifacts, (a) => {
				_push(`<div class="mb-5 pb-5 border-b hairline last:border-0"><div class="flex flex-col md:flex-row md:justify-between md:items-baseline mb-1 gap-1"><h3 class="subsection-heading">${ssrInterpolate(a.label)}</h3><span class="text-subheading text-sm tick">${ssrInterpolate(a.committed?.slice(0, 10) ?? "—")}</span></div><p class="text-subheading text-sm mb-2"><code class="provenance">${ssrInterpolate(a.path)}</code></p><p class="hash-block">${ssrInterpolate(a.sha256)}</p></div>`);
			});
			_push(`<!--]--></section><section class="mb-10"><h2 class="rule-heading section-heading mb-4 text-base"><span>Private-repository commits</span></h2><p class="mb-5 max-w-3xl"> These repositories are not public. A git commit SHA is itself a hash over the entire tree and history, so publishing one commits to that exact content while revealing none of it. If a repository is later opened, anyone can confirm the SHA matches what is claimed here. </p><!--[-->`);
			ssrRenderList(unref(provenance_default$1).privateCommits, (c) => {
				_push(`<div class="mb-5 pb-5 border-b hairline last:border-0"><div class="flex flex-col md:flex-row md:justify-between md:items-baseline mb-1 gap-1"><h3 class="subsection-heading">${ssrInterpolate(c.claim)}</h3><span class="text-subheading text-sm tick">${ssrInterpolate(c.repo)} · ${ssrInterpolate(c.date)}</span></div><p class="hash-block">${ssrInterpolate(c.ref)}</p></div>`);
			});
			_push(`<!--]--></section><section><h2 class="rule-heading section-heading mb-4 text-base"><span>Corroborating records</span></h2><ul class="list-disc pl-5 space-y-2"><li><a href="https://doi.org/10.21105/joss.05901" target="_blank" rel="noopener noreferrer" class="text-accent link-underline">JOSS 10.21105/joss.05901</a> and <a href="https://arxiv.org/abs/2401.05451" target="_blank" rel="noopener noreferrer" class="text-accent link-underline">arXiv:2401.05451</a> — third-party dated records for OpenSkill, both from January 2024. </li><li> The manifest is served at <a href="/provenance.json" class="text-accent link-underline">/provenance.json</a>, so archive services can capture it independently. </li></ul></section></div>`);
		};
	}
});
//#endregion
//#region app/pages/provenance.vue
var _sfc_setup = provenance_vue_vue_type_script_setup_true_lang_default.setup;
provenance_vue_vue_type_script_setup_true_lang_default.setup = (props, ctx) => {
	const ssrContext = useSSRContext();
	(ssrContext.modules || (ssrContext.modules = /* @__PURE__ */ new Set())).add("pages/provenance.vue");
	return _sfc_setup ? _sfc_setup(props, ctx) : void 0;
};
var provenance_default = provenance_vue_vue_type_script_setup_true_lang_default;

export { provenance_default as default };
//# sourceMappingURL=provenance-CwPf01Rr.mjs.map
