'use client'

import { useState } from 'react'
import {
  DndContext,
  PointerSensor,
  useSensor,
  useSensors,
  type DragEndEvent,
} from '@dnd-kit/core'
import {
  SortableContext,
  useSortable,
  verticalListSortingStrategy,
  arrayMove,
} from '@dnd-kit/sortable'
import { CSS } from '@dnd-kit/utilities'
import { usePageStore } from '@/lib/pageStore'
import type { ListWithTrips } from '@/lib/pageStore'
import TrendingModal from './TrendingModal'
import FeaturedExperiencesModal from './FeaturedExperiencesModal'

// ─── Sortable row for a curated list in Page Structure ────────────────────────

function SortableListRow({ list }: { list: ListWithTrips }) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } =
    useSortable({ id: list.id })

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.4 : 1,
  }

  return (
    <div
      ref={setNodeRef}
      style={style}
      {...attributes}
      className={`flex items-center gap-4 border rounded-xl px-5 py-3 transition-colors ${
        isDragging ? 'border-[#ccff00]/40 bg-white/8' : 'bg-white/5 border-white/10'
      }`}
    >
      <div
        {...listeners}
        className="text-gray-600 cursor-grab active:cursor-grabbing flex-shrink-0"
        title="Drag to reorder"
      >
        ⠿
      </div>
      <div className="flex-1">
        <div className="text-sm font-medium text-white">{list.title}</div>
        <div className="text-xs text-gray-500 capitalize">{list.type}</div>
      </div>
      <StatusPill status={list.status} />
    </div>
  )
}

// ─── Static (non-draggable) row ───────────────────────────────────────────────

function StaticRow({
  index,
  name,
  subtitle,
  status,
  action,
}: {
  index: number
  name: string
  subtitle: string
  status: string
  action?: React.ReactNode
}) {
  return (
    <div className="flex items-center gap-4 bg-white/5 border border-white/10 rounded-xl px-5 py-3">
      <div className="w-6 h-6 rounded-full bg-white/10 flex items-center justify-center text-xs text-gray-400 flex-shrink-0">
        {index + 1}
      </div>
      <div className="flex-1">
        <div className="text-sm font-medium text-white">{name}</div>
        <div className="text-xs text-gray-500">{subtitle}</div>
      </div>
      <StatusPill status={status} />
      {action}
    </div>
  )
}

// ─── Overview ────────────────────────────────────────────────────────────────

