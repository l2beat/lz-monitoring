/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ['./index.html', './src/**/*.{ts,tsx}'],
  darkMode: 'class',
  theme: {
    extend: {
      gridTemplateColumns: {
        multisig: '3fr 6fr 4fr 3fr 1fr',
        'adapter-params': '2fr 1fr 2fr 7fr',
      },
    },
    fontFamily: {
      sans: ['Roboto', 'sans-serif'],
      mono: ['Roboto Mono', 'monospace'],
    },
    fontSize: {
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
        50: '#AEAEAE',
        100: '#868686',
        200: '#626262',
        400: '#5E5E5F',
        500: '#414145',
        600: '#3B3B40',
        700: '#36393D',
        750: '#323236',
        800: '#27272A',
        900: '#19191B',
      },
      pink: { 500: '#B57BA6', 700: '#41253A' },
      zinc: { 300: '#35353A', 400: '#4B4E51', 500: '#71717A', 700: '#3F3F46' },
      red: '#821F1F',
      green: '#064F00',
      blue: { 500: '#008FCC', 800: '#002B3D' },
      black: '#000000',
      white: '#FFFFFF',
      yellow: {
        100: '#EEF36A',
        200: '#C1C72B',
        300: '#6E7121',
        500: '#363718',
      },
    },
    zIndex: {
      dropdown: 100,
      'network-selector': 101,
      tooltip: 200,
    },
  },
  plugins: [
    // eslint-disable-next-line @typescript-eslint/no-var-requires
    require('@headlessui/tailwindcss')({ prefix: 'ui' }),
    // eslint-disable-next-line @typescript-eslint/no-var-requires
    require('tailwind-scrollbar'),
  ],
}
