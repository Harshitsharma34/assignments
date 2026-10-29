import { useState } from 'react'
import { ChevronRight, Package, Receipt, Sandwich, UtensilsCrossed } from 'lucide-react'
import Sheet from '../components/Sheet.jsx'
import ScoinGlyph from '../components/ScoinGlyph.jsx'
import { formatRupees, formatScoins, inAppValue } from '../lib/scoins.js'
import { ErrorView, PrimaryButton, Rows, ScreenHeader, SuccessView, useConfirmFlow } from './flow.jsx'
import { rankDeals } from './wallet/PopularDeals.jsx'
import { TickSlider, snapScoins } from './wallet/ScoinCalculator.jsx'

const ART = { food: Sandwich, dining: UtensilsCrossed, parcel: Package, bill: Receipt }

// Spend: pick a deal or a bill, review exactly what it costs and saves, confirm.
export default function Spend({ balance, selected, initialDeal, dispatch, failNext, onFailUsed, onBack, onEarn }) {
  const deals = rankDeals(balance)
  const covered = deals.filter((d) => d.covered)
  const later = deals.filter((d) => !d.covered)
  const [open, setOpen] = useState(() => deals.find((d) => d.id === initialDeal) ?? null)

  return (
    <div className="min-h-full pb-10 pt-11">
      <ScreenHeader title="Spend Scoins" onBack={onBack} />
      <div className="px-5 pt-2 text-center">
        <p className="flex items-center justify-center gap-1.5 text-[14px] text-ink-2"><ScoinGlyph size={14} /> {formatScoins(balance)} Scoins</p>
        <p className="mt-1 text-[36px] font-semibold tracking-[-0.03em] text-ink tnum">{formatRupees(inAppValue(balance))}</p>
        <p className="text-[13px] text-ink-3">to spend at 5 Scoins = ₹1</p>
      </div>

      {covered.length === 0 && balance === 0 ? (
        <div className="mx-5 mt-8 rounded-card bg-surface p-5 text-center">
          <p className="text-[15px] font-medium text-ink">No Scoins to spend yet</p>
          <p className="mt-1 text-[13px] text-ink-2">Every 5th UPI payment through SalarySe earns a bonus.</p>
          <button onClick={onEarn} className="mt-4 h-10 rounded-full bg-sunken px-4 text-[14px] font-medium text-ink hover:bg-sunken-2">See ways to earn</button>
        </div>
      ) : (
        <>
          {covered.length > 0 && <DealList title="You can cover" deals={covered} balance={balance} onOpen={setOpen} />}
          {later.length > 0 && <DealList title="Almost there" deals={later} balance={balance} onOpen={setOpen} />}
          <p className="mt-3 px-5 text-[11px] text-ink-3">Deals and vouchers are illustrative.</p>
        </>
      )}

      <Sheet open={!!open} onClose={() => setOpen(null)} title="Review">
        {open && (
          <Review
            key={open.id}
            deal={open}
            balance={balance}
            selected={selected}
            dispatch={dispatch}
            failNext={failNext}
            onFailUsed={onFailUsed}
            onDone={() => { setOpen(null); onBack() }}
            onEarn={onEarn}
          />
        )}
      </Sheet>
    </div>
  )
}

function DealList({ title, deals, balance, onOpen }) {
  return (
    <section className="mt-7 px-5" aria-label={title}>
      <h2 className="label">{title}</h2>
      <ul className="mt-2 overflow-hidden rounded-card bg-surface py-1">
        {deals.map((d) => (
          <li key={d.id}>
            <button onClick={() => onOpen(d)} className="flex w-full items-center gap-3 px-4 py-3 text-left hover:bg-white/[0.03]">
              <Mark deal={d} />
              <span className="min-w-0 flex-1">
                <span className="block truncate text-[15px] text-ink">{d.kind === 'bill' ? 'Pay a bill' : d.brand}</span>
                {d.covered ? (
                  <span className="block truncate text-[12px] text-ink-3 tnum">{d.kind === 'bill' ? `Up to ${formatScoins(d.cost)} Scoins` : `${formatScoins(d.cost)} Scoins · ${d.title}`}</span>
                ) : (
                  <span className="mt-1 flex items-center gap-2">
                    <span className="h-1 flex-1 overflow-hidden rounded-full bg-sunken" aria-hidden="true">
                      <span className="block h-full rounded-full bg-gold/70" style={{ width: `${Math.min(100, (balance / d.cost) * 100)}%` }} />
                    </span>
                    <span className="text-[11px] text-ink-3 tnum">{formatScoins(d.cost - balance)} more</span>
                  </span>
                )}
              </span>
              <span className="text-right text-[15px] font-medium text-ink tnum">
                {d.kind === 'bill' ? `Up to ${formatRupees(d.saving)}` : `${formatRupees(d.saving)} off`}
              </span>
              <ChevronRight size={16} aria-hidden="true" className="text-ink-3" />
            </button>
          </li>
        ))}
      </ul>
    </section>
  )
}

