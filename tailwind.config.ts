/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './app/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        bg: {
          DEFAULT: '#0d0d0d',
          1: '#111111',
          2: '#1a1a1a',
          3: '#242424',
        },
        accent: {
          DEFAULT: '#8b1e1e',
          hover: '#b02626',
          faint: 'rgba(139, 30, 30, 0.12)',
          line: 'rgba(139, 30, 30, 0.3)',
        },
        text: {
          primary: '#f0ece4',
          secondary: '#a09888',
          muted: '#6b6560',
        },
        border: {
          DEFAULT: '#1e1e1e',
          subtle: '#2a2a2a',
        },
      },
      fontFamily: {
        sans: ['Vazirmatn', 'system-ui', 'sans-serif'],
        mono: ['"IBM Plex Mono"', 'monospace'],
      },
      fontSize: {
        '2xs': ['0.625rem', { lineHeight: '0.875rem' }],
      },
    },
  },
  plugins: [],
};
