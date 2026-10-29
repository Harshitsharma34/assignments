import { useEffect, useRef, useState } from 'react'
import { motion, useReducedMotion } from 'framer-motion'
import Confetti from './Confetti.jsx'
import ScoinGlyph from './ScoinGlyph.jsx'

// The success seal: the 3D Scoin drops in and turns over twice, then keeps flipping between
// the coin and the gold tick seal. Rays turn slowly behind it, shockwaves and sparkles go out, then gold confetti.
export default function CoinSeal({ size = 200, className = '', rays = 'rgba(255,255,255,0.16)' }) {
  const seal = useRef(null)
  const reduce = useReducedMotion()
  return (
    <>
    <div ref={seal} className={`relative mx-auto grid place-items-center ${className}`} style={{ width: size, height: size }}>
      {/* Slow gold rays behind the seal. */}
      <motion.span
        aria-hidden="true"
        style={{ '--rays': rays }}
        className="absolute inset-[-30px] rounded-full will-change-transform bg-[repeating-conic-gradient(from_0deg,var(--rays)_0deg_6deg,transparent_6deg_18deg)] [mask:radial-gradient(closest-side,#000_20%,transparent_100%)]"
        initial={reduce ? false : { opacity: 0, scale: 0.6 }}
        animate={reduce ? { opacity: 1 } : { opacity: 1, scale: 1, rotate: 90 }}
        transition={{ opacity: { delay: 0.55, duration: 0.6 }, scale: { delay: 0.55, duration: 0.8, ease: 'easeOut' }, rotate: { delay: 0.55, duration: 24, ease: 'linear' } }}
      />
      {/* Shockwaves. */}
      {!reduce && [0, 1, 2].map((i) => (
        <motion.span
          key={i}
          aria-hidden="true"
          className="absolute h-[112px] w-[112px] rounded-full border border-gold-hi"
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: [0.9, 2.3], opacity: [0.8, 0] }}
          transition={{ delay: 0.78 + i * 0.18, duration: 1.2, ease: 'easeOut' }}
        />
      ))}
      {/* A ring of small Scoins bursts out from behind the seal and fades as it lands. */}
      {!reduce && BURST.map(([angle, dist, s, d], i) => (
        <motion.span
          key={`c${i}`}
          aria-hidden="true"
          className="absolute"
          initial={{ x: 0, y: 0, scale: 0.3, opacity: 0, rotateY: 0 }}
          animate={{
            x: Math.cos(angle) * dist,
            y: [0, Math.sin(angle) * dist - 18, Math.sin(angle) * dist + 26],
            scale: [0.3, 1, 0.9],
            opacity: [0, 1, 0],
            rotateY: 540,
          }}
          transition={{ delay: 0.8 + d, duration: 1.4, ease: [0.16, 1, 0.3, 1] }}
        >
          <ScoinGlyph size={s} />
        </motion.span>
      ))}
      {/* The 3D Scoin drops in and turns over twice, then keeps flipping: coin to tick and back. */}
      <motion.span
        aria-hidden="true"
        style={{ transformPerspective: 600 }}
        className="relative block h-[124px] w-[124px] drop-shadow-[0_16px_36px_rgba(242,205,126,0.35)]"
        initial={reduce ? false : { y: -140, scale: 0.4, rotateY: 0, opacity: 0 }}
        animate={{ y: 0, scale: [0.4, 1.12, 1], rotateY: 720, opacity: 1 }}
        transition={{ duration: 0.85, delay: 0.2, ease: [0.22, 1, 0.36, 1], opacity: { duration: 0.2, delay: 0.2 } }}
      >
        <span className="block h-full w-full [perspective:600px]">
          <span className="flip-coin relative block h-full w-full [animation-delay:1.2s] [transform-style:preserve-3d]">
            <span className="absolute inset-0 [backface-visibility:hidden]">
              <ScoinGlyph size={124} className="block" />
            </span>
            {/* The tick face: the smooth gold seal with a dark tick. */}
            <span className="absolute inset-[4px] grid place-items-center rounded-full bg-[radial-gradient(circle_at_34%_28%,#FFF0C2,#F2CD7E_38%,#D4A441_70%,#9C7020)] text-[#3A2705] shadow-[0_0_0_7px_rgba(242,205,126,0.16),inset_0_-6px_12px_rgba(110,72,10,0.45),inset_0_4px_8px_rgba(255,255,255,0.5)] [backface-visibility:hidden] [transform:rotateY(180deg)]">
              <span className="absolute inset-[8px] rounded-full border border-[#8A6116]/35" />
              <svg width="54" height="54" viewBox="0 0 24 24" fill="none" className="relative">
                <path d="M5 12.5l4.5 4.5L19 7.5" stroke="currentColor" strokeWidth="2.6" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </span>
          </span>
        </span>
      </motion.span>
      {/* Sparkles that twinkle once around the seal. */}
      {!reduce && SPARKS.map(([x, y, d], i) => (
        <motion.svg key={i} aria-hidden="true" width="14" height="14" viewBox="0 0 10 10" className="absolute text-gold-hi" style={{ left: x, top: y }}
          initial={{ scale: 0, opacity: 0 }} animate={{ scale: [0, 1, 0], opacity: [0, 1, 0], rotate: 45 }}
          transition={{ delay: 0.9 + d, duration: 1.1, ease: 'easeOut' }}>
          <path d="M5 0 6 4 10 5 6 6 5 10 4 6 0 5 4 4z" fill="currentColor" />
        </motion.svg>
      ))}
    </div>
              <ConfettiWhenReady anchor={seal} />
    </>
  )
}

const BURST = Array.from({ length: 12 }, (_, i) => [(i / 12) * Math.PI * 2 + (i % 2) * 0.2, 95 + (i % 3) * 22, 14 + (i % 3) * 5, (i % 4) * 0.04])

const SPARKS = [['12%', '18%', 0], ['82%', '12%', 0.12], ['90%', '62%', 0.24], ['6%', '70%', 0.18], ['50%', '-2%', 0.3]]

// Confetti needs the seal's position, so it starts once the seal has landed.
function ConfettiWhenReady({ anchor }) {
  const [go, setGo] = useState(false)
  useEffect(() => {
    const t = setTimeout(() => setGo(true), 850)
    return () => clearTimeout(t)
  }, [])
  return go ? <Confetti originRef={anchor} /> : null
}
