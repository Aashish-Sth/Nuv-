import tailwindcss from "@tailwindcss/vite";

export default defineNuxtConfig({
  runtimeConfig: {
    public: {
      // set BACKEND_URL via environment; defaults to Fastify backend
      backendUrl: process.env.BACKEND_URL ?? "http://localhost:3001",
    },
  },
  modules: [
    "@pinia/nuxt",
    "@vueuse/motion/nuxt",
    "@nuxt/image",
    "@nuxtjs/google-fonts",
  ],

  app: {
    head: {
      title: "Nuvé — Curated Cloud Kitchens & Restaurant Delivery",
      meta: [
        {
          name: "description",
          content:
            "Nuvé brings curated cloud kitchens and premium restaurant experiences to your doorstep.",
        },
        { name: "theme-color", content: "#080808" },
      ],
      htmlAttrs: { lang: "en" },
    },
    pageTransition: { name: "page", mode: "out-in" },
  },

  googleFonts: {
    families: {
      "DM Sans": [300, 400, 500, 600, 700],
      "DM Serif Display": [400],
    },
    display: "swap",
  },

  css: ["~/assets/css/tailwind.css"],

  vite: {
    plugins: [tailwindcss()],
    optimizeDeps: {
      include: ["gsap"],
    },
  },
});
