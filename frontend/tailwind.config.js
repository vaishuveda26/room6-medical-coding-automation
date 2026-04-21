/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,jsx}"],
  theme: {
    extend: {
      fontFamily: {
        sans: ["Manrope", "Segoe UI", "sans-serif"],
      },
      colors: {
        brand: {
          DEFAULT: "#127a86",
          50: "#effbfd",
          100: "#d4f2f6",
          500: "#1b97a6",
          600: "#127a86",
          700: "#0d5f68",
        },
        accent: {
          DEFAULT: "#c47b36",
          100: "#f7eadb",
          500: "#c47b36",
          600: "#aa692c",
        },
      },
    },
  },
  plugins: [],
};
