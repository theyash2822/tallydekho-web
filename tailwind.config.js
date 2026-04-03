/**
 * TallyDekho Design System — Web Portal
 * Notion-style: warm neutrals, off-whites, soft grays.
 * NOT pure black/white — warm and readable like Notion.
 */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        // ─── Surface ──────────────────────────────────────────────────────
        notion: {
          bg:       '#F7F6F3',   // warm off-white — page background
          surface:  '#FBFAF8',   // sidebar, cards, panels
          hover:    '#F1F0EC',   // row hover, button hover
          active:   '#EBEBEA',   // pressed, selected background
          border:   '#E8E7E3',   // all borders — inputs, cards, dividers
          divider:  '#EDEDEC',   // inner section dividers
        },
        // ─── Text ─────────────────────────────────────────────────────────
        ink: {
          primary:   '#1A1A1A',  // headings, primary data — warm near-black
          secondary: '#787774',  // body text, labels
          tertiary:  '#AEACA8',  // placeholder, disabled, captions
          inverse:   '#FFFFFF',  // text on dark surfaces
        },
        // ─── Brand accent (single teal) ───────────────────────────────────
        brand: {
          DEFAULT:  '#059669',
          light:    '#ECFDF5',
          dark:     '#047857',
        },
        // ─── Semantic — data states only ──────────────────────────────────
        positive: { DEFAULT: '#059669', bg: '#ECFDF5' },
        negative: { DEFAULT: '#E5484D', bg: '#FFF1F2' },
        caution:  { DEFAULT: '#D97706', bg: '#FEF9C3' },
        neutral:  { DEFAULT: '#3B82F6', bg: '#EFF6FF' },
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', '-apple-system', 'sans-serif'],
      },
      boxShadow: {
        'xs':       '0 1px 2px rgba(0,0,0,0.05)',
        'sm':       '0 1px 4px rgba(0,0,0,0.06)',
        'md':       '0 4px 12px rgba(0,0,0,0.08)',
        'lg':       '0 8px 24px rgba(0,0,0,0.10)',
        'xl':       '0 16px 40px rgba(0,0,0,0.12)',
        'notion':   '0 1px 3px rgba(0,0,0,0.05), 0 1px 2px rgba(0,0,0,0.03)',
        'notion-md':'0 4px 12px rgba(0,0,0,0.08)',
        'notion-lg':'0 8px 24px rgba(0,0,0,0.10)',
      },
      borderRadius: {
        'sm':  '6px',
        'md':  '8px',
        'lg':  '10px',
        'xl':  '12px',
        '2xl': '16px',
      },
    },
  },
  plugins: [],
}
