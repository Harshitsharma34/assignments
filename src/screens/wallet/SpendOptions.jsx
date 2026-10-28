import { ChevronRight, Receipt } from 'lucide-react'
import { DEALS } from '../../data/userStates.js'
import ScoinGlyph from '../../components/ScoinGlyph.jsx'
import { formatRupees, formatScoins, inAppValue } from '../../lib/scoins.js'

// Ranked by what the balance can actually cover, then the closest one still out of reach.
export function rankDeals(balance) {
  const options = DEALS.map((d) => {
    const cost = d.kind === 'bill' ? balance : d.cost
    return { ...d, cost, saving: inAppValue(cost), covered: cost > 0 && cost <= balance }
  })
  const covered = options.filter((o) => o.covered).sort((a, b) => b.saving - a.saving)
  const nearest = options.filter((o) => !o.covered && o.kind !== 'bill').sort((a, b) => a.cost - b.cost)[0]
  return { covered, nearest }
}

export default function SpendOptions({ balance, onSelect, onSeeAll }) {
  const { covered, nearest } = rankDeals(balance)
  return (
    <section aria-labelledby="spend-title" className="px-5">
      <div className="flex items-baseline justify-between">
        <h2 id="spend-title" className="text-[17px] font-semibold text-ink">Use your {formatRupees(inAppValue(balance))}</h2>
        <button onClick={onSeeAll} className="-mr-2 min-h-[44px] px-2 text-[14px] text-accent">See all</button>
      </div>
      <p className="mt-0.5 text-[13px] text-ink-3">Illustrative deals · full 5 Scoins = ₹1 value</p>

      <ul className="mt-3 overflow-hidden rounded-card border border-line bg-surface">
        {covered.slice(0, 3).map((d, i) => (
          <li key={d.id} className={i > 0 ? 'border-t border-line' : ''}>
            <button onClick={() => onSelect(d)} className="flex w-full items-center gap-3.5 px-4 py-3.5 text-left hover:bg-sunken">
              <BrandTile deal={d} />
              <span className="min-w-0 flex-1">
                <span className="block truncate text-[15px] font-medium text-ink">{d.kind === 'bill' ? 'Pay part of any bill' : `${d.brand} · ${d.title}`}</span>
                <span className="mt-0.5 flex items-center gap-1 text-[13px] text-ink-3 tnum">
                  Uses {formatScoins(d.cost)} <ScoinGlyph size={11} /> · {formatScoins(balance - d.cost)} left
                </span>
              </span>
              <span className="text-right">
                <span className="block text-[15px] font-semibold text-ink tnum">{d.kind === 'bill' ? 'Up to ' : ''}{formatRupees(d.saving)}</span>
                <span className="block text-[12px] text-ink-3">off</span>
              </span>
            </button>
          </li>
        ))}
        {nearest && (
          <li className={covered.length ? 'border-t border-line' : ''}>
            <button onClick={() => onSelect(nearest)} className="flex w-full items-center gap-3.5 px-4 py-3.5 text-left opacity-80 hover:bg-sunken">
              <BrandTile deal={nearest} />
              <span className="min-w-0 flex-1">
                <span className="block truncate text-[15px] font-medium text-ink">{nearest.brand} · {nearest.title}</span>
                <span className="mt-1.5 block h-1 overflow-hidden rounded-full bg-sunken-2" aria-hidden="true">
                  <span className="block h-full rounded-full bg-gold-lo" style={{ width: `${Math.min(100, (balance / nearest.cost) * 100)}%` }} />
                </span>
                <span className="mt-1 block text-[12px] text-ink-3 tnum">{formatScoins(nearest.cost - balance)} more Scoins needed</span>
              </span>
              <ChevronRight size={16} aria-hidden="true" className="text-ink-3" />
            </button>
          </li>
        )}
      </ul>
    </section>
  )
}

function BrandTile({ deal }) {
  if (deal.kind === 'bill') {
    return <span className="grid h-10 w-10 shrink-0 place-items-center rounded-xl bg-sunken-2 text-ink-2" aria-hidden="true"><Receipt size={18} /></span>
  }
  return (
    <span className="grid h-10 w-10 shrink-0 place-items-center rounded-xl bg-sunken-2 text-[15px] font-semibold text-ink" aria-hidden="true">
      {deal.brand[0]}
    </span>
  )
}
