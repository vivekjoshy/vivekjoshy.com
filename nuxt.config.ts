import tailwindcss from "@tailwindcss/vite";

// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({
  css: ["katex/dist/katex.min.css", "~/assets/app.css"],
  // Section comments in templates are for whoever edits the file, not for
  // every visitor to download on every page.
  vue: {
    compilerOptions: {
      comments: false
    }
  },
  vite: {
    plugins: [tailwindcss()],
  },
  app: {
    pageTransition: { name: 'page', mode: 'out-in' },
    head: {
      htmlAttrs: { lang: 'en' },
      charset: 'utf-8',
      viewport: 'width=device-width, initial-scale=1',
      link: [
        { rel: 'icon', type: 'image/svg+xml', href: '/favicon.svg' }
      ],
      script: [
        {
          // Apply the stored theme before first paint so there is no flash.
          innerHTML:
            "try{var t=localStorage.getItem('theme');if(t==='light'||t==='dark')document.documentElement.setAttribute('data-theme',t)}catch(e){}",
          tagPosition: 'head'
        }
      ]
    }
  },
  // Nitro bundles the whole app into one function, so a vercel.json
  // `functions` pattern like "api/mcp" matches nothing and fails the build.
  // Duration is set through the preset instead.
  nitro: {
    // Vercel's dependency tracing dropped `unhead` from the lambda, so SSR
    // died with ERR_MODULE_NOT_FOUND on every route while the build itself
    // reported success. Inlining puts it in the bundle rather than relying on
    // the tracer finding a transitive dependency.
    externals: {
      inline: ['unhead', '@unhead/vue']
    },
    vercel: {
      functions: {
        maxDuration: 15
      }
    }
  },
  compatibilityDate: "2025-03-26",
  site: {
    url: 'https://vivekjoshy.com'
  },
  typescript: {
    strict: false
  }
})
