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
        scada: {
          bg: 'var(--scada-bg, #0a101d)',
          surface: 'var(--scada-surface, #0e172a)',
          card: 'var(--scada-card, #14223d)',
          border: 'var(--scada-border, #1d3158)',
          accent: 'var(--scada-accent, #00d2ff)',
          accentGlow: 'rgba(0, 210, 255, 0.2)',
          blue: '#1d4ed8',
          emerald: '#10b981',
          amber: '#f59e0b',
          rose: '#f43f5e',
          purple: '#8b5cf6',
          text: 'var(--scada-text, #f1f5f9)',
          muted: 'var(--scada-muted, #94a3b8)',
          subtle: 'var(--scada-subtle, #64748b)'
        }
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
        mono: ['JetBrains Mono', 'Fira Code', 'monospace'],
      },
      keyframes: {
        pulseGlow: {
          '0%, 100%': { opacity: 1, filter: 'drop-shadow(0 0 10px rgba(0, 210, 255, 0.6))' },
          '50%': { opacity: 0.5, filter: 'drop-shadow(0 0 3px rgba(0, 210, 255, 0.2))' },
        }
      },
      animation: {
        pulseGlow: 'pulseGlow 2s cubic-bezier(0.4, 0, 0.6, 1) infinite',
      }
    },
  },
  plugins: [],
}
