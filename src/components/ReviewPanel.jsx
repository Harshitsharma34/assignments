import { Play, RotateCcw, Send } from 'lucide-react'
import { STATE_ORDER, USER_STATES } from '../data/userStates.js'

// Reviewer-only controls, outside the phone. Not part of the product UI.
export default function ReviewPanel({ stateId, onState, onUpi, onReplay, reduced, onReduced }) {
  return (
    <aside aria-label="Prototype controls" className="w-full max-w-[390px] rounded-3xl border border-line bg-ink-900 p-5 text-fg lg:w-[300px]">
      <p className="label">Prototype controls</p>
      <h2 className="mt-1 text-[16px] font-semibold">Scoins wallet · review</h2>

      <fieldset className="mt-5">
        <legend className="mb-2 text-[13px] text-fg-2">User state</legend>
        <div className="grid grid-cols-2 gap-2 lg:grid-cols-1">
          {STATE_ORDER.map((id) => {
            const s = USER_STATES[id]
            const active = id === stateId
            return (
              <button
                key={id}
                onClick={() => onState(id)}
                aria-pressed={active}
                className={`rounded-xl border px-3 py-2.5 text-left transition-colors ${active ? 'border-gold/60 bg-gold-wash' : 'border-line hover:bg-ink-850'}`}
              >
                <span className="block text-[14px] font-medium">{s.label}</span>
                <span className="block text-[12px] text-fg-3">{s.hint}</span>
              </button>
            )
          })}
        </div>
      </fieldset>

      <div className="mt-5 grid grid-cols-2 gap-2 lg:grid-cols-1">
        <Ctl onClick={onUpi} icon={Send}>Simulate UPI payment</Ctl>
        <Ctl onClick={() => onReplay('full')} icon={Play}>Replay full intro</Ctl>
        <Ctl onClick={() => onReplay('short')} icon={RotateCcw}>Replay repeat-visit intro</Ctl>
        <label className="flex min-h-[44px] cursor-pointer items-center justify-between gap-3 rounded-xl border border-line px-3 text-[14px]">
          Reduced motion
          <input type="checkbox" checked={reduced} onChange={(e) => onReduced(e.target.checked)} className="h-4 w-4 accent-[#E8B547]" />
        </label>
      </div>

      <p className="mt-5 text-[12px] leading-relaxed text-fg-3">
        Earn amounts, deals and card figures are illustrative. Conversion is fixed: 5 Scoins = ₹1 on SalarySe, 10 Scoins = ₹1 to bank.
      </p>
    </aside>
  )
}

function Ctl({ onClick, icon: Icon, children }) {
  return (
    <button onClick={onClick} className="flex min-h-[44px] items-center gap-2 rounded-xl border border-line px-3 text-left text-[14px] hover:bg-ink-850">
      <Icon size={15} aria-hidden="true" className="shrink-0 text-gold" /> {children}
    </button>
  )
}
