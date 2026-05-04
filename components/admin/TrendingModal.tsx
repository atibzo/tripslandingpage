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
import type { TrendingDest } from '@/lib/pageStore'

type DestEntry = TrendingDest & { _key: string }

function SortableDestRow({
  entry,
  onChange,
  onRemove,
}: {
  entry: DestEntry
  onChange: (field: keyof TrendingDest, value: string) => void
  onRemove: () => void
}) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } =
    useSortable({ id: entry._key })

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
      className="flex items-center gap-3 bg-white/5 border border-white/10 rounded-xl p-3"
    >
      <div {...listeners} className="text-gray-600 cursor-grab active:cursor-grabbing flex-shrink-0">⠿</div>
      <div className="w-10 h-10 rounded-lg overflow-hidden flex-shrink-0 bg-white/10">
        {entry.img && (
          <img src={entry.img} alt={entry.name} className="w-full h-full object-cover" />
        )}
      </div>
      <div className="flex-1 grid grid-cols-3 gap-2 min-w-0">
        <input
          value={entry.name}
          onChange={(e) => onChange('name', e.target.value)}
          placeholder="Name"
          className="bg-transparent border-b border-white/20 text-sm text-white placeholder-gray-600 focus:outline-none focus:border-[#ccff00]/60 px-1 py-0.5"
        />
        <input
          value={entry.duration}
          onChange={(e) => onChange('duration', e.target.value)}
          placeholder="5N/6D"
          className="bg-transparent border-b border-white/20 text-sm text-white placeholder-gray-600 focus:outline-none focus:border-[#ccff00]/60 px-1 py-0.5"
        />
        <input
          value={entry.img}
          onChange={(e) => onChange('img', e.target.value)}
          placeholder="Image URL"
          className="bg-transparent border-b border-white/20 text-sm text-white placeholder-gray-600 focus:outline-none focus:border-[#ccff00]/60 px-1 py-0.5"
        />
      </div>
      <button
        onClick={onRemove}
        className="text-gray-600 hover:text-red-400 flex-shrink-0 text-xs"
      >
        🗑
      </button>
    </div>
  )
}

let _keyCounter = 0
function genKey() { return `dest-${++_keyCounter}` }

export default function TrendingModal({
  initial,
  onSave,
  onClose,
}: {
  initial: TrendingDest[]
  onSave: (dests: TrendingDest[]) => void
  onClose: () => void
}) {
  const [entries, setEntries] = useState<DestEntry[]>(
    initial.map((d) => ({ ...d, _key: genKey() })),
  )

  const sensors = useSensors(useSensor(PointerSensor))

  function handleDragEnd(event: DragEndEvent) {
    const { active, over } = event
    if (!over || active.id === over.id) return
    const oldIdx = entries.findIndex((e) => e._key === active.id)
    const newIdx = entries.findIndex((e) => e._key === over.id)
    if (oldIdx === -1 || newIdx === -1) return
    setEntries(arrayMove(entries, oldIdx, newIdx))
  }

  function updateEntry(key: string, field: keyof TrendingDest, value: string) {
    setEntries((prev) =>
      prev.map((e) => (e._key === key ? { ...e, [field]: value } : e)),
    )
  }

  function removeEntry(key: string) {
    setEntries((prev) => prev.filter((e) => e._key !== key))
  }

  function addEntry() {
    setEntries((prev) => [...prev, { name: '', img: '', duration: '', _key: genKey() }])
  }

  function handleSave() {
    onSave(entries.map(({ _key: _k, ...d }) => d))
    onClose()
  }

  return (
    <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-[#111] border border-white/10 rounded-2xl w-full max-w-2xl max-h-[90vh] flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-white/10 flex-shrink-0">
          <h2 className="text-lg font-semibold text-white">Edit Trending Destinations</h2>
          <button onClick={onClose} className="text-gray-400 hover:text-white w-8 h-8 flex items-center justify-center rounded-lg hover:bg-white/10">✕</button>
        </div>

        {/* Note */}
        <div className="px-6 py-3 bg-white/3 border-b border-white/10 flex-shrink-0">
          <p className="text-xs text-gray-400">
            Destinations are auto-fetched from active trips. You can pin, remove, or reorder them here.
          </p>
        </div>

        {/* Column headers */}
        <div className="px-6 py-2 flex-shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-4 flex-shrink-0" />
            <div className="w-10 flex-shrink-0" />
            <div className="flex-1 grid grid-cols-3 gap-2 text-xs text-gray-500 px-1">
              <span>Name</span>
              <span>Duration</span>
              <span>Image URL</span>
            </div>
            <div className="w-4 flex-shrink-0" />
          </div>
        </div>

        {/* List */}
        <div className="flex-1 overflow-y-auto px-6 py-2 space-y-2">
          <DndContext sensors={sensors} onDragEnd={handleDragEnd}>
            <SortableContext
              items={entries.map((e) => e._key)}
              strategy={verticalListSortingStrategy}
            >
              {entries.map((entry) => (
                <SortableDestRow
                  key={entry._key}
                  entry={entry}
                  onChange={(field, value) => updateEntry(entry._key, field, value)}
                  onRemove={() => removeEntry(entry._key)}
                />
              ))}
            </SortableContext>
          </DndContext>
        </div>

        {/* Footer */}
        <div className="px-6 py-4 border-t border-white/10 flex items-center justify-between flex-shrink-0">
          <button
            onClick={addEntry}
            className="text-sm text-[#ccff00] hover:underline"
          >
            + Add Destination
          </button>
          <div className="flex items-center gap-3">
            <button onClick={onClose} className="px-4 py-2 text-sm text-gray-400 hover:text-white transition-colors">Cancel</button>
            <button
              onClick={handleSave}
              className="bg-[#ccff00] text-black font-semibold px-6 py-2 rounded-lg text-sm hover:bg-[#bbee00] transition-colors"
            >
              Save
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
