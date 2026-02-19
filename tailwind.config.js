/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      fontFamily: {
        sans: ['Tajawal', 'sans-serif'],
      },
      colors: {
        royal: '#4a148c',
        'royal-light': '#6a1b9a',
        lavender: '#f3e5f5',
        'rose-gold': '#b76e79',
        'rose-gold-light': '#e8b4b8',
      },
      borderRadius: {
        'glass': '24px',
      },
    },
  },
  plugins: [],
}
