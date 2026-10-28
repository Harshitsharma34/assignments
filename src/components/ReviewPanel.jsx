import { Play, RotateCcw, Send } from 'lucide-react'
import { STATE_ORDER, USER_STATES } from '../data/userStates.js'
import { T, timeAtAngle } from './coin/timeline.js'

const PHASES = [[T.closeup, 'Close-up'], [T.spin, 'Rotation'], [T.form, 'Formation'], [T.end, 'Into wallet']]
const phaseAt = (t) => PHASES.find(([end]) => t <= end)?.[1] ?? 'Wallet'

// Reviewer-only controls, outside the phone. Not part of the product UI.
export default function ReviewPanel({ stateId, onState, onUpi, onReplay, reduced, onReduced, scrub, onScrub }) {
  return (
    <aside aria-label="Prototype controls" className="w-full max-w-[390px] rounded-3xl border border-line bg-surface p-5 text-ink lg:w-[300px]">
      <p className="label">Prototype controls</p>
      <h2 className="mt-1 text-[16px] font-semibold">Scoins wallet · review</h2>

      <fieldset className="mt-5">
        <legend className="mb-2 text-[13px] text-ink-2">User state</legend>
        <div className="grid grid-cols-2 gap-2 lg:grid-cols-1">
          {STATE_ORDER.map((id) => {
            const s = USER_STATES[id]
            const active = id === stateId
            return (
              <button
                key={id}
                onClick={() => onState(id)}
                aria-pressed={active}
                className={`rounded-xl border px-3 py-2.5 text-left transition-colors ${active ? 'border-gold/60 bg-gold-wash' : 'border-line hover:bg-surface'}`}
              >
                <span className="block text-[14px] font-medium">{s.label}</span>
                <span className="block text-[12px] text-ink-3">{s.hint}</span>
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
          <input type="checkbox" checked={reduced} onChange={(e) => onReduced(e.target.checked)} className="h-4 w-4 accent-[#8A6114]" />
        </label>
      </div>

      <fieldset className="mt-5 rounded-xl border border-line p-3">
        <legend className="px-1 text-[13px] text-ink-2">Inspect the intro</legend>
        <label htmlFor="scrub" className="flex justify-between text-[12px] text-ink-3 tnum">
          <span>{scrub == null ? 'Live' : `${scrub.toFixed(2)}s · ${phaseAt(scrub)}`}</span>
          <span>0–{T.end}s</span>
        </label>
        <input
          id="scrub"
          type="range"
          min={0}
          max={T.end}
          step={0.01}
          value={scrub ?? T.end}
          onChange={(e) => onScrub(Number(e.target.value))}
          className="mt-2 w-full accent-[#8A6114]"
        />
        <div className="mt-2 grid grid-cols-3 gap-2">
          <Ctl onClick={() => onScrub(timeAtAngle(45))}>45°</Ctl>
          <Ctl onClick={() => onScrub(timeAtAngle(90))}>90°</Ctl>
          <Ctl onClick={() => onScrub(null)}>Resume</Ctl>
        </div>
      </fieldset>

      <p className="mt-5 text-[12px] leading-relaxed text-ink-3">
        Earn amounts, deals and card figures are illustrative. Conversion is fixed: 5 Scoins = ₹1 on SalarySe, 10 Scoins = ₹1 to bank.
      </p>
    </aside>
  )
}

function Ctl({ onClick, icon: Icon, children }) {
  return (
    <button onClick={onClick} className="flex min-h-[44px] items-center gap-2 rounded-xl border border-line px-3 text-left text-[14px] hover:bg-surface">
      {Icon && <Icon size={15} aria-hidden="true" className="shrink-0 text-accent" />} {children}
    </button>
  )
}
