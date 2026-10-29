import coin from '../assets/scoin.webp'

// Inline Scoin mark: a still of the 3D coin (rendered by render/earnArt.jsx, art=coin).
// Decorative: the word "Scoins" always sits next to it.
export default function ScoinGlyph({ size = 14, className = '' }) {
  return (
    <img
      src={coin}
      width={size}
      height={size}
      alt=""
      aria-hidden="true"
      draggable={false}
      className={`inline-block shrink-0 select-none ${className}`}
    />
  )
}
