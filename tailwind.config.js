/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./app/**/*.{js,ts,jsx,tsx}",
    "./pages/**/*.{js,ts,jsx,tsx}",
    "./components/**/*.{js,ts,jsx,tsx}",
 
    // Or if using `src` directory:
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        amazon: {
          blue_light: '#F7F8FC',
          blue_dark: '#FFFFFF',
          orange: '#7B2FF7'
        },
        vendora: {
          ink: '#10243b',
          soft: '#F7F8FC',
          accent: '#7B2FF7',
          accent_light: '#CDB7FF',
          accent_soft: '#E9E1FF',
          mint: '#22C55E'
        },
      }
    },
  },
  plugins: [],
}
