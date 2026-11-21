/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        navy: {
          DEFAULT: '#0F2544',
          50: '#F0F4F8',
          100: '#D9E2EC',
          200: '#BCCCDC',
          800: '#1A365D',
          900: '#0F2544',
          950: '#0A182E',
        },
        emerald: {
          DEFAULT: '#117A65',
          hover: '#0E6251',
          50: '#E6F4EF',
          100: '#CEEAE0',
          200: '#A3D6C5',
          600: '#117A65',
          700: '#0E6251',
          800: '#0A4A3D',
        },
        mint: {
          DEFAULT: '#E6F4EF',
          50: '#F4FAF7',
          100: '#E6F4EF',
          200: '#CBE8DE',
          300: '#A6D7C7',
        },
        terracotta: {
          DEFAULT: '#D96B27',
          50: '#FDF4EF',
          100: '#FAE6DA',
          500: '#D96B27',
          600: '#BF591B',
          700: '#9E4413',
        },
        gold: {
          DEFAULT: '#E0A82E',
          50: '#FDF9EE',
          100: '#FBF1D5',
          500: '#E0A82E',
          600: '#C69022',
        },
        canvas: {
          DEFAULT: '#F4F7FA',
          alt: '#FFFFFF',
        },
        slate: {
          border: '#E2E8F0',
          body: '#64748B',
          dark: '#1E293B',
          heading: '#0F172A',
        }
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', '-apple-system', 'sans-serif'],
        display: ['"Plus Jakarta Sans"', 'Inter', 'system-ui', 'sans-serif'],
      },
      borderRadius: {
        '2xl': '1rem',
        '3xl': '1.5rem',
      },
      boxShadow: {
        'card': '0 1px 3px 0 rgba(15, 23, 42, 0.05), 0 1px 2px -1px rgba(15, 23, 42, 0.05)',
        'card-hover': '0 10px 25px -3px rgba(15, 37, 68, 0.08), 0 4px 6px -4px rgba(15, 37, 68, 0.04)',
        'glow-emerald': '0 0 25px -5px rgba(17, 122, 101, 0.35)',
      },
      keyframes: {
        marquee: {
          '0%': { transform: 'translateX(0%)' },
          '100%': { transform: 'translateX(-50%)' },
        },
        marqueeReverse: {
          '0%': { transform: 'translateX(-50%)' },
          '100%': { transform: 'translateX(0%)' },
        },
      },
      animation: {
        marquee: 'marquee 30s linear infinite',
        marqueeReverse: 'marqueeReverse 30s linear infinite',
      },
    },
  },
  plugins: [],
}
