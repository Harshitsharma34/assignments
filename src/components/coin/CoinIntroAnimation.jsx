import { useEffect, useMemo, useRef } from 'react'
import gsap from 'gsap'
import { Canvas, useFrame, useThree } from '@react-three/fiber'
import { Environment, Lightformer } from '@react-three/drei'
import * as THREE from 'three'
import CoinGroup, { FORMATION } from './CoinGroup.jsx'
import { SPIN_FROM, START, T, lerp } from './timeline.js'

const FOV = 30
const TAN = Math.tan((FOV * Math.PI) / 360)

// Smooth curve through keyframes with no overshoot (Fritsch–Carlson monotone cubic).
function monotone(keys) {
  const xs = keys.map((k) => k[0])
  const ys = keys.map((k) => k[1])
  const n = xs.length
  const d = []
  for (let i = 0; i < n - 1; i++) d.push((ys[i + 1] - ys[i]) / (xs[i + 1] - xs[i]))
  // Ends ease in and out (zero slope); interior tangents use the weighted harmonic mean.
  const m = [0]
  for (let i = 1; i < n - 1; i++) {
    const h0 = xs[i] - xs[i - 1]
    const h1 = xs[i + 1] - xs[i]
    const w1 = 2 * h1 + h0
    const w2 = h1 + 2 * h0
    m.push(d[i - 1] * d[i] <= 0 ? 0 : (w1 + w2) / (w1 / d[i - 1] + w2 / d[i]))
  }
  m.push(0)
  return (x) => {
    if (x <= xs[0]) return ys[0]
    if (x >= xs[n - 1]) return ys[n - 1]
    let i = 0
    while (x > xs[i + 1]) i++
    const h = xs[i + 1] - xs[i]
    const t = (x - xs[i]) / h
    const t2 = t * t
    const t3 = t2 * t
    return (2 * t3 - 3 * t2 + 1) * ys[i] + (t3 - 2 * t2 + t) * h * m[i] + (-2 * t3 + 3 * t2) * ys[i + 1] + (t3 - t2) * h * m[i + 1]
  }
}

const TAU = Math.PI * 2
const CAM_START = 1.3

