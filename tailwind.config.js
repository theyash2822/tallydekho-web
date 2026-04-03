/**
 * TallyDekho Design System — Web Portal
 * Base: Pure black & white. True neutral grays. No warm tints.
 * Accent: Single teal — functional only (CTAs, active states).
 */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        // ─── Surface ──────────────────────────────────────────────────────────
        // Pure white base. Grays for depth. No warmth.
        surface: {
          page:     '#FFFFFF',   // main page background
          card:     '#FFFFFF',   // cards, panels
          raised:   '#F9F9F9',   // slightly raised: sidebar, headers
          hover:    '#F5F5F5',   // row hover, button hover
          active:   '#EBEBEB',   // pressed, selected
          inverse:  '#111111',   // dark surface: tooltips, badges
        },

        // ─── Ink (text) ───────────────────────────────────────────────────────
        ink: {
          primary:   '#000000',  // headings, primary data
          secondary: '#4B4B4B',  // body, labels
          tertiary:  '#8C8C8C',  // captions, placeholder, disabled
          inverse:   '#FFFFFF',  // text on dark bg
        },

        // ─── Border ───────────────────────────────────────────────────────────
        line: {
          DEFAULT:  '#E0E0E0',   // standard border
          strong:   '#B0B0B0',   // focused, emphasized
          subtle:   '#F0F0F0',   // inner dividers
        },

        // ─── Brand Accent (teal — used sparingly) ─────────────────────────────
        brand: {
          DEFAULT:  '#059669',
          light:    '#D1FAE5',   // tint bg
          dark:     '#047857',   // hover/pressed
        },

        // ─── Semantic (data states only — never decorative) ───────────────────
        positive: { DEFAULT: '#059669', bg: '#D1FAE5' },   // profit, received
        negative: { DEFAULT: '#DC2626', bg: '#FEE2E2' },   // loss, overdue, error
        caution:  { DEFAULT: '#D97706', bg: '#FEF3C7' },   // warning, pending
        neutral:  { DEFAULT: '#2563EB', bg: '#DBEAFE' },   // info, neutral status
      },

      fontFamily: {
        sans: ['Inter', 'system-ui', '-apple-system', 'sans-serif'],
      },

      boxShadow: {
        'xs':  '0 1px 2px rgba(0,0,0,0.06)',
        'sm':  '0 1px 4px rgba(0,0,0,0.08)',
        'md':  '0 4px 12px rgba(0,0,0,0.09)',
        'lg':  '0 8px 24px rgba(0,0,0,0.11)',
        'xl':  '0 16px 40px rgba(0,0,0,0.13)',
      },

      borderRadius: {
        'sm':  '6px',
        'md':  '8px',
        'lg':  '12px',
        'xl':  '16px',
        '2xl': '20px',
      },
    },
  },
  plugins: [],
}
