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
        600: '#626262',
        700: '#292929',
        750: '#262626',
        800: '#161616',
        900: '#0D0D0D',
      },
      orange: '#FFB36D',
      green: '#CDED71',
      blue: '#71EDDE',
      black: '#000000',
      white: '#FFFFFF',
    },
    zIndex: {
      dropdown: 100,
    },
  },
  // eslint-disable-next-line @typescript-eslint/no-var-requires
  plugins: [require('@headlessui/tailwindcss')({ prefix: 'ui' })],
}
