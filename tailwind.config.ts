import type { Config } from 'tailwindcss';

const config: Config = {
  content: [
    './app/**/*.{ts,tsx}',
    './components/**/*.{ts,tsx}',
  ],
  theme: {
    extend: {
      colors: {
        // Real Viento Sur brand palette, extended with warm neutrals.
        ink: {
          DEFAULT: '#332D52', // brand navy / indigo
          soft: '#4A4569',
          deep: '#231F3A',
        },
        sage: {
          DEFAULT: '#99A89D',
          deep: '#6E8074',
          tint: '#EBEEEA',
        },
        cream: '#F6F3EC', // "blanco cálido"
        beige: '#E8E0D2',
        glow: '#E7B77E', // warm light accent — used very sparingly
      },
      fontFamily: {
        display: ['var(--font-display)', 'Georgia', 'serif'],
        sans: ['var(--font-sans)', 'system-ui', 'sans-serif'],
        script: ['var(--font-script)', 'cursive'],
      },
      maxWidth: {
        content: '1280px',
      },
      letterSpacing: {
        label: '0.16em',
      },
      transitionTimingFunction: {
        soft: 'cubic-bezier(0.22, 1, 0.36, 1)',
      },
      keyframes: {
        'fade-up': {
          '0%': { opacity: '0', transform: 'translateY(12px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        'fade-in': {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
        'toast-in': {
          '0%': { opacity: '0', transform: 'translateY(16px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
      },
      animation: {
        'fade-up': 'fade-up 0.8s var(--tw-ease, cubic-bezier(0.22,1,0.36,1)) both',
        'fade-in': 'fade-in 0.6s ease both',
        'toast-in': 'toast-in 0.32s cubic-bezier(0.22,1,0.36,1) both',
      },
    },
  },
  plugins: [],
};

export default config;
