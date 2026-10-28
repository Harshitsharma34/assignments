import { motion } from 'framer-motion'
import { ArrowDownToLine, ArrowUpRight, Plus } from 'lucide-react'

const press = { whileTap: { scale: 0.96 }, transition: { type: 'spring', stiffness: 500, damping: 30 } }

export default function Actions({ onSpend, onWithdraw, onEarn }) {
  const items = [
    { icon: ArrowUpRight, title: 'Spend', sub: 'Deals, bills', onClick: onSpend, primary: true },
    { icon: ArrowDownToLine, title: 'Withdraw', sub: 'To your bank', onClick: onWithdraw },
    { icon: Plus, title: 'Earn', sub: 'View all ways', onClick: onEarn },
  ]
  return (
    <div className="flex justify-between px-4">
      {items.map(({ icon: Icon, title, sub, onClick, primary }) => (
        <motion.button key={title} {...press} onClick={onClick} className="flex items-center gap-2 rounded-2xl py-1 text-left">
          <span
            className={`grid h-[42px] w-[42px] shrink-0 place-items-center rounded-full ${
              primary
                ? 'bg-[radial-gradient(circle_at_35%_30%,#F6D488,#D9A441_60%,#B9862E)] text-gold-ink shadow-[0_6px_18px_rgba(226,182,92,0.25)]'
                : 'border border-line bg-sunken text-ink'
            }`}
            aria-hidden="true"
          >
            <Icon size={20} strokeWidth={2} />
          </span>
          <span className="min-w-0">
            <span className="block whitespace-nowrap font-display text-[15px] leading-tight text-ink">{title}</span>
            <span className="mt-0.5 block whitespace-nowrap text-[11px] text-ink-3">{sub}</span>
          </span>
        </motion.button>
      ))}
    </div>
  )
}
