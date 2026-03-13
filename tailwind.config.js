/** @type {import('tailwindcss').Config} */
module.exports = {
  // Activa el modo oscuro mediante una clase en el HTML
  darkMode: 'class', 
  // Le dice a Tailwind qué archivos mirar para generar el CSS
  content: ["./*.{html,js}"], 
  theme: {
    extend: {},
  },
  plugins: [],
}