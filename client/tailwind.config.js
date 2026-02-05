/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ["./src/**/*.{js,jsx,ts,tsx}"],
  theme: {
    extend: {
      backgroundImage: {
        // Use src asset so webpack can resolve during build
        'hero-section': "url('../assets/herosection.webp')",
      },
      colors: {
        "health-primary": "#0D9488", // Teal-600
        "health-secondary": "#F8FAFC", // Slate-50
        "health-surface": "#FFFFFF",
        "health-text-h": "#0f172a", // Slate-900
        "health-text-p": "#475569", // Slate-600
        teal: {
          600: "#0D9488",
          700: "#0f766e",
        },
        slate: {
          50: "#F8FAFC",
          100: "#f1f5f9",
          300: "#cbd5e1",
          600: "#475569",
          900: "#0f172a",
        },
      },
      borderRadius: {
        xl: "0.75rem", // 12px
        full: "9999px",
      },
      boxShadow: {
        sm: "0 1px 2px 0 rgb(0 0 0 / 0.05)",
      },
      fontFamily: {
        sans: ['Inter', 'sans-serif'],
      },
      animation: {
        'fade-in-up': 'fade-in-up 0.8s ease forwards',
        'float': 'float 4s ease-in-out infinite',
        'pulse': 'pulse 2s infinite',
      },
      keyframes: {
        'fade-in-up': {
          from: {
            opacity: '0',
            transform: 'translateY(30px)'
          },
          to: {
            opacity: '1',
            transform: 'translateY(0)'
          },
        },
        float: {
          '0%': { transform: 'translateY(0px)' },
          '50%': { transform: 'translateY(-15px)' },
          '100%': { transform: 'translateY(0px)' },
        },
        pulse: {
          '0%': { boxShadow: '0 0 0 0 rgba(20, 184, 166, 0.4)' },
          '70%': { boxShadow: '0 0 0 10px rgba(20, 184, 166, 0)' },
          '100%': { boxShadow: '0 0 0 0 rgba(20, 184, 166, 0)' },
        }
      }
    },
  },
  plugins: [],
};