import { useEffect, useRef, useState } from 'react'
import { motion } from 'framer-motion'
import { ArrowUpRight, ChevronLeft, ChevronRight, Landmark, Repeat } from 'lucide-react'
import AnimatedValue from '../../components/AnimatedValue.jsx'
import { bankValue, formatRupees, formatScoins, inAppValue } from '../../lib/scoins.js'

export const STEP = 50 // 50 Scoins = ₹10 in-app, ₹5 to bank: every stop is a whole rupee either way
const THUMB = 54
const TICKS = 16

const MODES = [
  { id: 'spend', label: 'On SalarySe' },
  { id: 'bank', label: 'To bank' },
]
const PICKS = [
  { id: '25', label: '25%', share: 0.25 },
  { id: '50', label: '50%', share: 0.5 },
  { id: 'all', label: 'All', share: 1 },
]

export const snapScoins = (v, max) => snap(v, max)
const snap = (v, max) => Math.min(max, Math.max(STEP, Math.round(v / STEP) * STEP))

// "What would my Scoins become?" Pick where to use them and how many; the result shows the
// rupee value at that rate, with the 2× in-app advantage stated plainly rather than as a warning.
export default function ScoinCalculator({ balance, onSpend, onWithdraw }) {
  const max = Math.max(STEP, Math.floor(balance / STEP) * STEP)
  const [mode, setMode] = useState('spend')
  const [scoins, setScoins] = useState(() => snap(Math.min(1000, max), max))

  useEffect(() => setScoins((s) => snap(s, max)), [max])

  const spend = mode === 'spend'
  const value = spend ? inAppValue(scoins) : bankValue(scoins)
  const activePick = PICKS.find((p) => snap(max * p.share, max) === scoins)?.id

  // One announcement once the value settles, not one per drag step.
  const [announcement, setAnnouncement] = useState('')
  useEffect(() => {
    const t = setTimeout(() => {
      setAnnouncement(`${formatScoins(scoins)} Scoins ${spend ? 'on SalarySe' : 'to your bank'} would become ${formatRupees(value)}`)
    }, 600)
    return () => clearTimeout(t)
  }, [scoins, spend, value])

  return (
    <section aria-labelledby="calc-title" className="mx-5 overflow-hidden shine-border rounded-card bg-surface">
      <h2 id="calc-title" className="sr-only">Scoin value calculator</h2>
      <div className="px-4 pb-4 pt-4">
        <div role="tablist" aria-label="Where to use Scoins" className="grid grid-cols-2 rounded-full bg-sunken p-1">
          {MODES.map((m) => (
            <button
              key={m.id}
              role="tab"
              aria-selected={mode === m.id}
              onClick={() => setMode(m.id)}
              className={`relative h-9 rounded-full text-[14px] transition-colors ${mode === m.id ? 'font-semibold text-[#141414]' : 'text-ink-2 hover:text-ink'}`}
            >
              {mode === m.id && (
                <motion.span layoutId="calc-mode" className="absolute inset-0 rounded-full bg-[#ECE6DA]" transition={{ type: 'spring', stiffness: 420, damping: 36 }} />
              )}
              <span className="relative">{m.label}</span>
            </button>
          ))}
        </div>

        <div className="mt-5 flex items-center justify-between gap-3">
          <p className="text-[13px] leading-snug text-ink-3">
            Scoins to use
            <span className="block text-[17px] font-semibold text-ink tnum">{formatScoins(scoins)} Scoins</span>
          </p>
          <p className="shrink-0 rounded-full bg-sunken px-3.5 py-1.5 text-[13px] text-ink-2">
            <span className="text-[16px] font-semibold text-ink tnum"><AnimatedValue value={value} format={formatRupees} duration={0.4} /></span> value
          </p>
        </div>

        <TickSlider value={scoins} max={max} onChange={setScoins} label="Scoins to use" />

        <div className="mt-4 flex items-center justify-between">
          <span className="text-[13px] text-ink-3">Quick pick</span>
          <div className="flex gap-1" role="group" aria-label="Quick amounts">
            {PICKS.map((p) => (
              <button
                key={p.id}
                onClick={() => setScoins(snap(max * p.share, max))}
                aria-pressed={activePick === p.id}
                className={`h-9 min-w-[56px] rounded-full px-3 text-[13px] tnum transition-colors ${activePick === p.id ? 'bg-sunken font-semibold text-ink' : 'text-ink-3 hover:text-ink'}`}
              >
                {p.label}
              </button>
            ))}
          </div>
        </div>
      </div>

      <div className="mx-4 border-t border-line py-4">
        <p className="sr-only" role="status">{announcement}</p>
        <p className="text-[14px] leading-snug text-ink-2 tnum">
          {formatScoins(scoins)} Scoins {spend ? 'spent on SalarySe' : 'withdrawn to your bank'} would become
        </p>
        <p className="mt-1.5 flex flex-wrap items-baseline gap-x-2 text-[22px] font-semibold text-ink tnum">
          {spend ? <ArrowUpRight size={20} aria-hidden="true" className="self-center text-gain" /> : <Landmark size={19} aria-hidden="true" className="self-center text-ink-2" />}
          <AnimatedValue value={value} format={formatRupees} duration={0.4} />
          {spend ? (
            <span className="self-center whitespace-nowrap rounded-full bg-gain/15 px-2.5 py-1 text-[12px] font-semibold leading-none text-gain">2× the bank value</span>
          ) : (
            <span className="text-[15px] font-normal text-ink-3">or {formatRupees(inAppValue(scoins))} on SalarySe</span>
          )}
        </p>
        <div className="mt-4 flex items-center justify-between gap-3">
          <p className="inline-flex items-center gap-1.5 rounded-md border border-line px-2 py-1 text-[12px] text-ink-2">
            <Repeat size={13} aria-hidden="true" /> {spend ? '5 Scoins = ₹1' : '10 Scoins = ₹1'}
          </p>
          {/* The answer leads straight to the action, carrying the chosen amount. */}
          <motion.button
            whileTap={{ scale: 0.97 }}
            onClick={() => (spend ? onSpend : onWithdraw)?.(scoins)}
            className={`flex h-10 items-center gap-1 rounded-full px-4 text-[14px] font-semibold tnum ${
              spend ? 'bg-gold text-gold-ink hover:bg-gold-hi' : 'bg-sunken text-ink hover:bg-sunken-2'
            }`}
          >
            {spend ? 'Spend' : 'Withdraw'} {formatRupees(value)}
            <ChevronRight size={17} aria-hidden="true" />
          </motion.button>
        </div>
      </div>
    </section>
  )
}

