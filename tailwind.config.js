/** @type {import('tailwindcss').Config} */
export default {
  darkMode: 'class',
  content: ['./index.html', './src/**/*.{ts,tsx}'],
  theme: {
    extend: {
      colors: {
        ink: '#172033'
      },
      boxShadow: {
        soft: '0 16px 40px rgba(15, 23, 42, 0.08)'
      }
    }
  },
  plugins: []
};
