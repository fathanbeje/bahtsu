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
        parchment: {
          50: '#FAF8F5',
          100: '#F5F0E6',
          200: '#EBE3D3',
          300: '#D9CDBC',
          400: '#B8A892',
          900: '#3D3428',
        },
        ink: {
          950: '#0F1210',
          900: '#141715',
          850: '#181C19',
          800: '#1E2320',
          700: '#2A302C',
          600: '#3E4641',
          500: '#5C6760',
          400: '#8A968F',
          300: '#BAC4BF',
          200: '#DEE4E1',
          100: '#F0F3F2',
        },
        turath: {
          emerald: '#1B4931',
          'emerald-deep': '#123322',
          'emerald-light': '#2D6A4F',
          'emerald-soft': '#EBF4EF',
          'emerald-dark-soft': '#162C20',
          gold: '#B58D3D',
          'gold-subtle': '#F9F4EB',
          'gold-dark': '#8A6724',
          ochre: '#C97A3E',
          ruby: '#962D2D',
        }
      },
      fontFamily: {
        arabic: ['"Amiri"', '"Scheherazade New"', '"Traditional Arabic"', 'serif'],
        serif: ['"Newsreader"', '"Merriweather"', 'Georgia', 'serif'],
        sans: ['"Plus Jakarta Sans"', 'system-ui', '-apple-system', 'sans-serif'],
      },
      boxShadow: {
        'manuscript': '0 4px 20px -2px rgba(20, 23, 21, 0.06), 0 2px 6px -1px rgba(20, 23, 21, 0.04)',
        'manuscript-lg': '0 12px 36px -4px rgba(20, 23, 21, 0.1), 0 4px 12px -2px rgba(20, 23, 21, 0.05)',
      }
    },
  },
  plugins: [],
}
