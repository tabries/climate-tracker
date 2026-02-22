import { useRef, useCallback, useState } from 'react'
import { useFrame, ThreeEvent } from '@react-three/fiber'
import { useTexture, Html } from '@react-three/drei'
import * as THREE from 'three'
import { WORLD_CITIES, type CityDataPoint } from '@/data/worldCities'
import { useWeatherStore } from '@/store/weatherStore'
import { useViewStore } from '@/store/viewStore'

const EARTH_RADIUS = 1
const AUTO_ROTATE_SPEED = 0.04 // radians per second

/**
 * Earth sphere with day-map texture and slow auto-rotation.
 *
 * Click anywhere on the surface → converts the 3D intersection point to
 * lat/lon (accounting for the mesh's current rotation), finds the nearest
 * city, fetches its weather and switches to the 2D map view.
 */
export function EarthMesh() {
  const meshRef = useRef<THREE.Mesh>(null)
  const [dayMap] = useTexture(['/textures/earth_daymap.jpg'])
  const [hoveredCity, setHoveredCity] = useState<CityDataPoint | null>(null)
  const [hoverPoint, setHoverPoint] = useState<THREE.Vector3 | null>(null)

  const setSelectedLocation = useWeatherStore((s) => s.setSelectedLocation)
  const setMode = useViewStore((s) => s.setMode)

  // Auto-rotate
  useFrame((_, delta) => {
    if (meshRef.current) {
      meshRef.current.rotation.y += AUTO_ROTATE_SPEED * delta
    }
  })

  /** Convert a 3D world-space point on the sphere to lat/lon */
  const worldToLatLon = useCallback((worldPoint: THREE.Vector3) => {
    if (!meshRef.current) return null
    const local = meshRef.current.worldToLocal(worldPoint.clone()).normalize()
    const lat = Math.asin(Math.max(-1, Math.min(1, local.y))) * (180 / Math.PI)
    const lon = -Math.atan2(local.z, local.x) * (180 / Math.PI)
    return { lat, lon }
  }, [])

  /** Find the city nearest to a lat/lon */
  const nearestCity = useCallback((lat: number, lon: number): CityDataPoint => {
    let best = WORLD_CITIES[0]
    let bestDist = Infinity
    for (const city of WORLD_CITIES) {
      const dist = Math.sqrt(
        (city.lat - lat) ** 2 + (city.lon - lon) ** 2,
      )
      if (dist < bestDist) {
        bestDist = dist
        best = city
      }
    }
    return best
  }, [])

  const handlePointerMove = useCallback(
    (e: ThreeEvent<PointerEvent>) => {
      const ll = worldToLatLon(e.point)
      if (!ll) return
      const city = nearestCity(ll.lat, ll.lon)
      setHoveredCity(city)
      setHoverPoint(e.point.clone())
      document.body.style.cursor = 'pointer'
    },
    [worldToLatLon, nearestCity],
  )

  const handlePointerLeave = useCallback(() => {
    setHoveredCity(null)
    setHoverPoint(null)
    document.body.style.cursor = 'default'
  }, [])

  const handleClick = useCallback(
    (e: ThreeEvent<MouseEvent>) => {
      if (!meshRef.current) return
      e.stopPropagation()
      const ll = worldToLatLon(e.point)
      if (!ll) return
      const city = nearestCity(ll.lat, ll.lon)
      setSelectedLocation({ lat: city.lat, lon: city.lon, name: city.name })
      setMode('map')
    },
    [worldToLatLon, nearestCity, setSelectedLocation, setMode],
  )

  return (
    <mesh
      ref={meshRef}
      onClick={handleClick}
      onPointerMove={handlePointerMove}
      onPointerLeave={handlePointerLeave}
    >
      <sphereGeometry args={[EARTH_RADIUS, 64, 64]} />
      <meshStandardMaterial
        map={dayMap}
        metalness={0.05}
        roughness={0.8}
        emissive="#112244"
        emissiveIntensity={0.15}
      />

      {/* Hover tooltip — nearest city preview */}
      {hoveredCity && hoverPoint && (
        <Html
          position={hoverPoint.clone().normalize().multiplyScalar(1.08).toArray()}
          center
          distanceFactor={3.5}
          style={{ pointerEvents: 'none' }}
        >
          <div
            style={{
              background: 'rgba(15,17,23,0.88)',
              backdropFilter: 'blur(6px)',
              border: '1px solid rgba(56,189,248,0.35)',
              borderRadius: '8px',
              padding: '5px 10px',
              color: '#e2e8f0',
              fontSize: '11px',
              whiteSpace: 'nowrap',
              boxShadow: '0 2px 12px rgba(0,0,0,0.5)',
            }}
          >
            <span style={{ fontWeight: 600 }}>{hoveredCity.name}</span>
            <span style={{ color: '#38bdf8', marginLeft: 6 }}>
              {hoveredCity.temp}°C
            </span>
            <br />
            <span style={{ color: '#94a3b8', fontSize: '10px' }}>
              Click to view weather
            </span>
          </div>
        </Html>
      )}
    </mesh>
  )
}
