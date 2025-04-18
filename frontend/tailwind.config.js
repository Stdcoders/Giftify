/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
  theme: {
    extend: {
      colors: {
        primary: "#4f46e5", // Indigo-600
        "primary-dark": "#4338ca", // Indigo-700
      },
      fontFamily: {
        "old-standard-tt": ['"Old Standard TT"', "serif"],
      },
      dropShadow: {
        "green-500": "0 0 10px #22c55e",
        "blue-500": "0 0 10px #3b82f6",
        "pink-500": "0 0 10px #ec4899",
      },
    },
  },
  plugins: [],
};