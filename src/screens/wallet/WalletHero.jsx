import { useEffect, useRef, useState } from 'react'
import CoinIntroAnimation from '../../components/coin/CoinIntroAnimation.jsx'
import { useIntroTimeline } from '../../components/coin/timeline.js'
import { useCoinInteraction } from '../../components/coin/useCoinInteraction.js'
import { BalanceHero, NewUserHero } from './BalanceHero.jsx'
import Reveal from './Reveal.jsx'

// Hero slot geometry, measured from the top of the wallet scroll content.
export const HERO = { top: 96, height: 120, coinWidth: 172 }
const STAGE_HEIGHT = 844

export default function WalletHero({ index, isNew, balance, savedRupees, onRates, intro, celebrateKey, idle, paused, onIntroDone }) {
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

  return (
    <div className="relative">
      {/* The stage spans the whole first screen so the intro can fill it; it scrolls with the page. */}
      <div className="pointer-events-none absolute inset-x-0 z-20" style={{ top: -HERO.top, height: STAGE_HEIGHT }}>
        <CoinIntroAnimation
          height={STAGE_HEIGHT}
          active={active}
          mode={intro.mode}
          skip={intro.skip}
          scrub={intro.scrub}
          timeline={timeline}
          heroY={HERO.top + HERO.height / 2}
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
      <div ref={slot} className="relative" style={{ height: HERO.height }}>
        {/* Hit area over the coins. The canvas itself never takes pointer events. */}
        <div
          {...coins.handlers}
          role={interactive ? 'button' : undefined}
          tabIndex={interactive ? 0 : -1}
          aria-label={interactive ? 'Spin the Scoins' : undefined}
          aria-hidden={interactive ? undefined : true}
          className={`absolute left-1/2 top-0 h-full w-[230px] -translate-x-1/2 touch-pan-y select-none rounded-[40px] ${interactive ? 'cursor-grab active:cursor-grabbing' : ''}`}
        />
      </div>
      <Reveal i={index}>
        {isNew ? <NewUserHero /> : <BalanceHero balance={balance} savedRupees={savedRupees} onRates={onRates} />}
      </Reveal>
    </div>
  )
}
