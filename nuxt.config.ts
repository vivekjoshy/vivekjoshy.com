import tailwindcss from "@tailwindcss/vite";

// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({
  css: ["~/assets/app.css"],
  vite: {
    plugins: [tailwindcss()],
  },
  app: {
    head: {
      charset: 'utf-8',
      viewport: 'width=device-width, initial-scale=1',
      link: [
        { rel: 'icon', type: 'image/svg+xml', href: '/favicon.svg' }
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
