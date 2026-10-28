import { useMemo } from 'react'
import * as THREE from 'three'

// Physically based gold finishes. Metals take their colour from reflections, so these base
// colours are the specular tint: champagne and amber, kept low in saturation.
// The face is sandblasted (fine grain, matte); the emblem and rim are polished so raised
// details catch the light against it.

function canvasTexture(size, paint) {
  const c = document.createElement('canvas')
  c.width = c.height = size
  const g = c.getContext('2d')
  const img = g.createImageData(size, size)
  for (let y = 0; y < size; y++) {
    for (let x = 0; x < size; x++) {
      const v = Math.max(0, Math.min(255, paint(x, y)))
      const i = (y * size + x) * 4
      img.data[i] = img.data[i + 1] = img.data[i + 2] = v
      img.data[i + 3] = 255
    }
  }
  g.putImageData(img, 0, 0)
  const tex = new THREE.CanvasTexture(c)
  tex.colorSpace = THREE.NoColorSpace
  tex.anisotropy = 8
  return tex
}

function makeRand(seed) {
  return () => ((seed = (seed * 16807) % 2147483647) / 2147483647)
}

// Faint lathe rings across the whole face: gentle roughness variation, mapped once.
function ringRoughness() {
  const size = 512
  const cx = size / 2
  const rand = makeRand(5)
  const jitter = Array.from({ length: cx + 2 }, () => (rand() - 0.5) * 10)
  return canvasTexture(size, (x, y) => {
    const r = Math.hypot(x - cx, y - cx)
    return 150 + Math.sin(r * 0.9) * 3 + jitter[Math.floor(r) % jitter.length]
  })
}

// Fine sandblast grain, tiled so it stays sharp in the extreme close-up.
function grainBump() {
  const rand = makeRand(11)
  const tex = canvasTexture(256, () => 128 + (rand() - 0.5) * 120)
  tex.wrapS = tex.wrapT = THREE.RepeatWrapping
  tex.repeat.set(6, 6)
  return tex
}

const gold = (color, roughness, extra = {}) =>
  new THREE.MeshPhysicalMaterial({ color, metalness: 1, roughness, envMapIntensity: 1, ...extra })

export function useScoinMaterials() {
  return useMemo(() => {
    return {
      face: gold('#C49A52', 0.5, { roughnessMap: ringRoughness(), bumpMap: grainBump(), bumpScale: 0.12 }), // sandblasted field
      emblem: gold('#E6C27E', 0.2), // polished raised S
      rim: gold('#D9B06A', 0.24), // polished outer ring
      teeth: gold('#B68C4E', 0.3), // cut triangle band
      edge: gold('#9E763E', 0.32), // reeded side, darker
    }
  }, [])
}
