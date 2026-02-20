import { useWeatherStore } from '@/store/weatherStore'

/** Displays current weather and 5-day forecast for the selected location. */
export function DataPanel() {
  const weather = useWeatherStore((s) => s.weather)
  const loading = useWeatherStore((s) => s.loading)
  const error = useWeatherStore((s) => s.error)
  const selectedLocation = useWeatherStore((s) => s.selectedLocation)

  if (!selectedLocation) {
    return (
      <div className="flex items-center justify-center h-full text-text-secondary text-sm p-6">
        Click the map or search for a location to see weather data.
      </div>
    )
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-accent border-t-transparent" />
      </div>
    )
  }

  if (error) {
    return (
      <div className="p-6 text-danger text-sm">
        <p className="font-semibold">Error loading weather</p>
        <p className="mt-1 text-text-secondary">{error}</p>
      </div>
    )
  }

  if (!weather) return null

  const { current, forecast, location } = weather
  const iconUrl = `https://openweathermap.org/img/wn/${current.icon}@2x.png`

  return (
    <div className="flex flex-col gap-4 p-4 overflow-y-auto h-full">
      {/* ── Header ─────────────────────────────────────────────────────── */}
      <div>
        <h2 className="text-lg font-semibold text-text-primary">{location}</h2>
        <p className="text-xs text-text-secondary">
          {selectedLocation.lat.toFixed(4)}, {selectedLocation.lon.toFixed(4)}
        </p>
      </div>

      {/* ── Current conditions ────────────────────────────────────────── */}
      <div className="rounded-lg bg-surface-alt border border-border p-4">
        <div className="flex items-center gap-3">
          <img src={iconUrl} alt={current.description} className="h-14 w-14" />
          <div>
            <p className="text-3xl font-bold">{current.temp}°C</p>
            <p className="text-sm text-text-secondary capitalize">{current.description}</p>
          </div>
        </div>

        <div className="mt-4 grid grid-cols-2 gap-3 text-sm">
          <Stat label="Feels like" value={`${current.feels_like}°C`} />
          <Stat label="Humidity" value={`${current.humidity}%`} />
          <Stat label="Wind" value={`${current.wind_speed} m/s`} />
          <Stat label="Clouds" value={`${current.cloud_cover}%`} />
          <Stat label="Precipitation" value={`${current.precipitation} mm`} />
          <Stat label="Wind dir" value={`${current.wind_direction}°`} />
        </div>
      </div>

      {/* ── 5-day forecast ────────────────────────────────────────────── */}
      <div>
        <h3 className="text-sm font-semibold text-text-secondary mb-2 uppercase tracking-wide">
          5-Day Forecast
        </h3>
        <div className="flex flex-col gap-2">
          {forecast.map((day) => (
            <div
              key={day.date}
              className="flex items-center rounded-lg bg-surface-alt border border-border px-3 py-2 text-sm"
            >
              <img
                src={`https://openweathermap.org/img/wn/${day.icon}.png`}
                alt={day.description}
                className="h-8 w-8 mr-2"
              />
              <span className="w-24 text-text-secondary">{formatDate(day.date)}</span>
              <span className="flex-1 capitalize text-text-secondary text-xs">{day.description}</span>
              <span className="font-medium text-accent">{day.temp_high}°</span>
              <span className="text-text-secondary mx-1">/</span>
              <span className="text-text-secondary">{day.temp_low}°</span>
              <span className="ml-3 text-xs text-text-secondary">{day.rain_chance}% 💧</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}

/* ── Helpers ────────────────────────────────────────────────────────────── */

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <p className="text-text-secondary text-xs">{label}</p>
      <p className="font-medium">{value}</p>
    </div>
  )
}

function formatDate(dateStr: string): string {
  const date = new Date(dateStr + 'T12:00:00')
  return date.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' })
}
