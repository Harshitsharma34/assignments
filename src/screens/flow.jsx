import { useEffect, useRef, useState } from 'react'
import { motion, useReducedMotion } from 'framer-motion'
import { AlertCircle, ArrowLeft, Loader2 } from 'lucide-react'
import AnimatedValue from '../components/AnimatedValue.jsx'
import Confetti from '../components/Confetti.jsx'

// review → loading → success | error. The commit runs only on success, so a failure
// never touches the balance.
export function useConfirmFlow({ failNext, onFailUsed }) {
  const [status, setStatus] = useState('review')
  const timer = useRef(null)
  useEffect(() => () => clearTimeout(timer.current), [])
  const run = (commit) => {
    setStatus('loading')
    timer.current = setTimeout(() => {
      if (failNext) {
        onFailUsed?.()
        setStatus('error')
      } else {
        commit()
        setStatus('success')
      }
    }, 1100)
  }
  return { status, run, reset: () => setStatus('review') }
}

export function ScreenHeader({ title, onBack }) {
  return (
    <header className="flex h-[52px] items-center justify-between px-4">
      <button onClick={onBack} aria-label="Back to wallet" className="grid h-10 w-10 place-items-center rounded-full bg-sunken text-ink hover:bg-sunken-2">
        <ArrowLeft size={19} />
      </button>
      <h1 className="text-[16px] font-semibold text-ink">{title}</h1>
      <span className="h-10 w-10" aria-hidden="true" />
    </header>
  )
}

export function Rows({ rows }) {
  return (
    <dl className="rounded-2xl bg-sunken px-4 py-1">
      {rows.map(([k, v, tone]) => (
        <div key={k} className="flex items-center justify-between gap-4 py-2.5 text-[14px]">
          <dt className="text-ink-3">{k}</dt>
          <dd className={`text-right tnum ${tone === 'accent' ? 'font-semibold text-accent' : 'text-ink'}`}>{v}</dd>
        </div>
      ))}
    </dl>
  )
}

export function PrimaryButton({ children, loading, disabled, tone = 'gold', ...props }) {
  const look = tone === 'gold' ? 'bg-gold text-gold-ink hover:bg-gold-hi' : 'bg-ink text-page hover:bg-ink/90'
  return (
    <button
      {...props}
      disabled={disabled || loading}
      aria-busy={loading || undefined}
      className={`flex h-12 w-full items-center justify-center gap-2 rounded-full text-[15px] font-semibold tnum transition-colors disabled:cursor-not-allowed disabled:opacity-40 ${look}`}
    >
      {loading && <Loader2 size={17} className="motion-safe:animate-spin" aria-hidden="true" />}
      {children}
    </button>
  )
}

// The success moment: the badge springs in, the tick draws itself, rings ripple out, a light
// sweeps across once, the amount counts up and confetti bursts from the badge.
export function SuccessView({ amount, format, suffix, lines, children, onDone }) {
  const badge = useRef(null)
  const reduce = useReducedMotion()
  useEffect(() => {
    if (!reduce) navigator.vibrate?.([18, 40, 28])
  }, [reduce])
  const rise = (i) => ({ initial: { opacity: 0, y: 8 }, animate: { opacity: 1, y: 0 }, transition: { delay: 0.45 + i * 0.08, duration: 0.4, ease: [0.22, 1, 0.36, 1] } })

  return (
    <div className="pb-2 text-center" role="status">
      <Confetti originRef={badge} />
      <div ref={badge} className="relative mx-auto h-20 w-20">
        {[0, 1].map((i) => (
          <motion.span
            key={i}
            aria-hidden="true"
            className="absolute inset-0 rounded-full border-2 border-gold"
            initial={{ scale: 0.8, opacity: 0.7 }}
            animate={{ scale: 2.1, opacity: 0 }}
            transition={{ delay: 0.15 + i * 0.22, duration: 1.1, ease: 'easeOut' }}
          />
        ))}
        <motion.span
          aria-hidden="true"
          className="absolute inset-0 grid place-items-center overflow-hidden rounded-full bg-[radial-gradient(circle_at_35%_30%,#F8DA92,#E2B65C_55%,#B9862E)] text-gold-ink shadow-[0_0_40px_rgba(226,182,92,0.45)]"
          initial={{ scale: 0, rotate: -25 }}
          animate={{ scale: [0, 1.18, 1], rotate: 0 }}
          transition={{ duration: 0.6, times: [0, 0.6, 1], ease: [0.22, 1, 0.36, 1] }}
        >
          <svg width="38" height="38" viewBox="0 0 24 24" fill="none">
            <motion.path
              d="M5 12.5l4.5 4.5L19 7.5"
              stroke="currentColor"
              strokeWidth="2.6"
              strokeLinecap="round"
              strokeLinejoin="round"
              initial={{ pathLength: 0 }}
              animate={{ pathLength: 1 }}
              transition={{ delay: 0.3, duration: 0.45, ease: 'easeOut' }}
            />
          </svg>
          <motion.span
            className="absolute inset-y-0 w-8 -skew-x-12 bg-white/45 blur-[2px]"
            initial={{ x: -70 }}
            animate={{ x: 70 }}
            transition={{ delay: 0.7, duration: 0.7, ease: 'easeInOut' }}
          />
        </motion.span>
      </div>
      <motion.p {...rise(0)} className="mt-5 text-[24px] font-semibold text-ink tnum">
        <AnimatedValue value={amount} from={0} format={format} duration={1.1} /> {suffix}
      </motion.p>
      {lines.map((l, i) => <motion.p key={l} {...rise(i + 1)} className="mt-1 text-[14px] text-ink-2 tnum">{l}</motion.p>)}
      <motion.div {...rise(lines.length + 1)}>{children}</motion.div>
      <motion.div {...rise(lines.length + 2)} className="mt-6"><PrimaryButton tone="light" onClick={onDone}>Done</PrimaryButton></motion.div>
    </div>
  )
}

export function ErrorView({ message, onRetry }) {
  return (
    <div className="pb-2 text-center" role="alert">
      <span className="mx-auto grid h-14 w-14 place-items-center rounded-full bg-danger/15 text-danger" aria-hidden="true">
        <AlertCircle size={26} />
      </span>
      <p className="mt-4 text-[18px] font-semibold text-ink">That didn't go through</p>
      <p className="mx-auto mt-1 max-w-[280px] text-[14px] leading-relaxed text-ink-2">{message}</p>
      <div className="mt-6"><PrimaryButton onClick={onRetry}>Try again</PrimaryButton></div>
    </div>
  )
}
