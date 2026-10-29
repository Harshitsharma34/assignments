import { useEffect, useRef, useState } from 'react'
import { motion } from 'framer-motion'
import { AlertCircle, ArrowLeft, Check, Loader2 } from 'lucide-react'

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

export function SuccessView({ title, lines, children, onDone }) {
  return (
    <div className="pb-2 text-center" role="status">
      <motion.span
        className="mx-auto grid h-16 w-16 place-items-center rounded-full bg-gold text-gold-ink"
        initial={{ scale: 0.6, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ type: 'spring', stiffness: 380, damping: 20 }}
        aria-hidden="true"
      >
        <Check size={30} strokeWidth={2.5} />
      </motion.span>
      <p className="mt-4 text-[22px] font-semibold text-ink tnum">{title}</p>
      {lines.map((l) => <p key={l} className="mt-1 text-[14px] text-ink-2 tnum">{l}</p>)}
      {children}
      <div className="mt-6"><PrimaryButton tone="light" onClick={onDone}>Done</PrimaryButton></div>
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
