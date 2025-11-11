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
        ink: {
          900: '#0b0b0c',
          800: '#121214',
          700: '#1a1b1e',
          600: '#222329',
          500: '#2b2d35',
        },
        accent: {
          500: '#00a2ff',
          400: '#33b7ff',
          300: '#66caff',
        }
      },
      backdropBlur: {
        xs: '2px'
      },
      boxShadow: {
        'glass': '0 8px 32px rgba(0,0,0,0.35)'
      },
      borderRadius: {
        xl: '14px'
      }
    }
  },
  plugins: []
} satisfies Config
