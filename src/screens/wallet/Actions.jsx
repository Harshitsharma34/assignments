import { motion } from 'framer-motion'
import { ArrowDownToLine, ArrowUpRight, History, Plus } from 'lucide-react'

const press = { whileTap: { scale: 0.94 }, transition: { type: 'spring', stiffness: 500, damping: 30 } }

// Four quick actions: identical circles with a short label underneath.
export default function Actions({ onSpend, onWithdraw, onEarn, onHistory }) {
  const items = [
    { icon: ArrowUpRight, label: 'Spend', onClick: onSpend, primary: true },
    { icon: ArrowDownToLine, label: 'Withdraw', onClick: onWithdraw },
    { icon: Plus, label: 'Earn', onClick: onEarn },
    { icon: History, label: 'History', onClick: onHistory },
  ]
  return (
    <div className="grid grid-cols-4 px-4">
      {items.map(({ icon: Icon, label, onClick, primary }) => (
        <motion.button key={label} {...press} onClick={onClick} className="flex flex-col items-center gap-2 py-1">
          <span
            className={`grid h-12 w-12 place-items-center rounded-full ${primary ? 'bg-gold text-gold-ink' : 'bg-sunken text-ink'}`}
            aria-hidden="true"
          >
            <Icon size={20} strokeWidth={2} />
          </span>
          <span className="text-[13px] text-ink">{label}</span>
        </motion.button>
      ))}
    </div>
  )
}
