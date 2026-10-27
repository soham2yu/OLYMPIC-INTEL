/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        olympic: {
          dark: '#080c15',
          navy: '#0f172a',
          surface: '#182235',
          card: '#1e293b',
          border: '#334155',
          muted: '#64748b',
          gold: '#eab308',
          goldLight: '#fde047',
          silver: '#94a3b8',
          silverLight: '#cbd5e1',
          bronze: '#d97706',
          bronzeLight: '#f59e0b',
          blue: '#38bdf8',
          blueDark: '#0284c7',
          green: '#22c55e',
          red: '#ef4444'
        }
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', '-apple-system', 'BlinkMacSystemFont', 'Segoe UI', 'Roboto', 'sans-serif'],
        mono: ['JetBrains Mono', 'Menlo', 'Courier New', 'monospace'],
      }
    },
  },
  plugins: [],
}
