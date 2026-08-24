export default defineNuxtPlugin(() => {
  const siteUrl = 'https://vivekjoshy.com';
  const siteName = 'Vivek Joshy';
  const siteDescription = 'Lead Scientist, Data & ML at Vairified Corp. Formal methods, grammar induction, neuro-symbolic computation, and interpretable AI. Author of OpenSkill.';
  // Raster, not SVG: X, LinkedIn, Facebook, Slack and Discord all reject SVG for og:image.
  const ogImage = `${siteUrl}/og-image.png`;

  // Base structured data
  const baseStructuredData = {
    "@context": "https://schema.org",
    "@type": "Person",
    "name": "Vivek Joshy",
    "jobTitle": "Lead Scientist, Data & ML",
    "worksFor": {
      "@type": "Organization",
      "name": "Vairified Corp"
    },
    "url": siteUrl,
    "image": ogImage,
    "sameAs": [
      "https://github.com/vivekjoshy",
      "https://openskill.me",
      "https://arxiv.org/abs/2401.05451"
    ],
    "knowsAbout": [
      "Formal Methods",
      "Grammar Induction",
      "Neuro-Symbolic Computation",
      "Interpretable AI",
      "Bayesian Inference",
      "Rating Systems"
    ]
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
      { property: 'og:url', content: siteUrl },
      { property: 'og:title', content: siteName },
      { property: 'og:description', content: siteDescription },
      { property: 'og:image', content: ogImage },
      { property: 'og:image:width', content: '1200' },
      { property: 'og:image:height', content: '630' },
      { property: 'og:image:alt', content: 'Vivek Joshy — Lead Scientist, Data & ML at Vairified Corp' },
      // Twitter
      { name: 'twitter:card', content: 'summary_large_image' },
      { name: 'twitter:url', content: siteUrl },
      { name: 'twitter:title', content: siteName },
      { name: 'twitter:description', content: siteDescription },
      { name: 'twitter:image', content: ogImage },
      // Favicon links are handled in app.head
    ],
    link: [
      { rel: 'icon', type: 'image/svg+xml', href: '/logo.svg' },
      { rel: 'canonical', href: siteUrl }
    ],
    script: [
      {
        type: 'application/ld+json',
        innerHTML: JSON.stringify(baseStructuredData)
      }
    ]
  });
});
