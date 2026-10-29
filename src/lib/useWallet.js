import { useMemo, useReducer } from 'react'
import { USER_STATES } from '../data/userStates.js'
import { bankValue, inAppValue } from './scoins.js'

const nowStamp = () => new Date().toISOString().slice(0, 16)
const balanceOf = (state) => state.lifetime.earned - state.lifetime.spent - state.lifetime.withdrawn

function init(stateId) {
  const s = USER_STATES[stateId]
  return { stateId, activity: s.activity, lifetime: s.lifetime, upi: s.upi, celebrateKey: 0, lastEvent: null }
}

function reducer(state, action) {
  switch (action.type) {
    case 'switch':
      return { ...init(action.stateId), celebrateKey: state.celebrateKey }
    case 'upi': {
      const done = state.upi.done + 1
      if (done < state.upi.target) {
        return { ...state, upi: { ...state.upi, done }, lastEvent: { type: 'progress', left: state.upi.target - done, id: Date.now() } }
      }
      const reward = state.upi.reward
      const entry = {
        id: `sim-${Date.now()}`,
        kind: 'upi',
        title: 'UPI bonus · 5th payment',
        source: 'UPI',
        scoins: reward,
        at: new Date().toISOString().slice(0, 16),
        rule: 'Every 5th UPI payment through SalarySe earns a bonus.',
        fresh: true,
      }
      return {
        ...state,
        upi: { ...state.upi, done: 0 },
        activity: [...state.activity, entry],
        lifetime: { ...state.lifetime, earned: state.lifetime.earned + reward },
        celebrateKey: state.celebrateKey + 1,
        lastEvent: { type: 'reward', scoins: reward, id: Date.now() },
      }
    }
    case 'redeem': {
      // Spending in-app: full 5 Scoins = ₹1 value, recorded as a saving.
      const { scoins, title, source } = action
      if (scoins <= 0 || scoins > balanceOf(state)) return state
      const entry = { id: `red-${Date.now()}`, kind: 'redeem', title, source, scoins: -scoins, at: nowStamp(), saved: inAppValue(scoins), fresh: true }
      return {
        ...state,
        activity: [...state.activity, entry],
        lifetime: { ...state.lifetime, spent: state.lifetime.spent + scoins },
        lastEvent: { type: 'redeemed', scoins, rupees: inAppValue(scoins), id: Date.now() },
      }
    }
    case 'withdraw': {
      // Cash-out at 10 Scoins = ₹1. Shown as money sent, never as a loss.
      const { scoins, to = 'Bank account', ref } = action
      if (scoins <= 0 || scoins > balanceOf(state)) return state
      const entry = {
        id: ref ?? `wd-${Date.now()}`, kind: 'withdraw', title: 'Withdrawn to bank', source: `UPI · ${to}`, scoins: -scoins,
        at: nowStamp(), sent: bankValue(scoins), status: 'Transferred', fresh: true,
      }
      return {
        ...state,
        activity: [...state.activity, entry],
        lifetime: { ...state.lifetime, withdrawn: state.lifetime.withdrawn + scoins },
        lastEvent: { type: 'withdrawn', scoins, rupees: bankValue(scoins), id: Date.now() },
      }
    }
    default:
      return state
  }
}

export function useWallet(initialId) {
  const [state, dispatch] = useReducer(reducer, initialId, init)
  const profile = USER_STATES[state.stateId]

  const derived = useMemo(() => {
    // Running balance per row, computed chronologically from the opening balance.
    let running = profile.opening
    const rows = state.activity.map((t) => {
      running += t.scoins
      return { ...t, balanceAfter: running }
    })
    const balance = running
    const expected = state.lifetime.earned - state.lifetime.spent - state.lifetime.withdrawn
    if (balance !== expected) console.warn(`[scoins] balance ${balance} ≠ lifetime ${expected} for ${state.stateId}`)
    const month = rows.filter((r) => r.at.startsWith('2026-10') || r.fresh)
    return {
      balance,
      rows: rows.slice().reverse(),
      monthEarned: month.filter((r) => r.scoins > 0).reduce((a, r) => a + r.scoins, 0),
      monthSpent: month.filter((r) => r.scoins < 0).reduce((a, r) => a - r.scoins, 0),
      pendingTotal: profile.pending.reduce((a, p) => a + p.scoins, 0),
    }
  }, [state.activity, state.lifetime, profile, state.stateId])

  return { state, profile, ...derived, dispatch }
}
