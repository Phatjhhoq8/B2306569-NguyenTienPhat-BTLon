/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{vue,js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      fontFamily: {
        sans: ['Be Vietnam Pro', 'Roboto', 'system-ui', 'sans-serif'],
        serif: ['Lora', 'Georgia', 'serif'],
      },
      colors: {
        primary: {
          light: '#f0f7ff', // Ocean Blue Light
          DEFAULT: '#0f4c81', // Ocean Blue
          dark: '#0c3d69', // Ocean Blue Dark
        },
        secondary: {
          light: '#fffbeb',
          DEFAULT: '#fef3c7',
          dark: '#d97706',
        },
      },
    },
  },
  plugins: [],
}
