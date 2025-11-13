import type { Config } from 'tailwindcss'

export default {
  darkMode: 'class',
  content: [
    './app/**/*.{ts,tsx}',
    './components/**/*.{ts,tsx}',
  ],
  theme: {
    extend: {
      colors: {
        // Getgems-like deep navy background scale
        gem: {
          900: '#0B1020',
          800: '#0E1426',
          700: '#121A33',
          600: '#17203F',
          500: '#1C274D',
        },
        // Bright blue accent similar to Getgems
        accent: {
          600: '#1E74FF',
          500: '#2A84FF',
          400: '#4D9BFF',
          300: '#75B4FF',
        },
        ink: {
          900: '#0B0C10',
          800: '#12131A',
          700: '#191C24',
          600: '#1F2330',
          500: '#262C3A',
        }
      },
      backdropBlur: {
        xs: '2px'
      },
      boxShadow: {
        'glass': '0 12px 30px rgba(4, 10, 30, 0.45)',
        'accent': '0 6px 22px rgba(42, 132, 255, 0.35)'
      },
      borderRadius: {
        xl: '14px',
        '2xl': '18px'
      }
    }
  },
  plugins: []
} satisfies Config
