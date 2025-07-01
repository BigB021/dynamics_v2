// tailwind.config.js
const plugin = require('tailwindcss/plugin');

module.exports = {
  darkMode: 'class',
  content: [
    './index.html',
    './src/**/*.{js,jsx,ts,tsx}',
  ],
  theme: {
    extend: {
      colors: {
        theme: {
          light: {
            text: 'var(--text)',
            textSecondary: 'var(--text-secondary)',
            textMuted: 'var(--text-muted)',
            progress: 'var(--progress)',
            progressFill: 'var(--progress-fill)',
          },
          dark: {
            text: 'var(--text)',
            textSecondary: 'var(--text-secondary)',
            textMuted: 'var(--text-muted)',
            progress: 'var(--progress)',
            progressFill: 'var(--progress-fill)',
          },
          neon: {
            text: 'var(--text)',
            textSecondary: 'var(--text-secondary)',
            textMuted: 'var(--text-muted)',
            progress: 'var(--progress)',
            progressFill: 'var(--progress-fill)',
          },
        },
      },
    },
  },
  plugins: [
    plugin(function ({ addBase }) {
      addBase({
        // Dark theme
        '.theme-dark': {
          '--bg': '#111827',
          '--glass': 'rgba(0,0,0,0.2)',
          '--text': '#ffffff',
          '--text-secondary': '#d1d5db',
          '--text-muted': '#9ca3af',
          '--progress': '#ffffff33',
          '--progress-fill': 'linear-gradient(to right, #60a5fa, #a78bfa)',
        },
        // Light theme
        '.theme-light': {
          '--bg': '#f9fafb',
          '--glass': 'rgba(255,255,255,0.4)',
          '--text': '#1f2937',
          '--text-secondary': '#374151',
          '--text-muted': '#6b7280',
          '--progress': '#e5e7eb',
          '--progress-fill': 'linear-gradient(to right, #3b82f6, #8b5cf6)',
        },
        // Neon theme
        '.theme-neon': {
          '--bg': '#0f0c29',
          '--glass': 'rgba(88,28,135,0.2)',
          '--text': '#ffffff',
          '--text-secondary': '#d8b4fe',
          '--text-muted': '#a78bfa',
          '--progress': 'rgba(147,51,234,0.3)',
          '--progress-fill': 'linear-gradient(to right, #22d3ee, #a855f7)',
        },
      });
    }),
  ],
};
