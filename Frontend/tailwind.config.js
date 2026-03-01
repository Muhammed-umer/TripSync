export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      animation: {
        boatMove: "boatMove 20s linear infinite",
      },
      keyframes: {
        boatMove: {
          "0%": { transform: "translateX(-150px)" },
          "100%": { transform: "translateX(110vw)" },
        },
      },
    },
  },
  plugins: [],
};