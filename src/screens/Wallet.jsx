import { useState } from 'react'
import { ArrowLeft, ChevronRight, House, Info, Receipt, Sparkles } from 'lucide-react'
import Sheet from '../components/Sheet.jsx'
import { formatRupees, inAppValue } from '../lib/scoins.js'
import Actions from './wallet/Actions.jsx'
import Activity, { TxDetail } from './wallet/Activity.jsx'
import CardRewards, { CardExplainer } from './wallet/CardRewards.jsx'
import NextReward from './wallet/NextReward.jsx'
import RatesExplainer from './wallet/RatesSheet.jsx'
import Reveal from './wallet/Reveal.jsx'
import SpendOptions from './wallet/SpendOptions.jsx'
import HeroBand from './wallet/HeroBand.jsx'
import WalletHero from './wallet/WalletHero.jsx'

export default function Wallet({ wallet, intro, introDone, onIntroDone, onBandHeight, paused, navigate, notify, idleMotion }) {
  const { profile, state, balance, rows, monthEarned, monthSpent, dispatch } = wallet
  const [sheet, setSheet] = useState(null)
  const close = () => setSheet(null)

  const isNew = profile.id === 'new'
  const isEmpty = balance === 0
  const savedRupees = inAppValue(state.lifetime.spent)
  let i = 0

  return (
    <div className="relative">
      <div className="relative pb-28">
        <HeroBand introDone={introDone} onHeight={onBandHeight}>
          <div className="h-11" aria-hidden="true" />
          <Reveal i={i++}>
            <header className="flex h-[52px] items-center justify-between px-3">
              <button aria-label="Back" className="grid h-11 w-11 place-items-center rounded-full text-ink hover:bg-surface"><ArrowLeft size={22} /></button>
              <h1 className="text-[16px] font-semibold text-ink">Scoins</h1>
              <button aria-label="How Scoin rates work" onClick={() => setSheet({ type: 'rates' })} className="grid h-11 w-11 place-items-center rounded-full text-ink-2 hover:bg-surface hover:text-ink"><Info size={20} /></button>
            </header>
          </Reveal>

          <WalletHero
            index={i++}
            isNew={isNew}
            balance={balance}
            savedRupees={savedRupees}
            onRates={() => setSheet({ type: 'rates' })}
            intro={intro}
            celebrateKey={state.celebrateKey}
            idle={idleMotion}
            paused={paused}
            onIntroDone={onIntroDone}
          />
        </HeroBand>

        {isNew ? (
          <>
            <Reveal i={i++} className="mt-7">
              <NextReward first upi={state.upi} onPay={() => dispatch({ type: 'upi' })} />
            </Reveal>
            <Reveal i={i++} className="mt-8"><OtherWays onOpen={() => navigate('earn')} /></Reveal>
            <Reveal i={i++} className="mt-8 px-5">
              <button onClick={() => setSheet({ type: 'rates' })} className="flex w-full items-center gap-3 rounded-card border border-line p-4 text-left hover:bg-surface">
                <span className="flex-1 text-[14px] leading-relaxed text-ink-2">
                  <span className="block font-medium text-ink">What Scoins are worth</span>
                  500 Scoins = ₹100 on SalarySe, or ₹50 in your bank
                </span>
                <ChevronRight size={18} aria-hidden="true" className="text-ink-3" />
              </button>
            </Reveal>
          </>
        ) : (
          <>
            {!isEmpty && (
              <Reveal i={i++} className="mt-6">
                <Actions onSpend={() => navigate('spend')} onWithdraw={() => navigate('withdraw')} onEarn={() => navigate('earn')} />
              </Reveal>
            )}

            {isEmpty && (
              <Reveal i={i++} className="mt-6 px-6 text-center text-[14px] leading-relaxed text-ink-2">
                You used all {state.lifetime.spent.toLocaleString('en-IN')} Scoins on SalarySe and got their full {formatRupees(savedRupees)} value. Here's the quickest way to your next reward.
              </Reveal>
            )}

            {profile.hasCard && (
              <Reveal i={i++} className="mt-6"><CardRewards balance={balance} card={profile.card} onExplain={() => setSheet({ type: 'card' })} /></Reveal>
            )}

            <Reveal i={i++} className="mt-6">
              <NextReward
                upi={state.upi}
                onPay={() => dispatch({ type: 'upi' })}
                showCardHint={!profile.hasCard}
                onCardHint={() => notify({ text: 'Card benefits live in Earn (next build)' })}
              />
            </Reveal>

            {!isEmpty && (
              <Reveal i={i++} className="mt-8">
                <SpendOptions balance={balance} onSelect={() => navigate('spend')} onSeeAll={() => navigate('spend')} />
              </Reveal>
            )}

            <Reveal i={i++} className="mt-8">
              <Activity rows={rows} pending={profile.pending} monthEarned={monthEarned} monthSpent={monthSpent} onOpen={(item) => setSheet({ type: 'tx', item })} />
            </Reveal>
          </>
        )}
      </div>

      <Sheet open={sheet?.type === 'rates'} onClose={close} title="What your Scoins are worth">
        <RatesExplainer balance={balance} />
      </Sheet>
      <Sheet open={sheet?.type === 'card'} onClose={close} title="How card rewards work">
        {profile.card && <CardExplainer card={profile.card} />}
      </Sheet>
      <Sheet open={sheet?.type === 'tx'} onClose={close} title="Transaction details">
        {sheet?.item && <TxDetail item={sheet.item} />}
      </Sheet>
    </div>
  )
}

function OtherWays({ onOpen }) {
  const ways = [
    { icon: House, title: 'Pay rent with instacash', sub: 'Up to 1,000 Scoins on rent payments' },
    { icon: Receipt, title: 'Pay bills on SalarySe', sub: 'Utilities, recharges and other bills' },
    { icon: Sparkles, title: 'Campaigns and partner offers', sub: 'Limited-time, shown when live' },
  ]
  return (
    <section aria-labelledby="other-ways" className="px-5">
      <h2 id="other-ways" className="text-[17px] font-semibold text-ink">Other ways to earn</h2>
      <ul className="mt-3 overflow-hidden rounded-card border border-line bg-surface">
        {ways.map(({ icon: Icon, title, sub }, i) => (
          <li key={title} className={i ? 'border-t border-line' : ''}>
            <button onClick={onOpen} className="flex w-full items-center gap-3.5 px-4 py-3.5 text-left hover:bg-sunken">
              <span className="grid h-10 w-10 shrink-0 place-items-center rounded-full border border-gold/55" aria-hidden="true"><Icon size={17} className="text-accent" /></span>
              <span className="flex-1">
                <span className="block text-[15px] text-ink">{title}</span>
                <span className="block text-[13px] text-ink-3">{sub}</span>
              </span>
              <ChevronRight size={16} aria-hidden="true" className="text-ink-3" />
            </button>
          </li>
        ))}
      </ul>
    </section>
  )
}
