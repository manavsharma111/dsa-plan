/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        paper: {
          bg: '#faf7f5',
          surface: '#fffdfb',
          'surface-2': '#f3ede7',
          border: 'rgba(31, 27, 22, 0.13)',
          text: '#1f1b16',
          dim: '#5f574f',
          faint: '#948a80',
          line: 'rgba(31, 27, 22, 0.06)',
        },
        core: {
          DEFAULT: '#c2410c',
          bg: '#fbe9e0',
        },
        sage: {
          DEFAULT: '#4d7c0f',
          bg: '#eaf2df',
        },
        gold: {
          DEFAULT: '#a16207',
          bg: '#f8eed6',
        },
        blue: {
          DEFAULT: '#0369a1',
          bg: '#e3f0f8',
        }
      },
      fontFamily: {
        serif: ['"IBM Plex Serif"', 'Georgia', 'serif'],
        sans: ['"IBM Plex Sans"', 'system-ui', 'sans-serif'],
        mono: ['"IBM Plex Mono"', 'ui-monospace', 'Menlo', 'monospace'],
      },
      animation: {
        shimmer: 'shimmer 2.4s infinite ease-in-out',
      },
      keyframes: {
        shimmer: {
          '0%': { transform: 'translateX(-100%)' },
          '100%': { transform: 'translateX(200%)' },
        }
      }
    },
  },
  plugins: [],
}
