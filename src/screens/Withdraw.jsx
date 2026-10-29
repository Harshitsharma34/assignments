import { useEffect, useRef, useState } from 'react'
import { motion, useReducedMotion } from 'framer-motion'
import { ArrowLeft, ChevronRight, Loader2, Pencil, Share2, X } from 'lucide-react'
import Confetti from '../components/Confetti.jsx'
import AnimatedValue from '../components/AnimatedValue.jsx'
import ScoinGlyph from '../components/ScoinGlyph.jsx'
import Sheet from '../components/Sheet.jsx'
import SwipeToConfirm from '../components/SwipeToConfirm.jsx'
import { bankValue, formatRupees, formatScoins, inAppValue } from '../lib/scoins.js'
import { STEP, TickSlider, snapScoins } from './wallet/ScoinCalculator.jsx'

// Withdraw follows SalarySe's existing transfer flow: amount and UPI ID, swipe to transfer,
// OTP, processing, then a full-screen success. Green and gold, laid straight on the page. Added on top: the exact rupees at 10 Scoins = ₹1,
// the in-app value shown as information, validation before the swipe unlocks, and a
// reconciled balance afterwards.
const PHONE = '+91 98•••••828' // illustrative
const PICKS = [['25%', 0.25], ['50%', 0.5], ['All', 1]]
const UPI_RE = /^[a-zA-Z0-9._-]{2,256}@[a-zA-Z]{2,64}$/

