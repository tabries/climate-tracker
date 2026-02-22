import { useEffect, useRef, useCallback } from 'react'
import { io, Socket } from 'socket.io-client'
import { useWeatherStore } from '@/store/weatherStore'
import type { WeatherData, AirQualityData } from '@/store/weatherStore'
import { useRealtimeStore } from '@/store/realtimeStore'
import type { AlertEvent } from '@/store/realtimeStore'

/* ── Singleton socket instance ──────────────────────────────────────────── */

let socket: Socket | null = null

function getSocket(): Socket {
  if (!socket) {
    socket = io({
      // In dev, Vite proxy forwards /socket.io to the backend.
      // In production, the socket connects to the same origin.
      transports: ['websocket', 'polling'],
      autoConnect: false,
      reconnectionAttempts: Infinity,
      reconnectionDelay: 2_000,
      reconnectionDelayMax: 10_000,
    })
  }
  return socket
}

/* ── Hook ───────────────────────────────────────────────────────────────── */

/**
 * Manages the Socket.IO lifecycle.
 *
 * • Connects on mount, disconnects on unmount.
 * • Subscribes to the currently selected location and pushes updates
 *   into the Zustand weather store.
 * • Tracks connection status and last-update timestamp in realtimeStore.
 */
export function useSocket() {
  const selectedLocation = useWeatherStore((s) => s.selectedLocation)
  const prevLocationRef = useRef<{ lat: number; lon: number } | null>(null)

  const setConnectionStatus = useRealtimeStore((s) => s.setConnectionStatus)
  const setLastUpdate = useRealtimeStore((s) => s.setLastUpdate)
  const setBroadcastInterval = useRealtimeStore((s) => s.setBroadcastInterval)
  const addAlerts = useRealtimeStore((s) => s.addAlerts)

  // ── Connect / disconnect lifecycle ──────────────────────────────────
  useEffect(() => {
    const s = getSocket()

    setConnectionStatus('connecting')

    s.on('connect', () => {
      setConnectionStatus('connected')

      // Re-subscribe to current location on reconnect
      if (prevLocationRef.current) {
        s.emit('subscribe', prevLocationRef.current)
      }
    })

    s.on('disconnect', () => {
      setConnectionStatus('disconnected')
    })

    s.on('connect_error', () => {
      setConnectionStatus('disconnected')
    })

    // Server tells us its broadcast cadence
    s.on('config', (cfg: { broadcastInterval?: number }) => {
      if (cfg.broadcastInterval) {
        setBroadcastInterval(cfg.broadcastInterval)
      }
    })

    // ── Real-time weather updates → push into Zustand ──────────────
    s.on('weather:update', (data: WeatherData & { timestamp: string }) => {
      const { timestamp, ...weatherData } = data

      // Only update if it's for the currently selected location
      const currentLoc = useWeatherStore.getState().selectedLocation
      if (
        currentLoc &&
        Math.abs(currentLoc.lat - weatherData.lat) < 0.05 &&
        Math.abs(currentLoc.lon - weatherData.lon) < 0.05
      ) {
        useWeatherStore.setState({ weather: weatherData })
      }
      setLastUpdate(timestamp)
    })

    s.on(
      'air-quality:update',
      (data: AirQualityData & { lat: number; lon: number; timestamp: string }) => {
        const currentLoc = useWeatherStore.getState().selectedLocation
        if (
          currentLoc &&
          Math.abs(currentLoc.lat - data.lat) < 0.05 &&
          Math.abs(currentLoc.lon - data.lon) < 0.05
        ) {
          useWeatherStore.setState({
            airQuality: {
              aqi: data.aqi,
              label: data.label,
              components: data.components,
            },
          })
        }
      },
    )

    // ── Weather alerts ─────────────────────────────────────────────
    s.on('weather:alerts', (event: AlertEvent) => {
      addAlerts(event)
    })

    s.connect()

    return () => {
      s.off('connect')
      s.off('disconnect')
      s.off('connect_error')
      s.off('config')
      s.off('weather:update')
      s.off('air-quality:update')
      s.off('weather:alerts')
      s.disconnect()
      setConnectionStatus('disconnected')
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  // ── Subscribe / unsubscribe when location changes ──────────────────
  const subscribe = useCallback((lat: number, lon: number) => {
    const s = getSocket()
    if (s.connected) {
      s.emit('subscribe', { lat, lon })
    }
  }, [])

  const unsubscribe = useCallback((lat: number, lon: number) => {
    const s = getSocket()
    if (s.connected) {
      s.emit('unsubscribe', { lat, lon })
    }
  }, [])

  useEffect(() => {
    const prev = prevLocationRef.current

    // Unsubscribe from previous location
    if (prev) {
      unsubscribe(prev.lat, prev.lon)
    }

    // Subscribe to new location
    if (selectedLocation) {
      subscribe(selectedLocation.lat, selectedLocation.lon)
      prevLocationRef.current = {
        lat: selectedLocation.lat,
        lon: selectedLocation.lon,
      }
    } else {
      prevLocationRef.current = null
    }
  }, [selectedLocation, subscribe, unsubscribe])
}
