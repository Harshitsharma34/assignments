import { motion } from 'framer-motion'
import { ChevronRight, CreditCard, Send } from 'lucide-react'
import ScoinGlyph from '../../components/ScoinGlyph.jsx'
import { formatRupees, inAppValue } from '../../lib/scoins.js'

// Progress toward the existing "every 5th UPI payment" bonus. Reward size is illustrative.
export default function NextReward({ upi, onPay, showCardHint, onCardHint, first = false }) {
  const left = upi.target - upi.done
  return (
    <section aria-labelledby="next-reward" className="mx-5 rounded-card border border-line bg-ink-850 p-5">
      <div className="flex items-center justify-between">
        <h2 id="next-reward" className="label">{first ? 'Your first reward' : 'Next reward'}</h2>
        <span className="text-[11px] text-fg-3">Illustrative values</span>
      </div>

      <div className="mt-3 flex items-start justify-between gap-4">
        <p className="text-[19px] font-semibold leading-snug text-fg">
          {upi.done === 0 && first ? `Make ${upi.target} UPI payments` : `${left} more UPI ${left === 1 ? 'payment' : 'payments'}`}
        </p>
        <div className="shrink-0 text-right">
          <p className="flex items-center justify-end gap-1 text-[15px] font-semibold text-gold-hi tnum">
            +{upi.reward} <ScoinGlyph size={14} />
          </p>
          <p className="text-[12px] text-fg-3">{formatRupees(inAppValue(upi.reward))} to spend</p>
        </div>
      </div>

      <div
        className="mt-4 grid gap-1.5"
        style={{ gridTemplateColumns: `repeat(${upi.target}, 1fr)` }}
        role="progressbar"
        aria-valuemin={0}
        aria-valuemax={upi.target}
        aria-valuenow={upi.done}
        aria-label={`${upi.done} of ${upi.target} UPI payments this cycle`}
      >
        {Array.from({ length: upi.target }, (_, i) => (
          <div key={i} className="h-1.5 overflow-hidden rounded-full bg-ink-700">
            <motion.div
              className="h-full rounded-full bg-gold"
              initial={false}
              animate={{ scaleX: i < upi.done ? 1 : 0 }}
              style={{ originX: 0 }}
              transition={{ type: 'spring', stiffness: 260, damping: 28, delay: i < upi.done ? 0.05 * i : 0 }}
            />
          </div>
        ))}
      </div>
      <p className="mt-2 text-[12px] text-fg-3 tnum">{upi.done} of {upi.target} this cycle</p>

      <p className="mt-3 text-[14px] leading-relaxed text-fg-2">
        Pay any shop or contact with SalarySe UPI. Every {upi.target}th payment earns a bonus, then the count starts again.
      </p>

      <motion.button
        whileTap={{ scale: 0.98 }}
        onClick={onPay}
        className={`mt-4 flex h-12 w-full items-center justify-center gap-2 rounded-xl text-[15px] font-medium ${first ? 'bg-gold font-semibold text-gold-ink hover:bg-gold-hi' : 'bg-ink-700 text-fg hover:bg-ink-600'}`}
      >
        <Send size={16} aria-hidden="true" /> Make a UPI payment
        <span className="text-[12px] font-normal opacity-70">(simulated)</span>
      </motion.button>

      {showCardHint && (
        <button onClick={onCardHint} className="mt-3 flex min-h-[44px] w-full items-center gap-3 border-t border-line pt-3 text-left">
          <CreditCard size={16} aria-hidden="true" className="shrink-0 text-gold" />
          <span className="flex-1 text-[13px] text-fg-2">UPI on an up! credit card earns 10× Scoins</span>
          <ChevronRight size={16} aria-hidden="true" className="text-fg-3" />
        </button>
      )}
    </section>
  )
}
