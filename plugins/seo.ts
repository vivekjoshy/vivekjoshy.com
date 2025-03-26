export default defineNuxtPlugin(() => {
  const siteUrl = 'https://vivekjoshy.com';
  const siteName = 'Vivek Joshy';
  const siteDescription = 'Data Scientist & Computational Biologist specializing in formal systems, deep learning, and bioinformatics.';
  
  // Base structured data
  const baseStructuredData = {
    "@context": "https://schema.org",
    "@type": "Person",
    "name": "Vivek Joshy",
    "jobTitle": "Data Scientist & Computational Biologist",
    "url": siteUrl,
    "sameAs": [
      "https://github.com/vivekjoshy"
    ],
    "knowsAbout": [
      "Deep Learning",
      "Computational Biology",
      "Bioinformatics",
      "Formal Systems",
      "Mathematical Logic",
      "Reinforcement Learning"
    ]
  };
  
  useHead({
    titleTemplate: (titleChunk) => {
      return titleChunk ? `${titleChunk} | ${siteName}` : siteName;
    },
    meta: [
      { name: 'viewport', content: 'width=device-width, initial-scale=1' },
      { name: 'description', content: siteDescription },
      { name: 'color-scheme', content: 'light dark' }, 
      // Open Graph / Facebook
      { property: 'og:type', content: 'website' },
      { property: 'og:url', content: siteUrl },
      { property: 'og:title', content: siteName },
      { property: 'og:description', content: siteDescription },
      { property: 'og:image', content: `${siteUrl}/logo.svg` },
      // Twitter
      { name: 'twitter:card', content: 'summary_large_image' },
      { name: 'twitter:url', content: siteUrl },
      { name: 'twitter:title', content: siteName },
      { name: 'twitter:description', content: siteDescription },
      { name: 'twitter:image', content: `${siteUrl}/logo.svg` },
    ],
    link: [
      { rel: 'icon', type: 'image/svg+xml', href: '/logo.svg', media: '(prefers-color-scheme: light)' },
      { rel: 'icon', type: 'image/svg+xml', href: '/logo.svg', media: '(prefers-color-scheme: dark)' },
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