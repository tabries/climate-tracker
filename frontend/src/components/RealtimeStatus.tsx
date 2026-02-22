import { useEffect, useState } from 'react'
import { useRealtimeStore } from '@/store/realtimeStore'

/**
 * Small status pill that shows socket connection state + time since last update.
 * Placed in the sidebar header.
 */
export function RealtimeStatus() {
  const status = useRealtimeStore((s) => s.connectionStatus)
  const lastUpdate = useRealtimeStore((s) => s.lastUpdate)
  const broadcastInterval = useRealtimeStore((s) => s.broadcastInterval)
  const [ago, setAgo] = useState<string>('')

  // Tick every second to update "X s ago"
  useEffect(() => {
    if (!lastUpdate) {
      setAgo('')
      return
    }

    const tick = () => {
      const diff = Math.floor((Date.now() - new Date(lastUpdate).getTime()) / 1000)
      if (diff < 60) setAgo(`${diff}s ago`)
      else if (diff < 3600) setAgo(`${Math.floor(diff / 60)}m ago`)
      else setAgo(`${Math.floor(diff / 3600)}h ago`)
    }

    tick()
    const id = setInterval(tick, 1000)
    return () => clearInterval(id)
  }, [lastUpdate])

  const dot =
    status === 'connected'
      ? 'bg-emerald-400'
      : status === 'connecting'
        ? 'bg-amber-400 animate-pulse'
        : 'bg-red-400'

  const label =
    status === 'connected'
      ? 'Live'
      : status === 'connecting'
        ? 'Connecting…'
        : 'Offline'

  return (
    <div className="flex items-center gap-2 text-xs text-text-secondary">
      <span className={`h-2 w-2 rounded-full ${dot}`} />
      <span>{label}</span>
      {status === 'connected' && ago && (
        <span className="text-text-secondary/60">· updated {ago}</span>
      )}
      {status === 'connected' && (
        <span className="text-text-secondary/40 ml-auto">
          ↻ {broadcastInterval / 1000}s
        </span>
      )}
    </div>
  )
}
