
/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,jsx,ts,tsx}"],
  theme: {
    extend: {
      fontFamily: {
        sans: ["Inter", "system-ui", "-apple-system", "sans-serif"],
      },
      colors: {
        brand: {
          50: "#ecfdf5",
          100: "#d1fae5", 
          200: "#a7f3d0",
          300: "#6ee7b7",
          400: "#34d399",
          500: "#10b981",   // primary emerald
          600: "#059669",
          700: "#047857",
          800: "#065f46",
          900: "#064e3b",
        }
      },
      boxShadow: {
        card: "0 10px 25px rgba(0,0,0,0.15)",
      },
      borderRadius: {
        xl: "12px",
        "2xl": "16px",
      }
    },
  },
  plugins: [],
};
