/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./App.jsx", "./main.jsx"],
  theme: {
    extend: {
      fontFamily: {
        sans: [
          "'Lora'",
          "serif",
          "Inter",
          "SF Pro Display",
          "Segoe UI",
          "Arial",
          "sans-serif",
        ],
        serif: ["'Playfair Display'", "serif"],
      },
      colors: {
        luxury: {
          dark: "#1a1a1a",
          text: "#2d2d2d",
          accent: "#D4A574",
          orange: "#E8956E",
          gray: "#8B8B8B",
          light: "#F5F3F0",
          cream: "#FAF8F5",
        },
      },
    },
  },
  plugins: [],
};
