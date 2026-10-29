import { motion } from 'framer-motion'
import { ArrowDownToLine, ArrowUpRight, History, Plus } from 'lucide-react'
import ScoinGlyph from '../../components/ScoinGlyph.jsx'

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
          {primary ? (
            <FlipCoin icon={Icon} />
          ) : (
            <span className="grid h-12 w-12 place-items-center rounded-full bg-sunken text-ink" aria-hidden="true">
              <Icon size={20} strokeWidth={2} />
            </span>
          )}
          <span className="text-[13px] text-ink">{label}</span>
        </motion.button>
      ))}
    </div>
  )
}

// Spend keeps turning over like a coin: the arrow face flips to a Scoin, rests, then flips back.
function FlipCoin({ icon: Icon }) {
  return (
    <span className="h-12 w-12 [perspective:400px]" aria-hidden="true">
      <span className="flip-coin relative block h-full w-full [transform-style:preserve-3d]">
        <span className="absolute inset-0 grid place-items-center rounded-full bg-gold text-gold-ink [backface-visibility:hidden]">
          <Icon size={20} strokeWidth={2} />
        </span>
        <span className="absolute inset-0 grid place-items-center rounded-full bg-[radial-gradient(circle_at_35%_30%,#FBE3A6,#E2B65C_60%,#B9862E)] [backface-visibility:hidden] [transform:rotateY(180deg)]">
          <ScoinGlyph size={36} />
        </span>
      </span>
    </span>
  )
}
