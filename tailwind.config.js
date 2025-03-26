/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./components/**/*.{js,vue,ts}",
    "./layouts/**/*.vue",
    "./pages/**/*.vue",
    "./plugins/**/*.{js,ts}",
    "./app.vue",
    "./error.vue"
  ],
  safelist: [
    'text-accent',
    'text-primary',
    'text-subheading',
    'border-accent',
    'bg-accent',
    'hover:text-accent',
    'btn-accent',
    'badge-accent',
    'badge-primary',
    'badge-secondary',
    'badge-info'
  ],
  theme: {
    extend: {
      colors: {
        primary: "#212121",
        accent: "#9c0026",
        subheading: "#333333",
      },
      fontFamily: {
        sans: ['Inter', 'sans-serif'],
      },
    },
  },
  plugins: [require("daisyui")],
  daisyui: {
    themes: [
      {
        light: {
          ...require("daisyui/src/theming/themes")["light"],
          "primary": "#212121",
          "primary-focus": "#000000",
          "accent": "#9c0026", 
          "accent-focus": "#7c0020",
          "base-100": "#ffffff",
          "base-200": "#f8f9fa",
          "base-300": "#f0f1f2",
          "base-content": "#212121",
        },
      },
    ],
  },
} 