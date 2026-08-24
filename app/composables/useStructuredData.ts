/**
 * Per-page JSON-LD.
 *
 * The site previously emitted one Person block on every route, so /arc and
 * /mcp each declared themselves to be a person. Structured data has to
 * describe the page it is on, and Google's guidelines require it to reflect
 * content the visitor can actually see — so everything asserted here is also
 * rendered on the page.
 */

const SITE = 'https://vivekjoshy.com'
const NAME = 'Vivek Joshy'

/** Stable identifier for the person, referenced from every page. */
export const PERSON_ID = `${SITE}/#person`
export const SITE_ID = `${SITE}/#website`

export function personEntity() {
  return {
    '@type': 'Person',
    '@id': PERSON_ID,
    name: NAME,
    jobTitle: 'Lead Scientist, Data & ML',
    worksFor: { '@type': 'Organization', name: 'Vairified Corp' },
    url: SITE,
    image: `${SITE}/og-image.png`,
    sameAs: [
      'https://github.com/vivekjoshy',
      'https://openskill.me',
      'https://arxiv.org/abs/2401.05451',
      'https://doi.org/10.21105/joss.05901',
      'https://www.kaggle.com/daegontaven',
      'https://stackoverflow.com/users/5586359/vivek-joshy'
    ],
    knowsAbout: [
      'Formal Methods',
      'Grammar Induction',
      'Neuro-Symbolic Computation',
      'Interpretable AI',
      'Bayesian Inference',
      'Rating Systems'
    ]
  }
}

/** Breadcrumbs replace the bare URL in a search result with a readable path. */
export function breadcrumbs(trail: { name: string; path: string }[]) {
  return {
    '@type': 'BreadcrumbList',
    itemListElement: trail.map((t, i) => ({
      '@type': 'ListItem',
      position: i + 1,
      name: t.name,
      item: `${SITE}${t.path === '/' ? '' : t.path}`
    }))
  }
}

/**
 * Emit a graph for the current page. Using @graph with @id references keeps a
 * single Person entity across the site rather than eight unrelated copies,
 * which is what lets a search engine merge them into one entity.
 */
export function useStructuredData(nodes: Record<string, unknown>[]) {
  useHead({
    script: [
      {
        type: 'application/ld+json',
        innerHTML: JSON.stringify({ '@context': 'https://schema.org', '@graph': nodes })
      }
    ]
  })
}

export { SITE, NAME }
