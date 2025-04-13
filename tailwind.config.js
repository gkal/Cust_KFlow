/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './index.html',
    './src/**/*.{js,ts,jsx,tsx}',
    './stepper-package/src/**/*.{js,ts,jsx,tsx}'  // Add this new line
  ],
  theme: {
    extend: {},
  },
  plugins: [],
}