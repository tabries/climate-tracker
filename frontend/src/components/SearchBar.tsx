import { useState, useCallback, useRef, useEffect } from 'react'
import { useWeatherStore } from '@/store/weatherStore'

interface Suggestion {
  lat: number
  lon: number
  name: string
  country: string
  full_name: string
}

/**
 * Debounced search bar that queries the geocode API and shows suggestions.
 */
export function SearchBar() {
  const [query, setQuery] = useState('')
  const [suggestions, setSuggestions] = useState<Suggestion[]>([])
  const [open, setOpen] = useState(false)
  const [loading, setLoading] = useState(false)
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null)
  const containerRef = useRef<HTMLDivElement>(null)

  const setSelectedLocation = useWeatherStore((s) => s.setSelectedLocation)

  // Close dropdown on outside click
  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setOpen(false)
      }
    }
    document.addEventListener('mousedown', handleClick)
    return () => document.removeEventListener('mousedown', handleClick)
  }, [])

  const search = useCallback(async (q: string) => {
    if (q.length < 2) {
      setSuggestions([])
      return
    }
    setLoading(true)
    try {
      const res = await fetch(`/api/geocode?query=${encodeURIComponent(q)}`)
      if (!res.ok) throw new Error('Geocode failed')
      const data: Suggestion[] = await res.json()
      setSuggestions(data)
      setOpen(data.length > 0)
    } catch {
      setSuggestions([])
    } finally {
      setLoading(false)
    }
  }, [])

  const handleChange = (value: string) => {
    setQuery(value)
    if (timerRef.current) clearTimeout(timerRef.current)
    timerRef.current = setTimeout(() => search(value), 300)
  }

  const handleSelect = (s: Suggestion) => {
    setSelectedLocation({ lat: s.lat, lon: s.lon, name: s.full_name ?? s.name })
    setQuery(s.full_name ?? s.name)
    setOpen(false)
  }

  return (
    <div ref={containerRef} className="relative w-full max-w-md">
      <input
        type="text"
        value={query}
        onChange={(e) => handleChange(e.target.value)}
        placeholder="Search location…"
        className="w-full rounded-lg bg-surface-alt border border-border px-4 py-2.5
                   text-text-primary placeholder:text-text-secondary
                   focus:outline-none focus:ring-2 focus:ring-accent/50 focus:border-accent
                   transition-all"
      />
      {loading && (
        <div className="absolute right-3 top-1/2 -translate-y-1/2">
          <div className="h-4 w-4 animate-spin rounded-full border-2 border-accent border-t-transparent" />
        </div>
      )}

      {open && suggestions.length > 0 && (
        <ul className="absolute z-50 mt-1 w-full rounded-lg bg-surface-alt border border-border
                        shadow-lg overflow-hidden">
          {suggestions.map((s, i) => (
            <li key={`${s.lat}-${s.lon}-${i}`}>
              <button
                type="button"
                onClick={() => handleSelect(s)}
                className="w-full text-left px-4 py-2.5 hover:bg-surface-hover
                           transition-colors text-sm"
              >
                <span className="text-text-primary">{s.name}</span>
                {s.country && (
                  <span className="text-text-secondary ml-1">— {s.country}</span>
                )}
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  )
}
