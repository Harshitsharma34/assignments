import { motion } from 'framer-motion'
import { formatRupees, formatScoins, inAppValue, bankValue } from '../../lib/scoins.js'

// Same Scoins, two values. Neutral framing: both are the user's money and both are available.
export default function RatesExplainer({ balance }) {
  const amount = balance > 0 ? balance : 500
  const options = [
    { label: 'Spend on SalarySe', rate: '5 Scoins = ₹1', value: inAppValue(amount), use: 'Deals, vouchers and bill payments', tone: 'bg-gold', width: 1 },
    { label: 'Withdraw to bank', rate: '10 Scoins = ₹1', value: bankValue(amount), use: 'Sent to your linked bank account', tone: 'bg-ink-3', width: 0.5 },
  ]
  return (
    <div className="text-[14px] text-ink-2">
      <p>{balance > 0 ? 'Your' : 'For example,'} <span className="font-semibold text-ink tnum">{formatScoins(amount)} Scoins</span> {balance > 0 ? 'are worth:' : 'are worth:'}</p>
      <div className="mt-4 space-y-5">
        {options.map((o, i) => (
          <div key={o.label}>
            <div className="flex items-baseline justify-between">
              <span className="font-medium text-ink">{o.label}</span>
              <span className="font-display text-[24px] font-semibold text-ink tnum">{formatRupees(o.value)}</span>
            </div>
            <div className="mt-2 h-2 rounded-full bg-sunken-2">
              <motion.div className={`h-full rounded-full ${o.tone}`} initial={{ width: 0 }} animate={{ width: `${o.width * 100}%` }} transition={{ delay: 0.15 + i * 0.1, duration: 0.6, ease: [0.22, 1, 0.36, 1] }} />
            </div>
            <p className="mt-1.5 flex justify-between text-[12px] text-ink-3"><span>{o.use}</span><span className="tnum">{o.rate}</span></p>
          </div>
        ))}
      </div>
      <p className="mt-6 rounded-xl bg-sunken p-3.5 leading-relaxed">
        Spending on SalarySe gives each Scoin <span className="font-medium text-ink">twice the value</span>. Withdrawing is always available when you'd rather have cash.
      </p>
    </div>
  )
}
