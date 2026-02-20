import { SearchBar } from '@/components/SearchBar'
import { DataPanel } from '@/components/DataPanel'
import { MapContainer } from '@/components/Map/MapContainer'

/**
 * Main application layout: full-screen map with a sidebar for search + data.
 */
export function Layout() {
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

      {/* ── Map ────────────────────────────────────────────────────────── */}
      <main className="flex-1 relative">
        <MapContainer />
      </main>
    </div>
  )
}
