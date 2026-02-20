import { useEffect, useRef } from 'react'
import maplibregl from 'maplibre-gl'
import 'maplibre-gl/dist/maplibre-gl.css'
import { useWeatherStore } from '@/store/weatherStore'

const MAPTILER_KEY = import.meta.env.VITE_MAPTILER_API_KEY ?? ''

/**
 * Interactive 2D map powered by MapLibre GL JS with MapTiler tiles.
 * Syncs with the global weather store for selected location.
 */
export function MapContainer() {
  const mapRef = useRef<maplibregl.Map | null>(null)
  const containerRef = useRef<HTMLDivElement>(null)
  const markerRef = useRef<maplibregl.Marker | null>(null)

  const selectedLocation = useWeatherStore((s) => s.selectedLocation)
  const setSelectedLocation = useWeatherStore((s) => s.setSelectedLocation)

  // ── Initialize map ──────────────────────────────────────────────────────
  useEffect(() => {
    if (!containerRef.current || mapRef.current) return

    const map = new maplibregl.Map({
      container: containerRef.current,
      style: `https://api.maptiler.com/maps/dataviz-dark/style.json?key=${MAPTILER_KEY}`,
      center: [-3.7, 40.4], // Madrid
      zoom: 3,
      attributionControl: false,
    })

    map.addControl(new maplibregl.NavigationControl(), 'top-right')
    map.addControl(
      new maplibregl.AttributionControl({ compact: true }),
      'bottom-right',
    )

    // Click on map → update selected location
    // Normalize lng to [-180, 180] to handle world-wrap panning
    map.on('click', (e) => {
      const { lng, lat } = e.lngLat
      const normalizedLng = ((((lng + 180) % 360) + 360) % 360) - 180
      const roundedLat = Math.round(lat * 1e5) / 1e5
      const roundedLon = Math.round(normalizedLng * 1e5) / 1e5
      setSelectedLocation({
        lat: roundedLat,
        lon: roundedLon,
        name: `${roundedLat.toFixed(2)}, ${roundedLon.toFixed(2)}`,
      })
    })

    mapRef.current = map

    return () => {
      map.remove()
      mapRef.current = null
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  // ── Fly to selected location and place marker ───────────────────────────
  useEffect(() => {
    const map = mapRef.current
    if (!map || !selectedLocation) return

    map.flyTo({
      center: [selectedLocation.lon, selectedLocation.lat],
      zoom: Math.max(map.getZoom(), 8),
      duration: 1500,
    })

    // Upsert marker
    if (markerRef.current) {
      markerRef.current.setLngLat([selectedLocation.lon, selectedLocation.lat])
    } else {
      markerRef.current = new maplibregl.Marker({ color: '#38bdf8' })
        .setLngLat([selectedLocation.lon, selectedLocation.lat])
        .addTo(map)
    }
  }, [selectedLocation])

  return (
    <div
      ref={containerRef}
      className="w-full h-full"
    />
  )
}
