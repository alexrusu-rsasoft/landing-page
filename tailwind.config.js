/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ['./src/**/*.{html,ts}'],
  theme: {
    extend: {
      colors: {
        primary: '#2B5494',
        neutral: {
          900: '#000000',
          50: '#F8FAFC',
        },
      },
      fontFamily: {
        sans: [
          'Poppins',
          'ui-sans-serif',
          'system-ui',
          '-apple-system',
          'BlinkMacSystemFont',
          'Segoe UI',
          'sans-serif',
        ],
      },
      boxShadow: {
        primary: '0 24px 80px rgba(43, 84, 148, 0.12)',
      },
    },
  },
  plugins: [],
};