// Ticked track with a large round thumb and a glowing trail behind it. Pointer drag, tap to
// jump, and full keyboard support through role="slider".
export function TickSlider({ value, max, onChange, label }) {
  const track = useRef(null)
  const dragging = useRef(false)
  const span = Math.max(1, max - STEP)
  const u = (value - STEP) / span

  const setFromX = (clientX) => {
    const r = track.current.getBoundingClientRect()
    const x = Math.min(1, Math.max(0, (clientX - r.left - THUMB / 2) / (r.width - THUMB)))
    onChange(snap(STEP + x * span, max))
  }

  const onKeyDown = (e) => {
    const big = Math.max(STEP, Math.round(span / 10 / STEP) * STEP)
    const next = {
      ArrowRight: value + STEP, ArrowUp: value + STEP, ArrowLeft: value - STEP, ArrowDown: value - STEP,
      PageUp: value + big, PageDown: value - big, Home: STEP, End: max,
    }[e.key]
    if (next == null) return
    e.preventDefault()
    onChange(snap(next, max))
  }

  const left = `calc(${u} * (100% - ${THUMB}px))`

  return (
    <div
      ref={track}
      className="relative mt-4 h-[64px] touch-none select-none"
      onPointerDown={(e) => {
        dragging.current = true
        e.currentTarget.setPointerCapture?.(e.pointerId)
        setFromX(e.clientX)
      }}
      onPointerMove={(e) => dragging.current && setFromX(e.clientX)}
      onPointerUp={() => (dragging.current = false)}
      onPointerCancel={() => (dragging.current = false)}
    >
      <div aria-hidden="true" className="absolute inset-x-6 top-1/2 flex -translate-y-1/2 justify-between">
        {Array.from({ length: TICKS }, (_, i) => <span key={i} className="h-3 w-px bg-white/20" />)}
      </div>
      {/* Trail: fades in from the left edge and hugs the thumb. */}
      <div
        aria-hidden="true"
        className="absolute inset-y-[5px] left-0 rounded-full bg-[linear-gradient(90deg,rgba(226,182,92,0)_0%,rgba(226,182,92,0.12)_50%,rgba(226,182,92,0.32)_100%)]"
        style={{ width: `calc(${left} + ${THUMB}px)` }}
      />
      <div
        role="slider"
        tabIndex={0}
        aria-label={label}
        aria-valuemin={STEP}
        aria-valuemax={max}
        aria-valuenow={value}
        aria-valuetext={`${formatScoins(value)} Scoins`}
        onKeyDown={onKeyDown}
        className="absolute top-1/2 grid -translate-y-1/2 cursor-grab place-items-center rounded-full bg-[#F7F5F0] shadow-[0_0_0_3px_rgba(226,182,92,0.6),0_4px_14px_rgba(0,0,0,0.4)] active:cursor-grabbing"
        style={{ left, width: THUMB, height: THUMB }}
      >
        <span aria-hidden="true" className="flex items-center text-[#9A958C]">
          <ChevronLeft size={17} strokeWidth={1.8} /><ChevronRight size={17} strokeWidth={1.8} className="-ml-1" />
        </span>
      </div>
    </div>
  )
}
