import { useState } from 'react'
import { ArrowLeft, ChevronRight, House, Info, Receipt, Sparkles } from 'lucide-react'
import Sheet from '../components/Sheet.jsx'
import { formatRupees, inAppValue } from '../lib/scoins.js'
import Actions from './wallet/Actions.jsx'
import Activity, { RecentActivity, TxDetail } from './wallet/Activity.jsx'
import { NewUserIntro, ValueCard } from './wallet/BalanceHero.jsx'
import CardRewards, { CardExplainer } from './wallet/CardRewards.jsx'
import NextReward from './wallet/NextReward.jsx'
import RatesExplainer from './wallet/RatesSheet.jsx'
import ScoinCalculator from './wallet/ScoinCalculator.jsx'
import Reveal from './wallet/Reveal.jsx'
import PopularDeals from './wallet/PopularDeals.jsx'
import WalletHero from './wallet/WalletHero.jsx'

export default function Wallet({ wallet, intro, onIntroDone, paused, navigate, notify, idleMotion }) {
  const { profile, state, balance, rows, monthEarned, monthSpent, dispatch } = wallet
  const [sheet, setSheet] = useState(null)
  const close = () => setSheet(null)
  const openRates = () => setSheet({ type: 'rates' })
  const openTx = (item) => setSheet({ type: 'tx', item })

  const isNew = profile.id === 'new'
  const isEmpty = balance === 0
  const savedRupees = inAppValue(state.lifetime.spent)
  let i = 0

  return (
    <div className="relative">
      {/* A single soft beam of warm light from the top right; the coins sit inside it. */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-x-0 top-0 h-[460px] bg-[radial-gradient(60%_42%_at_78%_22%,rgba(226,182,92,0.16),transparent_70%),linear-gradient(118deg,transparent_48%,rgba(255,236,200,0.05)_58%,transparent_70%)]"
      />
      <div className="relative pb-28">
        <div className="h-11" aria-hidden="true" />
        <Reveal i={i++}>
          <header className="flex h-[52px] items-center gap-3 px-4">
            <button aria-label="Back" className="grid h-11 w-11 place-items-center rounded-full border border-line bg-sunken/80 text-ink hover:bg-sunken-2"><ArrowLeft size={20} /></button>
            <h1 className="flex-1 font-display text-[22px] text-ink">Scoins</h1>
            <button aria-label="How Scoin rates work" onClick={openRates} className="grid h-11 w-11 place-items-center rounded-full border border-line bg-sunken/80 text-ink hover:bg-sunken-2"><Info size={19} /></button>
          </header>
        </Reveal>

        <WalletHero
          index={i++}
          balance={balance}
          savedRupees={savedRupees}
          intro={intro}
          celebrateKey={state.celebrateKey}
          idle={idleMotion}
          paused={paused}
          onIntroDone={onIntroDone}
        />

        {isNew && <Reveal i={i++} className="mt-2"><NewUserIntro /></Reveal>}

        <Reveal i={i++} className="mt-5"><ValueCard balance={balance} onRates={openRates} /></Reveal>

        {!isEmpty && (
          <Reveal i={i++} className="mt-5">
            <Actions onSpend={() => navigate('spend')} onWithdraw={() => navigate('withdraw')} onEarn={() => navigate('earn')} />
          </Reveal>
        )}

        {!isEmpty && (
          <Reveal i={i++} className="mt-6"><ScoinCalculator balance={balance} /></Reveal>
        )}

        {isEmpty && !isNew && (
          <Reveal i={i++} className="mt-5 px-5 text-[14px] leading-relaxed text-ink-2">
            You used all {state.lifetime.spent.toLocaleString('en-IN')} Scoins on SalarySe and got their full {formatRupees(savedRupees)} value. Here's the quickest way to your next reward.
          </Reveal>
        )}

        {profile.hasCard && (
          <Reveal i={i++} className="mt-6"><CardRewards balance={balance} card={profile.card} onExplain={() => setSheet({ type: 'card' })} /></Reveal>
        )}

        <Reveal i={i++} className="mt-6">
          <NextReward
            first={isNew}
            upi={state.upi}
            onPay={() => dispatch({ type: 'upi' })}
            showCardHint={!profile.hasCard}
            onCardHint={() => notify({ text: 'Card benefits live in Earn (next build)' })}
          />
        </Reveal>

        {isNew ? (
          <Reveal i={i++} className="mt-8"><OtherWays onOpen={() => navigate('earn')} /></Reveal>
        ) : (
          <>
            {!isEmpty && (
              <Reveal i={i++} className="mt-8">
                <PopularDeals balance={balance} onSelect={() => navigate('spend')} onSeeAll={() => navigate('spend')} />
              </Reveal>
            )}
            <Reveal i={i++} className="mt-6">
              <RecentActivity rows={rows} pending={profile.pending} onOpen={openTx} onSeeAll={() => setSheet({ type: 'activity' })} />
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
      <Sheet open={sheet?.type === 'activity'} onClose={close} title="All activity">
        <Activity rows={rows} pending={profile.pending} monthEarned={monthEarned} monthSpent={monthSpent} onOpen={openTx} />
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
      <h2 id="other-ways" className="label">Other ways to earn</h2>
      <ul className="mt-3 overflow-hidden rounded-card border border-line bg-gradient-to-b from-white/[0.04] to-white/[0.01]">
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
