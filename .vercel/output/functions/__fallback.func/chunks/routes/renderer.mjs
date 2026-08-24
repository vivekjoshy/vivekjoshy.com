import { u as useRuntimeConfig, e as encodePath, j as joinRelativeURL, b as defineRenderHandler, g as getQuery, c as createError, f as destr, h as getRouteRules, i as joinURL, k as getResponseStatusText, l as getResponseStatus, m as useNitroApp } from '../nitro/nitro.mjs';
import { hasInjectionContext, inject, isRef, toValue } from 'vue';
import { defineDiagnostics, createConsoleReporter } from 'nostics';
import { createRenderer, getRequestDependencies, getPreloadLinks, getPrefetchLinks } from 'vue-bundle-renderer/runtime';
import { renderToString } from 'vue/server-renderer';
import { stringify, uneval } from 'devalue';

/**
* E8xxx
* Nitro server runtime (SSR rendering / dev server) diagnostics.
*/
const docsBase = (code) => `https://nuxt.com/docs/4.x/errors/${code.replace("NUXT_", "").toLowerCase()}`;
const serverDiagnostics = /* #__PURE__ */ defineDiagnostics({
	docsBase,
	reporters: [/* @__PURE__ */ createConsoleReporter(void 0)],
	codes: {
		NUXT_E8001: {
			why: (p) => `\`render:html\` mutated \`body\`/\`bodyAppend\` while streaming (\`${p.path}\`). These fields are silently dropped because the body is about to stream.`,
			fix: "Use the `render:html:close` hook instead.",
			docs: false
		},
		NUXT_E8002: {
			why: (p) => `SSR streaming committed the response before render completed (\`${p.path}\`). The following mutations did not reach the client and were dropped:\n  - ${p.mutations}`,
			fix: (p) => `Move the mutation into a plugin (which runs before the shell is flushed), or opt this route out of streaming with \`routeRules: { '${p.path}': { streaming: false } }\` or the \`render:route\` hook.`,
			docs: false
		},
		NUXT_E8003: {
			why: (p) => `Failed to stringify dev server logs.${p.error ? ` Received \`${p.error}\`.` : ""}`,
			fix: "You can define your own reducer/reviver for rich types following the instructions in `https://nuxt.com/docs/4.x/api/composables/use-nuxt-app#payload`.",
			docs: false
		},
		NUXT_E8004: {
			why: "The server bundle is not available.",
			fix: "Ensure the Nuxt build completed successfully and the server entry was emitted by your builder.",
			docs: false
		},
		NUXT_E8005: {
			why: "Island props cannot contain a `template` key, which the Vue runtime compiler would compile and execute.",
			fix: "Rename the prop (e.g. `templateName`), or disable `vue.runtimeCompiler` if you do not need runtime template compilation.",
			docs: false
		}
	}
});

const NUXT_RUNTIME_PAYLOAD_EXTRACTION = false;
const NUXT_SSR_STREAMING = false;

function registerPlugin(head, p) {
  if (typeof p === "function" && p.key && head.plugins.has(p.key))
    return;
  const plugin = typeof p === "function" ? p(head) : p;
  const key = plugin.key || String(head.plugins.size + 1);
  if (!head.plugins.get(key)) {
    head.plugins.set(key, plugin);
    for (const k in plugin.hooks || {})
      head.hooks?.hook(k, plugin.hooks[k]);
  }
}
// @__NO_SIDE_EFFECTS__
function createUnhead(renderer, resolvedOptions = {}) {
  const ssr = !resolvedOptions.document;
  const entries = /* @__PURE__ */ new Map();
  const plugins = /* @__PURE__ */ new Map();
  const head = {
    _entryCount: 1,
    _h: 0,
    plugins,
    resolvedOptions,
    ssr,
    entries,
    // adapters decorate this same object; reserve the slot to keep its shape stable
    hooks: void 0,
    render: () => renderer(head),
    use: (p) => registerPlugin(head, p),
    push(input, _options) {
      const _i = _options?._index ?? head._entryCount++;
      const options = _options ? { ..._options } : {};
      delete options.head;
      delete options.onRendered;
      delete options._index;
      const entry = { _i, input, options };
      entries.set(_i, entry);
      const active = {
        _i,
        dispose() {
          entries.delete(_i);
        },
        patch(input2) {
          if (ssr) {
            entry.input = input2;
            delete entry._tags;
          } else {
            entry._pending = input2;
          }
          if (!entries.has(_i))
            entries.set(_i, entry);
        }
      };
      return active;
    }
  };
  resolvedOptions.init?.forEach((e) => e && head.push(e));
  return head;
}

const SelfClosingTags = /* @__PURE__ */ new Set(["meta", "link", "base"]);
const DupeableTags = /* @__PURE__ */ new Set(["link", "style", "script", "noscript"]);
const TagsWithInnerContent = /* @__PURE__ */ new Set(["title", "titleTemplate", "script", "style", "noscript"]);
const HasElementTags = /* @__PURE__ */ new Set(["base", "meta", "link", "style", "script", "noscript"]);
const ValidHeadTags = /* @__PURE__ */ new Set(["title", "base", "htmlAttrs", "bodyAttrs", "meta", "link", "style", "script", "noscript"]);
const UniqueTags = /* @__PURE__ */ new Set(["base", "title", "titleTemplate", "bodyAttrs", "htmlAttrs", "templateParams"]);
const TagConfigKeys = /* @__PURE__ */ new Set(["key", "tagPosition", "tagPriority", "tagDuplicateStrategy", "innerHTML", "textContent", "processTemplateParams"]);
const UsesMergeStrategy = /* @__PURE__ */ new Set(["templateParams", "htmlAttrs", "bodyAttrs"]);
const MetaTagsArrayable = /* @__PURE__ */ new Set([
  "theme-color",
  "google-site-verification",
  "author",
  "og:locale:alternate",
  "og:image",
  "og:video",
  "og:audio",
  "article:author",
  "article:tag",
  "book:author",
  "book:tag",
  "twitter:image"
]);
const TagPriorityAliases = { critical: -8, high: -1, low: 2 };
const hasContent = (value) => typeof value === "number" ? Number.isFinite(value) : value;

// @__NO_SIDE_EFFECTS__
function isUnsafeKey(key) {
  return key === "__proto__" || key === "constructor" || key === "prototype";
}

function callHooks(hooks, args, startIndex, task) {
	for (let i = startIndex; i < hooks.length; i += 1) try {
		const result = task ? task.run(() => hooks[i](...args)) : hooks[i](...args);
		if (result && typeof result.then === "function") return Promise.resolve(result).then(() => callHooks(hooks, args, i + 1, task));
	} catch (error) {
		return Promise.reject(error);
	}
}
var HookableCore = class {
	_hooks;
	constructor() {
		this._hooks = {};
	}
	hook(name, fn) {
		if (!name || typeof fn !== "function") return () => {};
		this._hooks[name] = this._hooks[name] || [];
		this._hooks[name].push(fn);
		return () => {
			if (fn) {
				this.removeHook(name, fn);
				fn = void 0;
			}
		};
	}
	removeHook(name, function_) {
		const hooks = this._hooks[name];
		if (hooks) {
			const index = hooks.indexOf(function_);
			if (index !== -1) hooks.splice(index, 1);
			if (hooks.length === 0) this._hooks[name] = void 0;
		}
	}
	callHook(name, ...args) {
		const hooks = this._hooks[name];
		if (!hooks || hooks.length === 0) return;
		return callHooks(hooks, args, 0);
	}
};

