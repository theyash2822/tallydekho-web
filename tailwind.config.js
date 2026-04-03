/**
 * TallyDekho Design System — Web Portal
 * Reference: Dribbble CRM Dashboard (cream base, white cards, black active)
 * Semantic: Notion-style calm — muted green/red/amber, never harsh
 */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        // ─── Surface ──────────────────────────────────────────────────────
        surface: {
          bg:      '#F5F4EF',   // warm cream — page background
          card:    '#FFFFFF',   // pure white — cards, panels
          hover:   '#F0EFE9',   // warm hover
          active:  '#E8E7E1',   // pressed/selected bg
          inverse: '#1A1A1A',   // dark surfaces — active nav pill, tooltips
        },

        // ─── Ink (text) ───────────────────────────────────────────────────
        ink: {
          primary:   '#1A1A1A',  // headings, primary data
          secondary: '#787774',  // labels, body text (Notion exact)
          tertiary:  '#AEACA8',  // placeholder, disabled
          inverse:   '#FFFFFF',  // text on dark bg
        },

        // ─── Border ───────────────────────────────────────────────────────
        line: {
          DEFAULT:  '#E9E8E3',   // standard warm border
          strong:   '#D4D3CE',   // focused, emphasized
          subtle:   '#F0EFE9',   // inner dividers
        },

        // ─── Brand (used only for specific interactive CTAs) ───────────────
        brand: {
          DEFAULT:  '#1A1A1A',   // CTA buttons = black (matches reference)
          hover:    '#333333',
        },

        // ─── Semantic — calm Notion-style ──────────────────────────────────
        // Muted, never harsh. Green for positive, red for negative.
        positive: {
          DEFAULT:  '#15803D',   // calm forest green
          bg:       '#F0FDF4',   // very light green bg
          border:   '#BBF7D0',
          text:     '#166534',
        },
        negative: {
          DEFAULT:  '#DC2626',   // calm red
          bg:       '#FEF2F2',   // very light red bg
          border:   '#FECACA',
          text:     '#991B1B',
        },
        caution: {
          DEFAULT:  '#D97706',   // calm amber
          bg:       '#FFFBEB',
          border:   '#FDE68A',
          text:     '#92400E',
        },
        info: {
          DEFAULT:  '#2563EB',   // calm blue
          bg:       '#EFF6FF',
          border:   '#BFDBFE',
          text:     '#1D4ED8',
        },
      },

      fontFamily: {
        sans: ['Inter', 'system-ui', '-apple-system', 'sans-serif'],
      },

      fontSize: {
        'xs':   ['11px', { lineHeight: '16px' }],
        'sm':   ['13px', { lineHeight: '20px' }],
        'base': ['14px', { lineHeight: '22px' }],
        'lg':   ['17px', { lineHeight: '26px' }],
        'xl':   ['20px', { lineHeight: '28px' }],
        '2xl':  ['24px', { lineHeight: '32px' }],
      },

      boxShadow: {
        'xs':  '0 1px 2px rgba(0,0,0,0.04)',
        'sm':  '0 1px 4px rgba(0,0,0,0.06)',
        'md':  '0 4px 12px rgba(0,0,0,0.07)',
        'lg':  '0 8px 24px rgba(0,0,0,0.09)',
        'xl':  '0 16px 40px rgba(0,0,0,0.11)',
        // legacy aliases
        'notion':    '0 1px 3px rgba(0,0,0,0.05)',
        'notion-md': '0 4px 12px rgba(0,0,0,0.07)',
        'notion-lg': '0 8px 24px rgba(0,0,0,0.09)',
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
