import type { Config } from 'tailwindcss'

const config: Config = {
  darkMode: 'class',
  content: [
    './pages/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
    './app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      fontFamily: {
        sans: ['var(--font-inter)', 'system-ui', 'sans-serif'],
        mono: ['var(--font-mono)', 'Menlo', 'Consolas', 'monospace'],
      },
      colors: {
        bg: '#0a0a0f',
        surface: '#0f0f18',
      },
      keyframes: {
        flowDotV: {
          '0%': { top: '-6px', opacity: '0' },
          '8%': { opacity: '1' },
          '92%': { opacity: '1' },
          '100%': { top: 'calc(100% + 6px)', opacity: '0' },
        },
        flowDot: {
          '0%': { left: '-6px', opacity: '0' },
          '8%': { opacity: '1' },
          '92%': { opacity: '1' },
          '100%': { left: 'calc(100% + 6px)', opacity: '0' },
        },
        pulseGlow: {
          '0%, 100%': {
            boxShadow: '0 0 8px rgba(34,211,238,0.3), 0 0 0 1px rgba(34,211,238,0.2)',
          },
          '50%': {
            boxShadow: '0 0 24px rgba(34,211,238,0.55), 0 0 0 1px rgba(34,211,238,0.4)',
          },
        },
        fadeInUp: {
          from: { opacity: '0', transform: 'translateY(20px)' },
          to: { opacity: '1', transform: 'translateY(0)' },
        },
        blink: {
          '0%, 100%': { opacity: '1' },
          '50%': { opacity: '0' },
        },
      },
      animation: {
        'flow-dot': 'flowDot 2.1s linear infinite',
        'pulse-glow': 'pulseGlow 2.5s ease-in-out infinite',
        'fade-in-up': 'fadeInUp 0.6s ease-out forwards',
        blink: 'blink 1s step-end infinite',
      },
    },
  },
  plugins: [],
}

export default config
