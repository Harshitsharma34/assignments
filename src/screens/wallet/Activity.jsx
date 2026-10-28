import { AnimatePresence, motion } from 'framer-motion'
import { ArrowRight, ChevronRight, Clock3 } from 'lucide-react'
import ScoinGlyph from '../../components/ScoinGlyph.jsx'
import { formatWhen } from '../../lib/format.js'
import { bankValue, formatRupees, formatScoins, formatSigned, inAppValue } from '../../lib/scoins.js'
import { KIND_ICON } from './kinds.js'

// The wallet shows the three most recent rows; "See all" opens the full month in a sheet.
export function RecentActivity({ rows, pending, onOpen, onSeeAll }) {
  const recent = [...pending.map((p) => ({ ...p, pending: true })), ...rows].slice(0, 3)
  return (
    <section aria-labelledby="activity-title" className="px-5">
      <div className="flex items-center justify-between">
        <h2 id="activity-title" className="label">Recent activity</h2>
        <button onClick={onSeeAll} className="-mr-2 inline-flex min-h-[44px] items-center gap-1.5 px-2 text-[14px] text-ink">
          See all <ArrowRight size={15} aria-hidden="true" />
        </button>
      </div>
      <ul className="mt-1 overflow-hidden rounded-card border border-line bg-gradient-to-b from-white/[0.04] to-white/[0.01]">
        <AnimatePresence initial={false}>
          {recent.map((r) => <Row key={r.id} item={r} pending={r.pending} onOpen={() => onOpen(r)} />)}
        </AnimatePresence>
      </ul>
    </section>
  )
}

export default function Activity({ rows, pending, monthEarned, monthSpent, onOpen }) {
  return (
    <div>
      <p className="text-[13px] text-ink-3">October 2026</p>
      <dl className={`mt-3 grid gap-2 text-[12px] ${pending.length ? 'grid-cols-3' : 'grid-cols-2'}`}>
        <Stat label="Earned" value={`+${formatScoins(monthEarned)}`} />
        <Stat label="Spent" value={formatScoins(monthSpent)} />
        {pending.length > 0 && <Stat label="Pending" value={`+${formatScoins(pending.reduce((a, p) => a + p.scoins, 0))}`} muted />}
      </dl>
      <ul className="mt-3 overflow-hidden rounded-card border border-line">
        {pending.map((p) => <Row key={p.id} item={p} pending onOpen={() => onOpen({ ...p, pending: true })} />)}
        {rows.map((r) => <Row key={r.id} item={r} onOpen={() => onOpen(r)} />)}
      </ul>
    </div>
  )
}

function Stat({ label, value, muted }) {
  return (
    <div className="rounded-xl bg-sunken px-3 py-2.5">
      <dt className="text-ink-3">{label}</dt>
      <dd className={`mt-0.5 flex items-center gap-1 text-[14px] font-semibold tnum ${muted ? 'text-ink-2' : 'text-ink'}`}>
        {value} <ScoinGlyph size={11} />
      </dd>
    </div>
  )
}

// Rupees lead, Scoins follow: "+₹60 / +300 Scoins". Redemptions read as savings, not losses.
function Row({ item, pending, onOpen }) {
  const Icon = pending ? Clock3 : KIND_ICON[item.kind]
  const isSpend = item.scoins < 0
  const rupees = formatRupees(inAppValue(Math.abs(item.scoins)))
  return (
    <motion.li
      layout
      initial={item.fresh ? { opacity: 0, height: 0, backgroundColor: 'rgba(226,182,92,0.16)' } : false}
      animate={{ opacity: 1, height: 'auto', backgroundColor: 'rgba(226,182,92,0)' }}
      transition={{ duration: 0.5, backgroundColor: { duration: 2.4 } }}
      className="border-t border-line first:border-t-0"
    >
      <button onClick={onOpen} className="flex w-full items-center gap-3.5 py-3.5 pl-4 pr-3 text-left hover:bg-white/[0.03]">
        <span className={`grid h-11 w-11 shrink-0 place-items-center rounded-full ${pending ? 'border border-dashed border-ink-3/60' : 'border border-line bg-sunken'}`} aria-hidden="true">
          <Icon size={18} className="text-ink" />
        </span>
        <span className="min-w-0 flex-1">
          <span className="block truncate text-[15px] text-ink">{item.title}</span>
          <span className="mt-0.5 block truncate text-[12px] text-ink-3">
            {pending ? `Pending · ${item.expected}` : formatWhen(item.at)}
            {item.multiplier ? ` · ${item.multiplier}× card reward` : ''}
          </span>
        </span>
        <span className="text-right">
          <span className={`block text-[16px] font-semibold tnum ${pending ? 'text-ink-2' : isSpend ? 'text-ink' : 'text-gain'}`}>
            {isSpend ? `Saved ${formatRupees(item.saved)}` : `+${rupees}`}
          </span>
          <span className="mt-0.5 block text-[12px] text-ink-3 tnum">{formatSigned(item.scoins)} Scoins</span>
        </span>
        <ChevronRight size={18} aria-hidden="true" className="shrink-0 text-ink-3" />
      </button>
    </motion.li>
  )
}

export function TxDetail({ item }) {
  const isSpend = item.scoins < 0
  const abs = Math.abs(item.scoins)
  const fields = [
    ['Status', item.pending ? `Pending · expected ${item.expected}` : isSpend ? 'Redeemed' : 'Credited'],
    ['Date', item.pending ? '—' : formatWhen(item.at)],
    ['Source', item.source],
    item.multiplier && ['Card multiplier', `${item.multiplier}× on UPI`],
    (item.rule || item.note) && ['How it works', item.rule || item.note],
    !item.pending && ['Balance after', `${formatScoins(item.balanceAfter)} Scoins · ${formatRupees(inAppValue(item.balanceAfter))}`],
    ['Reference', `SCN-${String(item.id).toUpperCase().slice(-6)}`],
  ].filter(Boolean)
  return (
    <div>
      <div className="text-center">
        <p className={`flex items-center justify-center gap-1.5 font-display text-[40px] font-semibold tracking-[-0.03em] tnum ${item.pending ? 'text-ink-2' : 'text-ink'}`}>
          {formatSigned(item.scoins)} <ScoinGlyph size={26} />
        </p>
        <p className="mt-1 text-[15px] text-ink-2">{item.title}</p>
        <p className="mx-auto mt-3 inline-block rounded-full bg-sunken px-3 py-1.5 text-[13px] text-ink-2 tnum">
          {isSpend
            ? `You saved ${formatRupees(item.saved)} · ${formatScoins(abs)} Scoins at 5 = ₹1`
            : `Worth ${formatRupees(inAppValue(abs))} on SalarySe · ${formatRupees(bankValue(abs))} to bank`}
        </p>
      </div>
      <dl className="mt-6 divide-y divide-line rounded-card border border-line">
        {fields.map(([k, v]) => (
          <div key={k} className="flex gap-4 px-4 py-3 text-[14px]">
            <dt className="w-[112px] shrink-0 text-ink-3">{k}</dt>
            <dd className="flex-1 text-ink">{v}</dd>
          </div>
        ))}
      </dl>
    </div>
  )
}
