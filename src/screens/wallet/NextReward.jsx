import { motion } from 'framer-motion'
import { ChevronRight, CreditCard, Send, Zap } from 'lucide-react'
import ScoinGlyph from '../../components/ScoinGlyph.jsx'
import { formatRupees, inAppValue } from '../../lib/scoins.js'

// Progress toward the existing "every 5th UPI payment" bonus. Reward size is illustrative.
export default function NextReward({ upi, onPay, showCardHint, onCardHint, first = false }) {
  const left = upi.target - upi.done
  const title = first && upi.done === 0 ? `Make ${upi.target} UPI payments` : `${left} more UPI ${left === 1 ? 'payment' : 'payments'}`
  const sub = first && upi.done === 0
    ? `Every ${upi.target}th UPI payment through SalarySe earns a bonus.`
    : `Make ${left} more UPI ${left === 1 ? 'payment' : 'payments'} to earn +${upi.reward} Scoins.`
  return (
    <section aria-labelledby="next-reward" className="mx-5 rounded-card border border-line bg-gradient-to-b from-white/[0.045] to-white/[0.01] p-5">
      <div className="flex items-center justify-between gap-3">
        <h2 id="next-reward" className="label whitespace-nowrap">{first ? 'Your first reward' : 'Next reward'}</h2>
        <div className="flex items-center gap-2.5">
          <span className="whitespace-nowrap text-[13px] text-ink-3 tnum">{upi.done} of {upi.target}</span>
          <div
            className="flex gap-1"
            role="progressbar"
            aria-valuemin={0}
            aria-valuemax={upi.target}
            aria-valuenow={upi.done}
            aria-label={`${upi.done} of ${upi.target} UPI payments this cycle`}
          >
            {Array.from({ length: upi.target }, (_, i) => (
              <span key={i} className="h-1 w-[15px] overflow-hidden rounded-full bg-sunken-2">
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
        </div>
      </div>

      <div className="mt-4 flex items-start gap-3.5">
        <span className="grid h-11 w-11 shrink-0 place-items-center rounded-full border border-gold/40 bg-sunken" aria-hidden="true">
          <Zap size={19} className="text-accent" />
        </span>
        <p className="min-w-0 flex-1 pt-1.5 font-display text-[20px] leading-snug text-ink">{title}</p>
        <div className="shrink-0 text-right">
          <p className="flex items-center justify-end gap-1 text-[17px] font-semibold text-accent tnum">
            +{upi.reward} <ScoinGlyph size={16} />
          </p>
          <p className="mt-0.5 text-[12px] text-ink-3">≈ {formatRupees(inAppValue(upi.reward))} to spend</p>
        </div>
      </div>

      <p className="mt-2 pl-[58px] text-[13px] leading-relaxed text-ink-2">{sub}</p>

      <motion.button
        whileTap={{ scale: 0.98 }}
        onClick={onPay}
        className="mt-5 flex h-14 w-full items-center gap-3 rounded-2xl border border-line bg-sunken px-2.5 text-left hover:bg-sunken-2"
      >
        <span className="grid h-9 w-9 place-items-center rounded-full bg-sunken-2" aria-hidden="true"><Send size={16} className="text-ink" /></span>
        <span className="flex-1 text-[15px] font-medium text-ink">Make a UPI payment</span>
        <ChevronRight size={18} aria-hidden="true" className="mr-1 text-ink-3" />
      </motion.button>

      {showCardHint && (
        <button onClick={onCardHint} className="mt-2 flex min-h-[44px] w-full items-center gap-3 px-1 text-left">
          <CreditCard size={16} aria-hidden="true" className="shrink-0 text-accent" />
          <span className="flex-1 text-[13px] text-ink-2">UPI on an up! credit card earns 10× Scoins</span>
          <ChevronRight size={16} aria-hidden="true" className="text-ink-3" />
        </button>
      )}
      <p className="mt-1 px-1 text-[11px] text-ink-3">Payments here are simulated. Reward values are illustrative.</p>
    </section>
  )
}