function createHooks(hooks) {
  const instance = new HookableCore();
  for (const key in hooks || {}) {
    instance.hook(key, hooks[key]);
  }
  return instance;
}
function callHook(head, hook, ctx) {
  const hooks = head.hooks?._hooks?.[hook];
  if (!hooks?.length)
    return;
  return head.hooks?.callHook(hook, ctx);
}

const META_NOREWRITE_RE = /^(?:viewport|description|keywords|robots)$/;
const META_KEY_ATTRS = ["name", "property", "http-equiv"];
function isMetaArrayDupeKey(v) {
  const i = v.indexOf(":");
  if (i === -1)
    return false;
  const key = v.slice(i + 1);
  return MetaTagsArrayable.has(key) || key.startsWith("og:image:") || key.startsWith("og:video:") || key.startsWith("og:audio:") || key.startsWith("twitter:image:");
}
function dedupeKey(tag) {
  const { props, tag: t, key } = tag;
  if (UniqueTags.has(t))
    return t;
  if (t === "link") {
    if (props.rel === "canonical")
      return "canonical";
    if (props.rel === "alternate" && props.hreflang)
      return `alternate:${props.hreflang}`;
  }
  if (props.charset)
    return "charset";
  if (t === "meta") {
    for (const n of META_KEY_ATTRS) {
      const v = props[n];
      if (v !== void 0)
        return `meta:${v}${(typeof v !== "string" || !v.includes(":")) && !META_NOREWRITE_RE.test(v) && key ? `:key:${key}` : ""}`;
    }
  }
  if (key)
    return `${t}:key:${key}`;
  if (props.id)
    return `${t}:id:${props.id}`;
  if (t === "link" && props.rel && props.href)
    return `link:${props.rel}:${props.href}`;
  return TagsWithInnerContent.has(t) && (tag.textContent || tag.innerHTML) ? `${t}:content:${tag.textContent || tag.innerHTML}` : void 0;
}
function hashTag(tag) {
  const identity = tag._h || tag._d || tag.textContent || tag.innerHTML;
  if (identity)
    return identity;
  const keys = Object.keys(tag.props).sort();
  let hash = `${tag.tag}:`;
  let separator = "";
  for (const key of keys) {
    hash += `${separator}${key}:${String(tag.props[key])}`;
    separator = ",";
  }
  return hash;
}

function walkResolver(val, resolve, key) {
  if (key === "_resolver")
    return val;
  if (typeof val === "function" && (!key || key !== "titleTemplate" && !key.startsWith("on")))
    val = val();
  const v = resolve ? resolve(key, val) : val;
  if (Array.isArray(v)) {
    let out;
    for (let i = 0; i < v.length; i++) {
      const r = walkResolver(v[i], resolve);
      if (out) {
        out[i] = r;
      } else if (r !== v[i]) {
        out = v.slice(0, i);
        out[i] = r;
      }
    }
    return out || v;
  }
  if (v?.constructor === Object) {
    let next;
    for (const k in v) {
      const unsafe = isUnsafeKey(k);
      const r = unsafe ? void 0 : walkResolver(v[k], resolve, k);
      if (!next && (unsafe || r !== v[k])) {
        next = {};
        for (const pk in v) {
          if (pk === k)
            break;
          next[pk] = v[pk];
        }
      }
      if (next && !unsafe)
        next[k] = r;
    }
    return next || v;
  }
  return v;
}

