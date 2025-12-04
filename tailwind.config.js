/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./src/**/*.{html,ts}",
  ],
  theme: {
    extend: {
      colors: {
        primary: '#2563EB', // Azul fitness
        secondary: '#1E293B', // Oscuro para fondos
      }
    },
  },
  plugins: [],
}