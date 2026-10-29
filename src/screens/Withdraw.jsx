import { useEffect, useRef, useState } from 'react'
import { ArrowLeft, Loader2 } from 'lucide-react'
import AnimatedValue from '../components/AnimatedValue.jsx'
import ScoinGlyph from '../components/ScoinGlyph.jsx'
import Sheet from '../components/Sheet.jsx'
import SwipeToConfirm from '../components/SwipeToConfirm.jsx'
import { bankValue, formatRupees, formatScoins, inAppValue } from '../lib/scoins.js'
import { SuccessView } from './flow.jsx'
import { STEP, TickSlider, snapScoins } from './wallet/ScoinCalculator.jsx'

// Withdraw follows SalarySe's existing transfer flow: amount and UPI ID, swipe to transfer,
// OTP, processing, then the success sheet. Added on top: the exact rupees at 10 Scoins = ₹1,
// the in-app value shown as information, validation before the swipe unlocks, and a
// reconciled balance afterwards.
const PHONE = '+91 98•••••828' // illustrative
const PICKS = [['25%', 0.25], ['50%', 0.5], ['All', 1]]
const UPI_RE = /^[a-zA-Z0-9._-]{2,256}@[a-zA-Z]{2,64}$/

export default function Withdraw({ balance, selected, dispatch, failNext, onFailUsed, onBack, onSpend, onEarn, notify }) {
  const max = Math.floor(balance / STEP) * STEP
  const [scoins, setScoins] = useState(() => (max >= STEP ? snapScoins(selected ?? max, max) : 0))
  const [upi, setUpi] = useState('')
  const [touched, setTouched] = useState(false)
  const [step, setStep] = useState('form') // form | otp | processing | success
  const [receipt, setReceipt] = useState(null)
  const rupees = bankValue(scoins)
  const upiValid = UPI_RE.test(upi.trim())
  const ready = max >= STEP && scoins >= STEP && upiValid

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

  return (
    <div className="min-h-full pb-10">
      {/* SalarySe's blue header: the page title, the balance and the bank rate. */}
      <header className="bg-brand px-4 pb-5 pt-12 text-white">
        <div className="flex items-center gap-3">
          <button onClick={onBack} aria-label="Back to wallet" className="grid h-10 w-10 place-items-center rounded-full bg-white/15 hover:bg-white/25">
            <ArrowLeft size={19} />
          </button>
          <h1 className="text-[16px] font-semibold">Transfer Scoins to bank account</h1>
        </div>
        <div className="mt-5 flex items-end justify-between">
          <div>
            <p className="text-[12px] text-white/75">Current balance</p>
            <p className="mt-0.5 flex items-center gap-1.5 text-[18px] font-semibold tnum"><ScoinGlyph size={17} /> {formatScoins(balance)}</p>
          </div>
          <span className="flex items-center gap-1.5 rounded-full bg-white/15 px-3 py-1.5 text-[14px] font-semibold tnum">
            <ScoinGlyph size={15} /> 10 = ₹1
          </span>
        </div>
      </header>

      {max < STEP ? (
        <div className="mx-5 mt-6 shine-border rounded-card bg-surface p-5 text-center">
          <p className="text-[15px] font-medium text-ink">No Scoins to withdraw yet</p>
          <p className="mt-1 text-[13px] text-ink-2">Withdrawals start from {STEP} Scoins ({formatRupees(bankValue(STEP))}).</p>
          <button onClick={onEarn} className="mt-4 h-10 rounded-full bg-sunken px-4 text-[14px] font-medium text-ink hover:bg-sunken-2">See ways to earn</button>
        </div>
      ) : (
        <div className="px-5">
          <section className="mt-5 shine-border rounded-card bg-surface p-4" aria-label="Transfer amount">
            <p className="text-[13px] text-ink-3">You'll receive</p>
            <p className="mt-0.5 text-[40px] font-semibold tracking-[-0.03em] text-ink tnum">
              <AnimatedValue value={rupees} format={formatRupees} duration={0.35} />
            </p>
            <p className="flex items-center gap-1.5 text-[13px] text-ink-2 tnum"><ScoinGlyph size={13} /> {formatScoins(scoins)} Scoins at 10 Scoins = ₹1</p>
            <TickSlider value={scoins} max={max} onChange={setScoins} label="Scoins to transfer" />
            <div className="mt-1 flex gap-1" role="group" aria-label="Quick amounts">
              {PICKS.map(([label, share]) => {
                const v = snapScoins(max * share, max)
                return (
                  <button key={label} onClick={() => setScoins(v)} aria-pressed={v === scoins}
                    className={`h-9 min-w-[60px] rounded-full px-3 text-[13px] tnum ${v === scoins ? 'bg-sunken font-semibold text-ink' : 'text-ink-3 hover:text-ink'}`}>
                    {label}
                  </button>
                )
              })}
            </div>
          </section>

          <button onClick={onSpend} className="mt-2 flex w-full items-center justify-between rounded-2xl px-4 py-3 text-left text-[13px] text-ink-2 hover:bg-surface">
            <span className="tnum">Worth <span className="font-semibold text-accent">{formatRupees(inAppValue(scoins))}</span> on SalarySe</span>
            <span className="text-accent">Spend instead</span>
          </button>

          <section className="mt-2">
            <label htmlFor="upi" className="text-[13px] text-ink-3">Your UPI ID</label>
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
              className={`mt-1.5 h-12 w-full rounded-xl border bg-surface px-4 text-[16px] text-ink placeholder:text-ink-3 focus:outline-none ${touched && !upiValid ? 'border-danger' : 'border-line focus:border-brand'}`}
            />
            <p id="upi-help" className={`mt-1.5 text-[12px] ${touched && !upiValid ? 'text-danger' : 'text-ink-3'}`}>
              {touched && !upiValid ? 'That doesn’t look like a UPI ID. It should look like name@bank.' : 'Use the UPI ID linked to your bank account.'}
            </p>
          </section>

          <div className="mt-6">
            <SwipeToConfirm label={`Swipe to get ${formatRupees(rupees)}`} disabled={!ready} onConfirm={() => setStep('otp')} />
          </div>
        </div>
      )}

      {/* Success: the earlier sheet design, with the gold badge, confetti and count-up. */}
      <Sheet open={step === 'success'} onClose={onBack} title="Requested">
        {receipt && (
          <SuccessView
            amount={receipt.rupees}
            format={formatRupees}
            suffix="on its way"
            lines={[`To ${receipt.to}`, `${formatScoins(receipt.scoins)} Scoins withdrawn · ${formatScoins(receipt.left)} left`]}
            onDone={onBack}
          >
            <p className="mx-auto mt-4 inline-block rounded-full bg-sunken px-3 py-1.5 text-[13px] text-ink-2">Status: processing (illustrative)</p>
          </SuccessView>
        )}
      </Sheet>

      <Sheet open={step === 'otp'} onClose={() => setStep('form')} title="Enter OTP to confirm">
        <Otp
          summary={`${formatRupees(rupees)} · ${formatScoins(scoins)} Scoins to ${upi.trim()}`}
          failNext={failNext}
          onFailUsed={onFailUsed}
          onVerified={finish}
        />
      </Sheet>
    </div>
  )
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
            className={`h-12 w-full rounded-xl border bg-sunken text-center text-[18px] font-semibold text-ink tnum focus:outline-none ${status === 'error' ? 'border-danger' : d ? 'border-ink/40' : 'border-line focus:border-brand'}`}
          />
        ))}
      </div>
      <p className={`mt-3 text-center text-[13px] ${status === 'error' ? 'text-danger' : 'text-ink-3'}`} role={status === 'error' ? 'alert' : undefined}>
        {status === 'error'
          ? 'That OTP didn’t match. No Scoins were withdrawn. Try again.'
          : seconds > 0
          ? `Resend OTP in 00:${String(seconds).padStart(2, '0')}`
          : <button onClick={() => setSeconds(30)} className="font-medium text-brand-hi">Resend OTP</button>}
      </p>
      <p className="mt-1 text-center text-[11px] text-ink-3">Prototype: any 6 digits work.</p>
      <button
        onClick={verify}
        disabled={code.length < 6 || status === 'checking'}
        className="mt-5 flex h-12 w-full items-center justify-center gap-2 rounded-2xl bg-brand text-[15px] font-semibold text-white transition-colors hover:bg-brand-hi disabled:bg-sunken disabled:text-ink-3"
      >
        {status === 'checking' && <Loader2 size={17} className="motion-safe:animate-spin" aria-hidden="true" />}
        {status === 'checking' ? 'Verifying…' : 'Verify and proceed'}
      </button>
    </div>
  )
}

function Processing({ rupees, to }) {
  return (
    <div className="flex min-h-full flex-col px-5 pt-16" role="status" aria-live="polite">
      <div className="shine-border rounded-card bg-surface p-6 text-center">
        <Loader2 size={40} className="mx-auto text-gold motion-safe:animate-spin" aria-hidden="true" />
        <p className="mt-4 text-[20px] font-semibold text-ink tnum">Processing transfer of {formatRupees(rupees)}</p>
        <div className="mt-5 border-t border-line pt-4 text-left">
          <p className="text-[12px] text-ink-3">To</p>
          <p className="text-[15px] font-medium text-ink">{to}</p>
        </div>
      </div>
      <p className="mt-4 text-center text-[13px] text-ink-3">Please don’t go back or close the app.</p>
    </div>
  )
}
