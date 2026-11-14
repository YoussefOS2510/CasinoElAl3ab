/** @type {import('tailwindcss').Config} */
export default {
  darkMode: 'class',
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      fontFamily: {
        sans: ['Cairo', 'Tajawal', 'system-ui', 'sans-serif'],
        cairo: ['Cairo', 'sans-serif'],
        tajawal: ['Tajawal', 'sans-serif'],
      },
      colors: {
        casino: {
          bg: '#0F172A',
          card: '#1E293B',
          gold: '#F59E0B',
          emerald: '#10B981',
          crimson: '#EF4444',
          yellow: '#EAB308',
        },
      },
      keyframes: {
        popIn: {
          '0%': { opacity: '0', transform: 'scale(0.92) translateY(8px)' },
          '100%': { opacity: '1', transform: 'scale(1) translateY(0)' },
        },
        shake: {
          '0%, 100%': { transform: 'translateX(0)' },
          '15%, 45%, 75%': { transform: 'translateX(-6px)' },
          '30%, 60%, 90%': { transform: 'translateX(6px)' },
        },
        pulseGlow: {
          '0%, 100%': { boxShadow: '0 0 0 0 rgba(245, 158, 11, 0.35)' },
          '50%': { boxShadow: '0 0 24px 4px rgba(245, 158, 11, 0.55)' },
        },
      },
      animation: {
        'pop-in': 'popIn 0.28s cubic-bezier(0.16, 1, 0.3, 1) forwards',
        shake: 'shake 0.45s ease-in-out',
        'pulse-glow': 'pulseGlow 2s infinite',
      },
    },
  },
  plugins: [],
};

