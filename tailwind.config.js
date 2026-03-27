/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        notion: {
          bg: '#F7F6F3',
          sidebar: '#FBFAF8',
          border: '#E8E7E3',
          text: '#1A1A1A',
          muted: '#787774',
          hover: '#F1F0EC',
        },
        accent: {
          indigo: '#6366F1',
          purple: '#8B5CF6',
          blue: '#3B82F6',
          teal: '#14B8A6',
          green: '#10B981',
          amber: '#F59E0B',
          rose: '#F43F5E',
        }
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', '-apple-system', 'sans-serif'],
      },
      boxShadow: {
        'notion': '0 1px 3px rgba(0,0,0,0.06), 0 1px 2px rgba(0,0,0,0.04)',
        'notion-md': '0 4px 12px rgba(0,0,0,0.08)',
        'notion-lg': '0 8px 24px rgba(0,0,0,0.10)',
      }
    },
  },
  plugins: [],
}
