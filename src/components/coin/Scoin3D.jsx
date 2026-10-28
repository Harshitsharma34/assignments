import * as THREE from 'three'
import { mergeGeometries } from 'three/examples/jsm/utils/BufferGeometryUtils.js'

// One Scoin, built from real geometry so it holds up front-on, at 45° and edge-on.
// Units: radius = 1, total thickness ≈ 0.25. Built around the Y axis, then turned to face +Z.
//
//   field      satin, lathe-turned disc (both faces)
//   teeth      72 chiselled triangles around the inner circumference, pointing inward
//   rim        rounded polished ring that stands proud of the field, bevelled to the edge
//   edge       120 square reeds around the side
//   emblem     extruded, bevelled SalarySe S on the front; the back is blank (as in the reference)

const FIELD_R = 0.79
const FACE_Y = 0.085
const EDGE_Y = 0.062

function buildField() {
  const top = new THREE.CircleGeometry(FIELD_R, 160)
  top.rotateX(-Math.PI / 2)
  top.translate(0, FACE_Y, 0)
  const bottom = new THREE.CircleGeometry(FIELD_R, 160)
  bottom.rotateX(Math.PI / 2)
  bottom.translate(0, -FACE_Y, 0)
  return mergeGeometries([top, bottom])
}

function buildRim() {
  // Profile from the field outward: inner wall, rounded lip, outer bevel down to the reeded band.
  const top = [
    [FIELD_R, FACE_Y], [0.792, 0.1], [0.798, 0.112], [0.808, 0.12], [0.826, 0.1245], [0.86, 0.126],
    [0.9, 0.1252], [0.928, 0.122], [0.95, 0.1155], [0.968, 0.105], [0.981, 0.092], [0.99, 0.078], [0.996, EDGE_Y],
  ]
  const bottom = top.map(([x, y]) => [x, -y])
  const profile = [...bottom, ...top.slice().reverse()].map(([x, y]) => new THREE.Vector2(x, y))
  return new THREE.LatheGeometry(profile, 192)
}

function buildEdge() {
  // Square reeds: two vertices out, two in, around an open cylinder; flat normals keep them crisp.
  const reeds = 120
  const segments = reeds * 4
  const geo = new THREE.CylinderGeometry(1, 1, EDGE_Y * 2, segments, 1, true)
  const pos = geo.attributes.position
  for (let i = 0; i < pos.count; i++) {
    const column = i % (segments + 1)
    const r = column % 4 < 2 ? 1.004 : 0.99
    const a = Math.atan2(pos.getZ(i), pos.getX(i))
    pos.setXYZ(i, Math.cos(a) * r, pos.getY(i), Math.sin(a) * r)
  }
  const flat = geo.toNonIndexed()
  flat.computeVertexNormals()
  return flat
}

function buildTeeth() {
  // Each tooth is a faceted pyramid: base against the rim wall, ridge rising toward the wall,
  // tip on the field. The two facets catch light differently, so the band reads as cut metal.
  const count = 72
  const rb = 0.787
  const rt = 0.708
  const h = 0.02
  const half = Math.PI / count
  const p = []
  const at = (r, a, y) => [Math.cos(a) * r, y, Math.sin(a) * r]
  for (let k = 0; k < count; k++) {
    const a = (k / count) * Math.PI * 2
    const bl = at(rb, a - half, FACE_Y)
    const br = at(rb, a + half, FACE_Y)
    const ridge = at(rb, a, FACE_Y + h)
    const tip = at(rt, a, FACE_Y)
    p.push(...bl, ...tip, ...ridge, ...ridge, ...tip, ...br)
  }
  const top = new THREE.BufferGeometry()
  top.setAttribute('position', new THREE.Float32BufferAttribute(p, 3))
  top.computeVertexNormals()
  const bottom = top.clone().rotateZ(Math.PI)
  return mergeGeometries([top, bottom])
}

function quad(points) {
  const s = new THREE.Shape()
  points.forEach(([x, y], i) => (i === 0 ? s.moveTo(x, y) : s.lineTo(x, y)))
  s.closePath()
  return s
}

function buildEmblem() {
  // SalarySe S: rising top band with three stripes, falling slab, rising bottom wedge.
  // The three bodies are one outline so the relief has no internal seams.
  const k = 0.5
  const L = -0.34
  const R = 0.34
  const rise = (x, y0) => y0 + k * (x - L)
  const fall = (x, y0) => y0 - k * (x - L)
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
    shapes.push(quad([[x0, rise(x0, y0)], [R, rise(R, y0)], [R, rise(R, y0 + 0.034)], [x0, rise(x0, y0 + 0.034)]]))
  }
  const geo = new THREE.ExtrudeGeometry(shapes, {
    depth: 0.022, bevelEnabled: true, bevelThickness: 0.014, bevelSize: 0.012, bevelSegments: 3, curveSegments: 1,
  })
  geo.scale(0.86, 0.86, 1) // corners stay inside the triangle band
  geo.rotateX(-Math.PI / 2)
  geo.translate(0, FACE_Y, 0)
  return geo
}

// Geometry is built once and shared by every coin instance.
let cache
export function getScoinGeometry() {
  if (!cache) {
    cache = { field: buildField(), rim: buildRim(), edge: buildEdge(), teeth: buildTeeth(), emblem: buildEmblem() }
  }
  return cache
}

export const SCOIN_RADIUS = 1

export default function Scoin3D({ materials, ...props }) {
  const g = getScoinGeometry()
  const parts = [
    [g.field, materials.face],
    [g.teeth, materials.teeth],
    [g.rim, materials.rim],
    [g.edge, materials.edge],
    [g.emblem, materials.emblem],
  ]
  return (
    <group {...props}>
      <group rotation={[Math.PI / 2, 0, 0]}>
        {parts.map(([geometry, material], i) => (
          <mesh key={i} geometry={geometry} material={material} castShadow receiveShadow />
        ))}
      </group>
    </group>
  )
}
