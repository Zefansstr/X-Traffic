import defaultTheme from 'tailwindcss/defaultTheme.js';
import forms from '@tailwindcss/forms';
import typography from '@tailwindcss/typography';

/** @type {import('tailwindcss').Config} */
const config = {
  content: ['./src/**/*.{ts,tsx}'],
  theme: {
    extend: {
      colors: {
        primary: {
          DEFAULT: '#5D55F5',
          dark: '#4338CA',
          light: '#7E76FA',
        },
        accent: {
          DEFAULT: '#EE9AE5',
          light: '#F6C5F1',
        },
        surface: '#FFFFFF',
        muted: '#F5F4FF',
      },
      fontFamily: {
        sans: ['Poppins', ...defaultTheme.fontFamily.sans],
      },
      boxShadow: {
        soft: '0 8px 20px rgba(93, 85, 245, 0.15)',
      },
    },
  },
  plugins: [forms, typography],
};

export default config; 