import { useRef, useState } from 'react'
import { animate, motion, useMotionValue, useTransform } from 'framer-motion'
import { ChevronsRight, Lock } from 'lucide-react'

// SalarySe's swipe-to-transfer control. A deliberate gesture for moving money; the thumb is also
// a real button, so Enter or Space confirms for keyboard and switch users.
export default function SwipeToConfirm({ label, disabled, onConfirm, tone = 'brand' }) {
  const gold = tone === 'gold'
  const track = useRef(null)
  const x = useMotionValue(0)
  const [done, setDone] = useState(false)
  const THUMB = 48
  const max = () => (track.current ? track.current.offsetWidth - THUMB - 8 : 240)
  const fill = useTransform(x, (v) => v + THUMB + 4)
  const fade = useTransform(x, (v) => 1 - Math.min(1, v / (max() * 0.6)))

  const confirm = () => {
    if (disabled || done) return
    setDone(true)
    animate(x, max(), { type: 'spring', stiffness: 500, damping: 40 })
    setTimeout(onConfirm, 180)
  }

  return (
    <div
      ref={track}
      className={`relative h-14 overflow-hidden ${gold ? 'rounded-full' : 'rounded-2xl'} ${disabled ? (gold ? 'bg-white/[0.07]' : 'bg-sunken') : gold ? 'bg-[linear-gradient(90deg,#B9862E,#E2B65C_45%,#F6D488)]' : 'bg-brand'}`}
      aria-disabled={disabled || undefined}
    >
      {!disabled && <motion.div aria-hidden="true" className={`absolute inset-y-0 left-0 ${gold ? 'bg-white/25' : 'bg-brand-hi/60'}`} style={{ width: fill }} />}
      <motion.span
        style={{ opacity: fade }}
        className={`pointer-events-none absolute inset-0 grid place-items-center pl-10 text-[15px] font-semibold tnum ${disabled ? 'text-ink-3' : gold ? 'text-[#1C1406]' : 'text-white'}`}
      >
        {label}
      </motion.span>
      <motion.button
        type="button"
        aria-label={disabled ? `${label} (unavailable)` : `${label}. Swipe right or press Enter`}
        disabled={disabled}
        onKeyDown={(e) => (e.key === 'Enter' || e.key === ' ') && (e.preventDefault(), confirm())}
        drag={disabled || done ? false : 'x'}
        dragConstraints={track}
        dragElastic={0}
        dragMomentum={false}
        style={{ x }}
        onDragEnd={() => (x.get() > max() * 0.82 ? confirm() : animate(x, 0, { type: 'spring', stiffness: 500, damping: 35 }))}
        className={`absolute left-1 top-1 grid h-12 w-12 touch-none place-items-center ${gold ? 'rounded-full' : 'rounded-xl'} ${disabled ? 'bg-sunken-2 text-ink-3' : gold ? 'cursor-grab bg-[#0B2A1B] text-gold-hi active:cursor-grabbing' : 'cursor-grab bg-white text-brand active:cursor-grabbing'}`}
      >
        {disabled ? <Lock size={18} aria-hidden="true" /> : <ChevronsRight size={22} aria-hidden="true" />}
      </motion.button>
    </div>
  )
}
