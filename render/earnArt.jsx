// Offline renderer for the Earn card illustrations. Not part of the app bundle:
// With `npx vite --port 5174` running, `node render/capture.cjs <dir>` screenshots each scene to
// transparent PNGs, which are then trimmed and saved as src/assets/earn/<name>.webp (176px).
import { createRoot } from 'react-dom/client'
import { useMemo } from 'react'
import * as THREE from 'three'
import { Canvas } from '@react-three/fiber'
import { Environment, Lightformer, RoundedBox } from '@react-three/drei'
import Scoin3D from '../src/components/coin/Scoin3D.jsx'
import { useScoinMaterials } from '../src/components/coin/ScoinMaterial.js'

const art = new URLSearchParams(location.search).get('art') || 'upi'

function useMats() {
  return useMemo(() => ({
    gold: new THREE.MeshPhysicalMaterial({ color: '#D9AE62', metalness: 1, roughness: 0.28 }),
    goldSatin: new THREE.MeshPhysicalMaterial({ color: '#C49A52', metalness: 1, roughness: 0.45 }),
    graphite: new THREE.MeshPhysicalMaterial({ color: '#1E1E21', metalness: 0.6, roughness: 0.35, clearcoat: 0.6 }),
    glass: new THREE.MeshPhysicalMaterial({ color: '#0D0D10', metalness: 0.2, roughness: 0.08, clearcoat: 1 }),
    ivory: new THREE.MeshPhysicalMaterial({ color: '#EDE6D6', metalness: 0, roughness: 0.6 }),
  }), [])
}

function Coin({ coin, ...p }) {
  return <Scoin3D materials={coin} {...p} />
}

function Stack({ coin, count, ...p }) {
  return (
    <group {...p}>
      {Array.from({ length: count }, (_, i) => (
        <Coin key={i} coin={coin} rotation={[-Math.PI / 2 + 0.02 * (i % 2), 0, 0.3 * i]} position={[0.02 * Math.sin(i), i * 0.25, 0]} />
      ))}
    </group>
  )
}

function shape(points) {
  const s = new THREE.Shape()
  points.forEach(([x, y], i) => (i ? s.lineTo(x, y) : s.moveTo(x, y)))
  s.closePath()
  return s
}

