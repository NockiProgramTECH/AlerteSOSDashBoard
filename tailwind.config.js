/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        'sapeur-red': '#E11D48',
        'sapeur-dark': '#0F172A',
      },
      fontFamily: {
        sans: ['Inter', '-apple-system', 'BlinkMacSystemFont', 'sans-serif'],
      },
    },
  },
  plugins: [
    require('daisyui'),
  ],
  daisyui: {
    themes: [
      {
        alertsapeur: {
          "primary": "#E11D48",
          "secondary": "#1E293B",
          "accent": "#F97316",
          "neutral": "#0F172A",
          "base-100": "#020617",
          "info": "#3B82F6",
          "success": "#22C55E",
          "warning": "#F59E0B",
          "error": "#E11D48",
        },
      },
    ],
    darkTheme: "alertsapeur",
    base: true,
    styled: true,
    utils: true,
  },
}
