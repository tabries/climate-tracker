import { create } from 'zustand'

/* ── Types ──────────────────────────────────────────────────────────────── */

export interface SelectedLocation {
  lat: number
  lon: number
  name: string
}

export interface CurrentWeather {
  temp: number
  feels_like: number
  humidity: number
  wind_speed: number
  wind_direction: number
  cloud_cover: number
  precipitation: number
  description: string
  icon: string
}

export interface ForecastDay {
  date: string
  temp_high: number
  temp_low: number
  rain_chance: number
  description: string
  icon: string
}

export interface WeatherData {
  lat: number
  lon: number
  location: string
  current: CurrentWeather
  forecast: ForecastDay[]
}

interface WeatherState {
  selectedLocation: SelectedLocation | null
  weather: WeatherData | null
  loading: boolean
  error: string | null

  setSelectedLocation: (loc: SelectedLocation) => void
  clearSelection: () => void
}

/* ── Store ──────────────────────────────────────────────────────────────── */

export const useWeatherStore = create<WeatherState>((set) => ({
  selectedLocation: null,
  weather: null,
  loading: false,
  error: null,

  setSelectedLocation: async (loc) => {
    set({ selectedLocation: loc, loading: true, error: null })

    try {
      const res = await fetch(`/api/weather/${loc.lat}/${loc.lon}`)
      if (!res.ok) {
        const body = await res.json().catch(() => ({}))
        throw new Error(body.message ?? `Weather API error (${res.status})`)
      }
      const data: WeatherData = await res.json()
      set({ weather: data, loading: false })
    } catch (err) {
      set({
        error: err instanceof Error ? err.message : 'Unknown error',
        loading: false,
      })
    }
  },

  clearSelection: () =>
    set({ selectedLocation: null, weather: null, error: null }),
}))
