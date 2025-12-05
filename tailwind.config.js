/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./src/**/*.{html,ts}",
  ],
  theme: {
    extend: {
      colors: {
        // Paleta inspirada en Symmetry/Dark Mode
        'brand-black': '#09090b',       // Fondo principal (casi negro)
        'brand-surface': '#18181b',     // Fondo de tarjetas/inputs (gris muy oscuro)
        'brand-surface-light': '#27272a', // Bordes o estados hover
        'brand-primary': '#3b82f6',     // Azul vibrante (puedes cambiarlo a tu gusto)
        'brand-text': '#f4f4f5',        // Texto principal (blanco hueso)
        'brand-text-muted': '#a1a1aa',  // Texto secundario (gris claro)
      },
      fontFamily: {
        sans: ['Inter', 'sans-serif'],
      }
    },
  },
  plugins: [],
}