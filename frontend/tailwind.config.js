/** @type {import('tailwindcss').Config} */
export default {
  darkMode: 'class',
  content: ["./index.html", "./src/**/*.{js,jsx}"],
  theme: {
    extend: {
      colors: {
        primary: "#0a7ea4",
        secondary: "#1e40af",
        dark: "#1f2937",
      },
    },
  },
  plugins: [],
};
