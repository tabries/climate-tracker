import { useRef, useMemo, useCallback } from 'react'
import { useFrame, ThreeEvent, useThree } from '@react-three/fiber'
import { Html } from '@react-three/drei'
import * as THREE from 'three'
import { geoToVector3 } from '@/utils/geoToVector'
import { WORLD_CITIES, type CityDataPoint } from '@/data/worldCities'
import { useWeatherStore } from '@/store/weatherStore'
import { useViewStore } from '@/store/viewStore'
import { useState } from 'react'

/* ── Constants ────────────────────────────────────────────────────────── */
const POINT_RADIUS = 0.018
const ELEVATION = 1.015 // slightly above earth surface
const TEMP_MIN = -10
const TEMP_MAX = 42
const PULSE_SPEED = 3.0

/**
 * Map a temperature to an RGB color along a cold→hot ramp:
 * blue → cyan → green → yellow → red
 */
function tempToColor(temp: number): THREE.Color {
  const t = Math.max(0, Math.min(1, (temp - TEMP_MIN) / (TEMP_MAX - TEMP_MIN)))
  const color = new THREE.Color()

  if (t < 0.25) {
    // blue → cyan
    const s = t / 0.25
    color.setRGB(0, s, 1)
  } else if (t < 0.5) {
    // cyan → green
    const s = (t - 0.25) / 0.25
    color.setRGB(0, 1, 1 - s)
  } else if (t < 0.75) {
    // green → yellow
    const s = (t - 0.5) / 0.25
    color.setRGB(s, 1, 0)
  } else {
    // yellow → red
    const s = (t - 0.75) / 0.25
    color.setRGB(1, 1 - s, 0)
  }
  return color
}

/* ── Component ────────────────────────────────────────────────────────── */

/**
 * Renders WORLD_CITIES as an InstancedMesh on the globe surface.
 * Each data point is color-coded by temperature.
 * Hovering shows a tooltip; clicking navigates to the 2D map.
 */
