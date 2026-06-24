/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,jsx}"],
  theme: {
    extend: {
      colors: {
        neuro: {
          bg: "#0b1020",
          card: "#141b2d",
          accent: "#3b82f6",
          muted: "#94a3b8",
        },
      },
    },
  },
  plugins: [],
};
