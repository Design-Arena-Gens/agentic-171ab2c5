import type { Config } from 'tailwindcss'

export default {
  content: [
    './app/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        brand: {
          50: '#f5f7ff',
          100: '#e7ecff',
          200: '#c7d1ff',
          300: '#9caeff',
          400: '#728bff',
          500: '#4a67ff',
          600: '#2d46f4',
          700: '#2237c2',
          800: '#1b2b95',
          900: '#172477'
        }
      }
    }
  },
  plugins: [],
} satisfies Config
