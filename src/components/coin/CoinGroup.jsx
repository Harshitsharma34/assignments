import Scoin3D from './Scoin3D.jsx'
import { useScoinMaterials } from './ScoinMaterial.js'

// The reference composition: centre coin largest and forward, two smaller coins behind it,
// each turned slightly outward so their edges show. All three share geometry and materials.
export const FORMATION = {
  side: { x: 1.0, y: 0.02, z: -0.55, scale: 0.77, turn: 0.36 },
  width: 2 * (1.0 + 0.77), // world units across the composition
}

export default function CoinGroup({ rig }) {
  const materials = useScoinMaterials()
  return (
    <group ref={rig.group}>
      <group ref={rig.left}><Scoin3D materials={materials} /></group>
      <group ref={rig.right}><Scoin3D materials={materials} /></group>
      <group ref={rig.main}><Scoin3D materials={materials} /></group>
    </group>
  )
}
