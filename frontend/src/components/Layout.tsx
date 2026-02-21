import { lazy, Suspense } from 'react'
import { SearchBar } from '@/components/SearchBar'
import { DataPanel } from '@/components/DataPanel'
import { MapContainer } from '@/components/Map/MapContainer'
import { LayerManager } from '@/components/Map/LayerManager'
import { Legend } from '@/components/Map/Legend'
import { GlobeLegend } from '@/components/Globe/GlobeLegend'
import { useViewStore, type ViewMode } from '@/store/viewStore'

// Lazy-load the Globe to avoid loading Three.js until the user requests it
const GlobeContainer = lazy(() =>
  import('@/components/Globe/GlobeContainer').then((m) => ({
    default: m.GlobeContainer,
  })),
)

/* ── View toggle button ─────────────────────────────────────────────────── */
function ViewToggle() {
  const mode = useViewStore((s) => s.mode)
  const setMode = useViewStore((s) => s.setMode)

  const options: { value: ViewMode; label: string; icon: string }[] = [
    { value: 'map', label: '2D Map', icon: '🗺️' },
    { value: 'globe', label: '3D Globe', icon: '🌍' },
  ]

  return (
    <div
      className="flex rounded-lg overflow-hidden border border-border bg-surface/80 backdrop-blur-sm"
      data-testid="view-toggle"
    >
      {options.map((opt) => (
        <button
          key={opt.value}
          onClick={() => setMode(opt.value)}
          className={`px-3 py-1.5 text-xs font-medium transition-colors ${
            mode === opt.value
              ? 'bg-accent text-surface'
              : 'text-text-secondary hover:bg-surface-hover hover:text-text-primary'
          }`}
        >
          {opt.icon} {opt.label}
        </button>
      ))}
    </div>
  )
}

/**
 * Main application layout: full-screen map/globe with a sidebar for search + data.
 */
export function Layout() {
  const viewMode = useViewStore((s) => s.mode)

  return (
    <div className="flex h-screen w-screen overflow-hidden">
      {/* ── Sidebar ────────────────────────────────────────────────────── */}
      <aside className="flex flex-col w-96 shrink-0 border-r border-border bg-surface">
        {/* Header */}
        <div className="p-4 border-b border-border">
          <h1 className="text-base font-bold tracking-tight mb-3">
            🌍 Climate Tracker
          </h1>
          <SearchBar />
        </div>

        {/* Data panel (scrollable) */}
        <div className="flex-1 overflow-hidden">
          <DataPanel />
        </div>
      </aside>

      {/* ── Main visualization ─────────────────────────────────────────── */}
      <main className="flex-1 relative">
        {/* View toggle — always visible */}
        <div className="absolute top-4 right-16 z-20">
          <ViewToggle />
        </div>

        {/* ── 2D Map view ──────────────────────────────────────────────── */}
        <div className={viewMode === 'map' ? 'w-full h-full' : 'hidden'}>
          <MapContainer />
        </div>

        {/* ── 3D Globe view ────────────────────────────────────────────── */}
        {viewMode === 'globe' && (
          <Suspense
            fallback={
              <div className="w-full h-full flex items-center justify-center bg-[#0a0a1a] text-text-secondary text-sm">
                Loading 3D Globe…
              </div>
            }
          >
            <GlobeContainer />
          </Suspense>
        )}

        {/* Map overlays (only show in map mode) */}
        {viewMode === 'map' && (
          <>
            <div className="absolute top-4 left-4 z-10">
              <LayerManager />
            </div>
            <div className="absolute bottom-6 left-4 z-10">
              <Legend />
            </div>
          </>
        )}

        {/* Globe overlays (only show in globe mode) */}
        {viewMode === 'globe' && (
          <div className="absolute bottom-6 left-4 z-10">
            <GlobeLegend />
          </div>
        )}
      </main>
    </div>
  )
}
