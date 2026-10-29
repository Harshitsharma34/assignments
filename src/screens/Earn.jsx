import { motion } from 'framer-motion'
import { BellRing, CalendarCheck, CreditCard, House, Receipt, Repeat, Send, Sparkles, Star } from 'lucide-react'
import { formatRupees, formatScoins, inAppValue } from '../lib/scoins.js'
import { ScreenHeader } from './flow.jsx'

// Earn: what earns Scoins today (from the current product), then proposed mechanics clearly
// marked as proposals. Every row says the action, the Scoins, the limits and the next step.
export default function Earn({ wallet, onBack, notify }) {
  const { profile, state, dispatch } = wallet
  const { upi } = state
  const isNew = profile.id === 'new'
  const campaign = profile.pending.find((p) => p.kind === 'campaign')
  const outside = (what) => () => notify({ text: `${what} opens outside this prototype` })

  return (
    <div className="min-h-full pb-12 pt-11">
      <ScreenHeader title="Earn Scoins" onBack={onBack} />

      <p className="mx-auto mt-1 max-w-[320px] px-5 text-center text-[14px] leading-relaxed text-ink-2">
        {isNew
          ? 'Start with payments you already make. Every 5 Scoins is ₹1 off on SalarySe.'
          : 'Payments you already make earn Scoins. Every 5 Scoins is ₹1 off on SalarySe.'}
      </p>

      <h2 className="label mt-7 px-5">Ways to earn today</h2>
      <ul className="mt-2 space-y-3 px-5">
        {/* UPI bonus: the one rule with visible progress. */}
        <Card
          icon={Send}
          title="UPI bonus"
          reward={`+${upi.reward} Scoins`}
          rupees={formatRupees(inAppValue(upi.reward))}
          detail={`Every ${upi.target}th UPI payment through SalarySe. Repeats every ${upi.target} payments.`}
          action="Pay via UPI"
          onAction={() => dispatch({ type: 'upi' })}
          illustrative
        >
          <Progress done={upi.done} target={upi.target} />
        </Card>

        <Card
          icon={House}
          title="Rent via instacash"
          reward="Up to 1,000 Scoins"
          rupees={formatRupees(inAppValue(1000))}
          detail="On rent paid through instacash. Amount depends on the rent paid."
          action="Pay rent"
          onAction={outside('Rent payment')}
        />

        <Card
          icon={Receipt}
          title="Bill payments"
          reward="Scoins on every bill"
          detail="Utilities, recharges and other bills paid on SalarySe."
          action="Pay a bill"
          onAction={outside('Bill payment')}
        />

        <Card
          icon={CalendarCheck}
          title="quickloans EMI"
          reward="Scoins on each EMI"
          detail="Earned when a quickloans EMI is paid through SalarySe."
          action="View EMIs"
          onAction={outside('quickloans')}
        />

        <Card
          icon={Sparkles}
          title="Campaigns and partner offers"
          reward={campaign ? `+${formatScoins(campaign.scoins)} Scoins pending` : 'Limited time'}
          rupees={campaign ? formatRupees(inAppValue(campaign.scoins)) : undefined}
          detail={campaign ? `${campaign.title}: ${campaign.note} Expected ${campaign.expected}.` : 'No live campaigns right now. New ones appear here first.'}
          action={campaign ? undefined : 'Notify me'}
          onAction={campaign ? undefined : () => notify({ icon: <BellRing size={15} />, text: 'We’ll tell you when a campaign goes live' })}
        />

        {/* Card multiplier: status for cardholders, one contextual line for everyone else. */}
        {profile.hasCard ? (
          <Card
            icon={CreditCard}
            title="up! credit card"
            reward="10× on UPI"
            detail={`Card spends earn reward points; they become Scoins after each statement (next: ${profile.card.nextStatement}).`}
            badge="Active"
          />
        ) : (
          <Card
            icon={CreditCard}
            title="UPI on an up! credit card"
            reward="10× Scoins"
            detail="UPI paid with an up! credit card earns 10× the Scoins. Subject to card approval."
            action="See card"
            onAction={outside('up! credit card')}
          />
        )}
      </ul>

      <div className="mt-9 flex items-baseline justify-between px-5">
        <h2 className="label">Proposed</h2>
        <span className="text-[12px] text-ink-3">Not live · values illustrative</span>
      </div>
      <p className="mt-1 px-5 text-[13px] leading-relaxed text-ink-3">
        Rewards for money habits worth building. Shown here to test the idea, not as current offers.
      </p>
      <ul className="mt-3 space-y-3 px-5">
        <Card
          proposal
          icon={CalendarCheck}
          title="On-time bills, 3 months running"
          reward="+50 Scoins"
          rupees={formatRupees(inAppValue(50))}
          detail="Pay every SalarySe bill before its due date for 3 months in a row. Once per quarter."
        >
          <Progress done={isNew ? 0 : 2} target={3} label="months" />
        </Card>
        <Card
          proposal
          icon={Repeat}
          title="Set up autopay for a bill"
          reward="+25 Scoins"
          rupees={formatRupees(inAppValue(25))}
          detail="One time, for the first recurring bill moved to autopay on SalarySe."
        />
        <Card
          proposal
          icon={Star}
          title="Your first eligible payment"
          reward="+20 Scoins"
          rupees={formatRupees(inAppValue(20))}
          detail="New users only: your first UPI or bill payment through SalarySe."
          badge={isNew ? undefined : 'Done'}
        />
        <Card
          proposal
          icon={Repeat}
          title="Recurring payments on SalarySe"
          reward="+30 Scoins a month"
          rupees={formatRupees(inAppValue(30))}
          detail="Keep a monthly payment, like rent or a subscription, on SalarySe. Up to 3 payments."
        />
        {profile.hasCard && (
          <Card
            proposal
            icon={CreditCard}
            title="Activate your up! card"
            reward="+100 Scoins"
            rupees={formatRupees(inAppValue(100))}
            detail="One time, after your first card transaction."
            badge="Done"
          />
        )}
      </ul>
    </div>
  )
}

