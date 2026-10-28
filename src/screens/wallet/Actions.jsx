import { ArrowDownToLine, Plus, ShoppingBag } from 'lucide-react'
import { motion } from 'framer-motion'

const press = { whileTap: { scale: 0.97 }, transition: { type: 'spring', stiffness: 500, damping: 30 } }

export default function Actions({ onSpend, onWithdraw, onEarn }) {
  return (
    <div className="grid grid-cols-[1.45fr_1fr_1fr] gap-2.5 px-5">
      <motion.button {...press} onClick={onSpend} className="flex h-[52px] items-center justify-center gap-2 rounded-2xl bg-ink text-[15px] font-semibold text-surface shadow-[inset_0_-1px_0_rgb(var(--gold)/0.55)] hover:bg-ink/90">
        <ShoppingBag size={18} aria-hidden="true" /> Spend Scoins
      </motion.button>
      <motion.button {...press} onClick={onWithdraw} className="flex h-[52px] items-center justify-center gap-1.5 rounded-2xl border-[1.5px] border-ink/85 bg-surface text-[14px] font-medium text-ink hover:bg-sunken">
        <ArrowDownToLine size={17} aria-hidden="true" className="text-ink-2" /> Withdraw
      </motion.button>
      <motion.button {...press} onClick={onEarn} className="flex h-[52px] items-center justify-center gap-1.5 rounded-2xl border-[1.5px] border-ink/85 bg-surface text-[14px] font-medium text-ink hover:bg-sunken">
        <Plus size={17} aria-hidden="true" className="text-ink-2" /> Earn
      </motion.button>
    </div>
  )
}