export default function AdminOverview({ onRefresh }: { onRefresh: () => void }) {
  const { state, dispatch } = usePageStore()
  const lists = state.lists ?? []

  const liveCount   = lists.filter((l) => l.status === 'live').length
  const draftCount  = lists.filter((l) => l.status === 'draft').length
  const totalTrips  = lists.reduce((acc, l) => acc + l.trips.length, 0)
  const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000)
  const staleCount  = lists.filter(
    (l) => l.last_reviewed_at && new Date(l.last_reviewed_at) < thirtyDaysAgo,
  ).length

  const metrics = [
    { label: 'Live Lists',   value: liveCount,  color: '#ccff00' },
    { label: 'Draft Lists',  value: draftCount, color: '#888' },
    { label: 'Total Trips',  value: totalTrips, color: '#60a5fa' },
    { label: 'Stale (>30d)', value: staleCount, color: '#f87171' },
  ]

  const featured = state.featured
  const [showTrendingModal, setShowTrendingModal] = useState(false)
  const [showFeaturedModal, setShowFeaturedModal] = useState(false)
  const sensors = useSensors(useSensor(PointerSensor))

  async function handleDragEnd(event: DragEndEvent) {
    const { active, over } = event
    if (!over || active.id === over.id) return
    const oldIdx = lists.findIndex((l) => l.id === active.id)
    const newIdx = lists.findIndex((l) => l.id === over.id)
    if (oldIdx === -1 || newIdx === -1) return

    const reordered = arrayMove(lists, oldIdx, newIdx)
    dispatch({ type: 'REORDER_LISTS', ordered: reordered })

    // Persist immediately — no save button needed
    await fetch('/api/lists/reorder', {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        order: reordered.map((l, i) => ({ id: l.id, display_order: i })),
      }),
    })
    onRefresh()
  }

  const STATIC_ROWS = [
    { name: 'Announcement Bar',     subtitle: 'Static',                  status: 'Active' },
    { name: 'Navigation',           subtitle: 'Static',                  status: 'Active' },
    { name: 'Hero Banner',          subtitle: 'Static',                  status: 'Active' },
    { name: 'Brand Bar + Search',   subtitle: 'Static',                  status: 'Active' },
    {
      name: 'Trending Destinations',
      subtitle: 'Auto-fetched · Customisable',
      status: 'Active',
      action: (
        <button
          onClick={() => setShowTrendingModal(true)}
          className="text-xs px-3 py-1 rounded-lg bg-white/10 text-gray-300 hover:bg-white/20 hover:text-white transition-colors ml-2"
        >
          Edit
        </button>
      ),
    },
    {
      name: 'Featured Experiences',
      subtitle: 'Manual · Admin configured',
      status: featured.length > 0 ? 'Live' : 'Empty',
      action: (
        <button
          onClick={() => setShowFeaturedModal(true)}
          className="text-xs px-3 py-1 rounded-lg bg-white/10 text-gray-300 hover:bg-white/20 hover:text-white transition-colors ml-2"
        >
          Edit
        </button>
      ),
    },
  ]

  return (
    <div className="space-y-8">
      {/* Metric cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {metrics.map((m) => (
          <div key={m.label} className="bg-white/5 border border-white/10 rounded-xl p-5">
            <div className="text-3xl font-bold mb-1" style={{ color: m.color }}>{m.value}</div>
            <div className="text-sm text-gray-400">{m.label}</div>
          </div>
        ))}
      </div>

      {/* Page structure */}
      <div>
        <h2 className="text-lg font-semibold text-white mb-4">Page Structure</h2>
        <div className="space-y-2">
          {/* Static rows 1-5 */}
          {STATIC_ROWS.map((row, i) => (
            <StaticRow
              key={row.name}
              index={i}
              name={row.name}
              subtitle={row.subtitle}
              status={row.status}
              action={row.action}
            />
          ))}

          {/* Draggable curated list rows */}
          <DndContext sensors={sensors} onDragEnd={handleDragEnd}>
            <SortableContext items={lists.map((l) => l.id)} strategy={verticalListSortingStrategy}>
              {lists.map((list) => (
                <SortableListRow key={list.id} list={list} />
              ))}
            </SortableContext>
          </DndContext>

          {lists.length === 0 && (
            <div className="text-center py-6 border border-dashed border-white/10 rounded-xl">
              <p className="text-xs text-gray-500">No curated lists yet. Create one in the Manual or Automatic tabs.</p>
            </div>
          )}
        </div>
      </div>

      {showTrendingModal && (
        <TrendingModal
          initial={state.trending}
          onSave={(dests) => dispatch({ type: 'SET_TRENDING', trending: dests })}
          onClose={() => setShowTrendingModal(false)}
        />
      )}

      {showFeaturedModal && (
        <FeaturedExperiencesModal
          initial={featured}
          onSave={(trips) => dispatch({ type: 'SET_FEATURED', featured: trips })}
          onClose={() => setShowFeaturedModal(false)}
        />
      )}
    </div>
  )
}

function StatusPill({ status }: { status: string }) {
  const map: Record<string, string> = {
    live:   'bg-[#ccff00]/10 text-[#ccff00] border-[#ccff00]/20',
    draft:  'bg-gray-500/10 text-gray-400 border-gray-500/20',
    hidden: 'bg-red-500/10 text-red-400 border-red-500/20',
    Active: 'bg-[#ccff00]/10 text-[#ccff00] border-[#ccff00]/20',
    Live:   'bg-[#ccff00]/10 text-[#ccff00] border-[#ccff00]/20',
    Empty:  'bg-gray-500/10 text-gray-400 border-gray-500/20',
  }
  return (
    <span className={`text-xs px-2.5 py-1 rounded-full border capitalize ${map[status] ?? map.draft}`}>
      {status}
    </span>
  )
}
