/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  darkMode: 'class', // Enable dark mode with class strategy
  theme: {
    extend: {
      colors: {
        primary: {
          50: '#eff6ff',
          100: '#dbeafe',
          300: '#93c5fd',
          500: '#3b82f6',
          700: '#1d4ed8',
          900: '#1e3a8a',
        },
        success: {
          100: '#d1fae5',
          500: '#10b981',
        },
        warning: {
          100: '#fef3c7',
          500: '#f59e0b',
        },
        error: {
          100: '#fee2e2',
          500: '#ef4444',
        },
        info: {
          100: '#dbeafe',
          500: '#3b82f6',
        },
        // Dark mode specific colors
        dark: {
          50: '#eff6ff',
          100: '#dbeafe',
          200: '#bfdbfe',
          300: '#93c5fd',
          400: '#60a5fa',
          500: '#3b82f6',
          600: '#2563eb',
          700: '#1d4ed8',
          800: '#1e40af',
          900: '#1e3a8a',
        },
      },
      fontFamily: {
        sans: [
          'Pretendard',
          '-apple-system',
          'BlinkMacSystemFont',
          'Segoe UI',
          'Roboto',
          'Helvetica Neue',
          'Arial',
          'Noto Sans KR',
          'sans-serif',
        ],
      },
    },
  },
  plugins: [],
  // Enable focus visible utilities for better accessibility
  corePlugins: {
    focusVisible: true,
  },
}
