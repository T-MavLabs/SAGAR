/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./src/**/*.{js,jsx,ts,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        'marine-blue': '#0a1929',
        'marine-cyan': '#00d4ff',
        'marine-green': '#00ff88',
        'marine-yellow': '#ffd700',
        'marine-orange': '#ff6b35',
        'marine-teal': '#20b2aa',
        'marine-dark': '#0d1b2a',
      },
      animation: {
        'pulse-slow': 'pulse 3s cubic-bezier(0.4, 0, 0.6, 1) infinite',
        'glow': 'glow 2s ease-in-out infinite alternate',
      },
      keyframes: {
        glow: {
          '0%': { boxShadow: '0 0 5px rgba(0, 212, 255, 0.5)' },
          '100%': { boxShadow: '0 0 20px rgba(0, 212, 255, 0.8)' },
        }
      }
    },
  },
  plugins: [],
}
