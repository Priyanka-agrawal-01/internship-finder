/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        darkBg: '#090d16',      // Very deep obsidian background
        darkCard: '#111827',    // Sleek card container background (slate-900 equivalent)
        darkCardHover: '#1f2937',// Slightly lighter slate for hover states (slate-800)
        darkBorder: '#1f2937',  // Clean grid line dividers
        brandPrimary: '#6366f1',// Modern indigo primary button/highlights
        brandPrimaryHover: '#4f46e5',
        brandSecondary: '#10b981',// Vibrant emerald for "New" badge and accents
      },
      fontFamily: {
        sans: ['Outfit', 'Inter', 'system-ui', 'sans-serif'],
      },
      boxShadow: {
        'glass': '0 8px 32px 0 rgba(0, 0, 0, 0.37)',
        'premium': '0 10px 25px -5px rgba(99, 102, 241, 0.15), 0 8px 10px -6px rgba(99, 102, 241, 0.15)'
      }
    },
  },
  plugins: [],
}
