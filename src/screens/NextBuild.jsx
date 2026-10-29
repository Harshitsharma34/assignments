import { ArrowLeft } from 'lucide-react'
import ScoinGlyph from '../components/ScoinGlyph.jsx'
import { bankValue, formatRupees, formatScoins, inAppValue } from '../lib/scoins.js'

const COPY = {
  earn: { title: 'Earn Scoins', screen: 'Screen B', points: ['Current ways to earn, each with action, Scoins, limits and progress', 'Proposed mechanics, clearly labelled as proposals', 'Card multipliers explained in context'] },
  spend: { title: 'Spend Scoins', screen: 'Screen C', points: ['Deal discovery ranked by what your balance covers', 'Review with Scoins deducted and ₹ saved', 'Confirmation with updated balance'] },
  withdraw: { title: 'Withdraw to bank', screen: 'Screen C', points: ['Amount picker with exact ₹ at 10 Scoins = ₹1', 'Neutral side-by-side with in-app value', 'Receipt that repeats the exact amount'] },
}

// Placeholder for screens that come in the next build step. Conversion shown is live.
export default function NextBuild({ route, balance, selected, onBack }) {
  const c = COPY[route]
  return (
    <div className="min-h-full px-5 pb-10 pt-11">
      <header className="-mx-2 flex h-[52px] items-center gap-2">
        <button onClick={onBack} aria-label="Back to wallet" className="grid h-11 w-11 place-items-center rounded-full text-ink hover:bg-surface"><ArrowLeft size={22} /></button>
        <h1 className="text-[16px] font-semibold text-ink">{c.title}</h1>
      </header>
      <p className="mt-6 flex items-center gap-1.5 text-[14px] text-ink-2">
        <ScoinGlyph /> {formatScoins(balance)} Scoins · {formatRupees(inAppValue(balance))} on SalarySe · {formatRupees(bankValue(balance))} to bank
      </p>
      {selected != null && (
        <p className="mt-4 rounded-card border border-line bg-surface p-4 text-[15px] text-ink tnum">
          Selected: {formatScoins(selected)} Scoins = {formatRupees(route === 'withdraw' ? bankValue(selected) : inAppValue(selected))}
          {route === 'withdraw' ? ' to your bank' : ' on SalarySe'}
        </p>
      )}
      <div className="mt-6 rounded-card border border-dashed border-line p-5">
        <p className="label">{c.screen} · next build step</p>
        <ul className="mt-3 list-disc space-y-2 pl-5 text-[14px] leading-relaxed text-ink-2">
          {c.points.map((p) => <li key={p}>{p}</li>)}
        </ul>
      </div>
    </div>
  )
}
