import { AnimatePresence, motion } from 'framer-motion'
import { Clock3 } from 'lucide-react'
import ScoinGlyph from '../../components/ScoinGlyph.jsx'
import { formatWhen } from '../../lib/format.js'
import { bankValue, formatRupees, formatScoins, formatSigned, inAppValue } from '../../lib/scoins.js'
import { KIND_ICON } from './kinds.js'

export default function Activity({ rows, pending, monthEarned, monthSpent, onOpen }) {
  return (
    <section aria-labelledby="activity-title" className="px-5">
      <div className="flex items-baseline justify-between">
        <h2 id="activity-title" className="text-[17px] font-semibold text-fg">Activity</h2>
        <span className="text-[13px] text-fg-3">October 2026</span>
      </div>

      <dl className={`mt-3 grid gap-2 text-[12px] ${pending.length ? 'grid-cols-3' : 'grid-cols-2'}`}>
        <Stat label="Earned" value={`+${formatScoins(monthEarned)}`} />
        <Stat label="Spent" value={formatScoins(monthSpent)} />
        {pending.length > 0 && <Stat label="Pending" value={`+${formatScoins(pending.reduce((a, p) => a + p.scoins, 0))}`} muted />}
      </dl>

      <ul className="mt-3 overflow-hidden rounded-card border border-line bg-ink-850">
        {pending.map((p) => (
          <Row key={p.id} item={p} pending onOpen={() => onOpen({ ...p, pending: true })} />
        ))}
        <AnimatePresence initial={false}>
          {rows.map((r) => (
            <Row key={r.id} item={r} onOpen={() => onOpen(r)} />
          ))}
        </AnimatePresence>
      </ul>
    </section>
  )
}

function Stat({ label, value, muted }) {
  return (
    <div className="rounded-xl bg-ink-850 px-3 py-2.5">
      <dt className="text-fg-3">{label}</dt>
      <dd className={`mt-0.5 flex items-center gap-1 text-[14px] font-semibold tnum ${muted ? 'text-fg-2' : 'text-fg'}`}>
        {value} <ScoinGlyph size={11} />
      </dd>
    </div>
  )
}

function Row({ item, pending, onOpen }) {
  const Icon = pending ? Clock3 : KIND_ICON[item.kind]
  const isSpend = item.scoins < 0
  return (
    <motion.li
      layout
      initial={item.fresh ? { opacity: 0, height: 0, backgroundColor: 'rgba(232,181,71,0.16)' } : false}
      animate={{ opacity: 1, height: 'auto', backgroundColor: 'rgba(232,181,71,0)' }}
      transition={{ duration: 0.5, backgroundColor: { duration: 2.4 } }}
      className="border-t border-line first:border-t-0"
    >
      <button onClick={onOpen} className="flex w-full items-center gap-3.5 px-4 py-3.5 text-left hover:bg-ink-800">
        <span className={`grid h-10 w-10 shrink-0 place-items-center rounded-full ${pending ? 'border border-dashed border-fg-3/50' : 'bg-ink-700'}`} aria-hidden="true">
          <Icon size={17} className="text-fg-2" />
        </span>
        <span className="min-w-0 flex-1">
          <span className="block truncate text-[15px] text-fg">{item.title}</span>
          <span className="mt-0.5 block truncate text-[12px] text-fg-3">
            {pending ? `Pending · ${item.expected}` : formatWhen(item.at)}
            {item.multiplier ? ` · ${item.multiplier}× card reward` : ''}
          </span>
        </span>
        <span className="text-right">
          <span className={`flex items-center justify-end gap-1 text-[15px] font-semibold tnum ${pending ? 'text-fg-2' : isSpend ? 'text-fg' : 'text-gain'}`}>
            {formatSigned(item.scoins)} <ScoinGlyph size={12} />
          </span>
          <span className={`block text-[12px] tnum ${isSpend ? 'text-gold-hi' : 'text-fg-3'}`}>
            {isSpend ? `Saved ${formatRupees(item.saved)}` : formatRupees(inAppValue(item.scoins))}
          </span>
        </span>
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
        <p className={`flex items-center justify-center gap-1.5 font-display text-[40px] font-semibold tracking-[-0.03em] tnum ${item.pending ? 'text-fg-2' : 'text-fg'}`}>
          {formatSigned(item.scoins)} <ScoinGlyph size={26} />
        </p>
        <p className="mt-1 text-[15px] text-fg-2">{item.title}</p>
        <p className="mx-auto mt-3 inline-block rounded-full bg-ink-800 px-3 py-1.5 text-[13px] text-fg-2 tnum">
          {isSpend
            ? `You saved ${formatRupees(item.saved)} · ${formatScoins(abs)} Scoins at 5 = ₹1`
            : `Worth ${formatRupees(inAppValue(abs))} on SalarySe · ${formatRupees(bankValue(abs))} to bank`}
        </p>
      </div>
      <dl className="mt-6 divide-y divide-line rounded-card border border-line">
        {fields.map(([k, v]) => (
          <div key={k} className="flex gap-4 px-4 py-3 text-[14px]">
            <dt className="w-[112px] shrink-0 text-fg-3">{k}</dt>
            <dd className="flex-1 text-fg">{v}</dd>
          </div>
        ))}
      </dl>
    </div>
  )
}
