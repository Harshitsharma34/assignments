import { useEffect, useRef } from 'react'
import { motion, useMotionValue, useTransform } from 'framer-motion'
import { T, easeInOutCubic, useIntroTimeline } from '../../components/coin/timeline.js'

const STAGE_HEIGHT = 844
const RADIUS = 32

// The black band that holds the header, coins and balance. Everything inside uses the
// `.on-dark` token scope. During the intro a full-screen black layer retracts into the band on
// the same playhead as the camera, so the porcelain page is uncovered rather than cut to.
export default function HeroBand({ children, introDone, onHeight }) {
  const timeline = useIntroTimeline()
  const band = useRef(null)
  const height = useMotionValue(STAGE_HEIGHT)

  useEffect(() => {
    const el = band.current
    if (!el) return
    const ro = new ResizeObserver(([entry]) => {
      const h = entry.target.offsetHeight
      height.set(h)
      onHeight?.(h)
    })
    ro.observe(el)
    return () => ro.disconnect()
  }, [height, onHeight])

  const clipPath = useTransform([timeline, height], ([t, h]) => {
    const u = easeInOutCubic(Math.min(1, Math.max(0, (t - T.form) / (T.end - T.form))))
    const bottom = (STAGE_HEIGHT - h) * u
    return `inset(0px 0px ${bottom}px 0px round 0px 0px ${RADIUS * u}px ${RADIUS * u}px)`
  })

  return (
    <>
      {!introDone && (
        <motion.div
          aria-hidden="true"
          className="pointer-events-none absolute inset-x-0 top-0 z-10 bg-black"
          style={{ height: STAGE_HEIGHT, clipPath }}
        />
      )}
      <div ref={band} className="on-dark relative z-[11] rounded-b-[32px] bg-page pb-7">
        <div
          aria-hidden="true"
          className="pointer-events-none absolute inset-0 rounded-b-[32px] bg-[radial-gradient(75%_45%_at_50%_26%,rgba(226,182,92,0.14),transparent_72%)]"
        />
        <div className="relative">{children}</div>
      </div>
    </>
  )
}
