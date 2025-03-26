// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({
  css: ["~/assets/app.css"],
  modules: ["@nuxtjs/tailwindcss"],
  app: {
    head: {
      charset: 'utf-8',
      viewport: 'width=device-width, initial-scale=1',
      link: [
        { rel: 'icon', type: 'image/svg+xml', href: '/favicon.svg' }
      ]
    }
  },
  tailwindcss: {
    configPath: '~/tailwind.config.js',
    exposeConfig: true,
    viewer: false,
  },
  compatibilityDate: "2025-03-26",
  site: {
    url: 'https://vivekjoshy.com'
  },
  typescript: {
    strict: false
  }
})