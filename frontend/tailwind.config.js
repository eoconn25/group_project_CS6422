/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
  theme: {
    extend: {
        primary: '#ec4899',
        primaryHover: '#db2777',
        secondary: '#f3f4f6',
    },
    fontFamily: {
        sans: ['Inter', 'sans-serif'],
        serif: ['Merriweather', 'serif'],
    }
  },
  plugins: [],
}