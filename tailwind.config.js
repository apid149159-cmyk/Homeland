/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      fontFamily: {
        sans: ['Quicksand', 'sans-serif'],
      },
      colors: {
        primary: '#FF4D80',
        secondary: '#FF85A1',
        brand: '#FF4D80',
      }
    },
  },
  plugins: [],
}
