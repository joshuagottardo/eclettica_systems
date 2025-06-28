/** @type {import('tailwindcss').Config} */

export default {
  content: ["./renderer/**/*.{html,js}"],
  theme: {
    extend: {
      colors: {
        custom: {
          100: "#383838",
          200: "#363636",
          300: "#333333",
          400: "#2e2e2e",
          500: "#2c2c2c",
          600: "#272727",
          700: "#252525",
          800: "#232323",
          900: "#1e1e1e",
          950: "#121212",
        },
      },
    },
    fontFamily: {
      sans: ["Helvetica", "Arial", "ui-sans-serif", "system-ui", "sans-serif"],
    },
  },
  plugins: [],
};
