'use client'

import { useEffect, useState } from 'react'
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
import type { ListWithTrips } from '@/lib/pageStore'

type Trip = {
  id: string; name: string; image: string; tag: string; duration: string;
  price: number; sold_out: boolean; seats_left: number; next_batch: string;
}

const SUGGESTIONS = [
  { title: 'Grand Prix 2026',   slug: 'grand-prix-2026' },
  { title: 'Weekend Escapes',   slug: 'weekend-escapes' },
  { title: 'Summer Special',    slug: 'summer-special' },
  { title: 'Hidden Gems',       slug: 'hidden-gems' },
  { title: 'Budget Under 20K',  slug: 'budget-under-20k' },
]

const TAGS = ['All', 'Himalayan', 'International', 'Beaches', 'Weekend', 'Northeast', 'Adventure', 'Nature', 'Grand Prix']

// ─── Sortable row in the "Trip Order" section ─────────────────────────────────

function SortableTripRow({
  tripId,
  trip,
  onRemove,
}: {
  tripId: string
  trip: Trip | undefined
  onRemove: () => void
}) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } =
    useSortable({ id: tripId })

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
      className="flex items-center gap-2 bg-white/5 border border-white/10 rounded-lg px-2 py-1.5"
    >
      <div {...listeners} className="text-gray-600 cursor-grab active:cursor-grabbing flex-shrink-0">⠿</div>
      {trip && (
        <img src={trip.image + '&w=40'} alt={trip.name} className="w-7 h-7 rounded object-cover flex-shrink-0" />
      )}
      <span className="text-xs text-gray-300 flex-1 truncate">{trip?.name ?? tripId}</span>
      <button
        onClick={onRemove}
        className="text-gray-600 hover:text-red-400 flex-shrink-0 text-xs"
      >
        ✕
      </button>
    </div>
  )
}

// ─── Modal ────────────────────────────────────────────────────────────────────

