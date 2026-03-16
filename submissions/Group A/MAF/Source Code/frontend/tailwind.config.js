export default {
  content: ["./index.html", "./src/**/*.{js,jsx}"],
  theme: {
    extend: {
      colors: {
        triage: {
          low: "#2f855a",
          medium: "#dd6b20",
          high: "#c53030",
        },
      },
      fontFamily: {
        headline: ["Poppins", "sans-serif"],
        body: ["Manrope", "sans-serif"],
      },
    },
  },
  plugins: [],
};
