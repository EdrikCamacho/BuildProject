/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./src/**/*.{html,ts}",
  ],
  theme: {
    extend: {
      colors: {
        // Paleta Symmetry / Dark Mode
        'brand-black': '#09090b',       // Fondo principal (casi negro)
        'brand-surface': '#18181b',     // Fondo de tarjetas (gris oscuro)
        'brand-surface-light': '#27272a', // Bordes
        'brand-primary': '#3b82f6',     // Azul eléctrico (para el volumen)
        'brand-text': '#f4f4f5',        // Texto blanco
        'brand-text-muted': '#a1a1aa',  // Texto gris
      },
      fontFamily: {
        sans: ['Inter', 'sans-serif'],
      }
    },
  },
  plugins: [],
}