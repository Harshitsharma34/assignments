import { motion, useTransform } from 'framer-motion'
import { T, easeOutCubic, useIntroTimeline } from '../../components/coin/timeline.js'

// Light from above the screen, falling on the coins: a warm source glow, one broad beam,
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

      {/* One broad beam: a single cone of light with feathered edges, fading as it falls. */}
      <div
        className="hero-rays absolute left-1/2 top-[-40px] h-[640px] w-[760px] -translate-x-1/2 blur-[22px]"
        style={{
          background:
            'conic-gradient(from 154deg at 50% 0%, transparent 0deg, rgba(246,212,140,0.16) 14deg, rgba(250,222,160,0.26) 26deg, rgba(246,212,140,0.16) 38deg, transparent 52deg, transparent 360deg)',
          WebkitMaskImage: 'linear-gradient(to bottom, #000 0%, rgba(0,0,0,0.75) 35%, transparent 85%)',
          maskImage: 'linear-gradient(to bottom, #000 0%, rgba(0,0,0,0.75) 35%, transparent 85%)',
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
