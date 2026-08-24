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
  compatibilityDate: "2025-03-26",
  site: {
    url: 'https://vivekjoshy.com'
  },
  typescript: {
    strict: false
  }
})