export default function Withdraw({ balance, selected, dispatch, failNext, onFailUsed, onBack, onSpend, onEarn, notify }) {
  const max = Math.floor(balance / STEP) * STEP
  const [scoins, setScoinsRaw] = useState(() => (max >= STEP ? snapScoins(selected ?? max, max) : 0))
  const [text, setText] = useState(() => String(bankValue(max >= STEP ? snapScoins(selected ?? max, max) : 0)))
  // The slider, the quick picks and the typed amount all drive the same value.
  const setScoins = (v) => { setScoinsRaw(v); setText(String(bankValue(v))) }
  const onType = (e) => {
    const t = e.target.value.replace(/\D/g, '').replace(/^0+(?=\d)/, '').slice(0, 6)
    setText(t)
    setScoinsRaw(Number(t || 0) * 10)
  }
  const over = scoins > max
  const under = scoins < STEP
  const [upi, setUpi] = useState('')
  const [touched, setTouched] = useState(false)
  const [step, setStep] = useState('form') // form | otp | processing | success
  const [receipt, setReceipt] = useState(null)
  const rupees = bankValue(scoins)
  const upiValid = UPI_RE.test(upi.trim())
  const ready = max >= STEP && !under && !over && upiValid

  const finish = () => {
    const ref = `SCN${Date.now().toString().slice(-9)}`
    setReceipt({ ref, at: new Date(), scoins, rupees, to: upi.trim(), left: balance - scoins })
    setStep('processing')
    setTimeout(() => {
      dispatch({ type: 'withdraw', scoins, to: upi.trim(), ref })
      setStep('success')
    }, 1700)
  }

  if (step === 'processing') return <Processing rupees={receipt.rupees} to={receipt.to} />
  if (step === 'success') return <Success receipt={receipt} onDone={onBack} />

  return (
    <GreenStage>
      <header className="flex items-center gap-3 px-4 pt-12">
        <button onClick={onBack} aria-label="Back to wallet" className="grid h-10 w-10 place-items-center rounded-full bg-white/10 text-white hover:bg-white/20">
          <ArrowLeft size={19} />
        </button>
        <h1 className="flex-1 text-[16px] font-semibold text-white">Transfer to bank</h1>
        <span className="flex items-center gap-1.5 rounded-full bg-black/20 px-3 py-1.5 text-[13px] font-semibold text-white tnum backdrop-blur-sm">
          <ScoinGlyph size={14} /> 10 = ₹1
        </span>
      </header>

      {max < STEP ? (
        <div className="px-6 pt-20 text-center">
          <p className="text-[20px] font-semibold text-white">No Scoins to withdraw yet</p>
          <p className="mt-2 text-[14px] text-white/65">Withdrawals start from {STEP} Scoins ({formatRupees(bankValue(STEP))}).</p>
          <button onClick={onEarn} className="mt-6 h-11 rounded-full bg-white px-5 text-[14px] font-semibold text-black hover:bg-white/90">See ways to earn</button>
        </div>
      ) : (
        <div className="px-6">
          {/* The amount is the page: a large figure you can also type into. */}
          <section className="pt-10 text-center" aria-label="Transfer amount">
            <label htmlFor="amount" className="text-[13px] font-medium uppercase tracking-[0.14em] text-white/80">You'll receive</label>
            <div className="mt-2 flex items-center justify-center">
              <span className="text-[44px] font-bold leading-none text-white/70">₹</span>
              <input
                id="amount"
                value={text}
                onChange={onType}
                onFocus={(e) => e.target.select()}
                inputMode="numeric"
                autoComplete="off"
                aria-describedby="amount-help"
                aria-invalid={over || (under && text !== '') ? true : undefined}
                style={{ width: `${Math.max(1, text.length) * 0.56 + 0.05}em` }}
                className="bg-transparent text-[60px] font-bold leading-none tracking-[-0.04em] text-white caret-white tnum focus:outline-none"
              />
              <Pencil size={16} aria-hidden="true" className="ml-1 self-end mb-2 text-white/50" />
            </div>
            <p id="amount-help" className={`mt-3 flex items-center justify-center gap-1.5 text-[14px] tnum ${over || (under && text !== '') ? 'text-[#FFD3CF]' : 'text-white/75'}`}>
              {over ? `You can withdraw up to ${formatRupees(bankValue(max))}`
                : under ? `Minimum ${formatRupees(bankValue(STEP))}`
                : <><ScoinGlyph size={14} /> {formatScoins(scoins)} of {formatScoins(balance)} Scoins</>}
            </p>
          </section>

          <TickSlider value={Math.min(Math.max(scoins, STEP), max)} max={max} onChange={setScoins} label="Scoins to transfer" />
          <div className="flex justify-center gap-6" role="group" aria-label="Quick amounts">
            {PICKS.map(([label, share]) => {
              const v = snapScoins(max * share, max)
              const on = v === scoins
              return (
                <button key={label} onClick={() => setScoins(v)} aria-pressed={on}
                  className={`relative min-h-[44px] px-2 text-[14px] tnum transition-colors ${on ? 'font-semibold text-white' : 'text-white/55 hover:text-white'}`}>
                  {label}
                  {on && <motion.span layoutId="pick" aria-hidden="true" className="absolute inset-x-2 bottom-2 h-0.5 rounded-full bg-white" />}
                </button>
              )
            })}
          </div>

          <GoldRule className="mt-5" />

          <button onClick={onSpend} className="flex min-h-[48px] w-full items-center gap-2 text-left text-[14px] text-white/75 hover:text-white">
            <span className="flex-1 tnum">Worth <span className="font-semibold text-gold-hi">{formatRupees(inAppValue(Math.min(scoins, max)))}</span> if spent on SalarySe</span>
            <span className="flex items-center gap-0.5 font-medium text-gold-hi">Spend instead <ChevronRight size={15} aria-hidden="true" /></span>
          </button>

          <GoldRule />

          <section className="mt-6">
            <label htmlFor="upi" className="text-[13px] font-medium text-white/65">Send to UPI ID</label>
            <input
              id="upi"
              value={upi}
              onChange={(e) => setUpi(e.target.value)}
              onBlur={() => setTouched(true)}
              inputMode="email"
              autoCapitalize="none"
              autoCorrect="off"
              spellCheck={false}
              placeholder="name@bank"
              aria-invalid={touched && !upiValid ? true : undefined}
              aria-describedby="upi-help"
              className={`mt-1 h-12 w-full border-b bg-transparent text-[18px] text-white placeholder:text-white/30 focus:outline-none ${touched && !upiValid ? 'border-danger' : 'border-white/20 focus:border-gold-hi'}`}
            />
            <p id="upi-help" className={`mt-2 text-[12px] ${touched && !upiValid ? 'text-danger' : 'text-white/50'}`}>
              {touched && !upiValid ? 'That doesn’t look like a UPI ID. It should look like name@bank.' : 'Use the UPI ID linked to your bank account.'}
            </p>
          </section>

          <div className="mt-9">
            <SwipeToConfirm tone="light" label={`Swipe to get ${formatRupees(rupees)}`} disabled={!ready} onConfirm={() => setStep('otp')} />
            <p className="mt-3 text-center text-[11px] text-white/40">UPI transfer and OTP are illustrative.</p>
          </div>
        </div>
      )}

      <Sheet open={step === 'otp'} onClose={() => setStep('form')} title="Enter OTP to confirm">
        <Otp
          summary={`${formatRupees(rupees)} · ${formatScoins(scoins)} Scoins to ${upi.trim()}`}
          failNext={failNext}
          onFailUsed={onFailUsed}
          onVerified={finish}
        />
      </Sheet>
    </GreenStage>
  )
}

