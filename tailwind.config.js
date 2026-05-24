/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ["./src/**/*.{js,jsx,ts,tsx}"],
  theme: {
    extend: {
      colors: {
        cinema: {
          black: "#080808",
          deep: "#0d0d0d",
          card: "#141414",
          border: "#1f1f1f",
          gold: "#f5c518",
          amber: "#e8a020",
          red: "#e50914",
          muted: "#808080",
          light: "#b3b3b3",
        },
      },
      fontFamily: {
        display: ["'Bebas Neue'", "cursive"],
        body: ["'DM Sans'", "sans-serif"],
        mono: ["'JetBrains Mono'", "monospace"],
      },
      animation: {
        "fade-up": "fadeUp 0.6s ease forwards",
        "fade-in": "fadeIn 0.4s ease forwards",
        shimmer: "shimmer 1.5s infinite",
        "slide-right": "slideRight 0.3s ease forwards",
        "pulse-gold": "pulseGold 2s ease-in-out infinite",
        "scroll-left": "scrollLeft 30s linear infinite",
      },
      keyframes: {
        fadeUp: {
          "0%": { opacity: 0, transform: "translateY(20px)" },
          "100%": { opacity: 1, transform: "translateY(0)" },
        },
        fadeIn: {
          "0%": { opacity: 0 },
          "100%": { opacity: 1 },
        },
        shimmer: {
          "0%": { backgroundPosition: "-200% 0" },
          "100%": { backgroundPosition: "200% 0" },
        },
        slideRight: {
          "0%": { transform: "translateX(-100%)" },
          "100%": { transform: "translateX(0)" },
        },
        pulseGold: {
          "0%, 100%": { boxShadow: "0 0 0 0 rgba(245,197,24,0.4)" },
          "50%": { boxShadow: "0 0 0 12px rgba(245,197,24,0)" },
        },
        scrollLeft: {
          "0%": { transform: "translateX(0)" },
          "100%": { transform: "translateX(-50%)" },
        },
      },
      backdropBlur: { xs: "2px" },
    },
  },
  plugins: [],
};
