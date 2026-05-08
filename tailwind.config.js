/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./app/**/*.{js,vue,ts}",
    "./components/**/*.{js,vue,ts}",
    "./layouts/**/*.vue",
    "./pages/**/*.vue",
    "./plugins/**/*.{js,ts}",
    "./nuxt.config.{js,ts}",
    "./app.vue",
  ],
  theme: {
    extend: {
      colors: {
        'nv-void': '#080808',
        'nv-base': '#101010',
        'nv-surface': '#191919',
        'nv-edge': '#222222',
        'nv-border': '#2A2A2A',
        'nv-green': '#3DBA7A',
        'nv-green-dk': '#2E9160',
        'nv-green-lt': '#A8E8C8',
        'nv-text': '#F0F0EC',
        'nv-muted': '#A0A09C',
        'nv-dim': '#606060'
      },
      fontFamily: {
        display: ['"DM Serif Display"', 'serif'],
        sans: ['"DM Sans"', 'sans-serif']
      },
      borderRadius: {
        sm: '6px',
        md: '10px',
        lg: '16px',
        pill: '9999px'
      }
    },
  },
  plugins: [
    function({ addUtilities }) {
      addUtilities({
        '.glow-green': {
          'box-shadow': '0 0 0 3px rgba(61,186,122,0.15)'
        }
      })
    }
  ],
}
