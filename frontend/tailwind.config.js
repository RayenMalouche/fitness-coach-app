/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,jsx}'],
  theme: {
    extend: {
      // One palette, strict roles — see README "The design".
      colors: {
        chalk: '#F4F1EA', // page ground: the infield-side concrete
        tartan: { DEFAULT: '#C9472E', deep: '#9E3421' }, // the track: primary actions, the signature
        infield: '#2E6A48', // go: approved, available, done
        flag: '#F2C230', // the yellow flag: waiting on someone
        ink: '#16181B', // type and bib numbers
        cinder: '#6B6660', // secondary text
        lane: '#FFFFFF', // lane lines, bib paper
      },
      fontFamily: {
        display: ['Anton', 'Impact', 'sans-serif'],
        sans: ['Barlow', 'system-ui', 'sans-serif'],
        mono: ['"Chivo Mono"', 'ui-monospace', 'monospace'],
      },
    },
  },
  plugins: [],
}
