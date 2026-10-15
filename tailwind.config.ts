import type { Config } from 'tailwindcss';

export default {
  content: ['./src/**/*.{ts,tsx}'],
  theme: {
    extend: {
      colors: {
        ink: { DEFAULT: '#0D0D13', 2: '#15151D', 3: '#1E1E28' },
        line: '#2B2B37',
        paper: '#F4F3F0',
        mute: '#A4A4B0',
        stage: { DEFAULT: '#E5533A', dark: '#C8331B', soft: '#3A1D18' },
        ok: '#4CC38A',
        warn: '#F2A65A',
      },
      fontFamily: {
        display: ['var(--font-display)', 'Helvetica Neue', 'sans-serif'],
        sans: ['var(--font-body)', 'Helvetica Neue', 'sans-serif'],
      },
      borderRadius: { xl2: '1.25rem' },
      maxWidth: { page: '1320px' },
    },
  },
  plugins: [],
} satisfies Config;
