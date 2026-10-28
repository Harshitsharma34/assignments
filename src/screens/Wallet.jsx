import { useState } from 'react'
import { motion } from 'framer-motion'
import { ArrowLeft, ChevronRight, House, Info, Receipt, Sparkles } from 'lucide-react'
import CoinStage from '../components/CoinStage.jsx'
import Sheet from '../components/Sheet.jsx'
import { formatRupees, inAppValue } from '../lib/scoins.js'
import Actions from './wallet/Actions.jsx'
import Activity, { TxDetail } from './wallet/Activity.jsx'
import { BalanceHero, NewUserHero } from './wallet/BalanceHero.jsx'
import CardRewards, { CardExplainer } from './wallet/CardRewards.jsx'
import NextReward from './wallet/NextReward.jsx'
import RatesExplainer from './wallet/RatesSheet.jsx'
import SpendOptions from './wallet/SpendOptions.jsx'

export const HERO = { top: 96, height: 120, coinWidth: 172 }
const STAGE_HEIGHT = 844

const reveal = {
  hidden: { opacity: 0, y: 14 },
  show: (i = 0) => ({ opacity: 1, y: 0, transition: { delay: i * 0.07, duration: 0.45, ease: [0.22, 1, 0.36, 1] } }),
}

function Block({ i, children, className = '' }) {
  return <motion.div custom={i} variants={reveal} className={className}>{children}</motion.div>
}

export default function Wallet({ wallet, intro, onIntroReveal, onIntroDone, revealed, navigate, notify, idleMotion }) {
  const { profile, state, balance, rows, monthEarned, monthSpent, dispatch } = wallet
  const [sheet, setSheet] = useState(null)
  const close = () => setSheet(null)

  const isNew = profile.id === 'new'
  const isEmpty = balance === 0
  const savedRupees = inAppValue(state.lifetime.spent)
  let i = 0

  return (
    <div className="relative">
      {/* 3D stage scrolls with the page so the coins stay pinned to the hero slot. */}
      <div className="pointer-events-none absolute inset-x-0 top-0 z-20" style={{ height: STAGE_HEIGHT }}>
        <CoinStage
          height={STAGE_HEIGHT}
          mode={intro.mode}
          skip={intro.skip}
          heroY={HERO.top + HERO.height / 2}
          heroWidth={HERO.coinWidth}
          celebrateKey={state.celebrateKey}
          idle={idleMotion}
          onReveal={onIntroReveal}
          onDone={onIntroDone}
        />
      </div>

      <motion.div initial="hidden" animate={revealed ? 'show' : 'hidden'} className="relative pb-28">
        <div className="h-11" aria-hidden="true" />
        <Block i={i++}>
          <header className="flex h-[52px] items-center justify-between px-3">
            <button aria-label="Back" className="grid h-11 w-11 place-items-center rounded-full text-fg hover:bg-ink-850"><ArrowLeft size={22} /></button>
            <h1 className="text-[16px] font-semibold text-fg">Scoins</h1>
            <button aria-label="How Scoin rates work" onClick={() => setSheet({ type: 'rates' })} className="grid h-11 w-11 place-items-center rounded-full text-fg-2 hover:bg-ink-850 hover:text-fg"><Info size={20} /></button>
          </header>
        </Block>

        <div style={{ height: HERO.height }} aria-hidden="true" />

        {isNew ? (
          <>
            <Block i={i++}><NewUserHero /></Block>
            <Block i={i++} className="mt-7">
              <NextReward first upi={state.upi} onPay={() => dispatch({ type: 'upi' })} />
            </Block>
            <Block i={i++} className="mt-8"><OtherWays onOpen={() => navigate('earn')} /></Block>
            <Block i={i++} className="mt-8 px-5">
              <button onClick={() => setSheet({ type: 'rates' })} className="flex w-full items-center gap-3 rounded-card border border-line p-4 text-left hover:bg-ink-850">
                <span className="flex-1 text-[14px] leading-relaxed text-fg-2">
                  <span className="block font-medium text-fg">What Scoins are worth</span>
                  500 Scoins = ₹100 on SalarySe, or ₹50 in your bank
                </span>
                <ChevronRight size={18} aria-hidden="true" className="text-fg-3" />
              </button>
            </Block>
          </>
        ) : (
          <>
            <Block i={i++}><BalanceHero balance={balance} savedRupees={savedRupees} onRates={() => setSheet({ type: 'rates' })} /></Block>

            {!isEmpty && (
              <Block i={i++} className="mt-6">
                <Actions onSpend={() => navigate('spend')} onWithdraw={() => navigate('withdraw')} onEarn={() => navigate('earn')} />
              </Block>
            )}

            {isEmpty && (
              <Block i={i++} className="mt-6 px-6 text-center text-[14px] leading-relaxed text-fg-2">
                You used all {state.lifetime.spent.toLocaleString('en-IN')} Scoins on SalarySe and got their full {formatRupees(savedRupees)} value. Here's the quickest way to your next reward.
              </Block>
            )}

            {profile.hasCard && (
              <Block i={i++} className="mt-6"><CardRewards balance={balance} card={profile.card} onExplain={() => setSheet({ type: 'card' })} /></Block>
            )}

            <Block i={i++} className="mt-6">
              <NextReward
                upi={state.upi}
                onPay={() => dispatch({ type: 'upi' })}
                showCardHint={!profile.hasCard}
                onCardHint={() => notify({ text: 'Card benefits live in Earn (next build)' })}
              />
            </Block>

            {!isEmpty && (
              <Block i={i++} className="mt-8">
                <SpendOptions balance={balance} onSelect={() => navigate('spend')} onSeeAll={() => navigate('spend')} />
              </Block>
            )}

            <Block i={i++} className="mt-8">
              <Activity rows={rows} pending={profile.pending} monthEarned={monthEarned} monthSpent={monthSpent} onOpen={(item) => setSheet({ type: 'tx', item })} />
            </Block>
          </>
        )}
      </motion.div>

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
      <h2 id="other-ways" className="text-[17px] font-semibold text-fg">Other ways to earn</h2>
      <ul className="mt-3 overflow-hidden rounded-card border border-line bg-ink-850">
        {ways.map(({ icon: Icon, title, sub }, i) => (
          <li key={title} className={i ? 'border-t border-line' : ''}>
            <button onClick={onOpen} className="flex w-full items-center gap-3.5 px-4 py-3.5 text-left hover:bg-ink-800">
              <span className="grid h-10 w-10 shrink-0 place-items-center rounded-full bg-ink-700" aria-hidden="true"><Icon size={17} className="text-fg-2" /></span>
              <span className="flex-1">
                <span className="block text-[15px] text-fg">{title}</span>
                <span className="block text-[13px] text-fg-3">{sub}</span>
              </span>
              <ChevronRight size={16} aria-hidden="true" className="text-fg-3" />
            </button>
          </li>
        ))}
      </ul>
    </section>
  )
}
