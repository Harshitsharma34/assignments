import { useState } from 'react'
import { Landmark } from 'lucide-react'
import AnimatedValue from '../components/AnimatedValue.jsx'
import Sheet from '../components/Sheet.jsx'
import ScoinGlyph from '../components/ScoinGlyph.jsx'
import { bankValue, formatRupees, formatScoins, inAppValue } from '../lib/scoins.js'
import { ErrorView, PrimaryButton, Rows, ScreenHeader, SuccessView, useConfirmFlow } from './flow.jsx'
import { STEP, TickSlider, snapScoins } from './wallet/ScoinCalculator.jsx'

const ACCOUNT = '••4321' // illustrative linked account
const PICKS = [['25%', 0.25], ['50%', 0.5], ['All', 1]]

// Withdraw: choose an amount, see the exact rupees at 10 Scoins = ₹1, confirm.
// The in-app value is shown alongside as information, not as a warning.
export default function Withdraw({ balance, selected, dispatch, failNext, onFailUsed, onBack, onSpend, onEarn }) {
  const max = Math.floor(balance / STEP) * STEP
  const [scoins, setScoins] = useState(() => (max >= STEP ? snapScoins(selected ?? max, max) : 0))
  const [review, setReview] = useState(false)
  const flow = useConfirmFlow({ failNext, onFailUsed })
  const rupees = bankValue(scoins)

  const close = () => {
    setReview(false)
    if (flow.status !== 'loading') flow.reset()
  }

  return (
    <div className="min-h-full pb-28 pt-11">
      <ScreenHeader title="Withdraw to bank" onBack={onBack} />

      {max < STEP ? (
        <div className="mx-5 mt-6 rounded-card bg-surface p-5 text-center">
          <p className="text-[15px] font-medium text-ink">No Scoins to withdraw yet</p>
          <p className="mt-1 text-[13px] text-ink-2">Withdrawals start from {STEP} Scoins ({formatRupees(bankValue(STEP))}).</p>
          <button onClick={onEarn} className="mt-4 h-10 rounded-full bg-sunken px-4 text-[14px] font-medium text-ink hover:bg-sunken-2">See ways to earn</button>
        </div>
      ) : (
        <>
          <section className="mx-5 mt-4 rounded-card bg-surface p-4" aria-label="Withdrawal amount">
            <p className="text-center text-[13px] text-ink-3">You'll receive</p>
            <p className="mt-1 text-center text-[44px] font-semibold tracking-[-0.03em] text-ink tnum">
              <AnimatedValue value={rupees} format={formatRupees} duration={0.35} />
            </p>
            <p className="flex items-center justify-center gap-1.5 text-[13px] text-ink-2 tnum">
              <ScoinGlyph size={13} /> {formatScoins(scoins)} Scoins at 10 Scoins = ₹1
            </p>
            <TickSlider value={scoins} max={max} onChange={setScoins} label="Scoins to withdraw" />
            <div className="mt-2 flex justify-center gap-1" role="group" aria-label="Quick amounts">
              {PICKS.map(([label, share]) => {
                const v = snapScoins(max * share, max)
                return (
                  <button
                    key={label}
                    onClick={() => setScoins(v)}
                    aria-pressed={v === scoins}
                    className={`h-9 min-w-[64px] rounded-full px-3 text-[13px] tnum ${v === scoins ? 'bg-sunken font-semibold text-ink' : 'text-ink-3 hover:text-ink'}`}
                  >
                    {label}
                  </button>
                )
              })}
            </div>
          </section>

          <button onClick={onSpend} className="mx-5 mt-3 flex w-[calc(100%-40px)] items-center justify-between rounded-2xl px-4 py-3 text-left text-[13px] text-ink-2 hover:bg-surface">
            <span className="tnum">Worth <span className="font-semibold text-accent">{formatRupees(inAppValue(scoins))}</span> on SalarySe</span>
            <span className="text-accent">Spend instead</span>
          </button>

          <section className="mx-5 mt-3 flex items-center gap-3 rounded-card bg-surface p-4" aria-label="Destination">
            <span className="grid h-10 w-10 place-items-center rounded-full bg-sunken" aria-hidden="true"><Landmark size={17} className="text-ink-2" /></span>
            <span className="flex-1">
              <span className="block text-[15px] text-ink">Bank account {ACCOUNT}</span>
              <span className="block text-[12px] text-ink-3">Linked account (illustrative)</span>
            </span>
          </section>

          <div className="sticky bottom-0 mt-6 bg-gradient-to-t from-page via-page to-transparent px-5 pb-6 pt-6">
            <PrimaryButton tone="light" onClick={() => setReview(true)}>Withdraw {formatRupees(rupees)}</PrimaryButton>
          </div>
        </>
      )}

      <Sheet open={review} onClose={close} title={flow.status === 'success' ? 'Requested' : 'Review withdrawal'}>
        {flow.status === 'success' ? (
          <SuccessView
            amount={rupees}
            format={formatRupees}
            suffix="on its way"
            lines={[`To bank account ${ACCOUNT}`, `${formatScoins(scoins)} Scoins withdrawn · ${formatScoins(balance)} left`]}
            onDone={() => { setReview(false); onBack() }}
          >
            <p className="mx-auto mt-4 inline-block rounded-full bg-sunken px-3 py-1.5 text-[13px] text-ink-2">Status: processing (illustrative)</p>
          </SuccessView>
        ) : flow.status === 'error' ? (
          <ErrorView message="No Scoins were withdrawn. Check your connection and try again." onRetry={flow.reset} />
        ) : (
          <div>
            <Rows
              rows={[
                ['You receive', formatRupees(rupees), 'accent'],
                ['Scoins withdrawn', `${formatScoins(scoins)} Scoins`],
                ['Rate', '10 Scoins = ₹1'],
                ['To', `Bank account ${ACCOUNT}`],
                ['Balance after', `${formatScoins(balance - scoins)} Scoins · ${formatRupees(inAppValue(balance - scoins))} to spend`],
              ]}
            />
            <div className="mt-5">
              <PrimaryButton tone="light" loading={flow.status === 'loading'} onClick={() => flow.run(() => dispatch({ type: 'withdraw', scoins }))}>
                {flow.status === 'loading' ? 'Confirming…' : `Confirm ${formatRupees(rupees)} withdrawal`}
              </PrimaryButton>
            </div>
          </div>
        )}
      </Sheet>
    </div>
  )
}
