import { useEffect, useRef, useState } from 'react'
import { motion } from 'framer-motion'
import { ArrowUpRight, ChevronLeft, ChevronRight, Landmark, Repeat } from 'lucide-react'
import AnimatedValue from '../../components/AnimatedValue.jsx'
import { bankValue, formatRupees, formatScoins, inAppValue } from '../../lib/scoins.js'

const STEP = 50 // 50 Scoins = ₹10 in-app, ₹5 to bank: every stop is a whole rupee either way
const THUMB = 76
const TICKS = 14

const MODES = [
  { id: 'spend', label: 'On SalarySe' },
  { id: 'bank', label: 'To bank' },
]
const PICKS = [
  { id: '25', label: '25%', share: 0.25 },
  { id: '50', label: '50%', share: 0.5 },
  { id: 'all', label: 'All', share: 1 },
]

const snap = (v, max) => Math.min(max, Math.max(STEP, Math.round(v / STEP) * STEP))

// "What would my Scoins become?" Pick where to use them and how many; the result shows the
// rupee value at that rate, with the 2× in-app advantage stated plainly rather than as a warning.
export default function ScoinCalculator({ balance }) {
  const max = Math.max(STEP, Math.floor(balance / STEP) * STEP)
  const [mode, setMode] = useState('spend')
  const [scoins, setScoins] = useState(() => snap(Math.min(1000, max), max))

  useEffect(() => setScoins((s) => snap(s, max)), [max])

  const spend = mode === 'spend'
  const value = spend ? inAppValue(scoins) : bankValue(scoins)
  const activePick = PICKS.find((p) => snap(max * p.share, max) === scoins)?.id

  return (
    <section aria-labelledby="calc-title" className="mx-5 overflow-hidden rounded-[22px] border border-line bg-surface">
      <h2 id="calc-title" className="sr-only">Scoin value calculator</h2>
      <div className="px-4 pb-5 pt-4">
        <div role="tablist" aria-label="Where to use Scoins" className="grid grid-cols-2 rounded-xl bg-sunken p-1">
          {MODES.map((m) => (
            <button
              key={m.id}
              role="tab"
              aria-selected={mode === m.id}
              onClick={() => setMode(m.id)}
              className={`relative h-11 rounded-lg text-[15px] transition-colors ${mode === m.id ? 'font-semibold text-[#141414]' : 'text-ink-2 hover:text-ink'}`}
            >
              {mode === m.id && (
                <motion.span layoutId="calc-mode" className="absolute inset-0 rounded-lg bg-[#ECE6DA]" transition={{ type: 'spring', stiffness: 420, damping: 36 }} />
              )}
              <span className="relative">{m.label}</span>
            </button>
          ))}
        </div>

        <div className="mt-6 flex items-center justify-between gap-3">
          <p className="text-[15px] leading-snug text-ink-2">
            Scoins to use
            <span className="block tnum">Amount: {formatScoins(scoins)} Scoins</span>
          </p>
          <p className="shrink-0 rounded-xl border border-line bg-sunken px-4 py-2.5 text-[15px] text-ink-2">
            <span className="text-[19px] font-bold text-ink tnum"><AnimatedValue value={value} format={formatRupees} duration={0.4} /></span> value
          </p>
        </div>

        <TickSlider value={scoins} max={max} onChange={setScoins} label="Scoins to use" />

        <div className="mt-4 flex items-center justify-between">
          <span className="text-[15px] text-ink-2">Use</span>
          <div className="flex gap-1" role="group" aria-label="Quick amounts">
            {PICKS.map((p) => (
              <button
                key={p.id}
                onClick={() => setScoins(snap(max * p.share, max))}
                aria-pressed={activePick === p.id}
                className={`h-11 min-w-[64px] rounded-lg px-3 text-[15px] tnum transition-colors ${activePick === p.id ? 'bg-sunken-2 font-semibold text-ink' : 'text-ink-3 hover:text-ink'}`}
              >
                {p.label}
              </button>
            ))}
          </div>
        </div>
      </div>

      <div className="border-t border-line bg-sunken/60 px-4 py-5" aria-live="polite">
        <p className="text-[15px] leading-snug text-ink-2 tnum">
          {formatScoins(scoins)} Scoins {spend ? 'spent on SalarySe' : 'withdrawn to your bank'} would become
        </p>
        <p className="mt-2 flex flex-wrap items-baseline gap-x-2 text-[22px] font-bold text-ink tnum">
          {spend ? <ArrowUpRight size={20} aria-hidden="true" className="self-center text-gain" /> : <Landmark size={19} aria-hidden="true" className="self-center text-ink-2" />}
          <AnimatedValue value={value} format={formatRupees} duration={0.4} />
          {spend ? (
            <span className="text-[17px] font-medium text-gain">(2× the bank value)</span>
          ) : (
            <span className="text-[15px] font-normal text-ink-3">or {formatRupees(inAppValue(scoins))} on SalarySe</span>
          )}
        </p>
        <p className="mt-3 inline-flex items-center gap-1.5 rounded-md border border-line px-2 py-1 text-[12px] text-ink-2">
          <Repeat size={13} aria-hidden="true" /> {spend ? '5 Scoins = ₹1' : '10 Scoins = ₹1'}
        </p>
      </div>
    </section>
  )
}

// Ticked track with a large round thumb and a glowing trail behind it. Pointer drag, tap to
// jump, and full keyboard support through role="slider".
function TickSlider({ value, max, onChange, label }) {
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
      className="relative -ml-4 mt-5 h-[92px] touch-none select-none"
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
        {Array.from({ length: TICKS }, (_, i) => <span key={i} className="h-5 w-[2px] rounded-full bg-white/15" />)}
      </div>
      {/* Trail: fades in from the left edge and hugs the thumb. */}
      <div
        aria-hidden="true"
        className="absolute inset-y-[8px] left-0 rounded-r-full bg-[linear-gradient(90deg,rgba(226,182,92,0)_0%,rgba(226,182,92,0.18)_45%,rgba(226,182,92,0.5)_100%)]"
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
        className="absolute top-1/2 grid -translate-y-1/2 cursor-grab place-items-center rounded-full bg-[#F7F5F0] shadow-[0_0_0_5px_rgba(226,182,92,0.55),0_8px_24px_rgba(0,0,0,0.45)] active:cursor-grabbing"
        style={{ left, width: THUMB, height: THUMB }}
      >
        <span aria-hidden="true" className="flex items-center text-[#9A958C]">
          <ChevronLeft size={22} strokeWidth={1.6} /><ChevronRight size={22} strokeWidth={1.6} className="-ml-1.5" />
        </span>
      </div>
    </div>
  )
}
