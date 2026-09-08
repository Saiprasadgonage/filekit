/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ["./app/**/*.{js,ts,jsx,tsx}", "./components/**/*.{js,ts,jsx,tsx}"],
  theme: {
    extend: {
      colors: {
        ink: "#14171C",
        panel: "#1C2028",
        panel2: "#242933",
        line: "#323945",
        paper: "#ECEBE6",
        dim: "#9CA3AF",
        amber: "#E8A33D",
        amberDeep: "#C67F1E",
        teal: "#4FA98C",
        rust: "#C1553A"
      },
      fontFamily: {
        sans: ["Inter", "system-ui", "sans-serif"],
        mono: ["IBM Plex Mono", "monospace"]
      },
      borderRadius: {
        sm: "4px",
        md: "6px",
        lg: "10px"
      }
    }
  },
  plugins: []
};
