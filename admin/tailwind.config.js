/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./components/**/*.{vue,js,ts}",
    "./layouts/**/*.vue",
    "./pages/**/*.vue",
    "./composables/**/*.{js,ts}",
    "./app.vue",
  ],
  theme: {
    extend: {
      colors: {
        "admin-bg": "#F8F8F6",
        "admin-surface": "#FFFFFF",
        "admin-border": "#E8E8E4",
        "admin-text": "#1A1A18",
        "admin-muted": "#888884",
        "admin-dim": "#BBBBB8",
        "nv-green": "#3DBA7A",
        "nv-green-lt": "#E8F7EF",
        "admin-red": "#E5484D",
        "admin-red-lt": "#FFF0F0",
        "admin-amber": "#F59E0B",
        "admin-amber-lt": "#FFFBEB",
        "admin-blue": "#3B82F6",
        "admin-blue-lt": "#EFF6FF",
      },
      fontFamily: {
        sans: ["Inter", "sans-serif"],
      },
      borderRadius: {
        sm: "4px",
        md: "8px",
        lg: "12px",
        pill: "9999px",
      },
    },
  },
  plugins: [],
};
