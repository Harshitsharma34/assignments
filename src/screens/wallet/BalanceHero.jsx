import { Info, Landmark, PiggyBank } from 'lucide-react'
import AnimatedValue from '../../components/AnimatedValue.jsx'
import ScoinGlyph from '../../components/ScoinGlyph.jsx'
import { bankValue, formatRupees, formatScoins, inAppValue } from '../../lib/scoins.js'

export function BalanceHero({ balance, savedRupees, onRates }) {
  const empty = balance === 0
  return (
    <section aria-labelledby="balance-label" className="px-5 text-center">
      <p id="balance-label" className="label">Available to spend on SalarySe</p>
      <p className={`mt-2 font-display text-[56px] font-semibold leading-none tracking-[-0.035em] tnum ${empty ? 'text-fg-2' : 'text-fg'}`}>
        <AnimatedValue value={inAppValue(balance)} format={formatRupees} />
      </p>
      <p className="mt-3 flex items-center justify-center gap-1.5 text-[15px] text-fg-2">
        <ScoinGlyph size={15} />
        <span><span className="font-semibold text-fg tnum"><AnimatedValue value={balance} format={formatScoins} /></span> Scoins</span>
        <span aria-hidden="true" className="text-fg-3">·</span>
        <span>5 Scoins = ₹1</span>
      </p>

      {empty && savedRupees > 0 ? (
        <p className="mx-auto mt-4 inline-flex items-center gap-2 rounded-full bg-gold-wash px-3.5 py-2 text-[13px] text-gold-hi">
          <PiggyBank size={15} aria-hidden="true" />
          You've saved {formatRupees(savedRupees)} with Scoins so far
        </p>
      ) : (
        <button
          onClick={onRates}
          className="mx-auto mt-4 inline-flex min-h-[40px] items-center gap-2 rounded-full border border-line bg-ink-850 px-3.5 text-[13px] text-fg-2 transition-colors hover:text-fg"
        >
          <Landmark size={14} aria-hidden="true" className="text-fg-3" />
          <span>
            or <span className="font-medium text-fg tnum"><AnimatedValue value={bankValue(balance)} format={formatRupees} /></span> to your bank · 10 Scoins = ₹1
          </span>
          <Info size={14} aria-hidden="true" className="text-fg-3" />
          <span className="sr-only">How Scoin rates work</span>
        </button>
      )}
    </section>
  )
}

export function NewUserHero() {
  return (
    <section aria-labelledby="new-title" className="px-6 text-center">
      <h1 id="new-title" className="font-display text-[26px] font-semibold leading-[1.15] tracking-[-0.02em] text-fg text-balance">
        Earn money back on payments you already make
      </h1>
      <p className="mx-auto mt-3 max-w-[300px] text-[15px] leading-relaxed text-fg-2">
        Scoins are SalarySe rewards. Every 5 Scoins is ₹1 off when you spend them on SalarySe.
      </p>
      <p className="mx-auto mt-4 inline-flex items-center gap-1.5 rounded-full border border-line px-3 py-1.5 text-[13px] text-fg-2">
        <ScoinGlyph size={13} /> Balance <span className="font-medium text-fg tnum">0 Scoins · ₹0</span>
      </p>
    </section>
  )
}