export function DataPoints() {
  const meshRef = useRef<THREE.InstancedMesh>(null)
  const [hovered, setHovered] = useState<CityDataPoint | null>(null)
  const [hoveredIdx, setHoveredIdx] = useState(-1)
  
  const { raycaster } = useThree()

  const setSelectedLocation = useWeatherStore((s) => s.setSelectedLocation)
  const setMode = useViewStore((s) => s.setMode)

  // Pre-compute matrices and colors once
  const { matrices, colors, tempGeom } = useMemo(() => {
    const dummy = new THREE.Object3D()
    const mats: THREE.Matrix4[] = []
    const cols: THREE.Color[] = []

    for (const city of WORLD_CITIES) {
      const pos = geoToVector3(city.lat, city.lon, ELEVATION)
      dummy.position.copy(pos)
      dummy.lookAt(0, 0, 0) // orient towards globe center
      dummy.updateMatrix()
      mats.push(dummy.matrix.clone())

      cols.push(tempToColor(city.temp))
    }

    return {
      matrices: mats,
      colors: cols,
      tempGeom: new THREE.SphereGeometry(POINT_RADIUS, 8, 8),
    }
  }, [])

  // Set instance matrices & colors on mount
  useMemo(() => {
    if (!meshRef.current) return
    const mesh = meshRef.current

    const colorArray = new Float32Array(WORLD_CITIES.length * 3)

    for (let i = 0; i < WORLD_CITIES.length; i++) {
      mesh.setMatrixAt(i, matrices[i])
      colorArray[i * 3] = colors[i].r
      colorArray[i * 3 + 1] = colors[i].g
      colorArray[i * 3 + 2] = colors[i].b
    }

    mesh.instanceMatrix.needsUpdate = true
    mesh.geometry.setAttribute(
      'color',
      new THREE.InstancedBufferAttribute(colorArray, 3),
    )
  }, [matrices, colors])

  // Pulse hovered instance
  useFrame(({ clock }) => {
    if (!meshRef.current || hoveredIdx < 0) return
    const t = clock.getElapsedTime()
    const scale = 1 + 0.3 * Math.sin(t * PULSE_SPEED)

    const dummy = new THREE.Object3D()
    dummy.position.setFromMatrixPosition(matrices[hoveredIdx])
    dummy.lookAt(0, 0, 0)
    dummy.scale.setScalar(scale)
    dummy.updateMatrix()
    meshRef.current.setMatrixAt(hoveredIdx, dummy.matrix)
    meshRef.current.instanceMatrix.needsUpdate = true
  })

  // Reset hovered instance scale when hover ends
  const resetHoveredScale = useCallback(
    (idx: number) => {
      if (!meshRef.current || idx < 0) return
      meshRef.current.setMatrixAt(idx, matrices[idx])
      meshRef.current.instanceMatrix.needsUpdate = true
    },
    [matrices],
  )

  const handlePointerOver = useCallback(
    (e: ThreeEvent<PointerEvent>) => {
      e.stopPropagation()
      const idx = e.instanceId
      if (idx === undefined || idx < 0) return
      setHovered(WORLD_CITIES[idx])
      setHoveredIdx(idx)
      document.body.style.cursor = 'pointer'
    },
    [],
  )

  const handlePointerOut = useCallback(() => {
    resetHoveredScale(hoveredIdx)
    setHovered(null)
    setHoveredIdx(-1)
    document.body.style.cursor = 'default'
  }, [hoveredIdx, resetHoveredScale])

  const handleClick = useCallback(
    (e: ThreeEvent<MouseEvent>) => {
      if (!meshRef.current) return
      e.stopPropagation()
      
      // Use raycarding to find which instance was clicked
      // This is more reliable than relying on e.instanceId
      const intersections = raycaster.intersectObject(meshRef.current)
      
      if (intersections.length === 0) return
      
      // Get the first intersection point
      const intersection = intersections[0]
      
      // For InstancedMesh, we need to find which instance was closest
      // by checking the intersection point against our instance positions
      if (!intersection.instanceId && intersection.instanceId !== 0) {
        // Fallback: estimate based on distance to the intersection point
        let closestIdx = 0
        let closestDist = Infinity
        const intersectionPoint = intersection.point
        
        for (let i = 0; i < WORLD_CITIES.length; i++) {
          const pos = geoToVector3(WORLD_CITIES[i].lat, WORLD_CITIES[i].lon, ELEVATION)
          const dist = pos.distanceTo(intersectionPoint)
          if (dist < closestDist) {
            closestDist = dist
            closestIdx = i
          }
        }
        
        if (closestDist > 0.1) return // too far, not a real click on a point
        
        const city = WORLD_CITIES[closestIdx]
        setSelectedLocation({ lat: city.lat, lon: city.lon, name: city.name })
        setMode('map')
      } else {
        // Use instanceId if available
        const idx = intersection.instanceId
        if (idx === undefined || idx < 0) return
        const city = WORLD_CITIES[idx]
        setSelectedLocation({ lat: city.lat, lon: city.lon, name: city.name })
        setMode('map')
      }
    },
    [raycaster, setSelectedLocation, setMode],
  )

  return (
    <>
      <instancedMesh
        ref={meshRef}
        args={[tempGeom, undefined, WORLD_CITIES.length]}
        onPointerOver={handlePointerOver}
        onPointerOut={handlePointerOut}
        onClick={handleClick}
      >
        <meshStandardMaterial
          vertexColors
          emissive="#ffffff"
          emissiveIntensity={0.6}
          roughness={0.3}
          metalness={0.1}
        />
      </instancedMesh>

      {/* Tooltip on hover */}
      {hovered && (
        <Html
          position={geoToVector3(hovered.lat, hovered.lon, ELEVATION + 0.04).toArray()}
          center
          style={{ pointerEvents: 'none' }}
        >
          <div className="bg-surface/90 backdrop-blur-sm text-text-primary text-xs px-3 py-1.5 rounded-lg border border-border shadow-lg whitespace-nowrap">
            <span className="font-semibold">{hovered.name}</span>
            <span className="ml-2 text-accent">{hovered.temp}°C</span>
          </div>
        </Html>
      )}
    </>
  )
}
