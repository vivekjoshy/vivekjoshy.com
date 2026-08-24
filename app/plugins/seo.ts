export default defineNuxtPlugin(() => {
  // Canonical and og:url must follow the route. Setting them once meant every
  // page declared itself a duplicate of the homepage, which invites search
  // engines to drop the subpages and makes every shared link report the wrong
  // identity.
  const route = useRoute()
  const siteUrl = 'https://vivekjoshy.com';
  const siteName = 'Vivek Joshy';
  const siteDescription = 'Maintainer of OpenSkill, a Bayesian multiplayer rating library published in JOSS. Lead Scientist, Data & ML at Vairified Corp, working on formal methods, grammar induction, neuro-symbolic computation and interpretable AI.';
  // Raster, not SVG: X, LinkedIn, Facebook, Slack and Discord all reject SVG for og:image.
  const ogImage = `${siteUrl}/og-image.png`

  // No trailing slash except at the root, so one page never has two canonicals.
  const canonicalFor = (path: string) => {
    const clean = path.replace(/\/+$/, '')
    return clean ? `${siteUrl}${clean}` : siteUrl
  };


  useHead({
    titleTemplate: (titleChunk) => {
      return titleChunk ? `${titleChunk} | ${siteName}` : siteName;
    },
    meta: [
      { name: 'viewport', content: 'width=device-width, initial-scale=1' },
      { name: 'description', content: siteDescription },
      // Open Graph / Facebook
      { property: 'og:type', content: 'website' },
      { property: 'og:url', content: () => canonicalFor(route.path) },
      { property: 'og:title', content: siteName },
      { property: 'og:description', content: siteDescription },
      { property: 'og:image', content: ogImage },
      { property: 'og:image:width', content: '1200' },
      { property: 'og:image:height', content: '630' },
      { property: 'og:image:alt', content: 'Vivek Joshy — Lead Scientist, Data & ML at Vairified Corp' },
      // Twitter
      { name: 'twitter:card', content: 'summary_large_image' },
      { name: 'twitter:url', content: () => canonicalFor(route.path) },
      { name: 'twitter:title', content: siteName },
      { name: 'twitter:description', content: siteDescription },
      { name: 'twitter:image', content: ogImage },
      // Favicon links are handled in app.head
    ],
    link: [
      { rel: 'icon', type: 'image/svg+xml', href: '/logo.svg' },
      { rel: 'canonical', href: () => canonicalFor(route.path) }
    ]
  });
});
