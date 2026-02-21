import { useRef } from 'react'
import { useFrame } from '@react-three/fiber'
import { useTexture } from '@react-three/drei'
import * as THREE from 'three'

const EARTH_RADIUS = 1
const AUTO_ROTATE_SPEED = 0.04 // radians per second

/**
 * Earth sphere with day-map texture and slow auto-rotation.
 * Falls back to a solid dark blue if the texture fails to load.
 */
export function EarthMesh() {
  const meshRef = useRef<THREE.Mesh>(null)

  // Load textures — useTexture suspends until loaded (wrapped in Suspense)
  const [dayMap] = useTexture(['/textures/earth_daymap.jpg'])

  // Auto-rotate
  useFrame((_, delta) => {
    if (meshRef.current) {
      meshRef.current.rotation.y += AUTO_ROTATE_SPEED * delta
    }
  })

  return (
    <mesh ref={meshRef}>
      <sphereGeometry args={[EARTH_RADIUS, 64, 64]} />
      <meshStandardMaterial
        map={dayMap}
        metalness={0.05}
        roughness={0.8}
        emissive="#112244"
        emissiveIntensity={0.15}
      />
    </mesh>
  )
}
