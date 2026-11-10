/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./app.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        brand: {
          blue:  '#06525C',
          green: '#22C55E',
        },
        bg:     '#F7F9F8',
        card:   '#FFFFFF',
        border: '#D5E1DF',
        text: {
          primary:   '#06525C',
          secondary: '#2F737D',
        },
      },
      fontFamily: {
        sans: ['IBM Plex Sans', 'system-ui', '-apple-system', 'sans-serif'],
        mono: ['IBM Plex Mono', 'ui-monospace', 'monospace'],
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
