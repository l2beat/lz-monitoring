/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ['./index.html', './src/**/*.{ts,tsx}'],
  darkMode: 'class',
  theme: {
    extend: {
      gridTemplateColumns: {
        multisig: '3fr 6fr 4fr 3fr 1fr',
      },
      transitionProperty: {
        'max-height': 'max-height',
      },
    },
    fontFamily: {
      sans: ['Roboto', 'sans-serif'],
      mono: ['Roboto Mono', 'monospace'],
    },
    fontSize: {
      '5xs': ['10px', '10px'],
      '4xs': ['11px', '11px'],
      '3xs': ['12px', '12px'],
      '2xs': ['13px', '13px'],
      xs: ['14px', '14px'],
      sm: ['15px', '15px'],
      md: ['16px', '16px'],
      lg: ['18px', '18px'],
      xl: ['24px', '24px'],
      xxl: ['32px', '32px'],
    },
    colors: {
      gray: {
        15: '#868686',
        30: '#71717A',
        50: '#5E5E5F',
        75: '#323236',
        100: '#626262',
        200: '#414145',
        300: '#3B3B40',
        400: '#36393D',
        500: '#27272A',
        600: '#292929',
        700: '#262626',
        800: '#161616',
        900: '#19191B',
        1000: '#0D0D0D',
      },
      orange: '#FFB36D',
      green: '#CDED71',
      blue: '#71EDDE',
      black: '#000000',
      white: '#FFFFFF',
      yellow: {
        100: '#EEF36A',
      },
    },
    zIndex: {
      dropdown: 100,
      'network-selector': 101,
    },
  },
  plugins: [
    // eslint-disable-next-line @typescript-eslint/no-var-requires
    require('@headlessui/tailwindcss')({ prefix: 'ui' }),
    // eslint-disable-next-line @typescript-eslint/no-var-requires
    require('tailwind-scrollbar'),
  ],
}
