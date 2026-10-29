import { Info, PiggyBank } from 'lucide-react'
import AnimatedValue from '../../components/AnimatedValue.jsx'
import ScoinGlyph from '../../components/ScoinGlyph.jsx'
import { bankValue, formatRupees, formatScoins, inAppValue } from '../../lib/scoins.js'

// Left column of the hero. The 3D coins sit to its right, so the figure scales down
// for long amounts instead of running under them.
export function HeroBalance({ balance, savedRupees, onRates }) {
  const rupees = formatRupees(inAppValue(balance))
  const size = rupees.length > 7 ? 'text-[44px]' : rupees.length > 5 ? 'text-[54px]' : 'text-[66px]'
  const empty = balance === 0
  return (
    <section aria-labelledby="balance-label" className="px-5 pt-3">
      <p id="balance-label" className="whitespace-nowrap text-[11px] font-medium uppercase tracking-[0.16em] text-ink-2">Your rewards balance</p>
      <p className={`mt-4 max-w-[52%] font-display font-semibold leading-[0.95] tracking-[-0.035em] tnum ${size} ${empty ? 'text-ink-2' : 'text-ink'}`}>
        <AnimatedValue value={inAppValue(balance)} format={formatRupees} />
      </p>
      <p className="mt-3 flex items-center gap-2 text-[17px]">
        <ScoinGlyph size={18} />
        <span className="font-semibold text-ink tnum"><AnimatedValue value={balance} format={formatScoins} /></span>
        <span className="font-display text-ink-2">Scoins</span>
      </p>
      {/* The bank value stays visible, one tap from the full rate explanation. */}
      <button onClick={onRates} className="-ml-1 mt-0.5 inline-flex min-h-[44px] items-center gap-1.5 px-1 text-[13px] text-ink-3 hover:text-ink-2">
        {empty ? (
          <span>5 Scoins = ₹1 on SalarySe</span>
        ) : (
          <span className="tnum">or <span className="font-medium text-ink-2"><AnimatedValue value={bankValue(balance)} format={formatRupees} /></span> to your bank</span>
        )}
        <Info size={13} aria-hidden="true" />
        <span className="sr-only">How Scoin rates work</span>
      </button>
      {empty && savedRupees > 0 && (
        <p className="mt-3 inline-flex items-center gap-1.5 text-[13px] text-accent">
          <PiggyBank size={15} aria-hidden="true" /> Saved {formatRupees(savedRupees)} with Scoins
        </p>
      )}
    </section>
  )
}

export function NewUserIntro() {
  return (
    <p className="px-5 text-[15px] leading-relaxed text-ink-2">
      Earn Scoins on payments you already make. Every 5 Scoins is ₹1 off when you spend them on SalarySe.
    </p>
  )
}
