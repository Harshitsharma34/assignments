/** Design tokens for the Scoins prototype. Components use these names, never raw hex.
 *  Values live in CSS variables (src/index.css) so a `.on-dark` scope can restyle a region,
 *  such as the black hero band, without touching component code. */
const v = (name) => `rgb(var(--${name}) / <alpha-value>)`

module.exports = {
  content: ['./index.html', './src/**/*.{js,jsx}'],
  theme: {
    extend: {
      colors: {
        page: v('page'),
        surface: v('surface'),
        sunken: { DEFAULT: v('sunken'), 2: v('sunken-2') },
        strong: v('strong'),
        line: 'rgb(var(--line) / 0.1)',
        ink: { DEFAULT: v('ink'), 2: v('ink-2'), 3: v('ink-3') },
        accent: v('accent'),
        gold: { DEFAULT: v('gold'), hi: v('gold-hi'), lo: '#A87D2A', ink: '#1A1306', wash: 'rgb(var(--gold) / 0.14)' },
        gain: v('gain'),
        danger: '#C8442F',
      },
      fontFamily: {
        sans: ['"Noto Sans"', 'system-ui', 'sans-serif'],
        display: ['"Noto Serif Display"', 'Georgia', 'serif'],
      },
      borderRadius: { card: '20px' },
    },
  },
  plugins: [],
}
