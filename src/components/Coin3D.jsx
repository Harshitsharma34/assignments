import { useMemo } from 'react'
import * as THREE from 'three'
import { mergeGeometries } from 'three/examples/jsm/utils/BufferGeometryUtils.js'

// Real-geometry Scoin, modelled on the reference sheet: satin field, polished rim lip,
// inward-pointing sawtooth ring, reeded edge, faceted SalarySe "S" on the front, blank back.
// Units: coin radius = 1. The coin is built around the Y axis, then turned to face +Z.

const FIELD_R = 0.8 // radius of the flat face inside the rim
const RIM_R = 0.975 // outer radius of the rim lip
const FACE_Y = 0.07 // height of the field above the coin's mid-plane
const RIM_Y = 0.095 // height of the rim lip
const EDGE_H = 0.13 // height of the reeded band

const v = (x, y) => new THREE.Vector2(x, y)

function lathe(points, segments = 160) {
  // LatheGeometry wants the profile ordered bottom → top for outward-facing normals.
  return new THREE.LatheGeometry(points.map(([x, y]) => v(x, y)), segments)
}

function buildField() {
  return lathe([[0, -FACE_Y], [FIELD_R, -FACE_Y], [FIELD_R, FACE_Y], [0, FACE_Y]])
}

function buildRim() {
  // Inner wall rising from the field, rounded lip, bevel down to the reeded edge, mirrored below.
  const top = [
    [FIELD_R, FACE_Y], [FIELD_R + 0.008, RIM_Y - 0.006], [FIELD_R + 0.025, RIM_Y],
    [RIM_R - 0.06, RIM_Y], [RIM_R - 0.02, RIM_Y - 0.01], [RIM_R, RIM_Y - 0.03], [RIM_R + 0.005, EDGE_H / 2],
  ]
  const bottom = top.map(([x, y]) => [x, -y])
  return lathe([...bottom, ...top.slice().reverse()])
}

function buildEdge() {
  // Reeded edge: an open cylinder whose vertices alternate between two radii.
  const segments = 280
  const geo = new THREE.CylinderGeometry(1, 1, EDGE_H, segments, 1, true)
  const pos = geo.attributes.position
  for (let i = 0; i < pos.count; i++) {
    const x = pos.getX(i)
    const z = pos.getZ(i)
    const angle = Math.atan2(z, x)
    const ridge = Math.cos(angle * (segments / 2)) > 0 ? 0.993 : 0.982
    pos.setX(i, Math.cos(angle) * ridge)
    pos.setZ(i, Math.sin(angle) * ridge)
  }
  const flat = geo.toNonIndexed()
  flat.computeVertexNormals()
  return flat
}

function buildSawtooth() {
  // A thin raised band hugging the rim wall, with teeth pointing toward the centre.
  const teeth = 64
  const outer = FIELD_R + 0.004
  const base = FIELD_R - 0.03
  const tip = FIELD_R - 0.085
  const shape = new THREE.Shape()
  for (let i = 0; i <= 128; i++) {
    const a = (i / 128) * Math.PI * 2
    i === 0 ? shape.moveTo(Math.cos(a) * outer, Math.sin(a) * outer) : shape.lineTo(Math.cos(a) * outer, Math.sin(a) * outer)
  }
  const hole = new THREE.Path()
  for (let i = 0; i <= teeth * 2; i++) {
    const a = (i / (teeth * 2)) * Math.PI * 2
    const r = i % 2 === 0 ? base : tip
    i === 0 ? hole.moveTo(Math.cos(a) * r, Math.sin(a) * r) : hole.lineTo(Math.cos(a) * r, Math.sin(a) * r)
  }
  shape.holes.push(hole)
  const geo = new THREE.ExtrudeGeometry(shape, {
    depth: 0.012, bevelEnabled: true, bevelThickness: 0.006, bevelSize: 0.004, bevelSegments: 2, curveSegments: 1,
  })
  geo.rotateX(-Math.PI / 2)
  geo.translate(0, FACE_Y, 0)
  return geo
}

function quad(points) {
  const s = new THREE.Shape()
  points.forEach(([x, y], i) => (i === 0 ? s.moveTo(x, y) : s.lineTo(x, y)))
  s.closePath()
  return s
}

function buildEmblem() {
  // Faceted SalarySe "S": rising top band with three stripes, descending slab, rising bottom wedge.
  const k = 0.5 // slope of the rising bands
  const L = -0.34
  const R = 0.34
  const rise = (x, y0) => y0 + k * (x - L)
  const fall = (x, y0) => y0 - k * (x - L)
  // The three bodies are traced as one outline so the relief has no internal seams.
  // Each corner is where a band edge (rising) meets a slab edge (falling).
  const meet = (rising0, falling0) => {
    const u = (falling0 - rising0) / (2 * k)
    return [L + u, rising0 + k * u]
  }
  const shapes = [
    quad([
      [L, 0.13], [R, rise(R, 0.13)], [R, rise(R, 0)], meet(0, 0.13),
      meet(-0.5, 0.13), [R, rise(R, -0.5)], [R, fall(R, -0.2)], meet(-0.66, -0.2),
      [L, -0.66], [L, -0.5], meet(-0.5, -0.2), [L, -0.2],
    ]),
  ]
  for (let i = 0; i < 3; i++) {
    const x0 = -0.04 + i * 0.08
    const y0 = 0.175 + i * 0.062
    shapes.push(quad([[x0, rise(x0, y0)], [R, rise(R, y0)], [R, rise(R, y0 + 0.032)], [x0, rise(x0, y0 + 0.032)]]))
  }
  const parts = shapes.map((shape) => new THREE.ExtrudeGeometry(shape, {
    depth: 0.028, bevelEnabled: true, bevelThickness: 0.014, bevelSize: 0.012, bevelSegments: 3, curveSegments: 1,
  }))
  const geo = mergeGeometries(parts)
  geo.scale(0.86, 0.86, 1) // keeps the corners inside the sawtooth ring
  geo.rotateX(-Math.PI / 2)
  geo.translate(0, FACE_Y, 0)
  return geo
}

export function useCoinAssets() {
  return useMemo(() => {
    const geometries = {
      field: buildField(),
      rim: buildRim(),
      edge: buildEdge(),
      sawtooth: buildSawtooth(),
      sawtoothBack: buildSawtooth().rotateZ(Math.PI),
      emblem: buildEmblem(),
    }
    const gold = (color, roughness) =>
      new THREE.MeshStandardMaterial({ color, metalness: 1, roughness, envMapIntensity: 1.15 })
    const materials = {
      field: gold('#F0BE2E', 0.36),
      rim: gold('#F6CC45', 0.2),
      edge: gold('#E0AC26', 0.3),
      relief: gold('#F3C740', 0.18),
    }
    return { geometries, materials }
  }, [])
}

export function Coin({ assets, ...props }) {
  const { geometries: g, materials: m } = assets
  return (
    <group {...props}>
      <group rotation={[Math.PI / 2, 0, 0]}>
        <mesh geometry={g.field} material={m.field} />
        <mesh geometry={g.rim} material={m.rim} />
        <mesh geometry={g.edge} material={m.edge} />
        <mesh geometry={g.sawtooth} material={m.relief} />
        <mesh geometry={g.sawtoothBack} material={m.relief} />
        <mesh geometry={g.emblem} material={m.relief} />
      </group>
    </group>
  )
}
