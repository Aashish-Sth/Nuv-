export default defineNuxtConfig({
  modules: ["@nuxtjs/tailwindcss", "@pinia/nuxt", "nuxt-icon", "@nuxtjs/google-fonts"],
  css: ["~/assets/css/tailwind.css"],
  postcss: {
    plugins: {
      '@tailwindcss/postcss': {},
    },
  },
  googleFonts: {
    families: {
      Inter: [300, 400, 500, 600, 700],
    },
    display: "swap",
  },
  runtimeConfig: {
    public: {
      apiBase: "http://localhost:3001/api",
    },
  },
  routeRules: {
    "/": { redirect: "/dashboard" },
  },
  app: {
    head: {
      title: "Nuvé Admin",
    },
  },
  compatibilityDate: "2025-11-01",
});
