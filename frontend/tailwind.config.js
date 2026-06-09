/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        brand: {
          blue:  '#2563EB',
          green: '#22C55E',
        },
        bg:     '#F8FAFC',
        card:   '#FFFFFF',
        border: '#E2E8F0',
        text: {
          primary:   '#0F172A',
          secondary: '#64748B',
        },
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', '-apple-system', 'sans-serif'],
      },
      boxShadow: {
        card:  '0 1px 3px 0 rgba(0,0,0,0.08), 0 1px 2px -1px rgba(0,0,0,0.04)',
        hover: '0 4px 12px 0 rgba(0,0,0,0.10), 0 2px 4px -1px rgba(0,0,0,0.06)',
      },
      borderRadius: {
        card: '12px',
        lg2:  '14px',
        xl2:  '16px',
      },
    },
  },
  plugins: [],
}
