import { ArrowRight, ChevronRight, Package, Receipt, Sandwich, UtensilsCrossed } from 'lucide-react'
import { DEALS } from '../../data/userStates.js'
import ScoinGlyph from '../../components/ScoinGlyph.jsx'
import { formatRupees, formatScoins, inAppValue } from '../../lib/scoins.js'

const ART = { food: Sandwich, dining: UtensilsCrossed, parcel: Package, bill: Receipt }

// Deals the balance covers come first (largest saving first), then the ones still out of reach.
export function rankDeals(balance) {
  const options = DEALS.map((d) => {
    const cost = d.kind === 'bill' ? balance : d.cost
    return { ...d, cost, saving: inAppValue(cost), covered: cost > 0 && cost <= balance }
  }).filter((d) => d.cost > 0)
  const covered = options.filter((o) => o.covered).sort((a, b) => b.saving - a.saving)
  const later = options.filter((o) => !o.covered).sort((a, b) => a.cost - b.cost)
  return [...covered, ...later]
}

export default function PopularDeals({ balance, onSelect, onSeeAll }) {
  const deals = rankDeals(balance)
  return (
    <section aria-labelledby="deals-title">
      <div className="flex items-center justify-between px-5">
        <h2 id="deals-title" className="label">Popular deals</h2>
        <button onClick={onSeeAll} className="-mr-2 inline-flex min-h-[44px] items-center gap-1.5 px-2 text-[14px] text-ink">
          See all <ArrowRight size={15} aria-hidden="true" />
        </button>
      </div>
      <ul className="no-scrollbar flex snap-x snap-mandatory gap-3 overflow-x-auto px-5 pb-1" style={{ scrollPaddingLeft: 20 }}>
        {deals.map((d) => (
          <li key={d.id} className="w-[168px] shrink-0 snap-start">
            <DealCard deal={d} balance={balance} onSelect={() => onSelect(d)} />
          </li>
        ))}
      </ul>
      <p className="mt-2 px-5 text-[11px] text-ink-3">Illustrative deals. Every deal uses 5 Scoins = ₹1.</p>
    </section>
  )
}

function DealCard({ deal, balance, onSelect }) {
  const Art = ART[deal.art]
  const short = deal.cost - balance
  const headline = deal.kind === 'bill' ? `Up to ${formatRupees(deal.saving)}` : `${formatRupees(deal.saving)} off`
  return (
    <button
      onClick={onSelect}
      className="relative flex h-[188px] w-full flex-col overflow-hidden rounded-card border border-line bg-surface p-4 text-left transition-colors hover:border-white/20"
    >
      {/* Line artwork stands in for product photography. */}
      <span aria-hidden="true" className="pointer-events-none absolute -right-5 -top-5 grid h-[116px] w-[116px] place-items-center rounded-full bg-[radial-gradient(circle,rgba(226,182,92,0.16),transparent_70%)]">
        <Art size={58} strokeWidth={1.1} className="text-accent/70" />
      </span>
      <span
        aria-hidden="true"
        className="relative grid h-10 w-10 place-items-center rounded-full text-[18px] font-bold"
        style={{ background: deal.mark.bg, color: deal.mark.fg }}
      >
        {deal.mark.letter}
      </span>
      <span className="relative mt-auto block text-[14px] font-medium text-ink">{deal.brand}</span>
      <span className="relative mt-0.5 block text-[20px] font-semibold leading-tight text-accent tnum">{headline}</span>
      {deal.covered ? (
        <span className="relative mt-1 flex items-center gap-1 whitespace-nowrap pr-9 text-[12px] text-ink-3 tnum"><ScoinGlyph size={12} /> {formatScoins(deal.cost)} Scoins</span>
      ) : (
        <span className="relative mt-1.5 block pr-9">
          <span className="block h-1 overflow-hidden rounded-full bg-sunken-2" aria-hidden="true">
            <span className="block h-full rounded-full bg-gold/70" style={{ width: `${Math.min(100, (balance / deal.cost) * 100)}%` }} />
          </span>
          <span className="mt-1 block text-[11px] text-ink-3 tnum">{formatScoins(short)} more Scoins</span>
        </span>
      )}
      <span aria-hidden="true" className="absolute bottom-4 right-4 grid h-7 w-7 place-items-center rounded-full border border-line bg-sunken">
        <ChevronRight size={16} className="text-ink" />
      </span>
    </button>
  )
}