function Scene() {
  const coin = useScoinMaterials()
  const m = useMats()
  const ext = (s, depth = 0.25) => new THREE.ExtrudeGeometry(s, { depth, bevelEnabled: true, bevelSize: 0.04, bevelThickness: 0.04, bevelSegments: 3 })
  const scenes = {
    upi: (
      <group rotation={[0.1, -0.45, 0.05]}>
        <RoundedBox args={[1.25, 2.3, 0.14]} radius={0.16} smoothness={6} material={m.graphite} />
        <RoundedBox args={[1.1, 2.12, 0.02]} radius={0.12} position={[0, 0, 0.075]} material={m.glass} />
        <Coin coin={coin} scale={0.62} position={[0.55, -0.55, 0.55]} rotation={[0.15, 0.6, 0]} />
      </group>
    ),
    rent: (
      <group rotation={[0.15, -0.55, 0]} position={[0, -0.2, 0]}>
        <mesh geometry={ext(shape([[-0.9, -0.8], [0.9, -0.8], [0.9, 0.35], [0, 1.15], [-0.9, 0.35]]), 0.9)} material={m.goldSatin} position={[0, 0, -0.45]} />
        <RoundedBox args={[0.42, 0.62, 0.06]} radius={0.04} position={[0, -0.5, 0.5]} material={m.graphite} />
        <Coin coin={coin} scale={0.5} position={[0.95, -0.55, 0.65]} rotation={[0.1, 0.4, 0]} />
      </group>
    ),
    bills: (
      <group rotation={[0.2, -0.4, 0.08]}>
        <mesh geometry={ext(shape([[-0.75, 1.1], [0.75, 1.1], [0.75, -1.0], [0.5, -1.15], [0.25, -1.0], [0, -1.15], [-0.25, -1.0], [-0.5, -1.15], [-0.75, -1.0]]), 0.04)} material={m.ivory} />
        {[0.6, 0.3, 0.0, -0.3].map((y, i) => <RoundedBox key={y} args={[i === 0 ? 0.9 : 1.1, 0.08, 0.02]} radius={0.02} position={[-0.1 + (i === 0 ? -0.1 : 0), y, 0.08]} material={i === 0 ? m.gold : m.graphite} />)}
        <Stack coin={coin} count={3} scale={0.45} position={[0.75, -1.05, 0.5]} />
      </group>
    ),
    emi: (
      <group rotation={[0.2, -0.5, 0.05]}>
        <RoundedBox args={[1.7, 1.7, 0.22]} radius={0.16} smoothness={6} material={m.ivory} />
        <RoundedBox args={[1.7, 0.42, 0.24]} radius={0.12} position={[0, 0.64, 0.01]} material={m.gold} />
        {[-0.4, 0.4].map((x) => <RoundedBox key={x} args={[0.12, 0.42, 0.12]} radius={0.05} position={[x, 0.95, 0.05]} material={m.graphite} />)}
        {/* Check mark: two bars. */}
        <RoundedBox args={[0.42, 0.13, 0.08]} radius={0.04} position={[-0.22, -0.28, 0.14]} rotation={[0, 0, -0.8]} material={m.graphite} />
        <RoundedBox args={[0.78, 0.13, 0.08]} radius={0.04} position={[0.14, -0.16, 0.14]} rotation={[0, 0, 0.85]} material={m.graphite} />
      </group>
    ),
    campaign: (
      <group rotation={[0.3, -0.6, 0]} position={[0, -0.25, 0]}>
        <RoundedBox args={[1.5, 1.1, 1.5]} radius={0.08} material={m.graphite} />
        <RoundedBox args={[1.62, 0.28, 1.62]} radius={0.06} position={[0, 0.6, 0]} material={m.graphite} />
        <RoundedBox args={[0.24, 1.42, 1.56]} radius={0.04} position={[0, 0.06, 0]} material={m.gold} />
        <RoundedBox args={[1.56, 1.42, 0.24]} radius={0.04} position={[0, 0.06, 0]} material={m.gold} />
        <mesh material={m.gold} position={[-0.25, 0.95, 0]} rotation={[0, 0, 0.6]}><torusGeometry args={[0.24, 0.07, 16, 40]} /></mesh>
        <mesh material={m.gold} position={[0.25, 0.95, 0]} rotation={[0, 0, -0.6]}><torusGeometry args={[0.24, 0.07, 16, 40]} /></mesh>
      </group>
    ),
    card: (
      <group rotation={[0.35, -0.5, 0.25]}>
        <RoundedBox args={[2.3, 1.45, 0.06]} radius={0.12} smoothness={6} material={m.graphite} />
        <RoundedBox args={[0.42, 0.32, 0.03]} radius={0.05} position={[-0.7, 0.18, 0.04]} material={m.gold} />
        <RoundedBox args={[1.2, 0.08, 0.02]} radius={0.02} position={[-0.25, -0.38, 0.04]} material={m.goldSatin} />
        <Coin coin={coin} scale={0.5} position={[0.85, -0.6, 0.45]} rotation={[0.2, 0.5, 0]} />
      </group>
    ),
    streak: (
      <group rotation={[0.25, -0.5, 0]} position={[0, -0.75, 0]}>
        <Stack coin={coin} count={1} scale={0.5} position={[-0.75, 0, 0]} />
        <Stack coin={coin} count={2} scale={0.5} position={[0, 0, 0.1]} />
        <Stack coin={coin} count={3} scale={0.5} position={[0.75, 0, 0.2]} />
      </group>
    ),
    autopay: (
      <group rotation={[0.2, -0.3, 0]}>
        <Coin coin={coin} scale={0.75} rotation={[0.1, 0.35, 0]} />
        <mesh material={m.gold} rotation={[1.25, 0, 0]}><torusGeometry args={[1.1, 0.05, 16, 96, Math.PI * 1.7]} /></mesh>
        <mesh material={m.gold} position={[1.08, 0.18, 0.3]} rotation={[0, 0, -0.4]}><coneGeometry args={[0.13, 0.3, 24]} /></mesh>
      </group>
    ),
    first: (
      <group rotation={[0.15, -0.35, 0]}>
        <Coin coin={coin} scale={0.8} rotation={[0.1, 0.4, 0]} />
        {[[0.95, 0.75, 0.3, 0.16], [-0.95, 0.45, 0.2, 0.11], [0.75, -0.85, 0.4, 0.09]].map(([x, y, z, s]) => (
          <mesh key={x} material={m.gold} position={[x, y, z]} scale={s} rotation={[0.4, 0.4, 0]}><octahedronGeometry args={[1, 0]} /></mesh>
        ))}
      </group>
    ),
    // Single coin, almost face-on, filling the frame: used for every inline Scoin in the app.
    coin: <Coin coin={coin} scale={1.6} rotation={[0.1, -0.16, 0]} />,
    recurring: (
      <group rotation={[0.25, -0.4, 0]} position={[0, -0.9, 0]}>
        <Stack coin={coin} count={6} scale={0.55} />
        <Stack coin={coin} count={3} scale={0.55} position={[0.95, 0, 0.3]} />
      </group>
    ),
  }
  return scenes[art]
}

function App() {
  return (
    <Canvas
      gl={{ alpha: true, antialias: true, preserveDrawingBuffer: true, toneMapping: THREE.ACESFilmicToneMapping }}
      camera={{ fov: 30, position: [0, 0, 7.2] }}
      dpr={2}
      style={{ width: 240, height: 240 }}
      onCreated={({ gl }) => { if (art === 'coin') gl.toneMappingExposure = 1.55; setTimeout(() => (window.__ready = true), 600) }}
    >
      <ambientLight intensity={0.15} />
      <directionalLight position={[-2.5, 3.5, 5]} intensity={2.2} color="#FFE8C2" />
      <Scene />
      <Environment resolution={256} frames={1}>
        <Lightformer form="rect" intensity={2} color="#FFEBCB" position={[0, 6, 2]} scale={[9, 3, 1]} />
        <Lightformer form="rect" intensity={2.4} color="#FFF3E0" position={[-4.5, 2.5, 5]} scale={[3, 5, 1]} />
        <Lightformer form="rect" intensity={2.6} color="#FFE6C0" position={[0.4, 1, 9]} scale={[7, 4, 1]} />
        <Lightformer form="rect" intensity={1.2} color="#FFF0D8" position={[3, -2, 7]} scale={[4, 2, 1]} />
        <Lightformer form="rect" intensity={1.4} color="#F4C27A" position={[5.5, 0.5, 3]} scale={[1.6, 6, 1]} />
        <Lightformer form="rect" intensity={0.8} color="#FFE7C4" position={[7, 0.5, -0.5]} scale={[6, 5, 1]} />
        <Lightformer form="rect" intensity={1} color="#FFFFFF" position={[0, 1, -6]} scale={[6, 0.6, 1]} />
      </Environment>
    </Canvas>
  )
}

createRoot(document.getElementById('root')).render(<App />)
