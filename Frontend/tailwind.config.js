/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        emeraldDark: "#064e3b",
        waterBlue: "#0c4a6e",
      },
      boxShadow: {
        cinematic: "0 25px 50px -12px rgba(0,0,0,0.6)",
      },
    },
  },
  plugins: [],
};