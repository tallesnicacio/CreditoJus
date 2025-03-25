/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        creditojus: {
          primary: '#0070F3',
          secondary: '#7928CA',
          background: '#FFFFFF',
          text: {
            dark: '#1A1A1A',
            light: '#666666'
          },
          accent: '#FF4081'
        }
      },
      borderRadius: {
        'creditojus': '8px'
      },
      boxShadow: {
        'creditojus': '0 4px 6px rgba(0, 0, 0, 0.1)',
      }
    },
  },
  plugins: [],
}