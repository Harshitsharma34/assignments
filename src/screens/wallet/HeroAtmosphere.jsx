import { motion, useTransform } from 'framer-motion'
import { T, easeOutCubic, useIntroTimeline } from '../../components/coin/timeline.js'

// Light from above the screen, falling on the coins: a warm source glow, soft rays fanning down,
// and fine guilloché rings centred on the coins, the way a banknote or coin is engraved.
// Everything fades out by mid-screen so cards below stay calm. It arrives with the intro's
// last phase, so the opening stays black.
export default function HeroAtmosphere({ coinY = 150 }) {
  const timeline = useIntroTimeline()
  const opacity = useTransform(timeline, [T.form, T.end], [0, 1], { ease: easeOutCubic })

  return (
    <motion.div aria-hidden="true" className="pointer-events-none absolute inset-x-0 top-0 h-[560px] overflow-hidden" style={{ opacity }}>
      {/* Source glow just above the top edge. */}
      <div className="absolute inset-0 bg-[radial-gradient(80%_36%_at_50%_-6%,rgba(246,212,140,0.34),rgba(226,182,92,0.10)_45%,transparent_78%)]" />

      {/* Rays: two conic fans with different periods so the beams look irregular, softened and faded. */}
      <div
        className="hero-rays absolute left-1/2 top-[-80px] h-[700px] w-[900px] -translate-x-1/2 blur-[7px]"
        style={{
          background:
            'repeating-conic-gradient(from 0deg at 50% 0%, rgba(246,212,140,0.20) 0deg 2.4deg, transparent 2.4deg 8deg),' +
            'repeating-conic-gradient(from 4deg at 50% 0%, rgba(255,230,180,0.12) 0deg 4.5deg, transparent 4.5deg 15deg)',
          WebkitMaskImage: 'radial-gradient(58% 80% at 50% 0%, #000 0%, rgba(0,0,0,0.7) 38%, transparent 82%)',
          maskImage: 'radial-gradient(58% 80% at 50% 0%, #000 0%, rgba(0,0,0,0.7) 38%, transparent 82%)',
        }}
      />

      {/* Guilloché: fine concentric rings around the coins. */}
      <div
        className="absolute inset-0"
        style={{
          background: `repeating-radial-gradient(circle at 50% ${coinY}px, rgba(242,205,126,0.07) 0 1px, transparent 1px 11px)`,
          WebkitMaskImage: `radial-gradient(240px 230px at 50% ${coinY}px, transparent 26%, #000 46%, rgba(0,0,0,0.5) 72%, transparent 100%)`,
          maskImage: `radial-gradient(240px 230px at 50% ${coinY}px, transparent 26%, #000 46%, rgba(0,0,0,0.5) 72%, transparent 100%)`,
        }}
      />
      {/* A second, offset ring set makes the moiré of engraved security printing. */}
      <div
        className="absolute inset-0"
        style={{
          background: `repeating-radial-gradient(circle at calc(50% + 6px) ${coinY + 4}px, rgba(255,255,255,0.035) 0 1px, transparent 1px 11px)`,
          WebkitMaskImage: `radial-gradient(240px 230px at 50% ${coinY}px, transparent 26%, #000 46%, rgba(0,0,0,0.4) 72%, transparent 100%)`,
          maskImage: `radial-gradient(240px 230px at 50% ${coinY}px, transparent 26%, #000 46%, rgba(0,0,0,0.4) 72%, transparent 100%)`,
        }}
      />

      {/* Bottom fade into the page. */}
      <div className="absolute inset-x-0 bottom-0 h-40 bg-gradient-to-b from-transparent to-page" />
    </motion.div>
  )
}
