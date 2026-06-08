/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        primary:   "#6366f1",
        secondary: "#8b5cf6",
        accent:    "#06b6d4",
        dark:      "#0f0f1a",
        card:      "#1a1a2e",
        border:    "#2a2a4a",
      },
      fontFamily: {
        sans: ["Inter", "system-ui", "sans-serif"],
        mono: ["Fira Code", "monospace"],
      },
    },
  },
  plugins: [],
}