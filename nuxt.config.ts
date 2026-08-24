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
    build: {
      // Vite inlines assets under 4KB as data: URIs. KaTeX_Size3-Regular.woff2
      // is 3,624 bytes, so exactly one font of twenty was inlined — and the CSP
      // font-src 'self' then blocked it, logging an error on every page with
      // maths. Never inline fonts: they stay separately cacheable, the CSS stays
      // smaller, and the policy stays tight.
      assetsInlineLimit: (filePath: string) =>
        /\.(woff2?|ttf|otf|eot)$/i.test(filePath) ? false : undefined
    }
  },
  app: {
    pageTransition: { name: 'page', mode: 'out-in' },
    head: {
      htmlAttrs: { lang: 'en' },
      charset: 'utf-8',
      viewport: 'width=device-width, initial-scale=1',
      link: [
        { rel: 'icon', type: 'image/svg+xml', href: '/favicon.svg' },
        {
          rel: 'preload',
          as: 'font',
          type: 'font/woff2',
          href: '/fonts/inter-latin.woff2',
          crossorigin: 'anonymous'
        }
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
  routeRules: {
    '/**': {
      headers: {
        // Clickjacking, MIME sniffing, referrer leakage.
        'X-Frame-Options': 'DENY',
        'X-Content-Type-Options': 'nosniff',
        'Referrer-Policy': 'strict-origin-when-cross-origin',
        // Two years, preload-eligible.
        'Strict-Transport-Security': 'max-age=63072000; includeSubDomains; preload',
        // Nothing here needs a camera, a microphone or a location.
        'Permissions-Policy': 'camera=(), microphone=(), geolocation=(), interest-cohort=()',
        'Cross-Origin-Opener-Policy': 'same-origin',
        // Self-hosted fonts and no third-party scripts, so this can be tight.
        // 'unsafe-inline' remains for style-src because Vue emits inline styles
        // for bound values, and for script-src because Nuxt inlines its
        // hydration payload.
        'Content-Security-Policy': [
          "default-src 'self'",
          "script-src 'self' 'unsafe-inline'",
          "style-src 'self' 'unsafe-inline'",
          "img-src 'self' data:",
          "font-src 'self'",
          "connect-src 'self'",
          "frame-ancestors 'none'",
          "base-uri 'self'",
          "form-action 'self'",
          "object-src 'none'"
        ].join('; ')
      }
    },
    // The MCP endpoint is meant to be called cross-origin by agents.
    '/api/mcp': {
      headers: {
        'Access-Control-Allow-Origin': '*',
        'X-Frame-Options': 'DENY'
      }
    }
  },

  nitro: {
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