// SalarySe green that falls away to black, lit by two slow light pools and fine rings.
// It is the page's only surface: content sits straight on it instead of in boxes.
function GreenStage({ children, center = false }) {
  return (
    <div className={`relative min-h-full overflow-hidden bg-black pb-10 ${center ? 'flex flex-col' : ''}`}>
      <div aria-hidden="true" className="pointer-events-none absolute inset-x-0 top-0 h-[560px] bg-[linear-gradient(180deg,#14D467_0%,#0A9A48_26%,#04512A_52%,#011A0D_76%,#000_100%)]" />
      {/* Two slow light pools drift over the green so it feels lit, not flat. */}
      <div aria-hidden="true" className="aurora pointer-events-none absolute -left-24 -top-24 h-[340px] w-[340px] rounded-full bg-[radial-gradient(closest-side,rgba(190,255,120,0.45),transparent)]" />
      <div aria-hidden="true" className="aurora aurora-b pointer-events-none absolute -right-28 top-10 h-[300px] w-[300px] rounded-full bg-[radial-gradient(closest-side,rgba(242,205,126,0.30),transparent)]" />
      <svg aria-hidden="true" className="pointer-events-none absolute left-1/2 top-[-140px] -translate-x-1/2 opacity-[0.14]" width="560" height="560" viewBox="0 0 560 560">
        {Array.from({ length: 14 }, (_, i) => (
          <circle key={i} cx="280" cy="280" r={60 + i * 16} fill="none" stroke="#fff" strokeWidth="0.6" strokeDasharray={i % 2 ? '1 5' : undefined} />
        ))}
      </svg>
      <div className={`relative ${center ? 'flex flex-1 flex-col' : ''}`}>{children}</div>
    </div>
  )
}

function GoldRule({ className = '' }) {
  return <div aria-hidden="true" className={`h-px bg-[linear-gradient(90deg,transparent,rgba(242,205,126,0.35),transparent)] ${className}`} />
}

