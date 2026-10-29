import { useEffect, useRef } from 'react'
import { createPortal } from 'react-dom'
import { useReducedMotion } from 'framer-motion'
import coinSrc from '../assets/scoin.webp'

// One celebratory burst on a canvas over the phone screen: a fountain from the success badge
// and two side cannons. Pieces are ribbons, flecks and tiny gold coins, with gravity, drag,
// spin and a flutter so they fall like paper rather than sliding. Skipped under reduced motion.
// The 3D Scoin still, drawn for the coin pieces.
const COIN = typeof Image !== 'undefined' ? Object.assign(new Image(), { src: coinSrc }) : {}
const COLORS = ['#E2B65C', '#F6D488', '#FFF3DC', '#B9862E', '#F2CD7E', '#5ED68C', '#FFFFFF']

function makePiece(x, y, angle, speed) {
  const kind = Math.random()
  return {
    x, y,
    vx: Math.cos(angle) * speed,
    vy: Math.sin(angle) * speed,
    rot: Math.random() * Math.PI * 2,
    vr: (Math.random() - 0.5) * 0.35,
    flutter: Math.random() * Math.PI * 2,
    w: 5 + Math.random() * 6,
    h: 3 + Math.random() * 4,
    shape: kind < 0.16 ? 'coin' : kind < 0.62 ? 'ribbon' : 'fleck',
    color: COLORS[(Math.random() * COLORS.length) | 0],
  }
}

export default function Confetti({ originRef, rootId = 'phone-screen' }) {
  const canvas = useRef(null)
  const reduce = useReducedMotion()
  const root = typeof document !== 'undefined' ? document.getElementById(rootId) : null

  useEffect(() => {
    if (reduce || !root || !canvas.current) return
    const c = canvas.current
    const rect = root.getBoundingClientRect()
    const dpr = Math.min(2, window.devicePixelRatio || 1)
    c.width = rect.width * dpr
    c.height = rect.height * dpr
    const ctx = c.getContext('2d')
    ctx.scale(dpr, dpr)

    const o = originRef?.current?.getBoundingClientRect()
    const ox = o ? o.left + o.width / 2 - rect.left : rect.width / 2
    const oy = o ? o.top + o.height / 2 - rect.top : rect.height * 0.55

    const pieces = []
    for (let i = 0; i < 120; i++) pieces.push(makePiece(ox, oy, -Math.PI / 2 + (Math.random() - 0.5) * 1.9, 9 + Math.random() * 11))
    // Side cannons, a beat later.
    const cannons = setTimeout(() => {
      for (let i = 0; i < 60; i++) pieces.push(makePiece(-10, rect.height * 0.7, -Math.PI * 0.36 + (Math.random() - 0.5) * 0.5, 13 + Math.random() * 8))
      for (let i = 0; i < 60; i++) pieces.push(makePiece(rect.width + 10, rect.height * 0.7, -Math.PI * 0.64 + (Math.random() - 0.5) * 0.5, 13 + Math.random() * 8))
    }, 140)

    const start = performance.now()
    let last = start
    let raf
    const tick = (now) => {
      const t = (now - start) / 1000
      // Physics in 60 fps units, scaled by real elapsed time so slow devices look the same.
      const k = Math.min(3, (now - last) / (1000 / 60))
      last = now
      ctx.clearRect(0, 0, rect.width, rect.height)
      const fade = t > 3.4 ? Math.max(0, 1 - (t - 3.4) / 0.9) : 1
      for (const p of pieces) {
        // Paper drag: fast launch, then a slow, fluttering fall at a gentle terminal speed.
        const drag = Math.pow(0.965, k)
        p.vx *= drag
        p.vy = p.vy * drag + 0.2 * k
        if (p.vy > 2.6) p.vy = 2.6 + (p.vy - 2.6) * 0.5
        p.flutter += 0.11 * k
        p.x += (p.vx + Math.sin(p.flutter) * 0.9) * k
        p.y += p.vy * k
        p.rot += p.vr * k
        if (p.y > rect.height + 20) continue
        ctx.save()
        ctx.globalAlpha = fade
        ctx.translate(p.x, p.y)
        ctx.rotate(p.rot)
        if (p.shape === 'coin') {
          ctx.scale(Math.abs(Math.cos(p.flutter)) * 0.8 + 0.2, 1) // spins like a coin seen edge-on
          if (COIN.complete) ctx.drawImage(COIN, -7, -7, 14, 14)
        } else if (p.shape === 'ribbon') {
          ctx.fillStyle = p.color
          ctx.fillRect(-p.w / 2, -p.h / 4, p.w, (p.h / 2) * (0.4 + Math.abs(Math.sin(p.flutter))))
        } else {
          ctx.fillStyle = p.color
          ctx.beginPath(); ctx.arc(0, 0, p.h / 2.4, 0, Math.PI * 2); ctx.fill()
        }
        ctx.restore()
      }
      if (t < 4.4) raf = requestAnimationFrame(tick)
      else ctx.clearRect(0, 0, rect.width, rect.height)
    }
    raf = requestAnimationFrame(tick)
    return () => {
      clearTimeout(cannons)
      cancelAnimationFrame(raf)
    }
  }, [reduce, root, originRef])

  if (!root || reduce) return null
  return createPortal(<canvas ref={canvas} aria-hidden="true" className="pointer-events-none absolute inset-0 z-[70] h-full w-full" />, root)
}
