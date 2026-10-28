import { createContext, useContext } from 'react'

// One timeline (in seconds) drives the camera, the coins and the wallet DOM reveal.
export const T = {
  closeup: 0.5, // extreme close-up, camera starts pulling back
  spin: 1.6, // full 360° turn while the camera recedes
  form: 2.3, // side coins slide out from behind
  end: 3.0, // composition settles into the wallet hero
}

// Repeat visits start at the wallet transition; reduced motion jumps to the end.
export const START = { full: 0, short: T.form, none: T.end }

// Wallet blocks fade in during the last phase, staggered, and always finish by T.end.
export function revealWindow(index) {
  const duration = 0.36
  const start = Math.min(T.form + 0.06 + index * 0.05, T.end - duration)
  return [start, start + duration]
}

export const IntroTimeline = createContext(null)
export const useIntroTimeline = () => useContext(IntroTimeline)

export const clamp01 = (x) => Math.min(1, Math.max(0, x))
export const lerp = (a, b, t) => a + (b - a) * t
export const easeInOutCubic = (t) => (t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2)
export const easeOutCubic = (t) => 1 - Math.pow(1 - t, 3)
export const easeInOutSine = (t) => -(Math.cos(Math.PI * t) - 1) / 2

// Time at which the main coin's turn reaches a given angle (inverse of the spin curve).
export const SPIN_FROM = -0.42
export function timeAtAngle(deg) {
  const e = ((deg * Math.PI) / 180 - SPIN_FROM) / (Math.PI * 2 - SPIN_FROM)
  const u = e < 0.5 ? Math.cbrt(e / 4) : 1 - Math.cbrt(2 * (1 - e)) / 2
  return u * T.spin
}