function Otp({ summary, failNext, onFailUsed, onVerified }) {
  const [digits, setDigits] = useState(Array(6).fill(''))
  const [seconds, setSeconds] = useState(30)
  const [status, setStatus] = useState('idle') // idle | checking | error
  const refs = useRef([])
  const code = digits.join('')

  useEffect(() => {
    if (seconds <= 0) return
    const t = setTimeout(() => setSeconds((s) => s - 1), 1000)
    return () => clearTimeout(t)
  }, [seconds])

  const set = (i, v) => {
    const next = [...digits]
    next[i] = v
    setDigits(next)
    if (status === 'error') setStatus('idle')
  }
  const onChange = (i, e) => {
    const v = e.target.value.replace(/\D/g, '')
    if (v.length > 1) {
      // Paste or autofill: spread across the boxes.
      const next = [...digits]
      v.slice(0, 6 - i).split('').forEach((d, k) => (next[i + k] = d))
      setDigits(next)
      refs.current[Math.min(5, i + v.length)]?.focus()
      return
    }
    set(i, v)
    if (v && i < 5) refs.current[i + 1]?.focus()
  }
  const onKeyDown = (i, e) => {
    if (e.key === 'Backspace' && !digits[i] && i > 0) refs.current[i - 1]?.focus()
  }
  const verify = () => {
    setStatus('checking')
    setTimeout(() => {
      if (failNext) {
        onFailUsed?.()
        setStatus('error')
        setDigits(Array(6).fill(''))
        refs.current[0]?.focus()
      } else {
        onVerified()
      }
    }, 900)
  }

  return (
    <div>
      <p className="text-[13px] text-ink-2">OTP sent to {PHONE}</p>
      <p className="mt-1 text-[13px] text-ink-3 tnum">{summary}</p>
      <div className="mt-5 grid grid-cols-6 gap-2" role="group" aria-label="One-time password">
        {digits.map((d, i) => (
          <input
            key={i}
            ref={(el) => (refs.current[i] = el)}
            value={d}
            onChange={(e) => onChange(i, e)}
            onKeyDown={(e) => onKeyDown(i, e)}
            inputMode="numeric"
            autoComplete={i === 0 ? 'one-time-code' : 'off'}
            maxLength={6}
            aria-label={`Digit ${i + 1}`}
            autoFocus={i === 0}
            className={`h-12 w-full rounded-xl border bg-sunken text-center text-[18px] font-semibold text-ink tnum focus:outline-none ${status === 'error' ? 'border-danger' : d ? 'border-ink/40' : 'border-line focus:border-gold'}`}
          />
        ))}
      </div>
      <p className={`mt-3 text-center text-[13px] ${status === 'error' ? 'text-danger' : 'text-ink-3'}`} role={status === 'error' ? 'alert' : undefined}>
        {status === 'error'
          ? 'That OTP didn’t match. No Scoins were withdrawn. Try again.'
          : seconds > 0
          ? `Resend OTP in 00:${String(seconds).padStart(2, '0')}`
          : <button onClick={() => setSeconds(30)} className="font-medium text-gold-hi">Resend OTP</button>}
      </p>
      <p className="mt-1 text-center text-[11px] text-ink-3">Prototype: any 6 digits work.</p>
      <button
        onClick={verify}
        disabled={code.length < 6 || status === 'checking'}
        className="mt-5 flex h-12 w-full items-center justify-center gap-2 rounded-full bg-gold text-[15px] font-semibold text-gold-ink transition-colors hover:bg-gold-hi disabled:bg-sunken disabled:text-ink-3"
      >
        {status === 'checking' && <Loader2 size={17} className="motion-safe:animate-spin" aria-hidden="true" />}
        {status === 'checking' ? 'Verifying…' : 'Verify and proceed'}
      </button>
    </div>
  )
}

function Processing({ rupees, to }) {
  const reduce = useReducedMotion()
  return (
    <GreenStage center>
      <div className="flex flex-1 flex-col items-center justify-center px-6 pt-24 text-center" role="status" aria-live="polite">
        <div className="relative h-24 w-24">
          <motion.span
            aria-hidden="true"
            className="absolute inset-0 rounded-full bg-[conic-gradient(from_0deg,transparent_0deg,#F2CD7E_300deg,transparent_360deg)] [mask:radial-gradient(farthest-side,transparent_calc(100%-3px),#000_calc(100%-2px))]"
            animate={reduce ? undefined : { rotate: 360 }}
            transition={{ repeat: Infinity, duration: 1.1, ease: 'linear' }}
          />
          <span className="absolute inset-3 grid place-items-center"><ScoinGlyph size={58} /></span>
        </div>
        <p className="mt-7 text-[22px] font-semibold text-white tnum">Sending {formatRupees(rupees)}</p>
        <p className="mt-1 text-[14px] text-white/65">to {to}</p>
        <p className="mt-10 text-[13px] text-white/45">Please don’t go back or close the app.</p>
      </div>
    </GreenStage>
  )
}

