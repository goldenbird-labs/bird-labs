import colors from 'tailwindcss/colors'

/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './admin.html', './src/**/*.{js,jsx}', '!./src/chat/**'],
  theme: {
    extend: {
      colors: {
        brand: colors.violet,
        ink: colors.slate,
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', '-apple-system', 'Segoe UI', 'Roboto', 'sans-serif'],
        display: ['"Plus Jakarta Sans"', 'Inter', 'system-ui', 'sans-serif'],
      },
      boxShadow: {
        card: '0 1px 2px rgba(15, 23, 42, 0.04), 0 4px 16px rgba(15, 23, 42, 0.06)',
        lift: '0 2px 4px rgba(15, 23, 42, 0.04), 0 16px 40px rgba(76, 29, 149, 0.12)',
      },
      maxWidth: {
        site: '72rem',
      },
    },
  },
  plugins: [],
}
