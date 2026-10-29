import { motion } from 'framer-motion'
import { ChevronRight, CreditCard, Zap } from 'lucide-react'
import { formatRupees, inAppValue } from '../../lib/scoins.js'

// Progress toward the existing "every 5th UPI payment" bonus. Reward size is illustrative.
// One row says what's next and what it's worth; the bar shows how close; one action moves it.
export default function NextReward({ upi, onPay, showCardHint, onCardHint, first = false }) {
  const left = upi.target - upi.done
  const title = first && upi.done === 0 ? `Make ${upi.target} UPI payments` : `${left} more UPI ${left === 1 ? 'payment' : 'payments'}`
  return (
    <section aria-labelledby="next-reward" className="mx-5 shine-border rounded-card bg-surface p-4">
      <h2 id="next-reward" className="sr-only">{first ? 'Your first reward' : 'Next reward'}</h2>
      <div className="flex items-center gap-3">
        <span className="grid h-10 w-10 shrink-0 place-items-center rounded-full bg-gold/15" aria-hidden="true">
          <Zap size={18} className="text-accent" />
        </span>
        <div className="min-w-0 flex-1">
          <p className="text-[15px] font-medium text-ink">{title}</p>
          <p className="text-[13px] text-ink-3 tnum">
            +{upi.reward} Scoins · {formatRupees(inAppValue(upi.reward))} to spend
          </p>
        </div>
        <button onClick={onPay} className="h-9 shrink-0 rounded-full bg-sunken px-3.5 text-[13px] font-medium text-ink hover:bg-sunken-2">
          Pay via UPI
        </button>
      </div>

      <div className="mt-4 flex items-center gap-3">
        <div
          className="grid flex-1 gap-1"
          style={{ gridTemplateColumns: `repeat(${upi.target}, 1fr)` }}
          role="progressbar"
          aria-valuemin={0}
          aria-valuemax={upi.target}
          aria-valuenow={upi.done}
          aria-label={`${upi.done} of ${upi.target} UPI payments this cycle`}
        >
          {Array.from({ length: upi.target }, (_, i) => (
            <span key={i} className="h-1 overflow-hidden rounded-full bg-sunken">
              <motion.span
                className="block h-full rounded-full bg-gold"
                initial={false}
                animate={{ scaleX: i < upi.done ? 1 : 0 }}
                style={{ originX: 0 }}
                transition={{ type: 'spring', stiffness: 260, damping: 28, delay: i < upi.done ? 0.05 * i : 0 }}
              />
            </span>
          ))}
        </div>
        <span className="text-[12px] text-ink-3 tnum">{upi.done}/{upi.target}</span>
      </div>

      {showCardHint && (
        <button onClick={onCardHint} className="-mx-1 mt-3 flex min-h-[40px] w-[calc(100%+8px)] items-center gap-2.5 rounded-xl px-1 text-left hover:bg-sunken/50">
          <CreditCard size={15} aria-hidden="true" className="shrink-0 text-ink-3" />
          <span className="flex-1 text-[13px] text-ink-2">UPI on an up! credit card earns 10× Scoins</span>
          <ChevronRight size={15} aria-hidden="true" className="text-ink-3" />
        </button>
      )}
      <p className="mt-2 text-[11px] text-ink-3">Payments are simulated · reward values are illustrative</p>
    </section>
  )
}
