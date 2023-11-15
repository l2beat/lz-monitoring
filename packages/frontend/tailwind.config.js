/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ['./index.html', './src/**/*.{ts,tsx}'],
  darkMode: 'class',
  theme: {
    extend: {
      gridTemplateColumns: {
        multisig: '3fr 6fr 4fr 3fr 1fr',
      },
    },
    fontFamily: {
      sans: ['Roboto', 'sans-serif'],
      mono: ['Roboto Mono', 'monospace'],
    },
    fontSize: {
      xs: ['14px', '14px'],
      sm: ['15px', '15px'],
      md: ['16px', '16px'],
      lg: ['18px', '18px'],
      xl: ['24px', '24px'],
      xxl: ['32px', '32px'],
    },
    colors: {
      gray: {
        20: '#3B3B40', // change me
        50: '#36393D', // change me
        100: '#27272A', // change me
        200: '#19191B', // change me
        300: '#5E5E5F', // change me
        400: '#414145', // change me
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
      yellow: '#EEF36A',
    },
    zIndex: {
      dropdown: 100,
    },
  },
  plugins: [
    // eslint-disable-next-line @typescript-eslint/no-var-requires
    require('@headlessui/tailwindcss')({ prefix: 'ui' }),
    // eslint-disable-next-line @typescript-eslint/no-var-requires
    require('tailwind-scrollbar'),
  ],
}
