/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./App.tsx",
    "./pages/**/*.{tsx,ts}",
    "./components/**/*.{tsx,ts}",
  ],
  theme: {
    extend: {
      fontFamily: {
        sans: ['"Plus Jakarta Sans"', 'system-ui', 'sans-serif'],
        display: ['Sora', '"Plus Jakarta Sans"', 'sans-serif'],
      },
      // Finer opacity scale than the Tailwind default so design tokens like
      // bg-white/78 or border-white/12 resolve instead of failing the build.
      opacity: {
        0: '0', 5: '0.05', 8: '0.08', 10: '0.1', 12: '0.12', 15: '0.15',
        18: '0.18', 20: '0.2', 25: '0.25', 30: '0.3', 35: '0.35', 40: '0.4',
        45: '0.45', 50: '0.5', 55: '0.55', 60: '0.6', 65: '0.65', 70: '0.7',
        75: '0.75', 78: '0.78', 80: '0.8', 85: '0.85', 90: '0.9', 92: '0.92',
        95: '0.95', 98: '0.98', 100: '1',
      },
      colors: {
        ink: {
          50: '#F2F6FA',
          100: '#E3ECF5',
          200: '#C3D5E8',
          300: '#93B2D1',
          400: '#5C87B2',
          500: '#356392',
          600: '#244C76',
          700: '#163A5C',
          800: '#0C2843',
          900: '#06192F',
          950: '#030F1E',
        },
        brand: {
          50: '#ECFDF5',
          100: '#D1FAE5',
          200: '#A7F3D0',
          300: '#6EE7B7',
          400: '#34D399',
          500: '#10B981',
          600: '#059669',
          700: '#047857',
          800: '#065F46',
          900: '#064E3B',
        },
        gold: {
          300: '#FCD34D',
          400: '#FBBF24',
          500: '#F5B301',
          600: '#D99E00',
        },
      },
      boxShadow: {
        soft: '0 2px 20px -6px rgba(6, 25, 47, 0.10)',
        lift: '0 24px 60px -20px rgba(6, 25, 47, 0.28)',
        glow: '0 0 0 1px rgba(16, 185, 129, 0.25), 0 18px 40px -18px rgba(16, 185, 129, 0.45)',
      },
      backgroundImage: {
        'grid-light':
          'linear-gradient(to right, rgba(6,25,47,0.045) 1px, transparent 1px), linear-gradient(to bottom, rgba(6,25,47,0.045) 1px, transparent 1px)',
        'mesh-hero':
          'radial-gradient(at 12% 18%, rgba(16,185,129,0.22) 0px, transparent 55%), radial-gradient(at 88% 12%, rgba(245,179,1,0.16) 0px, transparent 50%), radial-gradient(at 70% 85%, rgba(53,99,146,0.35) 0px, transparent 55%)',
      },
      animation: {
        'fade-in-up': 'fadeInUp 0.7s cubic-bezier(0.22, 1, 0.36, 1) forwards',
        'fade-in': 'fadeIn 0.9s ease-out forwards',
        float: 'float 7s ease-in-out infinite',
        'pulse-slow': 'pulseSlow 4s cubic-bezier(0.4, 0, 0.6, 1) infinite',
        'bounce-slow': 'bounceSlow 3s infinite',
        'loading-bar': 'loadingBar 1.4s ease-in-out infinite',
        marquee: 'marquee 38s linear infinite',
        'spin-slow': 'spin 14s linear infinite',
        shimmer: 'shimmer 2.2s linear infinite',
      },
      keyframes: {
        fadeInUp: {
          from: { opacity: 0, transform: 'translateY(26px)' },
          to: { opacity: 1, transform: 'translateY(0)' },
        },
        fadeIn: { from: { opacity: 0 }, to: { opacity: 1 } },
        float: {
          '0%, 100%': { transform: 'translateY(0px)' },
          '50%': { transform: 'translateY(-16px)' },
        },
        pulseSlow: {
          '0%, 100%': { opacity: 1 },
          '50%': { opacity: 0.45 },
        },
        bounceSlow: {
          '0%, 100%': { transform: 'translateY(-4%)', animationTimingFunction: 'cubic-bezier(0.8, 0, 1, 1)' },
          '50%': { transform: 'translateY(0)', animationTimingFunction: 'cubic-bezier(0, 0, 0.2, 1)' },
        },
        loadingBar: {
          '0%': { transform: 'translateX(-100%)' },
          '100%': { transform: 'translateX(100%)' },
        },
        marquee: {
          '0%': { transform: 'translateX(0)' },
          '100%': { transform: 'translateX(-50%)' },
        },
        shimmer: {
          '0%': { backgroundPosition: '-200% 0' },
          '100%': { backgroundPosition: '200% 0' },
        },
      },
    },
  },
  plugins: [],
}
