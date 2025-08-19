/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
   "./app/**/*.{ts,tsx}",
    "./src/**/*.{ts,tsx}"
  ],
  theme: {
    extend: {
      colors: {
        brand: {
          50:"#f5f8ff",100:"#e6eeff",200:"#c6d6ff",300:"#9eb7ff",
          400:"#6c90ff",500:"#3b6bff",600:"#2b53d6",700:"#223fa6",
          800:"#1b327f",900:"#162a66"
        }
      }
    }
  },
  plugins: [],
};