function Rig({ mode, skip, scrub, heroY, heroWidth, celebrateKey, idle, timeline, interaction, onDone }) {
  const { size, camera } = useThree()
  const rig = { group: useRef(), main: useRef(), left: useRef(), right: useRef() }
  const sweep = useRef()
  const glint = useRef()
  const tl = useRef(null)
  const started = useRef(false)
  const done = useRef(false)
  const onDoneRef = useRef(onDone)
  onDoneRef.current = onDone

  // Everything the timeline animates. GSAP tweens these numbers; the frame loop applies them.
  const p = useRef({ dolly: 0, offset: 1, pan: 0, turn: SPIN_FROM, left: 0, right: 0, sweep: 0, glint: 0 }).current
  const fx = useRef({ spin: 0, lift: 0 }).current // earn celebration

  // Final framing: the composition sits on the hero slot at heroWidth px.
  const hero = useMemo(() => {
    const z = (size.height * FORMATION.width) / (heroWidth * 2 * TAN)
    const pxPerUnit = size.height / (2 * z * TAN)
    return { z, y: -(size.height / 2 - heroY) / pxPerUnit }
  }, [size.height, heroWidth, heroY])
  const heroRef = useRef(hero)
  heroRef.current = hero

  const markDone = () => {
    if (done.current) return
    done.current = true
    onDoneRef.current?.()
  }

  // One GSAP master timeline, labelled by phase. Scrub, skip and the repeat-visit intro are seeks.
  useEffect(() => {
    // The dolly is keyed in log-distance so the pull-back reads as one continuous camera move;
    // the keys become a custom ease on a single 0→1 tween.
    const zKeys = [[0, CAM_START], [T.closeup, 1.75], [1.0, 3.6], [T.spin, 9.5], [T.form, 15], [T.end, heroRef.current.z]]
    const l0 = Math.log(CAM_START)
    const l1 = Math.log(heroRef.current.z)
    const dollyEase = monotone(zKeys.map(([t, z]) => [t / T.end, (Math.log(z) - l0) / (l1 - l0)]))

    const master = gsap.timeline({ paused: true })
      .addLabel('closeup', 0)
      .addLabel('spin', T.closeup)
      .addLabel('formation', T.spin)
      .addLabel('wallet', T.form)
      .to(p, { dolly: 1, duration: T.end, ease: dollyEase }, 'closeup')
      .to(p, { offset: 0, duration: T.spin, ease: 'power2.inOut' }, 'closeup')
      .to(p, { turn: TAU, duration: T.spin, ease: 'power3.inOut' }, 'closeup')
      .to(p, { sweep: 1, duration: T.spin, ease: 'sine.inOut' }, 'closeup')
      .to(p, { left: 1, duration: 0.62, ease: 'power3.out' }, 'formation')
      .to(p, { right: 1, duration: 0.62, ease: 'power3.out' }, 'formation+=0.08')
      .to(p, { glint: 1, duration: 0.5, ease: 'none' }, 'formation+=0.15')
      .to(p, { pan: 1, duration: T.end - T.form, ease: 'power3.inOut' }, 'wallet')
      .call(markDone, null, T.end)
    tl.current = master

    if (mode === 'none') {
      master.progress(1)
      markDone()
    } else {
      master.seek(START[mode])
    }
    return () => master.kill()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  useEffect(() => {
    if (skip && tl.current) {
      tl.current.progress(1)
      markDone()
    }
  }, [skip])

  const wasScrubbing = useRef(false)
  useEffect(() => {
    const master = tl.current
    if (!master) return
    if (scrub != null) {
      wasScrubbing.current = true
      master.pause().seek(scrub)
    } else if (wasScrubbing.current) {
      wasScrubbing.current = false
      master.progress(1)
      markDone()
    }
  }, [scrub])

  const lastKey = useRef(celebrateKey)
  useEffect(() => {
    if (celebrateKey === lastKey.current) return
    lastKey.current = celebrateKey
    gsap.timeline()
      .to(fx, { spin: `+=${TAU}`, duration: 1.1, ease: 'power3.inOut' }, 0)
      .to(fx, { lift: 1, duration: 0.4, ease: 'power2.out' }, 0)
      .to(fx, { lift: 0, duration: 0.7, ease: 'power2.inOut' }, 0.4)
  }, [celebrateKey])

  useFrame((state) => {
    const master = tl.current
    if (!master) return
    // Start on the first rendered frame so shader compilation doesn't eat into the intro.
    if (!started.current) {
      started.current = true
      if (mode !== 'none' && scrub == null) master.play()
    }
    timeline?.set(master.time())

    const h = heroRef.current
    const l0 = Math.log(CAM_START)
    camera.position.set(0.4 * p.offset, lerp(0.3 * p.offset, h.y, p.pan), Math.exp(lerp(l0, Math.log(h.z), p.dolly)))

    // Resting motion: a slow float, never a spin.
    const time = state.clock.elapsedTime
    const resting = done.current && idle && scrub == null
    const bob = (phase) => (resting ? Math.sin(time * 1.1 + phase) * 0.035 : 0)
    const sway = resting ? Math.sin(time * 0.55) * 0.07 : 0
    const I = interaction ?? { spin: 0, tiltX: 0, tiltY: 0, lift: 0, left: 0, right: 0 }

    rig.group.current.rotation.set(I.tiltX, I.tiltY, 0)

    const main = rig.main.current
    main.rotation.set(resting ? Math.sin(time * 0.8) * 0.03 : 0, p.turn + fx.spin + I.spin + sway, 0)
    main.position.set(0, bob(0) + fx.lift * 0.12 + I.lift * 0.1, 0)

    const { side } = FORMATION
    for (const [ref, dir, u, spin] of [[rig.left, -1, p.left, I.left], [rig.right, 1, p.right, I.right]]) {
      const o = ref.current
      o.visible = u > 0.001
      o.position.set(dir * side.x * u, side.y * u + bob(dir * 1.3), lerp(-0.3, side.z, u))
      o.scale.setScalar(side.scale)
      o.rotation.set(0, -dir * side.turn * u - sway * 0.4 + spin, 0)
    }

    // A soft key drifts across the gold during the close-up, then settles; one restrained glint.
    sweep.current.position.set(lerp(-4, 3, p.sweep), 2.5, 4)
    sweep.current.intensity = lerp(1.4, 0.35, p.sweep)
    glint.current.intensity = Math.sin(Math.PI * p.glint) * 3
    glint.current.position.set(lerp(-1.8, 1.8, p.glint), 0.9, 2.2)
  })

  return (
    <>
      <ambientLight intensity={0.06} />
      <directionalLight
        castShadow
        position={[-2.2, 3.2, 5]}
        intensity={1.5}
        color="#FFE8C2"
        shadow-mapSize={[1024, 1024]}
        shadow-bias={-0.0004}
        shadow-normalBias={0.015}
        shadow-radius={4}
        shadow-camera-left={-2.4}
        shadow-camera-right={2.4}
        shadow-camera-top={2.4}
        shadow-camera-bottom={-2.4}
        shadow-camera-near={1}
        shadow-camera-far={14}
      />
      <directionalLight ref={sweep} intensity={1.4} color="#FFF3DE" />
      <pointLight ref={glint} intensity={0} distance={6} decay={2} color="#FFF4DC" />
      <CoinGroup rig={rig} />
      <Environment resolution={256} frames={1}>
        {/* Studio softboxes only, no HDRI. Large, soft and low in contrast: champagne key and
            overhead, a front panel for the polished S, amber side strips, a thin rim light behind.
            The dark gaps between them are what darken the bevels. */}
        <Lightformer form="rect" intensity={1.8} color="#FFEBCB" position={[0, 6, 2]} scale={[9, 3, 1]} />
        <Lightformer form="rect" intensity={2.4} color="#FFF3E0" position={[-4.5, 2.5, 5]} scale={[3, 5, 1]} />
        <Lightformer form="rect" intensity={1.1} color="#FFE6C0" position={[0.6, 1.4, 9]} scale={[5, 2.4, 1]} />
        <Lightformer form="rect" intensity={1.4} color="#F4C27A" position={[5.5, 0.5, 3]} scale={[1.6, 6, 1]} />
        <Lightformer form="rect" intensity={0.9} color="#E9B56C" position={[-6, -0.5, 0]} scale={[1.2, 5, 1]} />
        <Lightformer form="rect" intensity={0.8} color="#FFE7C4" position={[7, 0.5, -0.5]} scale={[6, 5, 1]} />
        <Lightformer form="rect" intensity={0.8} color="#FFE2B0" position={[0, -4, 4.5]} scale={[8, 1.4, 1]} />
        <Lightformer form="rect" intensity={1} color="#FFFFFF" position={[0, 1, -6]} scale={[6, 0.6, 1]} />
      </Environment>
    </>
  )
}

export default function CoinIntroAnimation({ height, active = true, ...rigProps }) {
  return (
    <Canvas
      style={{ height, width: '100%', pointerEvents: 'none' }}
      frameloop={active ? 'always' : 'never'}
      dpr={[1, 1.75]}
      shadows={{ type: THREE.PCFSoftShadowMap }}
      camera={{ fov: FOV, position: [0, 0, 15], near: 0.05, far: 80 }}
      gl={{ antialias: true, alpha: true, powerPreference: 'high-performance', toneMapping: THREE.ACESFilmicToneMapping, toneMappingExposure: 1.05 }}
      aria-hidden="true"
    >
      <Rig {...rigProps} />
    </Canvas>
  )
}
