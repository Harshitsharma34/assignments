import { useEffect, useRef, useState } from 'react'
import { motion, useTransform } from 'framer-motion'
import CoinIntroAnimation from '../../components/coin/CoinIntroAnimation.jsx'
import { T, easeOutCubic, useIntroTimeline } from '../../components/coin/timeline.js'
import { useCoinInteraction } from '../../components/coin/useCoinInteraction.js'
import { HeroBalance } from './BalanceHero.jsx'
import Reveal from './Reveal.jsx'

// Hero geometry, measured from the top of the wallet scroll content. The balance sits on the
// left; the coin composition lands to its right, centred on (coinX, coinY).
export const HERO = { top: 96, coins: 112, coinX: 195, coinY: 150, coinWidth: 150 }
const STAGE_HEIGHT = 844

export default function WalletHero({ index, balance, savedRupees, onRates, intro, celebrateKey, idle, paused, onIntroDone }) {
  const timeline = useIntroTimeline()
  const slot = useRef(null)
  const [onScreen, setOnScreen] = useState(true)
  const [introDone, setIntroDone] = useState(intro.mode === 'none')

  // Stop rendering the 3D scene once it has scrolled away or the wallet is covered.
  useEffect(() => {
    const el = slot.current
    if (!el || typeof IntersectionObserver === 'undefined') return
    const io = new IntersectionObserver(([e]) => setOnScreen(e.isIntersecting), { threshold: 0 })
    io.observe(el)
    return () => io.disconnect()
  }, [])

  const active = !introDone || intro.scrub != null || (onScreen && !paused)
  // Coins become touchable once they have landed; reduced motion keeps them still.
  const interactive = introDone && idle && intro.scrub == null
  const coins = useCoinInteraction(interactive)

  // The pedestal glow arrives with the coins, on the same playhead.
  const glow = useTransform(timeline, [T.form, T.end], [0, 1], { ease: easeOutCubic })
  const localY = HERO.coinY - HERO.top

  return (
    <div ref={slot} className="relative">
      <motion.div
        aria-hidden="true"
        className="pointer-events-none absolute h-[36px] w-[180px] rounded-[50%] bg-[radial-gradient(ellipse_at_center,rgba(242,205,126,0.28),rgba(226,182,92,0.08)_45%,transparent_72%)]"
        style={{ left: HERO.coinX - 90, top: localY + 30, opacity: glow }}
      />
      {/* The stage spans the whole first screen so the intro can fill it; it scrolls with the page. */}
      <div className="pointer-events-none absolute inset-x-0 z-20" style={{ top: -HERO.top, height: STAGE_HEIGHT }}>
        <CoinIntroAnimation
          height={STAGE_HEIGHT}
          active={active}
          mode={intro.mode}
          skip={intro.skip}
          scrub={intro.scrub}
          timeline={timeline}
          heroX={HERO.coinX}
          heroY={HERO.coinY}
          heroWidth={HERO.coinWidth}
          celebrateKey={celebrateKey}
          idle={idle}
          interaction={coins.state}
          onDone={() => {
            setIntroDone(true)
            onIntroDone?.()
          }}
        />
      </div>
      <div style={{ height: HERO.coins }} aria-hidden="true" />
      <Reveal i={index}>
        <HeroBalance balance={balance} savedRupees={savedRupees} onRates={onRates} />
      </Reveal>
      {/* Hit area over the coins. The canvas itself never takes pointer events. */}
      <div
        {...coins.handlers}
        role={interactive ? 'button' : undefined}
        tabIndex={interactive ? 0 : -1}
        aria-label={interactive ? 'Spin the Scoins' : undefined}
        aria-hidden={interactive ? undefined : true}
        className={`absolute z-30 touch-pan-y select-none rounded-[40px] ${interactive ? 'cursor-grab active:cursor-grabbing' : 'pointer-events-none'}`}
        style={{ left: HERO.coinX - 90, top: localY - 50, width: 180, height: 100 }}
      />
    </div>
  )
}
