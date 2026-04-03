/**
 * TallyDekho Design System — Web Portal
 * Primary palette: #3F5263 slate blue-gray
 * Style: Notion-clean, cool-neutral, professional
 */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        // ─── Primary palette (from MaterialColor 3f5263) ──────────────────
        primary: {
          50:   '#3F5263',   // base — CTA, active, links
          100:  '#526373',   // hover/pressed
          200:  '#657582',   // secondary interactive
          300:  '#798692',   // icons, medium UI
          400:  '#8C97A1',   // muted interactive
          500:  '#9FA9B1',   // disabled, placeholder
          600:  '#B2BAC1',   // subtle UI
          700:  '#C5CBD0',   // border strong
          800:  '#D9DCE0',   // border default
          900:  '#ECEEEF',   // surface tint, background
          DEFAULT: '#3F5263',
        },

        // ─── Surface ──────────────────────────────────────────────────────
        surface: {
          page:    '#F4F5F6',   // main page background — cool off-white
          card:    '#FFFFFF',   // cards, panels — pure white
          raised:  '#F0F1F3',   // sidebar, raised elements
          hover:   '#E8EAEC',   // row hover, button hover
          active:  '#DDE0E3',   // pressed, selected
          inverse: '#1A222A',   // dark surfaces — tooltip, badge bg
        },

        // ─── Ink (text) ───────────────────────────────────────────────────
        ink: {
          primary:   '#1C2B3A',  // headings — deep blue-gray (warm dark)
          secondary: '#6B7280',  // body, labels
          tertiary:  '#9CA3AF',  // placeholder, disabled, captions
          muted:     '#B0B7BF',  // very subtle text
          inverse:   '#FFFFFF',  // on dark bg
        },

        // ─── Border ───────────────────────────────────────────────────────
        line: {
          DEFAULT:  '#D9DCE0',   // standard — cards, inputs
          strong:   '#C5CBD0',   // focused, emphasized
          subtle:   '#ECEEEF',   // inner dividers
        },

        // ─── Semantic — light Notion-style accents ────────────────────────
        positive: {
          DEFAULT:  '#2D7D46',
          bg:       '#E8F5ED',
          text:     '#1A5C32',
        },
        negative: {
          DEFAULT:  '#C0392B',
          bg:       '#FDECEA',
          text:     '#962D22',
        },
        caution: {
          DEFAULT:  '#B45309',
          bg:       '#FEF6E4',
          text:     '#8A4007',
        },
        info: {
          DEFAULT:  '#2563EB',
          bg:       '#EBF2FF',
          text:     '#1A4DC2',
        },
      },

      fontFamily: {
        sans: ['Inter', 'system-ui', '-apple-system', 'sans-serif'],
      },

      fontSize: {
        'xs':   ['11px', { lineHeight: '16px' }],
        'sm':   ['13px', { lineHeight: '20px' }],
        'base': ['14px', { lineHeight: '22px' }],
        'md':   ['15px', { lineHeight: '24px' }],
        'lg':   ['17px', { lineHeight: '26px' }],
        'xl':   ['20px', { lineHeight: '28px' }],
        '2xl':  ['24px', { lineHeight: '32px' }],
        '3xl':  ['30px', { lineHeight: '38px' }],
      },

      boxShadow: {
        'xs':  '0 1px 2px rgba(63,82,99,0.05)',
        'sm':  '0 1px 4px rgba(63,82,99,0.07)',
        'md':  '0 4px 12px rgba(63,82,99,0.09)',
        'lg':  '0 8px 24px rgba(63,82,99,0.11)',
        'xl':  '0 16px 40px rgba(63,82,99,0.13)',
        'notion':    '0 1px 3px rgba(63,82,99,0.06), 0 1px 2px rgba(63,82,99,0.04)',
        'notion-md': '0 4px 16px rgba(63,82,99,0.10)',
        'notion-lg': '0 8px 28px rgba(63,82,99,0.12)',
      },

      borderRadius: {
        'sm':  '6px',
        'md':  '8px',
        'lg':  '10px',
        'xl':  '12px',
        '2xl': '16px',
        '3xl': '20px',
      },
    },
  },
  plugins: [],
}
