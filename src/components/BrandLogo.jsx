// Brand marks for illustrative partner deals, drawn as vector so they stay sharp at any size.
// Each sits on its own badge background: Zomato's red disc, and white discs for Swiggy and
// Amazon, whose orange and black marks would vanish on the dark UI.
export const BRAND_TINT = { zomato: '226,55,68', swiggy: '252,128,25', amazon: '255,153,0' }

export default function BrandLogo({ brand, size = 40 }) {
  const common = { width: size, height: size, viewBox: '0 0 100 100', 'aria-hidden': true, className: 'shrink-0' }
  if (brand === 'zomato') {
    return (
      <svg {...common}>
        <circle cx="50" cy="50" r="50" fill="#E23744" />
        <text x="50" y="58" textAnchor="middle" fill="#fff" fontFamily="'Noto Sans', sans-serif" fontWeight="800" fontStyle="italic" fontSize="25" letterSpacing="-0.5">zomato</text>
      </svg>
    )
  }
  if (brand === 'swiggy') {
    return (
      <svg {...common}>
        <circle cx="50" cy="50" r="50" fill="#fff" />
        <defs>
          <clipPath id="swiggy-pin"><path d="M50 14c-15.5 0-27 11.6-27 26.3 0 16.9 18.6 37.1 27 47.7 8.4-10.6 27-30.8 27-47.7C77 25.6 65.5 14 50 14z" /></clipPath>
        </defs>
        <path d="M50 14c-15.5 0-27 11.6-27 26.3 0 16.9 18.6 37.1 27 47.7 8.4-10.6 27-30.8 27-47.7C77 25.6 65.5 14 50 14z" fill="#FC8019" />
        <g clipPath="url(#swiggy-pin)" stroke="#fff" strokeWidth="3.2" strokeLinecap="round" strokeLinejoin="round" fill="none">
          <path d="M52.5 26v15.5h30" />
          <path d="M47.5 76V61.5H18" />
        </g>
      </svg>
    )
  }
  if (brand === 'amazon') {
    return (
      <svg {...common}>
        <circle cx="50" cy="50" r="50" fill="#fff" />
        <text x="50" y="60" textAnchor="middle" fill="#131921" fontFamily="'Noto Sans', sans-serif" fontWeight="700" fontSize="46">a</text>
        <path d="M27 66c13 8.5 32 9 46 1" stroke="#FF9900" strokeWidth="4.5" strokeLinecap="round" fill="none" />
        <path d="M67.5 62.5l6.5 4-6 4.6" stroke="#FF9900" strokeWidth="4" strokeLinecap="round" strokeLinejoin="round" fill="none" />
      </svg>
    )
  }
  return null
}
