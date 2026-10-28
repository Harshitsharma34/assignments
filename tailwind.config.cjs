/** Design tokens for the Scoins prototype. Components use these names, never raw hex. */
module.exports = {
  content: ['./index.html', './src/**/*.{js,jsx}'],
  theme: {
    extend: {
      colors: {
        ink: { 950: '#0B0B0C', 900: '#111113', 850: '#161618', 800: '#1C1C1F', 700: '#26262A', 600: '#34343A' },
        line: 'rgba(255,255,255,0.08)',
        fg: { DEFAULT: '#F4F1EA', 2: '#B4AFA5', 3: '#8E8A82' },
        gold: { DEFAULT: '#E8B547', hi: '#F5CC6A', lo: '#A87D2A', ink: '#1A1306', wash: 'rgba(232,181,71,0.10)' },
        gain: '#5BD08F',
        danger: '#FF7A6B',
      },
      fontFamily: {
        sans: ['"Noto Sans"', 'system-ui', 'sans-serif'],
        display: ['"Noto Sans"', 'system-ui', 'sans-serif'],
      },
      borderRadius: { card: '20px' },
    },
  },
  plugins: [],
}
