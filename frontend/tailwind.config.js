/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        cream: {
          50: '#FFFDF8',   // Card background
          100: '#F8F4EC',  // Main page background
          200: '#E8DCC8',  // Primary beige
          300: '#D8C5AA',  // Secondary beige
          400: '#C2AC8F',
          500: '#80664A',  // Primary button
          600: '#695239',  // Primary button hover
          800: '#342A22',  // Primary text
          900: '#231B15',
        },
        borderCream: '#E5D9C8',
        textPrimary: '#342A22',
        textSecondary: '#76685A',
        successGreen: '#3D7A5A',
        errorRed: '#A94442',
        warningAmber: '#8A6D3B',
      },
      fontFamily: {
        sans: [
          'Plus Jakarta Sans',
          'Inter',
          '-apple-system',
          'BlinkMacSystemFont',
          'Segoe UI',
          'Roboto',
          'sans-serif',
        ],
        serif: ['Playfair Display', 'Georgia', 'serif'],
      },
      boxShadow: {
        soft: '0 4px 20px -2px rgba(52, 42, 34, 0.05)',
        card: '0 2px 12px 0 rgba(128, 102, 74, 0.06)',
        lift: '0 10px 25px -3px rgba(128, 102, 74, 0.1)',
      },
    },
  },
  plugins: [],
};
