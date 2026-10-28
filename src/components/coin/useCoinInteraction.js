import { useRef } from 'react'
import gsap from 'gsap'

const TAU = Math.PI * 2
const RAD_PER_PX = 0.012
const MAIN_HIT = 48 // px either side of centre that count as the main coin

// Touch and pointer handling for the hero coins. It only writes numbers into `state`;
// the 3D frame loop reads them, so React never re-renders during a drag.
//   drag / flick  spins the main coin, which settles face-forward with momentum
//   tap           flips the coin under the finger (main or either side coin)
//   hover         tilts the composition toward the pointer (mouse only)
//   Enter / Space flips the main coin
export function useCoinInteraction(enabled) {
  const state = useRef({ spin: 0, tiltX: 0, tiltY: 0, lift: 0, left: 0, right: 0 }).current
  const drag = useRef(null)

  const settle = (target, duration, ease = 'power3.out') =>
    gsap.to(state, { spin: target, duration, ease, overwrite: 'auto' })

  const flip = (which, dir = 1) => {
    if (which === 'main') {
      const target = (Math.round(state.spin / TAU) + dir) * TAU
      settle(target, 1, 'power2.inOut')
      gsap.timeline()
        .to(state, { lift: 1, duration: 0.35, ease: 'power2.out' })
        .to(state, { lift: 0, duration: 0.6, ease: 'power2.inOut' })
    } else {
      gsap.to(state, { [which]: Math.round(state[which] / TAU) * TAU + TAU * dir, duration: 0.9, ease: 'power3.inOut', overwrite: 'auto' })
    }
  }

  const tilt = (x, y, duration = 0.6) =>
    gsap.to(state, { tiltY: x, tiltX: y, duration, ease: 'power2.out', overwrite: 'auto' })

  const onPointerDown = (e) => {
    if (!enabled) return
    e.currentTarget.setPointerCapture?.(e.pointerId)
    gsap.killTweensOf(state, 'spin')
    drag.current = { startX: e.clientX, lastX: e.clientX, lastT: performance.now(), v: 0, moved: false }
  }

  const onPointerMove = (e) => {
    if (!enabled) return
    const d = drag.current
    if (d) {
      const now = performance.now()
      const dx = e.clientX - d.lastX
      state.spin += dx * RAD_PER_PX
      const dt = Math.max(1, now - d.lastT)
      d.v = d.v * 0.6 + (dx / dt) * 0.4 // px per ms, smoothed
      d.lastX = e.clientX
      d.lastT = now
      if (Math.abs(e.clientX - d.startX) > 6) d.moved = true
      return
    }
    if (e.pointerType === 'mouse') {
      const r = e.currentTarget.getBoundingClientRect()
      const nx = ((e.clientX - r.left) / r.width) * 2 - 1
      const ny = ((e.clientY - r.top) / r.height) * 2 - 1
      tilt(nx * 0.2, ny * 0.14)
    }
  }

  const onPointerUp = (e) => {
    const d = drag.current
    drag.current = null
    if (!enabled || !d) return
    if (!d.moved && e.type === 'pointerup') {
      const r = e.currentTarget.getBoundingClientRect()
      const dx = e.clientX - (r.left + r.width / 2)
      flip(dx < -MAIN_HIT ? 'left' : dx > MAIN_HIT ? 'right' : 'main', dx < -MAIN_HIT ? -1 : 1)
      return
    }
    // Flick: project the release velocity forward, then land on the nearest face-forward turn.
    const velocity = d.v * 1000 * RAD_PER_PX // rad/s
    const projected = state.spin + velocity * 0.3
    const target = Math.round(projected / TAU) * TAU
    const duration = Math.min(1.8, Math.max(0.5, 0.45 + Math.abs(target - state.spin) * 0.12))
    settle(target, duration)
  }

  const onPointerLeave = (e) => {
    if (e.pointerType === 'mouse' && !drag.current) tilt(0, 0, 0.8)
  }

  const onKeyDown = (e) => {
    if (!enabled || (e.key !== 'Enter' && e.key !== ' ')) return
    e.preventDefault()
    flip('main')
  }

  return {
    state,
    handlers: enabled
      ? { onPointerDown, onPointerMove, onPointerUp, onPointerCancel: onPointerUp, onPointerLeave, onKeyDown }
      : {},
  }
}