function Mark({ deal }) {
  const Art = ART[deal.art]
  if (deal.kind === 'bill') {
    return <span className="grid h-10 w-10 shrink-0 place-items-center rounded-full bg-sunken" aria-hidden="true"><Art size={17} className="text-ink-2" /></span>
  }
  return (
    <span className="grid h-10 w-10 shrink-0 place-items-center rounded-full text-[16px] font-bold" style={{ background: deal.mark.bg, color: deal.mark.fg }} aria-hidden="true">
      {deal.mark.letter}
    </span>
  )
}

function Review({ deal, balance, selected, dispatch, failNext, onFailUsed, onDone, onEarn }) {
  const isBill = deal.kind === 'bill'
  const [billScoins, setBillScoins] = useState(() => snapScoins(selected ?? balance, balance))
  const cost = isBill ? billScoins : deal.cost
  const short = cost - balance
  const flow = useConfirmFlow({ failNext, onFailUsed })
  const name = isBill ? 'Bill payment' : `${deal.brand} ${deal.title}`

  if (flow.status === 'success') {
    return (
      <SuccessView
        title={`${formatRupees(inAppValue(cost))} saved`}
        lines={[`${formatScoins(cost)} Scoins used · ${formatScoins(balance)} left`]}
        onDone={onDone}
      >
        <p className="mx-auto mt-4 inline-block rounded-full bg-sunken px-3 py-1.5 text-[13px] text-ink-2">
          {isBill ? 'Applied to your next bill (illustrative)' : 'Voucher code SCN-4F7K2 (illustrative)'}
        </p>
      </SuccessView>
    )
  }
  if (flow.status === 'error') {
    return <ErrorView message="No Scoins were used. Check your connection and try again." onRetry={flow.reset} />
  }

  return (
    <div>
      <div className="flex items-center gap-3">
        <Mark deal={deal} />
        <div>
          <p className="text-[15px] font-medium text-ink">{isBill ? 'Pay part of any bill' : deal.brand}</p>
          <p className="text-[13px] text-ink-3">{isBill ? 'Scoins come off your next bill' : deal.title}</p>
        </div>
      </div>

      {isBill && balance > 0 && (
        <div className="mt-4">
          <p className="text-[13px] text-ink-3">Scoins to use</p>
          <TickSlider value={billScoins} max={Math.max(50, Math.floor(balance / 50) * 50)} onChange={setBillScoins} label="Scoins to use on your bill" />
        </div>
      )}

      <div className="mt-4">
        <Rows
          rows={[
            ['You save', formatRupees(inAppValue(cost)), 'accent'],
            ['Scoins used', `${formatScoins(cost)} Scoins`],
            ['Rate', '5 Scoins = ₹1'],
            ['Balance after', short > 0 ? '—' : `${formatScoins(balance - cost)} Scoins · ${formatRupees(inAppValue(balance - cost))}`],
          ]}
        />
      </div>

      <div className="mt-5">
        {short > 0 ? (
          <>
            <p className="mb-3 text-center text-[13px] text-ink-2 tnum">You need {formatScoins(short)} more Scoins for this deal.</p>
            <PrimaryButton tone="light" onClick={onEarn}>See ways to earn</PrimaryButton>
          </>
        ) : (
          <PrimaryButton
            loading={flow.status === 'loading'}
            onClick={() => flow.run(() => dispatch({ type: 'redeem', scoins: cost, title: name, source: isBill ? 'Bill payment' : 'Deal' }))}
          >
            {flow.status === 'loading' ? 'Confirming…' : `Use ${formatScoins(cost)} Scoins`}
          </PrimaryButton>
        )}
      </div>
    </div>
  )
}