export default function CreateListModal({
  editingList,
  onClose,
  onSave,
}: {
  editingList: ListWithTrips | null
  onClose: () => void
  onSave: () => void
}) {
  const [title, setTitle]   = useState(editingList?.title  ?? '')
  const [slug, setSlug]     = useState(editingList?.slug   ?? '')
  const [status, setStatus] = useState(editingList?.status ?? 'draft')
  const [trips, setTrips]   = useState<Trip[]>([])
  const [search, setSearch]     = useState('')
  const [tagFilter, setTagFilter] = useState('All')
  const [saving, setSaving]   = useState(false)

  // Ordered array of selected trip_ids — preserves both selection and order.
  const [orderedIds, setOrderedIds] = useState<string[]>(
    editingList
      ? [...editingList.trips]
          .sort((a, b) => a.position - b.position)
          .map((t) => t.trip_id)
      : [],
  )

  const selectedSet = new Set(orderedIds)

  const sensors = useSensors(useSensor(PointerSensor))

  useEffect(() => {
    fetch('/api/trips').then((r) => r.json()).then(setTrips)
  }, [])

  const filtered = trips.filter((t) => {
    const matchTag    = tagFilter === 'All' || t.tag === tagFilter
    const matchSearch = t.name.toLowerCase().includes(search.toLowerCase())
    return matchTag && matchSearch
  })

  function toggleTrip(id: string) {
    setOrderedIds((prev) =>
      prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id],
    )
  }

  function selectAll() {
    const newIds = filtered.map((t) => t.id).filter((id) => !selectedSet.has(id))
    setOrderedIds((prev) => [...prev, ...newIds])
  }

  function applySuggestion(s: typeof SUGGESTIONS[0]) {
    setTitle(s.title)
    setSlug(s.slug)
  }

  function autoSlug(t: string) {
    return t.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '')
  }

  function handleTripDragEnd(event: DragEndEvent) {
    const { active, over } = event
    if (!over || active.id === over.id) return
    const oldIdx = orderedIds.indexOf(String(active.id))
    const newIdx = orderedIds.indexOf(String(over.id))
    if (oldIdx === -1 || newIdx === -1) return
    setOrderedIds(arrayMove(orderedIds, oldIdx, newIdx))
  }

  async function handleSave() {
    setSaving(true)
    try {
      let listId: number
      if (editingList) {
        const res = await fetch(`/api/lists/${editingList.id}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ title, slug, status, type: 'manual', enabled: true }),
        })
        const data = await res.json()
        listId = data.id

        // Remove trips no longer selected
        for (const t of editingList.trips) {
          if (!selectedSet.has(t.trip_id)) {
            await fetch(`/api/lists/${listId}/trips/${t.trip_id}`, { method: 'DELETE' })
          }
        }
        // Add newly selected trips
        const existingIds = new Set(editingList.trips.map((t) => t.trip_id))
        for (const id of orderedIds) {
          if (!existingIds.has(id)) {
            const trip = trips.find((t) => t.id === id)!
            await fetch(`/api/lists/${listId}/trips`, {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({
                trip_id: trip.id, trip_name: trip.name, trip_image: trip.image,
                trip_tag: trip.tag, trip_duration: trip.duration, trip_price: trip.price,
                trip_sold_out: trip.sold_out, seats_left: trip.seats_left, next_batch: trip.next_batch,
              }),
            })
          }
        }
      } else {
        const res = await fetch('/api/lists', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ title, slug, status, type: 'manual', enabled: true }),
        })
        const data = await res.json()
        listId = data.id
        for (const id of orderedIds) {
          const trip = trips.find((t) => t.id === id)!
          await fetch(`/api/lists/${listId}/trips`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              trip_id: trip.id, trip_name: trip.name, trip_image: trip.image,
              trip_tag: trip.tag, trip_duration: trip.duration, trip_price: trip.price,
              trip_sold_out: trip.sold_out, seats_left: trip.seats_left, next_batch: trip.next_batch,
            }),
          })
        }
      }

      // Persist final trip order (positions 0…n)
      if (orderedIds.length > 0) {
        await fetch(`/api/lists/${listId}/trips/reorder`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            order: orderedIds.map((trip_id, i) => ({ trip_id, position: i })),
          }),
        })
      }

      onSave()
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-[#111] border border-white/10 rounded-2xl w-full max-w-4xl max-h-[90vh] flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-white/10 flex-shrink-0">
          <h2 className="text-lg font-semibold text-white">{editingList ? 'Edit List' : 'Create New List'}</h2>
          <button onClick={onClose} className="text-gray-400 hover:text-white w-8 h-8 flex items-center justify-center rounded-lg hover:bg-white/10">✕</button>
        </div>

        <div className="flex flex-1 overflow-hidden">
          {/* Left panel */}
          <div className="w-72 border-r border-white/10 flex flex-col overflow-y-auto p-5 gap-5 flex-shrink-0">
            {/* Suggestions */}
            <div>
              <div className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-3">Suggestions</div>
              <div className="space-y-1.5">
                {SUGGESTIONS.map((s) => (
                  <button
                    key={s.slug}
                    onClick={() => applySuggestion(s)}
                    className={`w-full text-left px-3 py-2 rounded-lg text-sm transition-colors ${
                      slug === s.slug ? 'bg-[#ccff00]/10 text-[#ccff00]' : 'text-gray-400 hover:text-white hover:bg-white/5'
                    }`}
                  >
                    {s.title}
                  </button>
                ))}
              </div>
            </div>

            {/* List details */}
            <div className="space-y-3">
              <div className="text-xs font-semibold text-gray-500 uppercase tracking-wider">List Details</div>
              <div>
                <label className="text-xs text-gray-400 mb-1 block">Title</label>
                <input
                  value={title}
                  onChange={(e) => { setTitle(e.target.value); if (!editingList) setSlug(autoSlug(e.target.value)) }}
                  placeholder="List title"
                  className="w-full bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-sm text-white placeholder-gray-500 focus:outline-none focus:border-[#ccff00]/50"
                />
              </div>
              <div>
                <label className="text-xs text-gray-400 mb-1 block">Slug</label>
                <input
                  value={slug}
                  onChange={(e) => setSlug(e.target.value)}
                  placeholder="url-slug"
                  className="w-full bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-sm text-white placeholder-gray-500 focus:outline-none focus:border-[#ccff00]/50"
                />
              </div>
              <div>
                <label className="text-xs text-gray-400 mb-1 block">Status</label>
                <select
                  value={status}
                  onChange={(e) => setStatus(e.target.value)}
                  className="w-full bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-[#ccff00]/50"
                >
                  <option value="draft">Draft</option>
                  <option value="live">Live</option>
                  <option value="hidden">Hidden</option>
                </select>
              </div>
            </div>

            {/* Trip order — drag to reorder selected trips */}
            {orderedIds.length > 0 && (
              <div>
                <div className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">
                  Trip Order ({orderedIds.length})
                </div>
                <div className="space-y-1.5 max-h-52 overflow-y-auto">
                  <DndContext sensors={sensors} onDragEnd={handleTripDragEnd}>
                    <SortableContext items={orderedIds} strategy={verticalListSortingStrategy}>
                      {orderedIds.map((id) => (
                        <SortableTripRow
                          key={id}
                          tripId={id}
                          trip={trips.find((t) => t.id === id)}
                          onRemove={() => setOrderedIds((prev) => prev.filter((x) => x !== id))}
                        />
                      ))}
                    </SortableContext>
                  </DndContext>
                </div>
              </div>
            )}
          </div>

          {/* Right panel: trip picker */}
          <div className="flex-1 flex flex-col overflow-hidden">
            <div className="px-5 py-4 border-b border-white/10 flex-shrink-0">
              <div className="flex items-center justify-between mb-3">
                <div className="text-sm text-white font-medium">{orderedIds.length} trip{orderedIds.length !== 1 ? 's' : ''} selected</div>
                <button onClick={selectAll} className="text-xs text-[#ccff00] hover:underline">Select all filtered</button>
              </div>
              <input
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search trips..."
                className="w-full bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-sm text-white placeholder-gray-500 focus:outline-none focus:border-[#ccff00]/50 mb-3"
              />
              <div className="flex gap-1.5 overflow-x-auto pb-1">
                {TAGS.map((tag) => (
                  <button
                    key={tag}
                    onClick={() => setTagFilter(tag)}
                    className={`flex-shrink-0 px-3 py-1 rounded-full text-xs transition-colors ${
                      tagFilter === tag ? 'bg-[#ccff00] text-black font-semibold' : 'bg-white/5 text-gray-400 hover:text-white'
                    }`}
                  >
                    {tag}
                  </button>
                ))}
              </div>
            </div>
            <div className="flex-1 overflow-y-auto p-3 grid grid-cols-2 gap-3 content-start">
              {filtered.map((trip) => {
                const selected = selectedSet.has(trip.id)
                return (
                  <div
                    key={trip.id}
                    onClick={() => toggleTrip(trip.id)}
                    className={`relative rounded-xl overflow-hidden cursor-pointer border-2 transition-all ${
                      selected ? 'border-[#ccff00]' : 'border-transparent'
                    }`}
                  >
                    <img src={trip.image + '&w=200'} alt={trip.name} className="w-full h-28 object-cover" />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/70 to-transparent" />
                    {selected && (
                      <div className="absolute top-2 right-2 w-5 h-5 bg-[#ccff00] rounded-full flex items-center justify-center">
                        <span className="text-black text-xs font-bold">✓</span>
                      </div>
                    )}
                    <div className="absolute bottom-0 left-0 right-0 p-2">
                      <div className="text-white text-xs font-medium leading-tight line-clamp-2">{trip.name}</div>
                      <div className="text-white/70 text-xs">₹{trip.price.toLocaleString('en-IN')}</div>
                    </div>
                  </div>
                )
              })}
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="px-6 py-4 border-t border-white/10 flex items-center justify-end gap-3 flex-shrink-0">
          <button onClick={onClose} className="px-4 py-2 text-sm text-gray-400 hover:text-white transition-colors">Cancel</button>
          <button
            onClick={handleSave}
            disabled={saving || !title}
            className="flex items-center gap-2 bg-[#ccff00] text-black font-semibold px-6 py-2 rounded-lg text-sm hover:bg-[#bbee00] transition-colors disabled:opacity-50"
          >
            {saving ? <div className="w-4 h-4 border-2 border-black border-t-transparent rounded-full animate-spin" /> : null}
            {editingList ? 'Save Changes' : 'Create List'}
          </button>
        </div>
      </div>
    </div>
  )
}
