import { u as useHead$1 } from '../virtual/entry.mjs';

//#region app/composables/usePageSeo.ts
/**
* Page-level SEO.
*
* The global plugin sets site-wide defaults. Without this, every page shipped
* the homepage's og:title and og:description, so a shared link to any subpage
* previewed as the front page. Pages call this instead of useHead directly.
*/
function usePageSeo(options) {
	const full = `${options.title} | Vivek Joshy`;
	useHead$1({
		title: options.title,
		meta: [
			{
				name: "description",
				content: options.description
			},
			{
				property: "og:title",
				content: full
			},
			{
				property: "og:description",
				content: options.description
			},
			{
				name: "twitter:title",
				content: full
			},
			{
				name: "twitter:description",
				content: options.description
			}
		]
	});
}

export { usePageSeo as u };
//# sourceMappingURL=pages-yrXgqx3L.mjs.map
