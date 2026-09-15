/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      fontFamily: {
        japanese: ['"BIZ UDMincho"', '"Noto Serif JP"', 'serif'],
      },
    },
  },
  plugins: [],
};