function Card({ icon: Icon, title, reward, rupees, detail, action, onAction, badge, proposal, illustrative, children }) {
  return (
    <li className="rounded-card bg-surface p-4">
      <div className="flex items-start gap-3">
        <span className={`grid h-10 w-10 shrink-0 place-items-center rounded-full ${proposal ? 'bg-sunken' : 'bg-gold/15'}`} aria-hidden="true">
          <Icon size={17} className={proposal ? 'text-ink-2' : 'text-accent'} />
        </span>
        <div className="min-w-0 flex-1">
          <div className="flex items-start justify-between gap-2">
            <p className="text-[15px] font-medium text-ink">{title}</p>
            {proposal && <span className="shrink-0 rounded-full border border-line px-2 py-0.5 text-[11px] text-ink-3">Proposal</span>}
            {badge && !proposal && <span className="shrink-0 rounded-full bg-gain/15 px-2 py-0.5 text-[11px] font-medium text-gain">{badge}</span>}
          </div>
          <p className="mt-0.5 text-[14px] font-semibold text-accent tnum">
            {reward}
            {rupees && <span className="font-normal text-ink-3"> · {rupees} to spend</span>}
            {illustrative && <span className="font-normal text-ink-3"> (illustrative)</span>}
          </p>
          <p className="mt-1 text-[13px] leading-relaxed text-ink-2">{detail}</p>
          {children}
          {proposal && badge && <p className="mt-2 text-[12px] text-gain">{badge}</p>}
          {action && (
            <motion.button whileTap={{ scale: 0.97 }} onClick={onAction} className="mt-3 h-9 rounded-full bg-sunken px-3.5 text-[13px] font-medium text-ink hover:bg-sunken-2">
              {action}
            </motion.button>
          )}
        </div>
      </div>
    </li>
  )
}

function Progress({ done, target, label = 'this cycle' }) {
  return (
    <div className="mt-3 flex items-center gap-3">
      <div
        className="grid flex-1 gap-1"
        style={{ gridTemplateColumns: `repeat(${target}, 1fr)` }}
        role="progressbar"
        aria-valuemin={0}
        aria-valuemax={target}
        aria-valuenow={done}
        aria-label={`${done} of ${target} ${label}`}
      >
        {Array.from({ length: target }, (_, i) => (
          <span key={i} className="h-1 overflow-hidden rounded-full bg-sunken">
            <motion.span className="block h-full rounded-full bg-gold" initial={false} animate={{ scaleX: i < done ? 1 : 0 }} style={{ originX: 0 }} />
          </span>
        ))}
      </div>
      <span className="text-[12px] text-ink-3 tnum">{done}/{target} {label === 'this cycle' ? '' : label}</span>
    </div>
  )
}
