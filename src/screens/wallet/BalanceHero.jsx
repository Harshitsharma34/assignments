import { Landmark, PiggyBank, ShoppingBag } from 'lucide-react'
import AnimatedValue from '../../components/AnimatedValue.jsx'
import ScoinGlyph from '../../components/ScoinGlyph.jsx'
import { bankValue, formatRupees, formatScoins, inAppValue } from '../../lib/scoins.js'

// Left column of the hero. The 3D coins sit to its right, so the figure scales down
// for long amounts instead of running under them.
export function HeroBalance({ balance, savedRupees }) {
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
      {empty && savedRupees > 0 && (
        <p className="mt-3 inline-flex items-center gap-1.5 text-[13px] text-accent">
          <PiggyBank size={15} aria-hidden="true" /> Saved {formatRupees(savedRupees)} with Scoins
        </p>
      )}
    </section>
  )
}

// Both values of the same balance, side by side. In-app is marked as the better rate;
// the bank value is always visible and never framed as a loss.
export function ValueCard({ balance, onRates }) {
  return (
    <button
      onClick={onRates}
      aria-label={`Spend on SalarySe ${formatRupees(inAppValue(balance))}, or withdraw ${formatRupees(bankValue(balance))} to bank. How rates work`}
      className="mx-5 grid w-[calc(100%-40px)] grid-cols-2 rounded-card border border-line bg-gradient-to-b from-white/[0.045] to-white/[0.01] py-4 text-left transition-colors hover:border-white/20"
    >
      <Half icon={ShoppingBag} label="On SalarySe" value={inAppValue(balance)} rate="5 Scoins = ₹1" highlight />
      <Half icon={Landmark} label="To your bank" value={bankValue(balance)} rate="10 Scoins = ₹1" divider />
    </button>
  )
}

function Half({ icon: Icon, label, value, rate, highlight, divider }) {
  return (
    <span className={`min-w-0 px-4 ${divider ? 'border-l border-line' : ''}`}>
      <span className="flex items-center gap-1.5 text-[11px] font-medium uppercase tracking-[0.06em] text-ink-2">
        <Icon size={14} aria-hidden="true" className={`shrink-0 ${highlight ? 'text-accent' : 'text-ink-2'}`} />
        <span className="truncate">{label}</span>
      </span>
      <span className="mt-2.5 flex items-center gap-2">
        <span className={`text-[26px] font-semibold leading-none tnum ${highlight ? 'text-accent' : 'text-ink'}`}>
          <AnimatedValue value={value} format={formatRupees} />
        </span>
        {highlight && <span className="whitespace-nowrap rounded-md bg-gain/15 px-1.5 py-1 text-[10px] font-semibold uppercase leading-none tracking-[0.04em] text-gain">2× value</span>}
      </span>
      <span className="mt-2 block text-[12px] text-ink-3 tnum">{rate}</span>
    </span>
  )
}

export function NewUserIntro() {
  return (
    <p className="px-5 text-[15px] leading-relaxed text-ink-2">
      Earn Scoins on payments you already make. Every 5 Scoins is ₹1 off when you spend them on SalarySe.
    </p>
  )
}
