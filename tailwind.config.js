/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
        mono: ['JetBrains Mono', 'monospace'],
      },
      colors: {
        ink: {
          950: '#08090c',
          900: '#0c0e13',
          850: '#101218',
          800: '#151821',
          750: '#1a1e2a',
          700: '#21262f',
          600: '#2a2f3a',
          500: '#3a4050',
          400: '#525a6b',
          300: '#7a8294',
          200: '#a8aebd',
          100: '#d4d8e0',
        },
        brand: {
          50: '#ecfdf5',
          100: '#d1fae5',
          200: '#a7f3d0',
          300: '#6ee7b7',
          400: '#34d399',
          500: '#10b981',
          600: '#059669',
          700: '#047857',
          800: '#065f46',
          900: '#064e3b',
        },
        win: {
          DEFAULT: '#10b981',
          soft: '#064e3b',
          glow: 'rgba(16,185,129,0.35)',
        },
        loss: {
          DEFAULT: '#ef4444',
          soft: '#450a0a',
          glow: 'rgba(239,68,68,0.35)',
        },
        warn: {
          DEFAULT: '#f59e0b',
          soft: '#451a03',
          glow: 'rgba(245,158,11,0.35)',
        },
        err: {
          DEFAULT: '#6b7280',
          soft: '#1f2937',
        },
      },
      animation: {
        'pulse-glow': 'pulseGlow 2s ease-in-out infinite',
        'slide-in': 'slideIn 0.3s ease-out',
        'fade-in': 'fadeIn 0.4s ease-out',
        'shimmer': 'shimmer 2s linear infinite',
        'scan': 'scan 3s ease-in-out infinite',
      },
      keyframes: {
        pulseGlow: {
          '0%, 100%': { opacity: '1', boxShadow: '0 0 0 0 rgba(16,185,129,0.4)' },
          '50%': { opacity: '0.85', boxShadow: '0 0 0 8px rgba(16,185,129,0)' },
        },
        slideIn: {
          '0%': { transform: 'translateX(-8px)', opacity: '0' },
          '100%': { transform: 'translateX(0)', opacity: '1' },
        },
        fadeIn: {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
        shimmer: {
          '0%': { backgroundPosition: '-200% 0' },
          '100%': { backgroundPosition: '200% 0' },
        },
        scan: {
          '0%, 100%': { transform: 'translateY(0)' },
          '50%': { transform: 'translateY(100%)' },
        },
      },
    },
  },
  plugins: [],
};
