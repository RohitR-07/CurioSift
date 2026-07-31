/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      fontFamily: {
        sans: ['Inter', 'sans-serif'],
      },
      colors: {
        primary: '#2563EB',
        background: '#F8FAFC',
        card: '#FFFFFF',
        border: '#E2E8F0',
        text: {
          DEFAULT: '#0F172A',
          secondary: '#64748B',
        },
        success: '#22C55E',
        warning: '#F59E0B',
        danger: '#EF4444',
      },
      boxShadow: {
        'soft': '0 4px 20px -2px rgba(0, 0, 0, 0.05)',
        'soft-hover': '0 10px 40px -4px rgba(0, 0, 0, 0.08)',
      }
    },
  },
  plugins: [],
}
