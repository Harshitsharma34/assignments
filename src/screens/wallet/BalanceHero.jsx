import { Info, PiggyBank } from 'lucide-react'
import AnimatedValue from '../../components/AnimatedValue.jsx'
import ScoinGlyph from '../../components/ScoinGlyph.jsx'
import { bankValue, formatRupees, formatScoins, inAppValue } from '../../lib/scoins.js'

// Centred balance: one label, one number, one pill. The coins sit above it.
export function HeroBalance({ balance, savedRupees, onRates }) {
  const empty = balance === 0
  return (
    <section aria-labelledby="balance-label" className="px-5 text-center">
      <p id="balance-label" className="flex items-center justify-center gap-1.5 text-[14px] text-ink-2">
        <ScoinGlyph size={14} /> <span className="tnum"><AnimatedValue value={balance} format={formatScoins} /></span> Scoins
      </p>
      <p className={`mt-1 text-[48px] font-semibold leading-[1.05] tracking-[-0.03em] tnum ${empty ? 'text-ink-2' : 'text-ink'}`}>
        <AnimatedValue value={inAppValue(balance)} format={formatRupees} />
      </p>
      <p className="text-[13px] text-ink-3">to spend on SalarySe</p>
      {/* The bank value stays visible, one tap from the full rate explanation. */}
      <button onClick={onRates} className="mt-3 inline-flex h-9 items-center gap-1.5 rounded-full bg-sunken px-3.5 text-[13px] text-ink-2 hover:bg-sunken-2">
        {empty ? (
          <span>5 Scoins = ₹1 on SalarySe</span>
        ) : (
          <span className="tnum">or <span className="font-medium text-ink"><AnimatedValue value={bankValue(balance)} format={formatRupees} /></span> to your bank</span>
        )}
        <Info size={13} aria-hidden="true" />
        <span className="sr-only">How Scoin rates work</span>
      </button>
      {empty && savedRupees > 0 && (
        <p className="mt-3 flex items-center justify-center gap-1.5 text-[13px] text-accent">
          <PiggyBank size={15} aria-hidden="true" /> Saved {formatRupees(savedRupees)} with Scoins so far
        </p>
      )}
    </section>
  )
}

export function NewUserIntro() {
  return (
    <p className="mx-auto max-w-[320px] px-5 text-center text-[14px] leading-relaxed text-ink-2">
      Earn Scoins on payments you already make. Every 5 Scoins is ₹1 off when you spend them on SalarySe.
    </p>
  )
}
