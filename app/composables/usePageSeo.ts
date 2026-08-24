/**
 * Page-level SEO.
 *
 * The global plugin sets site-wide defaults. Without this, every page shipped
 * the homepage's og:title and og:description, so a shared link to any subpage
 * previewed as the front page. Pages call this instead of useHead directly.
 */
export function usePageSeo(options: { title: string; description: string }) {
  const site = 'Vivek Joshy'
  const full = `${options.title} | ${site}`

  useHead({
    title: options.title,
    meta: [
      { name: 'description', content: options.description },
      { property: 'og:title', content: full },
      { property: 'og:description', content: options.description },
      { name: 'twitter:title', content: full },
      { name: 'twitter:description', content: options.description }
    ]
  })
}
