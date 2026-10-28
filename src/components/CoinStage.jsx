import { useEffect, useRef } from 'react'
import { Canvas, useFrame, useThree } from '@react-three/fiber'
import { Environment, Lightformer } from '@react-three/drei'
import { Coin, useCoinAssets } from './Coin3D.jsx'

// One continuous timeline drives the camera and the three coins:
//   0.0–0.6  reveal: camera close, coin cropped, light sweeps, slow turn
//   0.6–1.8  pull back while the coin spins 360° and decelerates
//   1.8–2.5  side coins slide out from behind; restrained glint
//   2.5–3.2  formation scales into the wallet hero; UI reveals
// `short` plays only a 0.9s settle; `none` jumps to the resting state.

const FOV = 30
const CAM_END = 13
const T = { reveal: 0.6, spin: 1.8, form: 2.5, end: 3.2 }
const SHORT_END = 0.9
const FORMATION_WIDTH = 2.9 // world units across the three coins at scale 1
const SIDE = { x: 0.74, y: 0.04, z: -0.75, scale: 0.74, turn: 0.42 }

const clamp01 = (x) => Math.min(1, Math.max(0, x))
const lerp = (a, b, t) => a + (b - a) * t
const easeOutCubic = (t) => 1 - Math.pow(1 - t, 3)
const easeInOutCubic = (t) => (t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2)
const easeOutQuint = (t) => 1 - Math.pow(1 - t, 5)

