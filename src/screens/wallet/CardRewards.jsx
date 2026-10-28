import { Clock3, CreditCard, Info } from 'lucide-react'
import ScoinGlyph from '../../components/ScoinGlyph.jsx'
import { formatRupees, formatScoins, inAppValue } from '../../lib/scoins.js'

// Cardholders: where the balance comes from, and what is still pending from the card cycle.
export default function CardRewards({ balance, card, onExplain }) {
  const fromActivity = Math.max(0, balance - card.converted)
  const total = balance + card.cycleEstimate
  const pct = (n) => `${(n / total) * 100}%`
  return (
    <section aria-labelledby="breakdown" className="mx-5 rounded-card border border-line bg-surface p-5">
      <div className="flex items-center justify-between">
        <h2 id="breakdown" className="label">Your balance</h2>
        <button onClick={onExplain} className="-mr-2 inline-flex min-h-[44px] items-center gap-1 px-2 text-[13px] text-ink-2 hover:text-ink">
          <Info size={14} aria-hidden="true" /> How card rewards work
        </button>
      </div>

      <div className="mt-2 flex h-2 gap-0.5 overflow-hidden rounded-full" aria-hidden="true">
        <div className="bg-gold" style={{ width: pct(fromActivity) }} />
        <div className="bg-gold-lo" style={{ width: pct(card.converted) }} />
        <div className="rounded-r-full border border-dashed border-ink-3/60" style={{ width: pct(card.cycleEstimate) }} />
      </div>

      <dl className="mt-4 space-y-3 text-[14px]">
        <Row swatch="bg-gold" label="From SalarySe activity" scoins={fromActivity} />
        <Row swatch="bg-gold-lo" label={`From ${card.name}`} sub={`${card.statement} statement · 1 point = 1 Scoin`} scoins={card.converted} />
      </dl>

      <div className="mt-4 flex gap-3 rounded-xl bg-sunken p-3.5">
        <Clock3 size={17} aria-hidden="true" className="mt-0.5 shrink-0 text-ink-2" />
        <div className="flex-1">
          <p className="flex items-baseline justify-between text-[14px] font-medium text-ink">
            <span>{formatScoins(card.cycleEstimate)} points pending</span>
            <span className="text-[13px] font-normal text-ink-3 tnum">≈ {formatRupees(inAppValue(card.cycleEstimate))}</span>
          </p>
          <p className="mt-1 text-[13px] leading-relaxed text-ink-2">
            Earned this billing cycle. They become spendable Scoins after your {card.nextStatement} statement, subject to card terms.
          </p>
        </div>
      </div>
    </section>
  )
}

function Row({ swatch, label, sub, scoins }) {
  return (
    <div className="flex items-start gap-3">
      <span className={`mt-1.5 h-2 w-2 shrink-0 rounded-full ${swatch}`} aria-hidden="true" />
      <dt className="flex-1 text-ink-2">
        {label}
        {sub && <span className="block text-[12px] text-ink-3">{sub}</span>}
      </dt>
      <dd className="text-right">
        <span className="inline-flex items-center gap-1 font-medium text-ink tnum">{formatScoins(scoins)} <ScoinGlyph size={12} /></span>
        <span className="block text-[12px] text-ink-3 tnum">{formatRupees(inAppValue(scoins))}</span>
      </dd>
    </div>
  )
}

export function CardExplainer({ card }) {
  return (
    <div className="space-y-4 text-[14px] leading-relaxed text-ink-2">
      <p>Your {card.name} earns reward points on card spends. Points are separate from Scoins until your statement is generated.</p>
      <ol className="space-y-3">
        {[
          ['Earned', 'Points build up through the billing cycle. You can see them here as pending.'],
          ['Statement generated', `On ${card.nextStatement}, the cycle's points are confirmed.`],
          ['Added as Scoins', '1 point becomes 1 Scoin, ready to spend at 5 Scoins = ₹1.'],
        ].map(([t, d], i) => (
          <li key={t} className="flex gap-3">
            <span className="grid h-6 w-6 shrink-0 place-items-center rounded-full bg-sunken-2 text-[12px] font-semibold text-ink">{i + 1}</span>
            <span><span className="font-medium text-ink">{t}.</span> {d}</span>
          </li>
        ))}
      </ol>
      <p className="text-[12px] text-ink-3">Conversion and timing shown here follow the current product screens and remain subject to card terms.</p>
    </div>
  )
}
