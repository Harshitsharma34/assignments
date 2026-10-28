// Inline Scoin mark for amounts. Decorative: the word "Scoins" always sits next to it.
export default function ScoinGlyph({ size = 14, className = '' }) {
  return (
    <svg width={size} height={size} viewBox="0 0 16 16" aria-hidden="true" className={`inline-block shrink-0 ${className}`}>
      <circle cx="8" cy="8" r="7.5" fill="#C9961F" />
      <circle cx="8" cy="8" r="6.2" fill="#F2C53D" />
      <path d="M5.6 7.4 10.4 5V6.4L5.6 8.8zM5.6 8.8 10.4 10.6V11.9L5.6 10.1zM5.6 7.4V8.8L10.4 10.6V9.2z" fill="#A87A14" />
    </svg>
  )
}
