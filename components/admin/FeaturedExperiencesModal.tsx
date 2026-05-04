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
import type { FeaturedTrip } from '@/lib/pageStore'

type ApiTrip = {
  id: string; name: string; image: string; tag: string; duration: string;
  price: number; sold_out: boolean; seats_left: number; next_batch: string;
}

const TAGS = ['All', 'Himalayan', 'International', 'Beaches', 'Weekend', 'Northeast', 'Adventure', 'Nature', 'Grand Prix']

function SortableRow({
  trip,
  onRemove,
}: {
  trip: FeaturedTrip
  onRemove: () => void
}) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } =
    useSortable({ id: trip.trip_id })

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
      <img src={trip.trip_image + '&w=40'} alt={trip.trip_name} className="w-7 h-7 rounded object-cover flex-shrink-0" />
      <span className="text-xs text-gray-300 flex-1 truncate">{trip.trip_name}</span>
      <button onClick={onRemove} className="text-gray-600 hover:text-red-400 flex-shrink-0 text-xs">✕</button>
    </div>
  )
}

export default function FeaturedExperiencesModal({
  initial,
  onSave,
  onClose,
}: {
  initial: FeaturedTrip[]
  onSave: (trips: FeaturedTrip[]) => void
  onClose: () => void
}) {
  const [apiTrips, setApiTrips] = useState<ApiTrip[]>([])
  const [selected, setSelected] = useState<FeaturedTrip[]>(initial)
  const [search, setSearch] = useState('')
  const [tagFilter, setTagFilter] = useState('All')

  const sensors = useSensors(useSensor(PointerSensor))
  const selectedIds = new Set(selected.map((t) => t.trip_id))

  useEffect(() => {
    fetch('/api/trips').then((r) => r.json()).then(setApiTrips)
  }, [])

  const filtered = apiTrips.filter((t) => {
    const matchTag = tagFilter === 'All' || t.tag === tagFilter
    const matchSearch = t.name.toLowerCase().includes(search.toLowerCase())
    return matchTag && matchSearch
  })

  function toggleTrip(apiTrip: ApiTrip) {
    if (selectedIds.has(apiTrip.id)) {
      setSelected((prev) => prev.filter((t) => t.trip_id !== apiTrip.id))
    } else {
      const ft: FeaturedTrip = {
        trip_id: apiTrip.id,
        trip_name: apiTrip.name,
        trip_image: apiTrip.image,
        trip_tag: apiTrip.tag,
        trip_duration: apiTrip.duration,
        trip_price: apiTrip.price,
        trip_sold_out: apiTrip.sold_out,
        seats_left: apiTrip.seats_left,
        next_batch: apiTrip.next_batch,
      }
      setSelected((prev) => [...prev, ft])
    }
  }

  function handleDragEnd(event: DragEndEvent) {
    const { active, over } = event
    if (!over || active.id === over.id) return
    const oldIdx = selected.findIndex((t) => t.trip_id === active.id)
    const newIdx = selected.findIndex((t) => t.trip_id === over.id)
    if (oldIdx === -1 || newIdx === -1) return
    setSelected(arrayMove(selected, oldIdx, newIdx))
  }

  return (
    <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-[#111] border border-white/10 rounded-2xl w-full max-w-4xl max-h-[90vh] flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-white/10 flex-shrink-0">
          <h2 className="text-lg font-semibold text-white">Edit Featured Experiences</h2>
          <button onClick={onClose} className="text-gray-400 hover:text-white w-8 h-8 flex items-center justify-center rounded-lg hover:bg-white/10">✕</button>
        </div>

        <div className="flex flex-1 overflow-hidden">
          {/* Left: trip picker */}
          <div className="flex-1 flex flex-col overflow-hidden border-r border-white/10">
            <div className="px-5 py-4 border-b border-white/10 flex-shrink-0">
              <div className="text-sm text-white font-medium mb-3">
                {selected.length} trip{selected.length !== 1 ? 's' : ''} selected
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
                      tagFilter === tag
                        ? 'bg-[#ccff00] text-black font-semibold'
                        : 'bg-white/5 text-gray-400 hover:text-white'
                    }`}
                  >
                    {tag}
                  </button>
                ))}
              </div>
            </div>
            <div className="flex-1 overflow-y-auto p-3 grid grid-cols-2 gap-3 content-start">
              {filtered.map((trip) => {
                const sel = selectedIds.has(trip.id)
                return (
                  <div
                    key={trip.id}
                    onClick={() => toggleTrip(trip)}
                    className={`relative rounded-xl overflow-hidden cursor-pointer border-2 transition-all ${
                      sel ? 'border-[#ccff00]' : 'border-transparent'
                    }`}
                  >
                    <img src={trip.image + '&w=200'} alt={trip.name} className="w-full h-28 object-cover" />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/70 to-transparent" />
                    {sel && (
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

          {/* Right: selected ordered list */}
          <div className="w-72 flex flex-col flex-shrink-0">
            <div className="px-5 py-4 border-b border-white/10 flex-shrink-0">
              <div className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Selected Order</div>
            </div>
            <div className="flex-1 overflow-y-auto p-3 space-y-1.5">
              {selected.length === 0 ? (
                <div className="text-center py-8 text-xs text-gray-500">Pick trips from the left</div>
              ) : (
                <DndContext sensors={sensors} onDragEnd={handleDragEnd}>
                  <SortableContext items={selected.map((t) => t.trip_id)} strategy={verticalListSortingStrategy}>
                    {selected.map((trip) => (
                      <SortableRow
                        key={trip.trip_id}
                        trip={trip}
                        onRemove={() => setSelected((prev) => prev.filter((t) => t.trip_id !== trip.trip_id))}
                      />
                    ))}
                  </SortableContext>
                </DndContext>
              )}
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="px-6 py-4 border-t border-white/10 flex items-center justify-end gap-3 flex-shrink-0">
          <button onClick={onClose} className="px-4 py-2 text-sm text-gray-400 hover:text-white transition-colors">Cancel</button>
          <button
            onClick={() => { onSave(selected); onClose() }}
            className="bg-[#ccff00] text-black font-semibold px-6 py-2 rounded-lg text-sm hover:bg-[#bbee00] transition-colors"
          >
            Save
          </button>
        </div>
      </div>
    </div>
  )
}