const INVALID_ATTR_NAME_RE = /[\s"'<>/=\x00-\x1F\x7F]/;

function normalizeStyleClassProps(key, value) {
  const isStyle = key === "style";
  const store = isStyle ? /* @__PURE__ */ new Map() : /* @__PURE__ */ new Set();
  const add = (v) => {
    if (!v)
      return;
    if (isStyle) {
      const i = v.indexOf(":");
      i > 0 && store.set(v.slice(0, i).trim(), v.slice(i + 1).trim());
    } else {
      v.split(" ").forEach((c) => c && store.add(c));
    }
  };
  if (typeof value === "string") {
    (isStyle ? value.split(";") : [value]).forEach(add);
  } else if (Array.isArray(value)) {
    value.forEach(add);
  } else if (value && typeof value === "object") {
    for (const k in value) {
      const v = value[k];
      v && v !== "false" && (isStyle ? store.set(k.trim(), String(v)) : add(k));
    }
  }
  return store;
}
function normalizeProps(tag, input) {
  tag.props = tag.props || {};
  if (!input)
    return tag;
  if (tag.tag === "templateParams") {
    tag.props = input;
    return tag;
  }
  const isHtmlTag = HasElementTags.has(tag.tag) || tag.tag === "htmlAttrs" || tag.tag === "bodyAttrs";
  for (const prop in input) {
    if (isUnsafeKey(prop))
      continue;
    const isData = prop.startsWith("data-");
    const isHtmlAttr = isHtmlTag && !TagConfigKeys.has(prop);
    const key = isHtmlAttr && !isData ? prop.toLowerCase() : prop;
    if (isHtmlAttr && (!key || INVALID_ATTR_NAME_RE.test(key)))
      continue;
    const value = input[prop];
    if (value === null) {
      tag.props[key] = null;
    } else if (prop === "class" || prop === "style") {
      tag.props[prop] = normalizeStyleClassProps(prop, value);
    } else if (TagConfigKeys.has(prop)) {
      if ((prop === "textContent" || prop === "innerHTML") && typeof value === "object") {
        const type = input.type || "application/json";
        if (type.endsWith("json") || type === "speculationrules" || type === "importmap") {
          tag.props.type = type;
          tag[prop] = JSON.stringify(value);
        }
      } else {
        tag[prop] = value;
      }
    } else if (value !== void 0) {
      const str = String(value);
      const isMeta = tag.tag === "meta" && key === "content";
      tag.props[key] = str === "true" || str === "" ? isData || isMeta ? str : true : !value && isData && str === "false" ? "false" : value;
    }
  }
  return tag;
}
function resolveHeadInput(input, propResolvers) {
  let resolve;
  if (propResolvers.length) {
    resolve = (key, val) => {
      for (let i = 0; i < propResolvers.length; i++)
        val = propResolvers[i](key, val);
      return val;
    };
    input = resolve(void 0, input);
  }
  return walkResolver(input, resolve);
}
function normalizeTag(tagName, _input) {
  const input = typeof _input === "object" && typeof _input !== "function" ? _input : { [tagName === "script" || tagName === "noscript" || tagName === "style" ? "innerHTML" : "textContent"]: _input };
  const tag = normalizeProps({ tag: tagName, props: {} }, input);
  if (tag.key && DupeableTags.has(tag.tag))
    tag.props["data-hid"] = tag._h = tag.key;
  if (tag.tag === "script" && typeof tag.innerHTML === "object") {
    tag.innerHTML = JSON.stringify(tag.innerHTML);
    tag.props.type = tag.props.type || "application/json";
  }
  if (Array.isArray(tag.props.content)) {
    const tags = [];
    for (const content of tag.props.content) {
      tags.push({ ...tag, props: { ...tag.props, content } });
    }
    return tags;
  }
  return tag;
}
function pushNormalizedTag(tags, tag) {
  if (Array.isArray(tag)) {
    for (const t of tag) tags.push(t);
  } else {
    tags.push(tag);
  }
}
function normalizeEntryToTags(input, propResolvers) {
  if (!input)
    return [];
  if (typeof input === "function")
    input = input();
  input = resolveHeadInput(input, propResolvers);
  const tags = [];
  for (const key in input) {
    const value = input[key];
    if (value !== void 0) {
      if (Array.isArray(value)) {
        for (const v of value) pushNormalizedTag(tags, normalizeTag(key, v));
      } else {
        pushNormalizedTag(tags, normalizeTag(key, value));
      }
    }
  }
  return tags;
}

const LT_RE$1 = /</g;
const SCRIPT_END_RE = /<\/script/g;
const sortTags$1 = (a, b) => a._w === b._w ? a._p - b._p : a._w - b._w;
const DEFAULT_TAG_WEIGHT = () => 100;
function isEmptyProps(props) {
  for (const _ in props)
    return false;
  return true;
}
const TAG_MUTATING_HOOK_RE = /^tags:|:render/;
function syncEntryHookCache(head, hooks) {
  const count = (hooks["entries:resolve"]?.length || 0) + (hooks["entries:normalize"]?.length || 0);
  if (head._h !== count) {
    head._h = count;
    for (const entry of head.entries.values())
      delete entry._tags;
  }
}
function cloneTagsInPlace(tags) {
  for (let i = 0; i < tags.length; i++) {
    const t = tags[i];
    const props = { ...t.props };
    if (props.class instanceof Set)
      props.class = new Set(props.class);
    if (props.style instanceof Map)
      props.style = new Map(props.style);
    tags[i] = { ...t, props };
  }
}
function valuesToTags(ctx, sortFlatMeta) {
  const tags = ctx.tags;
  let w = 0;
  for (const value of ctx.tagMap.values()) {
    if (Array.isArray(value)) {
      for (const tag of value) tags[w++] = tag;
    } else {
      tags[w++] = value;
    }
  }
  tags.length = w;
  if (sortFlatMeta)
    tags.sort(sortTags$1);
}
function dedupeTags(ctx) {
  let hasFlatMeta = false;
  for (const next of ctx.tags.sort(sortTags$1)) {
    const k = next._d || hashTag(next);
    if (!k)
      continue;
    const prev = ctx.tagMap.get(k);
    if (!prev) {
      ctx.tagMap.set(k, next);
      continue;
    }
    const strategy = next.tagDuplicateStrategy || (UsesMergeStrategy.has(next.tag) ? "merge" : null) || (next.key && next.key === prev.key ? "merge" : null);
    if (strategy === "merge") {
      const props = { ...prev.props };
      for (const p in next.props) {
        props[p] = p === "style" ? new Map([...prev.props.style || /* @__PURE__ */ new Map(), ...next.props[p]]) : p === "class" ? /* @__PURE__ */ new Set([...prev.props.class || [], ...next.props[p]]) : next.props[p];
      }
      ctx.tagMap.set(k, { ...next, props });
    } else if (next._p >> 10 === prev._p >> 10 && next.tag === "meta" && isMetaArrayDupeKey(k)) {
      ctx.tagMap.set(k, Object.assign([...Array.isArray(prev) ? prev : [prev], next], next));
      hasFlatMeta = true;
    } else if (next._w === prev._w ? next._p > prev._p : next._w < prev._w) {
      ctx.tagMap.set(k, next);
    }
  }
  return hasFlatMeta;
}
function resolveTitleTemplate(ctx, head) {
  const title = ctx.tagMap.get("title");
  const tpl = ctx.tagMap.get("titleTemplate");
  head._title = title?.textContent;
  if (!tpl)
    return;
  const fn = tpl.textContent;
  head._titleTemplate = fn;
  if (!fn)
    return;
  let v = typeof fn === "function" ? fn(title?.textContent) : fn;
  if (typeof v === "string" && !head.plugins.has("template-params"))
    v = v.replace("%s", title?.textContent || "");
  if (title) {
    v === null ? ctx.tagMap.delete("title") : ctx.tagMap.set("title", { ...title, textContent: v });
  } else {
    ctx.tagMap.set("titleTemplate", { ...tpl, tag: "title", textContent: v });
  }
}
function sanitizeTagsInPlace(tags) {
  let w = 0;
  for (let t of tags) {
    const { innerHTML, tag, props } = t;
    if (!ValidHeadTags.has(tag) || isEmptyProps(props) && !hasContent(innerHTML) && !hasContent(t.textContent))
      continue;
    if (tag === "meta") {
      if (!hasContent(props.content) && !props["http-equiv"] && !props.charset)
        continue;
    }
    if (tag === "script" && (innerHTML || t.textContent)) {
      const type = String(props.type);
      const isJsonLike = type.endsWith("json") || type === "importmap" || type === "speculationrules";
      const escape = (content) => isJsonLike ? (typeof content === "string" ? content : JSON.stringify(content)).replace(LT_RE$1, "\\u003C") : typeof content === "string" ? content.replace(SCRIPT_END_RE, "<\\/script") : content;
      t = { ...t };
      if (innerHTML)
        t.innerHTML = escape(innerHTML);
      if (t.textContent)
        t.textContent = escape(t.textContent);
      t._d = dedupeKey(t);
    }
    tags[w++] = t;
  }
  tags.length = w;
  return tags;
}
function resolveTags(head, options) {
  const weightFn = options?.tagWeight ?? head.resolvedOptions._tagWeight ?? DEFAULT_TAG_WEIGHT;
  const ctx = { tagMap: /* @__PURE__ */ new Map(), tags: [] };
  const hooks = head.hooks?._hooks || {};
  syncEntryHookCache(head, hooks);
  for (const e of head.entries.values()) {
    if (e._pending !== void 0) {
      e.input = e._pending;
      delete e._pending;
      delete e._tags;
      delete e._precomputedTags;
    }
  }
  let entries;
  if (hooks["entries:resolve"]?.length || hooks["entries:normalize"]?.length) {
    entries = [...head.entries.values()];
    if (hooks["entries:resolve"]?.length)
      callHook(head, "entries:resolve", { entries, ...ctx });
  }
  syncEntryHookCache(head, hooks);
  for (const e of entries || head.entries.values()) {
    let tags = e._tags;
    if (!tags) {
      if (e._precomputedTags && weightFn === head.resolvedOptions._tagWeight && !hooks["entries:normalize"]?.length && !hooks["entries:resolve"]?.length && (!e.options || isEmptyProps(e.options))) {
        tags = e._precomputedTags;
      } else {
        tags = normalizeEntryToTags(e.input, head.resolvedOptions.propResolvers || []);
        if (e.options && !isEmptyProps(e.options)) {
          for (const t of tags)
            Object.assign(t, e.options);
        }
        if (hooks["entries:normalize"]?.length) {
          const normalizeCtx = { tags, entry: e };
          callHook(head, "entries:normalize", normalizeCtx);
          tags = normalizeCtx.tags;
        }
        for (let i = 0; i < tags.length; i++) {
          const t = tags[i];
          t._w = weightFn(t);
          t._p = (e._i << 10) + i;
          t._d = dedupeKey(t);
          if (!t._d)
            t._h = hashTag(t);
        }
        e._tags = tags;
      }
    }
    ctx.tags.push(...tags);
  }
  for (const name in hooks) {
    if (hooks[name]?.length && TAG_MUTATING_HOOK_RE.test(name)) {
      cloneTagsInPlace(ctx.tags);
      break;
    }
  }
  const hasFlatMeta = dedupeTags(ctx);
  resolveTitleTemplate(ctx, head);
  valuesToTags(ctx, hasFlatMeta);
  callHook(head, "tags:beforeResolve", ctx);
  callHook(head, "tags:resolve", ctx);
  callHook(head, "tags:afterResolve", ctx);
  return sanitizeTagsInPlace(ctx.tags);
}

const isTruthy = (v) => v === "" || v === true;
function capoTagWeight(tag) {
  if (typeof tag.tagPriority === "number")
    return tag.tagPriority;
  let weight = 100;
  const offset = TagPriorityAliases[tag.tagPriority] || 0;
  if (tag.tag === "base") {
    weight = -10;
  } else if (tag.tag === "title") {
    weight = 10;
  } else if (tag.tag === "meta") {
    weight = tag.props["http-equiv"] === "content-security-policy" ? -30 : tag.props.charset ? -20 : tag.props.name === "viewport" ? -15 : weight;
  } else if (tag.tag === "link" && tag.props.rel) {
    const rel = tag.props.rel;
    weight = rel === "preconnect" ? 20 : rel === "stylesheet" ? 60 : rel === "preload" || rel === "modulepreload" ? 70 : rel === "prefetch" || rel === "dns-prefetch" || rel === "prerender" ? 90 : weight;
  } else if (tag.tag === "script") {
    const type = typeof tag.props.type === "string" ? tag.props.type : "";
    const json = type.endsWith("json");
    if (type === "importmap")
      weight = 25;
    else if (type === "speculationrules")
      weight = 90;
    else if (isTruthy(tag.props.async))
      weight = 30;
    else if (tag.props.src && !isTruthy(tag.props.defer) && type !== "module" && !json || (tag.innerHTML || tag.textContent) && !json)
      weight = 50;
    else if (isTruthy(tag.props.defer) && tag.props.src || type === "module")
      weight = 80;
  } else if (tag.tag === "style") {
    weight = tag.innerHTML && /@import/.test(tag.innerHTML) ? 40 : 60;
  }
  return (weight || 100) + offset;
}

const DOUBLE_QUOTE_RE$1 = /"/g;
function encodeAttribute(value) {
  const s = typeof value === "string" ? value : String(value);
  return s.includes('"') ? s.replace(DOUBLE_QUOTE_RE$1, "&quot;") : s;
}
function propsToString(props) {
  let attrs = "";
  for (const key in props) {
    if (!Object.hasOwn(props, key) || !key || INVALID_ATTR_NAME_RE.test(key))
      continue;
    let value = props[key];
    if (typeof value !== "string") {
      if (key === "class") {
        let out = "";
        for (const c of value) out += out ? ` ${c}` : c;
        value = out;
      } else if (key === "style") {
        let out = "";
        for (const [k, v] of value) out += out ? `;${k}:${v}` : `${k}:${v}`;
        value = out;
      }
    }
    if (value !== false && value !== null) {
      attrs += value === true ? ` ${key}` : ` ${key}="${encodeAttribute(value)}"`;
    }
  }
  return attrs;
}

const ESCAPE_HTML_RE = /[&<>"'/]/g;
const CLOSE_TAG_RE = {};
const ESCAPE_HTML_MAP = { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#x27;", "/": "&#x2F;" };
function escapeHtml(str) {
  return str.replace(ESCAPE_HTML_RE, (c) => ESCAPE_HTML_MAP[c]);
}
function tagToString(tag) {
  const attrs = propsToString(tag.props);
  const openTag = `<${tag.tag}${attrs}>`;
  if (SelfClosingTags.has(tag.tag))
    return openTag;
  if (!TagsWithInnerContent.has(tag.tag))
    return `${openTag}</${tag.tag}>`;
  let content = String(tag.textContent ?? tag.innerHTML ?? "");
  content = tag.tag === "title" ? escapeHtml(content) : content.replace(CLOSE_TAG_RE[tag.tag] ||= new RegExp(`</${tag.tag}`, "gi"), `<\\/${tag.tag}`);
  return `${openTag}${content}</${tag.tag}>`;
}

function ssrRenderTags(tags, options) {
  const schema = { htmlAttrs: {}, bodyAttrs: {}, tags: { head: "", bodyClose: "", bodyOpen: "" } };
  const lineBreaks = !options?.omitLineBreaks ? "\n" : "";
  for (const tag of tags) {
    if (tag.tag === "htmlAttrs" || tag.tag === "bodyAttrs") {
      Object.assign(schema[tag.tag], tag.props);
      continue;
    }
    const s = tagToString(tag);
    const tagPosition = tag.tagPosition || "head";
    schema.tags[tagPosition] += schema.tags[tagPosition] ? `${lineBreaks}${s}` : s;
  }
  return {
    headTags: schema.tags.head,
    bodyTags: schema.tags.bodyClose,
    bodyTagsOpen: schema.tags.bodyOpen,
    htmlAttrs: propsToString(schema.htmlAttrs),
    bodyAttrs: propsToString(schema.bodyAttrs)
  };
}

// @__NO_SIDE_EFFECTS__
function createServerRenderer(options = {}) {
  return (head) => {
    const beforeRenderCtx = { shouldRender: true };
    callHook(head, "ssr:beforeRender", beforeRenderCtx);
    if (!beforeRenderCtx.shouldRender)
      return ssrRenderTags([]);
    const ctx = {
      tags: options.resolvedTags || resolveTags(head, { tagWeight: options.tagWeight ?? capoTagWeight }),
      options: { ...options }
    };
    callHook(head, "ssr:render", ctx);
    const html = ssrRenderTags(ctx.tags, ctx.options);
    const renderCtx = { tags: ctx.tags, html };
    callHook(head, "ssr:rendered", renderCtx);
    return renderCtx.html;
  };
}
// @__NO_SIDE_EFFECTS__
function renderSSRHead(head, options) {
  return (/* @__PURE__ */ createServerRenderer(options))(head);
}

const DEFAULT_INIT = {
  htmlAttrs: {
    lang: "en"
  },
  meta: [
    {
      charset: "utf-8"
    },
    {
      name: "viewport",
      content: "width=device-width, initial-scale=1"
    }
  ]
};
const serverPropResolver = /* @__PURE__ */ Object.assign(
  (k, v) => {
    if (k && k.startsWith("on") && typeof v === "function") {
      return `this.dataset.${k}fired = true`;
    }
    return v;
  },
  { _static: true }
);
let defaultInitTags;
function getDefaultInitTags() {
  if (!defaultInitTags) {
    defaultInitTags = normalizeEntryToTags(DEFAULT_INIT, []);
    for (let i = 0; i < defaultInitTags.length; i++) {
      const t = defaultInitTags[i];
      t._w = capoTagWeight(t);
      t._p = (1 << 10) + i;
      t._d = dedupeKey(t);
      if (!t._d)
        t._h = hashTag(t);
    }
  }
  return defaultInitTags;
}
// @__NO_SIDE_EFFECTS__
function createHead$1(options = {}) {
  const tagWeight = options.tagWeight || capoTagWeight;
  const core = createUnhead(createServerRenderer({ tagWeight, omitLineBreaks: options.omitLineBreaks }), {
    _tagWeight: tagWeight,
    // @ts-expect-error untyped
    document: false,
    experimentalStreamKey: options.experimentalStreamKey,
    propResolvers: [
      ...options.propResolvers || [],
      serverPropResolver
    ],
    init: [
      options.disableDefaults ? void 0 : DEFAULT_INIT,
      ...options.init || []
    ]
  });
  if (!options.disableDefaults && !options.tagWeight && !options.propResolvers?.some((r) => !r._static)) {
    const defaultEntry = core.entries.get(1);
    if (defaultEntry)
      defaultEntry._precomputedTags = getDefaultInitTags();
  }
  core.hooks = createHooks(options.hooks);
  options.plugins?.forEach((p) => core.use(p));
  return core;
}

const headSymbol = "usehead";
// @__NO_SIDE_EFFECTS__
function injectHead() {
  if (hasInjectionContext()) {
    const instance = inject(headSymbol);
    if (instance)
      return instance;
  }
  throw new Error("useHead() was called without provide context, ensure you call it through the setup() function.");
}
// @__NO_SIDE_EFFECTS__
function vueInstall(head) {
  const plugin = {
    install(app) {
      app.config.globalProperties.$unhead = head;
      app.config.globalProperties.$head = head;
      app.provide(headSymbol, head);
    }
  };
  return plugin.install;
}

const VueResolver = /* @__PURE__ */ Object.assign(
  (_, value) => isRef(value) ? toValue(value) : value,
  // identity for plain non-reactive values, so the SSR default init entry
  // keeps its precomputed fast path (see unhead/server createHead)
  { _static: true }
);

function defineHeadPlugin(plugin, key) {
  if (key && typeof plugin === "function")
    plugin.key = key;
  return plugin;
}

const BACKSLASH_RE = /\\/g;
const LT_RE = /</g;
const DOUBLE_QUOTE_RE = /"/g;
const TOKEN_RE = /%\w+(?:\.\w+)?/g;
const SepSub = "%separator";
function sub(p, token, isJson = false) {
  let val;
  if (token === "s" || token === "pageTitle") {
    val = p.pageTitle;
  } else if (token.includes(".")) {
    const dotIndex = token.indexOf(".");
    val = p[token.substring(0, dotIndex)]?.[token.substring(dotIndex + 1)];
  } else {
    val = p[token];
  }
  if (val !== void 0) {
    return isJson ? (val || "").replace(BACKSLASH_RE, "\\\\").replace(LT_RE, "\\u003C").replace(DOUBLE_QUOTE_RE, '\\"') : val || "";
  }
  return void 0;
}
function processTemplateParams(s, p, sep, isJson = false) {
  if (typeof s !== "string" || !s.includes("%"))
    return s;
  let decoded = s;
  try {
    decoded = decodeURI(s);
  } catch {
  }
  const tokens = decoded.match(TOKEN_RE);
  if (!tokens) {
    return s;
  }
  const hasSepSub = s.includes(SepSub);
  s = s.replace(TOKEN_RE, (token) => {
    if (token === SepSub || !tokens.includes(token)) {
      return token;
    }
    const re = sub(p, token.slice(1), isJson);
    return re !== void 0 ? re : token;
  }).trim();
  if (hasSepSub) {
    s = s.split(SepSub).map((part) => part.trim()).filter((part) => part !== "").join(sep ? ` ${sep} ` : " ");
  }
  return s;
}

const sortTags = (a, b) => a._w === b._w ? a._p - b._p : a._w - b._w;
const formatKey = (k) => !k.includes(":key") ? k.split(":").join(":key:") : k;
const AliasSortingPlugin = /* @__PURE__ */ defineHeadPlugin({
  key: "aliasSorting",
  hooks: {
    "tags:resolve": (ctx) => {
      let m = false;
      for (const t of ctx.tags) {
        const p = t.tagPriority;
        if (!p)
          continue;
        const s = String(p);
        if (s.startsWith("before:")) {
          const k = formatKey(s.slice(7));
          const l = ctx.tagMap.get(k);
          if (l) {
            if (typeof l.tagPriority === "number")
              t.tagPriority = l.tagPriority;
            t._p = l._p - 1;
            m = true;
          }
        } else if (s.startsWith("after:")) {
          const k = formatKey(s.slice(6));
          const l = ctx.tagMap.get(k);
          if (l) {
            if (typeof l.tagPriority === "number")
              t.tagPriority = l.tagPriority;
            t._p = l._p + 1;
            m = true;
          }
        }
      }
      if (m)
        ctx.tags = ctx.tags.sort(sortTags);
    }
  }
});

const DeprecationsPlugin = /* @__PURE__ */ defineHeadPlugin({
  key: "deprecations",
  hooks: {
    "entries:normalize": ({ tags }) => {
      for (const tag of tags) {
        if (tag.props.children) {
          tag.innerHTML = tag.props.children;
          delete tag.props.children;
        }
        if (tag.props.hid) {
          tag.key = tag.props.hid;
          delete tag.props.hid;
        }
        if (tag.props.vmid) {
          tag.key = tag.props.vmid;
          delete tag.props.vmid;
        }
        if ("body" in tag.props) {
          if (tag.props.body) {
            tag.tagPosition = "bodyClose";
          }
          delete tag.props.body;
        }
        if (tag.props.renderPriority != null) {
          tag.tagPriority = tag.props.renderPriority;
          delete tag.props.renderPriority;
        }
      }
    }
  }
});

function isThenable(v) {
  return typeof v?.then === "function";
}
const maxSyncPrefix = 256;
function walkArrayPromises(v, index) {
  if (index === v.length)
    return;
  if (index === maxSyncPrefix) {
    const values2 = new Array(v.length);
    let hasThenable = false;
    for (; index < v.length; index++) {
      const value2 = walkPromises(v[index]);
      values2[index] = value2;
      hasThenable ||= isThenable(value2);
    }
    return hasThenable ? values2 : void 0;
  }
  const value = walkPromises(v[index]);
  if (isThenable(value)) {
    const values2 = new Array(v.length);
    values2[index] = value;
    for (let rest = index + 1; rest < v.length; rest++)
      values2[rest] = walkPromises(v[rest]);
    return values2;
  }
  const values = walkArrayPromises(v, index + 1);
  if (values)
    values[index] = value;
  return values;
}
function walkObjectPromises(v, keys, index) {
  if (index === keys.length)
    return;
  if (index === maxSyncPrefix) {
    const values2 = new Array(keys.length);
    let hasThenable = false;
    for (; index < keys.length; index++) {
      const value2 = walkPromises(v[keys[index]]);
      values2[index] = value2;
      hasThenable ||= isThenable(value2);
    }
    return hasThenable ? values2 : void 0;
  }
  const value = walkPromises(v[keys[index]]);
  if (isThenable(value)) {
    const values2 = new Array(keys.length);
    values2[index] = value;
    for (let rest = index + 1; rest < keys.length; rest++)
      values2[rest] = walkPromises(v[keys[rest]]);
    return values2;
  }
  const values = walkObjectPromises(v, keys, index + 1);
  if (values)
    values[index] = value;
  return values;
}
function walkPromises(v) {
  if (typeof v === "function")
    return v;
  if (isThenable(v))
    return Promise.resolve(v).then(walkPromises);
  if (Array.isArray(v)) {
    const values = walkArrayPromises(v, 0);
    return values ? Promise.all(values) : v;
  }
  if (v?.constructor === Object) {
    const keys = Object.keys(v);
    const values = walkObjectPromises(v, keys, 0);
    if (values) {
      return Promise.all(values).then((resolved) => Object.fromEntries(
        keys.map((key, index) => [key, resolved[index]])
      ));
    }
  }
  return v;
}
const PromisesPlugin = /* @__PURE__ */ defineHeadPlugin((head) => {
  const pending = /* @__PURE__ */ new WeakMap();
  return {
    key: "promises",
    hooks: {
      "entries:resolve": (ctx) => {
        for (let index = ctx.entries.length - 1; index >= 0; index--) {
          const entry = ctx.entries[index];
          const input = entry.input;
          if (pending.get(entry) === input) {
            ctx.entries.splice(index, 1);
            continue;
          }
          const result = walkPromises(input);
          if (!isThenable(result)) {
            pending.delete(entry);
            continue;
          }
          pending.set(entry, input);
          ctx.entries.splice(index, 1);
          void Promise.resolve(result).then(
            (resolved) => {
              if (pending.get(entry) !== input)
                return;
              pending.delete(entry);
              entry.input = resolved;
              delete entry._tags;
              head.invalidate?.();
            },
            () => {
              if (pending.get(entry) === input)
                pending.delete(entry);
            }
          );
        }
      }
    }
  };
}, "promises");

const SupportedAttrs = {
  meta: "content",
  link: "href",
  htmlAttrs: "lang"
};
const contentAttrs = ["innerHTML", "textContent"];
function processIfNeeded(value, params, separator, isJson = false) {
  return typeof value === "string" && value.includes("%") ? processTemplateParams(value, params, separator, isJson) : value;
}
const TemplateParamsPlugin = /* @__PURE__ */ defineHeadPlugin((head) => {
  return {
    key: "template-params",
    hooks: {
      "tags:resolve": ({ tagMap, tags }) => {
        const params = tagMap.get("templateParams")?.props || {};
        const sep = params.separator || "|";
        delete params.separator;
        params.pageTitle = processIfNeeded(
          // find templateParams
          params.pageTitle || head._title || "",
          params,
          sep
        );
        for (const tag of tags) {
          if (tag.processTemplateParams === false) {
            continue;
          }
          const v = SupportedAttrs[tag.tag];
          if (v && typeof tag.props[v] === "string") {
            tag.props[v] = processIfNeeded(tag.props[v], params, sep);
          } else if (tag.processTemplateParams || tag.tag === "titleTemplate" || tag.tag === "title") {
            for (const p of contentAttrs) {
              if (typeof tag[p] === "string")
                tag[p] = processIfNeeded(tag[p], params, sep, tag.tag === "script" && typeof tag.props.type === "string" && tag.props.type.endsWith("json"));
            }
          }
        }
        head._templateParams = params;
        head._separator = sep;
      },
      "tags:afterResolve": ({ tagMap }) => {
        const title = tagMap.get("title");
        if (title?.textContent && title.processTemplateParams !== false) {
          title.textContent = processIfNeeded(title.textContent, head._templateParams, head._separator);
        }
      }
    }
  };
}, "template-params");

// @__NO_SIDE_EFFECTS__
function createHead(options = {}) {
  const head = createHead$1({
    ...options,
    propResolvers: [VueResolver]
  });
  head.install = vueInstall(head);
  return head;
}

const legacyPlugins = [DeprecationsPlugin, PromisesPlugin, TemplateParamsPlugin, AliasSortingPlugin];

const unheadOptions = {
  disableDefaults: true,
  plugins: legacyPlugins,
};

function encodeEventPath(path) {
	const queryIndex = path.indexOf("?");
	if (queryIndex === -1) return encodePath(path);
	return encodePath(path.slice(0, queryIndex)) + path.slice(queryIndex);
}
function createSSRContext(event) {
	const url = encodeEventPath(event.path);
	const ssrContext = {
		url,
		event,
		runtimeConfig: useRuntimeConfig(event),
		noSSR: event.context.nuxt?.noSSR || (false),
		head: createHead(unheadOptions),
		error: false,
		nuxt: void 0,
		payload: {},
		["~payloadReducers"]: Object.create(null),
		modules: /* @__PURE__ */ new Set()
	};
	return ssrContext;
}
function setSSRError(ssrContext, error) {
	ssrContext.error = true;
	ssrContext.payload = { error };
	ssrContext.url = error.url;
}

//#region src/runtime/utils/paths.ts
function baseURL() {
	return useRuntimeConfig().app.baseURL;
}
function buildAssetsDir() {
	return useRuntimeConfig().app.buildAssetsDir;
}
function buildAssetsURL(...path) {
	return joinRelativeURL(publicAssetsURL(), buildAssetsDir(), ...path);
}
function publicAssetsURL(...path) {
	const app = useRuntimeConfig().app;
	const publicBase = app.cdnURL || app.baseURL;
	return path.length ? joinRelativeURL(publicBase, ...path) : publicBase;
}

//#region src/runtime/utils/renderer/cache.ts
function lazyCachedFunction(fn) {
	let res = null;
	return () => {
		if (res === null) res = fn().catch((err) => {
			res = null;
			throw err;
		});
		return res;
	};
}

const appHead = {"meta":[{"name":"viewport","content":"width=device-width, initial-scale=1"},{"charset":"utf-8"}],"link":[{"rel":"icon","type":"image/svg+xml","href":"/favicon.svg"}],"style":[],"script":[{"innerHTML":"try{var t=localStorage.getItem('theme');if(t==='light'||t==='dark')document.documentElement.setAttribute('data-theme',t)}catch(e){}","tagPosition":"head"}],"noscript":[],"htmlAttrs":{"lang":"en"},"charset":"utf-8","viewport":"width=device-width, initial-scale=1"};

const appRootTag = "div";

const appRootAttrs = {"id":"__nuxt"};

const appTeleportTag = "div";

const appTeleportAttrs = {"id":"teleports"};

const appSpaLoaderTag = "div";

const appSpaLoaderAttrs = {"id":"__nuxt-loader"};

const appId = "nuxt-app";

//#region src/runtime/utils/renderer/build-files.ts
globalThis.__buildAssetsURL = buildAssetsURL;
globalThis.__publicAssetsURL = publicAssetsURL;
const APP_ROOT_OPEN_TAG = `<${appRootTag}${propsToString(appRootAttrs)}>`;
const APP_ROOT_CLOSE_TAG = `</${appRootTag}>`;
const getServerEntry = () => import('../virtual/entry.mjs').then(function (n) { return n.e; }).then((r) => r.default || r);
const getPrecomputedDependencies = () => import('../virtual/precomputed.mjs').then((r) => "default" in r ? r.default : r).then((r) => typeof r === "function" ? r() : r);
const getSSRRenderer = lazyCachedFunction(async () => {
	const createSSRApp = await getServerEntry();
	if (!createSSRApp) throw serverDiagnostics.NUXT_E8004();
	const precomputed = await getPrecomputedDependencies();
	const renderer = createRenderer(createSSRApp, {
		precomputed,
		manifest: void 0,
		renderToString: renderToString$1,
		buildAssetsURL
	});
	async function renderToString$1(input, context) {
		const html = await renderToString(input, context);
		return APP_ROOT_OPEN_TAG + html + APP_ROOT_CLOSE_TAG;
	}
	return renderer;
});
const getSPARenderer = lazyCachedFunction(async () => {
	const precomputed = await getPrecomputedDependencies();
	const spaTemplate = await import('../virtual/_virtual_spa-template.mjs').then((r) => r.template).catch(() => "").then((r) => {
		{
			const APP_SPA_LOADER_OPEN_TAG = `<${appSpaLoaderTag}${propsToString(appSpaLoaderAttrs)}>`;
			const APP_SPA_LOADER_CLOSE_TAG = `</${appSpaLoaderTag}>`;
			return APP_ROOT_OPEN_TAG + APP_ROOT_CLOSE_TAG + (r ? APP_SPA_LOADER_OPEN_TAG + r + APP_SPA_LOADER_CLOSE_TAG : "");
		}
	});
	const renderer = createRenderer(() => () => {}, {
		precomputed,
		manifest: void 0,
		renderToString: () => spaTemplate,
		buildAssetsURL
	});
	const result = await renderer.renderToString({});
	const renderToString = (ssrContext) => {
		const config = useRuntimeConfig(ssrContext.event);
		ssrContext.modules ||= /* @__PURE__ */ new Set();
		ssrContext.payload.serverRendered = false;
		ssrContext.config = {
			public: config.public,
			app: config.app
		};
		return Promise.resolve(result);
	};
	return {
		rendererContext: renderer.rendererContext,
		renderToString
	};
});
function getRenderer(ssrContext) {
	return ssrContext.noSSR ? getSPARenderer() : getSSRRenderer();
}
const getSSRStyles = lazyCachedFunction(() => import('../virtual/styles.mjs').then((r) => r.default || r));

//#region src/runtime/utils/renderer/inline-styles.ts
async function renderInlineStyles(usedModules) {
	const styleMap = await getSSRStyles();
	const inlinedStyles = /* @__PURE__ */ new Set();
	const promises = [];
	for (const mod of usedModules) if (mod in styleMap && styleMap[mod]) promises.push(styleMap[mod]());
	for (const styles of await Promise.all(promises)) for (const style of styles) inlinedStyles.add(style);
	return Array.from(inlinedStyles).map((style) => ({ innerHTML: style }));
}

function renderPayloadJsonScript(opts) {
	const payload = {
		"type": "application/json",
		"innerHTML": opts.data ? encodeForwardSlashes(stringify(opts.data, opts.ssrContext["~payloadReducers"])) : "",
		"data-nuxt-data": appId,
		"data-ssr": !(opts.ssrContext.noSSR)
	};
	payload.id = "__NUXT_DATA__";
	if (opts.src) payload["data-src"] = opts.src;
	const config = uneval(opts.ssrContext.config);
	return [payload, { innerHTML: `window.__NUXT__={};window.__NUXT__.config=${config}` }];
}
/**
* Encode forward slashes as unicode escape sequences to prevent
* Google from treating them as internal links and trying to crawl them.
* @see https://github.com/nuxt/nuxt/issues/24175
*/
function encodeForwardSlashes(str) {
	return str.replaceAll("/", "\\u002F");
}

const renderSSRHeadOptions = {"omitLineBreaks":true};

const entryIds = [];

const entryFileName = "DDgCmD9D.js";

const _DRIVE_LETTER_START_RE = /^[A-Za-z]:\//;
function normalizeWindowsPath(input = "") {
  if (!input) {
    return input;
  }
  return input.replace(/\\/g, "/").replace(_DRIVE_LETTER_START_RE, (r) => r.toUpperCase());
}
const _IS_ABSOLUTE_RE = /^[/\\](?![/\\])|^[/\\]{2}(?!\.)|^[A-Za-z]:[/\\]/;
const _ROOT_FOLDER_RE = /^\/([A-Za-z]:)?$/;
function cwd() {
  if (typeof process !== "undefined" && typeof process.cwd === "function") {
    return process.cwd().replace(/\\/g, "/");
  }
  return "/";
}
const resolve = function(...arguments_) {
  arguments_ = arguments_.map((argument) => normalizeWindowsPath(argument));
  let resolvedPath = "";
  let resolvedAbsolute = false;
  for (let index = arguments_.length - 1; index >= -1 && !resolvedAbsolute; index--) {
    const path = index >= 0 ? arguments_[index] : cwd();
    if (!path || path.length === 0) {
      continue;
    }
    resolvedPath = `${path}/${resolvedPath}`;
    resolvedAbsolute = isAbsolute(path);
  }
  resolvedPath = normalizeString(resolvedPath, !resolvedAbsolute);
  if (resolvedAbsolute && !isAbsolute(resolvedPath)) {
    return `/${resolvedPath}`;
  }
  return resolvedPath.length > 0 ? resolvedPath : ".";
};
function normalizeString(path, allowAboveRoot) {
  let res = "";
  let lastSegmentLength = 0;
  let lastSlash = -1;
  let dots = 0;
  let char = null;
  for (let index = 0; index <= path.length; ++index) {
    if (index < path.length) {
      char = path[index];
    } else if (char === "/") {
      break;
    } else {
      char = "/";
    }
    if (char === "/") {
      if (lastSlash === index - 1 || dots === 1) ; else if (dots === 2) {
        if (res.length < 2 || lastSegmentLength !== 2 || res[res.length - 1] !== "." || res[res.length - 2] !== ".") {
          if (res.length > 2) {
            const lastSlashIndex = res.lastIndexOf("/");
            if (lastSlashIndex === -1) {
              res = "";
              lastSegmentLength = 0;
            } else {
              res = res.slice(0, lastSlashIndex);
              lastSegmentLength = res.length - 1 - res.lastIndexOf("/");
            }
            lastSlash = index;
            dots = 0;
            continue;
          } else if (res.length > 0) {
            res = "";
            lastSegmentLength = 0;
            lastSlash = index;
            dots = 0;
            continue;
          }
        }
        if (allowAboveRoot) {
          res += res.length > 0 ? "/.." : "..";
          lastSegmentLength = 2;
        }
      } else {
        if (res.length > 0) {
          res += `/${path.slice(lastSlash + 1, index)}`;
        } else {
          res = path.slice(lastSlash + 1, index);
        }
        lastSegmentLength = index - lastSlash - 1;
      }
      lastSlash = index;
      dots = 0;
    } else if (char === "." && dots !== -1) {
      ++dots;
    } else {
      dots = -1;
    }
  }
  return res;
}
const isAbsolute = function(p) {
  return _IS_ABSOLUTE_RE.test(p);
};
const relative = function(from, to) {
  const _from = resolve(from).replace(_ROOT_FOLDER_RE, "$1").split("/");
  const _to = resolve(to).replace(_ROOT_FOLDER_RE, "$1").split("/");
  if (_to[0][1] === ":" && _from[0][1] === ":" && _from[0] !== _to[0]) {
    return _to.join("/");
  }
  const _fromCopy = [..._from];
  for (const segment of _fromCopy) {
    if (_to[0] !== segment) {
      break;
    }
    _from.shift();
    _to.shift();
  }
  return [..._from.map(() => ".."), ..._to].join("/");
};

//#region src/runtime/handlers/renderer.ts
globalThis.__buildAssetsURL = buildAssetsURL;
globalThis.__publicAssetsURL = publicAssetsURL;
const HAS_APP_TELEPORTS = !!(appTeleportAttrs.id);
const APP_TELEPORT_OPEN_TAG = HAS_APP_TELEPORTS ? `<${appTeleportTag}${propsToString(appTeleportAttrs)}>` : "";
const APP_TELEPORT_CLOSE_TAG = HAS_APP_TELEPORTS ? `</${appTeleportTag}>` : "";
let entryPath;
const handler = defineRenderHandler((event) => {
	const ssrError = event.path.startsWith("/__nuxt_error") ? getQuery(event) : null;
	if (ssrError && !("__unenv__" in event.node.req)) throw createError({
		status: 404,
		statusText: "Page Not Found: /__nuxt_error",
		message: "Page Not Found: /__nuxt_error"
	});
	return renderRoute(event, ssrError);
});
async function renderRoute(event, ssrError) {
	const nitroApp = useNitroApp();
	const ssrContext = createSSRContext(event);
	ssrContext.head.push(appHead);
	if (ssrError) {
		const status = ssrError.status || ssrError.statusCode;
		if (status) ssrError.status = ssrError.statusCode = Number.parseInt(status);
		if (typeof ssrError.data === "string") try {
			ssrError.data = destr(ssrError.data);
		} catch {}
		setSSRError(ssrContext, ssrError);
	}
	const routeOptions = getRouteRules(event);
	if (routeOptions.ssr === false) ssrContext.noSSR = true;
	!ssrContext.noSSR && (NUXT_RUNTIME_PAYLOAD_EXTRACTION);
	const renderer = await getRenderer(ssrContext);
	for (const id of entryIds) ssrContext.modules.add(id);
	const canStream = NUXT_SSR_STREAMING;
	const renderRouteContext = {
		canStream,
		prefersStream: false
	};
	await nitroApp.hooks.callHook("render:route", renderRouteContext, { event });
	const _rendered = await (renderer.renderToString(ssrContext)).catch(async (error) => {
		if ((ssrContext["~renderResponse"] || ssrContext._renderResponse) && error.message === "skipping render") return {};
		const _err = !ssrError && ssrContext.payload?.error || error;
		await ssrContext.nuxt?.hooks.callHook("app:error", _err);
		throw _err;
	});
	const inlinedStyles = !ssrContext["~renderResponse"] && !ssrContext._renderResponse && true ? await renderInlineStyles(ssrContext.modules ?? []) : [];
	await ssrContext.nuxt?.hooks.callHook("app:rendered", {
		ssrContext,
		renderResult: _rendered
	});
	if (ssrContext["~renderResponse"] || ssrContext._renderResponse) return ssrContext["~renderResponse"] || ssrContext._renderResponse;
	if (ssrContext.payload?.error && !ssrError) throw ssrContext.payload.error;
	const NO_SCRIPTS = routeOptions.noScripts;
	const { styles, scripts } = getRequestDependencies(ssrContext, renderer.rendererContext);
	if (!NO_SCRIPTS) {
		let path = entryPath;
		if (!path) {
			path = buildAssetsURL(entryFileName);
			if (ssrContext.runtimeConfig.app.cdnURL || /^(?:\/|\.+\/)/.test(path)) entryPath = path;
			else {
				path = relative(event.path.replace(/\/[^/]+$/, "/"), joinURL("/", path));
				if (!/^(?:\/|\.+\/)/.test(path)) path = `./${path}`;
			}
		}
		ssrContext.head.push({ script: [{
			type: "importmap",
			innerHTML: { imports: { "#entry": path } }
		}] });
	}
	if (inlinedStyles.length) ssrContext.head.push({ style: inlinedStyles });
	const link = [];
	for (const resource of Object.values(styles)) {
		link.push({
			rel: "stylesheet",
			href: renderer.rendererContext.buildAssetsURL(resource.file),
			crossorigin: ""
		});
	}
	if (link.length) ssrContext.head.push({ link });
	if (!NO_SCRIPTS) {
		const dependencyOptions = ssrContext["~lazyHydratedModules"]?.size ? { exclude: ssrContext["~lazyHydratedModules"] } : void 0;
		const excludeHrefs = new Set(link.map((l) => l.href));
		for (const id of ssrContext["~neverHydratedModules"] ?? []) {
			const file = renderer.rendererContext.manifest?.[id]?.file;
			if (file) excludeHrefs.add(renderer.rendererContext.buildAssetsURL(file));
		}
		const hints = [];
		for (const l of getPreloadLinks(ssrContext, renderer.rendererContext, dependencyOptions)) if (!excludeHrefs.has(l.href)) hints.push(l);
		for (const l of getPrefetchLinks(ssrContext, renderer.rendererContext, dependencyOptions)) if (!excludeHrefs.has(l.href)) hints.push(l);
		ssrContext.head.push({ link: hints });
		ssrContext.head.push({ script: renderPayloadJsonScript({
			ssrContext,
			data: stripInlineOnlyPayloadFields(ssrContext.payload)
		})   }, {
			tagPosition: "bodyClose",
			tagPriority: "high"
		});
	}
	if (!routeOptions.noScripts) {
		const tagPosition = "head";
		ssrContext.head.push({ script: Object.values(scripts).map((resource) => ({
			type: resource.module ? "module" : null,
			src: renderer.rendererContext.buildAssetsURL(resource.file),
			defer: resource.module ? null : true,
			tagPosition,
			crossorigin: ""
		})) });
	}
	const { headTags, bodyTags, bodyTagsOpen, htmlAttrs, bodyAttrs } = renderSSRHead(ssrContext.head, renderSSRHeadOptions);
	const htmlContext = {
		htmlAttrs: htmlAttrs ? [htmlAttrs] : [],
		head: normalizeChunks([headTags]),
		bodyAttrs: bodyAttrs ? [bodyAttrs] : [],
		bodyPrepend: normalizeChunks([bodyTagsOpen, ssrContext.teleports?.body]),
		body: [_rendered.html, APP_TELEPORT_OPEN_TAG + (HAS_APP_TELEPORTS ? joinTags([ssrContext.teleports?.[`#${appTeleportAttrs.id}`]]) : "") + APP_TELEPORT_CLOSE_TAG],
		bodyAppend: [bodyTags]
	};
	await nitroApp.hooks.callHook("render:html", htmlContext, { event });
	return {
		body: renderHTMLDocument(htmlContext),
		statusCode: getResponseStatus(event),
		statusMessage: getResponseStatusText(event),
		headers: {
			"content-type": "text/html;charset=utf-8",
			"x-powered-by": "Nuxt"
		}
	};
}
function normalizeChunks(chunks) {
	const result = [];
	for (const _chunk of chunks) {
		const chunk = _chunk?.trim();
		if (chunk) result.push(chunk);
	}
	return result;
}
function joinTags(tags) {
	return tags.join("");
}
function joinAttrs(chunks) {
	if (chunks.length === 0) return "";
	return " " + chunks.join(" ");
}
function renderHTMLDocument(html) {
	return `<!DOCTYPE html><html${joinAttrs(html.htmlAttrs)}><head>${joinTags(html.head)}</head><body${joinAttrs(html.bodyAttrs)}>${joinTags(html.bodyPrepend)}${joinTags(html.body)}${joinTags(html.bodyAppend)}</body></html>`;
}
function stripInlineOnlyPayloadFields(payload) {
	if (!payload.prefetchLinks) return payload;
	const { prefetchLinks: _, ...rest } = payload;
	return rest;
}

const renderer = /*#__PURE__*/Object.freeze(/*#__PURE__*/Object.defineProperty({
	__proto__: null,
	default: handler
}, Symbol.toStringTag, { value: 'Module' }));

export { VueResolver as V, baseURL as b, headSymbol as h, injectHead as i, renderer as r, walkResolver as w };
//# sourceMappingURL=renderer.mjs.map