// Success: the green field floods out from the centre, a gold coin drops in and turns over,
// settling as a gold seal with the tick drawn on it. Rays turn slowly behind it, a shockwave
// and gold confetti go out, then the amount counts up and the receipt rises line by line.
function Success({ receipt, onDone }) {
  const seal = useRef(null)
  const reduce = useReducedMotion()
  const [opened, setOpened] = useState(!!reduce)
  useEffect(() => {
    if (!reduce) navigator.vibrate?.([18, 40, 28])
  }, [reduce])
  const rise = (i) => ({
    initial: reduce ? false : { opacity: 0, y: 12 },
    animate: { opacity: 1, y: 0 },
    transition: { delay: 1.05 + i * 0.07, duration: 0.45, ease: [0.22, 1, 0.36, 1] },
  })
  const when = receipt.at.toLocaleString('en-IN', { day: 'numeric', month: 'short', year: 'numeric', hour: 'numeric', minute: '2-digit' })
  const rows = [
    ['To', receipt.to],
    ['Scoins used', `${formatScoins(receipt.scoins)} at 10 = ₹1`],
    ['Balance left', `${formatScoins(receipt.left)} Scoins`],
    ['Transaction ID', receipt.ref],
    ['Date and time', when],
  ]

  return (
    <motion.div
      className="min-h-full"
      initial={reduce ? false : { clipPath: 'circle(0% at 50% 38%)' }}
      animate={{ clipPath: 'circle(150% at 50% 38%)' }}
      transition={{ duration: 0.7, ease: [0.65, 0, 0.35, 1] }}
      onAnimationComplete={() => setOpened(true)}
      style={opened ? { clipPath: 'none' } : undefined}
    >
      <GreenStage center>
        <div className="flex items-center justify-between px-4 pt-12">
          <button onClick={onDone} aria-label="Close" className="grid h-10 w-10 place-items-center rounded-full bg-white/10 text-white hover:bg-white/20"><X size={19} /></button>
          <button
            onClick={() => navigator.share?.({ text: `${formatRupees(receipt.rupees)} sent to ${receipt.to} · Ref ${receipt.ref}` })}
            aria-label="Share receipt"
            className="grid h-10 w-10 place-items-center rounded-full bg-white/10 text-white hover:bg-white/20"
          ><Share2 size={17} /></button>
        </div>

        <div className="px-6 pt-6 text-center" role="status">
          <div ref={seal} className="relative mx-auto grid h-[200px] w-[200px] place-items-center">
            {/* Slow gold rays behind the seal. */}
            <motion.span
              aria-hidden="true"
              className="absolute inset-[-30px] rounded-full will-change-transform bg-[repeating-conic-gradient(from_0deg,rgba(255,255,255,0.16)_0deg_6deg,transparent_6deg_18deg)] [mask:radial-gradient(closest-side,#000_20%,transparent_100%)]"
              initial={reduce ? false : { opacity: 0, scale: 0.6 }}
              animate={reduce ? { opacity: 1 } : { opacity: 1, scale: 1, rotate: 90 }}
              transition={{ opacity: { delay: 0.55, duration: 0.6 }, scale: { delay: 0.55, duration: 0.8, ease: 'easeOut' }, rotate: { delay: 0.55, duration: 24, ease: 'linear' } }}
            />
            {/* Shockwaves. */}
            {!reduce && [0, 1, 2].map((i) => (
              <motion.span
                key={i}
                aria-hidden="true"
                className="absolute h-[112px] w-[112px] rounded-full border border-gold-hi"
                initial={{ scale: 0.9, opacity: 0 }}
                animate={{ scale: [0.9, 2.3], opacity: [0.8, 0] }}
                transition={{ delay: 0.78 + i * 0.18, duration: 1.2, ease: 'easeOut' }}
              />
            ))}
            {/* The coin drops, turns over and becomes the seal. */}
            <motion.span
              aria-hidden="true"
              style={{ transformPerspective: 600 }}
              className="relative grid h-[112px] w-[112px] place-items-center overflow-hidden rounded-full bg-[radial-gradient(circle_at_34%_28%,#FFF0C2,#F2CD7E_38%,#D4A441_70%,#9C7020)] shadow-[0_0_0_6px_rgba(242,205,126,0.14),0_18px_50px_rgba(242,205,126,0.35),inset_0_-6px_12px_rgba(110,72,10,0.45),inset_0_4px_8px_rgba(255,255,255,0.5)]"
              initial={reduce ? false : { y: -140, scale: 0.4, rotateY: 0, opacity: 0 }}
              animate={{ y: 0, scale: [0.4, 1.12, 1], rotateY: 720, opacity: 1 }}
              transition={{ duration: 0.85, delay: 0.2, ease: [0.22, 1, 0.36, 1], opacity: { duration: 0.2, delay: 0.2 } }}
            >
              <span className="absolute inset-[7px] rounded-full border border-[#8A6116]/35" />
              <svg width="52" height="52" viewBox="0 0 24 24" fill="none" className="relative text-[#3A2705]">
                <motion.path
                  d="M5 12.5l4.5 4.5L19 7.5"
                  stroke="currentColor"
                  strokeWidth="2.6"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  initial={reduce ? false : { pathLength: 0 }}
                  animate={{ pathLength: 1 }}
                  transition={{ delay: 0.95, duration: 0.4, ease: 'easeOut' }}
                />
              </svg>
              {/* One light sweep across the face. */}
              {!reduce && (
                <motion.span
                  className="absolute inset-y-0 w-10 -skew-x-12 bg-white/50 blur-[3px]"
                  initial={{ x: -110 }}
                  animate={{ x: 110 }}
                  transition={{ delay: 1.3, duration: 0.8, ease: 'easeInOut' }}
                />
              )}
            </motion.span>
            {/* Sparkles that twinkle once around the seal. */}
            {!reduce && SPARKS.map(([x, y, d], i) => (
              <motion.svg key={i} aria-hidden="true" width="14" height="14" viewBox="0 0 10 10" className="absolute text-gold-hi" style={{ left: x, top: y }}
                initial={{ scale: 0, opacity: 0 }} animate={{ scale: [0, 1, 0], opacity: [0, 1, 0], rotate: 45 }}
                transition={{ delay: 0.9 + d, duration: 1.1, ease: 'easeOut' }}>
                <path d="M5 0 6 4 10 5 6 6 5 10 4 6 0 5 4 4z" fill="currentColor" />
              </motion.svg>
            ))}
          </div>
                    <ConfettiWhenReady anchor={seal} />

          <motion.p {...rise(0)} className="mt-1 text-[52px] font-bold leading-tight tracking-[-0.04em] text-white tnum">
            <AnimatedValue value={receipt.rupees} from={0} format={formatRupees} duration={1.1} />
          </motion.p>
          <motion.p {...rise(1)} className="text-[17px] font-medium text-white">is on its way to your bank</motion.p>
          <motion.p {...rise(2)} className="mt-3 inline-flex items-center gap-1.5 rounded-full bg-black/25 px-3 py-1 text-[12px] text-white/80">
            <span className="h-1.5 w-1.5 rounded-full bg-gain motion-safe:animate-pulse" aria-hidden="true" /> Processing · usually instant (illustrative)
          </motion.p>
        </div>

        <dl className="mt-7 px-6">
          {rows.map(([k, v], i) => (
            <motion.div key={k} {...rise(3 + i)} className="flex items-baseline justify-between gap-4 border-b border-white/[0.08] py-3 text-[14px] last:border-0">
              <dt className="text-white/55">{k}</dt>
              <dd className="truncate text-right font-medium text-white tnum">{v}</dd>
            </motion.div>
          ))}
        </dl>

        <motion.div {...rise(9)} className="mt-auto px-6 pt-6">
          <button onClick={onDone} className="h-12 w-full rounded-full bg-white text-[15px] font-semibold text-black hover:bg-white/90">
            Back to wallet
          </button>
          <p className="mt-3 text-center text-[11px] text-white/40">UPI handling and transaction ID are illustrative.</p>
        </motion.div>
      </GreenStage>
    </motion.div>
  )
}

const SPARKS = [['12%', '18%', 0], ['82%', '12%', 0.12], ['90%', '62%', 0.24], ['6%', '70%', 0.18], ['50%', '-2%', 0.3]]

// Confetti needs the seal's position, so it starts once the seal has landed.
function ConfettiWhenReady({ anchor }) {
  const [go, setGo] = useState(false)
  useEffect(() => {
    const t = setTimeout(() => setGo(true), 850)
    return () => clearTimeout(t)
  }, [])
  return go ? <Confetti originRef={anchor} /> : null
}