function Rig({ mode, skip, heroY, heroWidth, celebrateKey, idle, onReveal, onDone }) {
  const assets = useCoinAssets()
  const { size, camera } = useThree()
  const group = useRef()
  const main = useRef()
  const left = useRef()
  const right = useRef()
  const sweep = useRef()
  const glint = useRef()
  const clock = useRef(0)
  const fired = useRef({ reveal: false, done: false })
  const celebrate = useRef({ key: celebrateKey, t: Infinity })

  const endTime = mode === 'full' ? T.end : mode === 'short' ? SHORT_END : 0

  useEffect(() => {
    if (skip) clock.current = endTime
  }, [skip, endTime])

  useEffect(() => {
    if (celebrateKey !== celebrate.current.key) celebrate.current = { key: celebrateKey, t: 0 }
  }, [celebrateKey])

  useFrame((state, delta) => {
    const dt = Math.min(delta, 0.1) // follow wall-clock time; only skip huge gaps (tab switches)
    clock.current = Math.min(endTime, clock.current + dt)
    const t = clock.current

    // Resting layout: formation centred on the hero slot, sized to heroWidth px.
    const halfH = CAM_END * Math.tan((FOV * Math.PI) / 360)
    const pxPerUnit = size.height / (2 * halfH)
    const heroScale = heroWidth / (FORMATION_WIDTH * pxPerUnit)
    const heroWorldY = (size.height / 2 - heroY) / pxPerUnit

    let camZ = CAM_END
    let camX = 0
    let camY = 0
    let spin = 0
    let side = 1
    let settle = 1
    let glintI = 0
    let sweepX = 3

    if (mode === 'full') {
      if (t < T.reveal) {
        const u = t / T.reveal
        camZ = lerp(2.1, 2.9, easeInOutCubic(u))
        spin = lerp(-0.55, -0.32, u)
        sweepX = lerp(-5, 1, u)
      } else if (t < T.spin) {
        const u = (t - T.reveal) / (T.spin - T.reveal)
        camZ = lerp(2.9, 10, easeOutCubic(u))
        spin = lerp(-0.32, Math.PI * 2, easeOutQuint(u))
        sweepX = lerp(1, 4, u)
      } else {
        const u = clamp01((t - T.spin) / (T.form - T.spin))
        camZ = lerp(10, CAM_END, easeInOutCubic(u))
        spin = Math.PI * 2
        glintI = Math.sin(Math.PI * clamp01((t - 1.95) / 0.45)) * 5
      }
      const pre = clamp01(t / T.spin)
      camX = 0.42 * (1 - easeOutCubic(pre))
      camY = 0.28 * (1 - easeOutCubic(pre))
      side = clamp01((t - T.spin) / (T.form - T.spin))
      settle = easeInOutCubic(clamp01((t - T.form) / (T.end - T.form)))
      if (t >= T.form + 0.22 && !fired.current.reveal) {
        fired.current.reveal = true
        onReveal?.()
      }
    } else if (mode === 'short') {
      const u = easeOutCubic(t / SHORT_END)
      spin = lerp(-1.1, 0, u)
      settle = 1
      side = 1
      if (!fired.current.reveal) {
        fired.current.reveal = true
        onReveal?.()
      }
    } else if (!fired.current.reveal) {
      fired.current.reveal = true
      onReveal?.()
    }

    if (t >= endTime && !fired.current.done) {
      fired.current.done = true
      onDone?.()
    }

    // Celebration: one extra turn with a small lift, used when a reward lands.
    let celebrateSpin = 0
    let lift = 0
    const c = celebrate.current
    if (c.t < 1) {
      c.t = Math.min(1, c.t + dt / 0.95)
      celebrateSpin = Math.PI * 2 * easeOutCubic(c.t)
      lift = Math.sin(Math.PI * c.t) * 0.09
    }

    const resting = fired.current.done && mode !== 'none'
    const drift = idle && resting ? Math.sin(state.clock.elapsedTime * 0.7) * 0.12 : 0

    camera.position.set(camX, camY, camZ)

    const shortGrow = mode === 'short' ? lerp(1.18, 1, easeOutCubic(t / SHORT_END)) : 1
    group.current.scale.setScalar(lerp(1, heroScale, settle) * shortGrow)
    group.current.position.y = lerp(0, heroWorldY, settle)

    main.current.rotation.y = spin + celebrateSpin + drift
    main.current.position.y = lift
    main.current.scale.setScalar(1 + lift * 0.6)

    const sl = easeOutCubic(side)
    const sr = easeOutCubic(clamp01((side * 0.7 - 0.08) / 0.62))
    for (const [ref, s, dir] of [[left, sl, -1], [right, sr, 1]]) {
      ref.current.visible = s > 0.001
      ref.current.position.set(dir * SIDE.x * s, SIDE.y * s, lerp(-0.25, SIDE.z, s))
      ref.current.scale.setScalar(lerp(0.55, SIDE.scale, s))
      ref.current.rotation.y = -dir * SIDE.turn * s - drift * 0.5
    }

    sweep.current.position.x = sweepX
    glint.current.intensity = glintI
    glint.current.position.x = lerp(-1.6, 1.6, clamp01((t - 1.95) / 0.45))
  })

  return (
    <>
      <ambientLight intensity={0.12} />
      <directionalLight ref={sweep} position={[3, 2.5, 4]} intensity={2.2} color="#FFF1D2" />
      <pointLight ref={glint} position={[0, 0.8, 2]} intensity={0} distance={6} color="#FFF6E0" />
      <group ref={group}>
        <group ref={left}><Coin assets={assets} /></group>
        <group ref={right}><Coin assets={assets} /></group>
        <group ref={main}><Coin assets={assets} /></group>
      </group>
      <Environment resolution={256} frames={1}>
        {/* Studio light formers, no network-loaded HDRI. Warm key, soft fill, thin rim strips. */}
        <Lightformer form="rect" intensity={2.4} color="#FFE7B8" position={[0, 5, 2]} scale={[10, 3, 1]} />
        <Lightformer form="rect" intensity={1.4} color="#FFF4DE" position={[-5, 1, 3]} rotation-y={Math.PI / 2} scale={[6, 2, 1]} />
        <Lightformer form="rect" intensity={0.9} color="#FFD58A" position={[5, -1, 2]} rotation-y={-Math.PI / 2} scale={[6, 1.2, 1]} />
        <Lightformer form="rect" intensity={0.9} color="#FFE9BF" position={[0, 0.5, 9]} scale={[9, 6, 1]} />
        <Lightformer form="ring" intensity={0.8} color="#FFFFFF" position={[1.5, 1.5, 6]} scale={2} />
      </Environment>
    </>
  )
}

export default function CoinStage({ height, ...rigProps }) {
  return (
    <Canvas
      style={{ height, width: '100%', pointerEvents: 'none' }}
      dpr={[1, 1.75]}
      camera={{ fov: FOV, position: [0, 0, CAM_END], near: 0.1, far: 50 }}
      gl={{ antialias: true, powerPreference: 'high-performance', alpha: true }}
      aria-hidden="true"
    >
      <Rig {...rigProps} />
    </Canvas>
  )
}
