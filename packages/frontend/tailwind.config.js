/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ['./index.html', './src/**/*.{ts,tsx}'],
  darkMode: 'class',
  theme: {
    extend: {},
    fontFamily: {
      sans: ['Roboto', 'sans-serif'],
      mono: ['Roboto Mono', 'monospace'],
    },
    fontSize: {
      xs: ['14px', '14px'],
      sm: ['15px', '15px'],
      md: ['16px', '16px'],
      lg: ['18px', '18px'],
      xxl: ['32px', '32px'],
    },
    colors: {
      gray: {
        500: '#868686',
        900: '#161616',
      },
      black: '#000000',
      white: '#FFFFFF',
    },
  },
  plugins: [],
}
