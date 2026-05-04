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
import CreateListModal from './CreateListModal'

function SortableListCard({
  list,
  onEdit,
  onDelete,
  onStatusChange,
}: {
  list: ListWithTrips
  onEdit: () => void
  onDelete: () => void
  onStatusChange: (status: string) => void
}) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } =
    useSortable({ id: list.id })

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
  }

  const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000)
  const isStale = list.last_reviewed_at && new Date(list.last_reviewed_at) < thirtyDaysAgo

  return (
    <div
      ref={setNodeRef}
      style={style}
      {...attributes}
      className={`border rounded-xl p-5 transition-all ${
        isDragging ? 'opacity-50 border-[#ccff00]/50' : 'border-white/10 bg-white/5'
      }`}
    >
      <div className="flex items-start gap-4">
        <div
          {...listeners}
          className="text-gray-600 mt-1 flex-shrink-0 cursor-grab active:cursor-grabbing"
        >
          ⠿
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-3 mb-2 flex-wrap">
            <span className="font-semibold text-white">{list.title}</span>
            <StatusPill status={list.status} />
            {isStale && (
              <span className="text-xs bg-yellow-500/10 text-yellow-400 border border-yellow-500/20 px-2 py-0.5 rounded-full">
                ⚠ Review needed
              </span>
            )}
          </div>
          <div className="text-sm text-gray-400">
            {list.trips.length} trips · /{list.slug}
            {list.published_at && ` · Published ${new Date(list.published_at).toLocaleDateString()}`}
          </div>
          {list.trips.length > 0 && (
            <div className="flex gap-1.5 mt-3">
              {list.trips.slice(0, 5).map((t) => (
                <img key={t.id} src={t.trip_image + '&w=60'} alt={t.trip_name} className="w-10 h-10 rounded-lg object-cover" />
              ))}
              {list.trips.length > 5 && (
                <div className="w-10 h-10 rounded-lg bg-white/10 flex items-center justify-center text-xs text-gray-400">
                  +{list.trips.length - 5}
                </div>
              )}
            </div>
          )}
        </div>
        <div className="flex items-center gap-2 flex-shrink-0">
          <select
            value={list.status}
            onChange={(e) => onStatusChange(e.target.value)}
            className="bg-white/5 border border-white/10 text-gray-300 text-xs rounded-lg px-2 py-1.5 focus:outline-none focus:border-[#ccff00]/50"
          >
            <option value="live">Live</option>
            <option value="draft">Draft</option>
            <option value="hidden">Hidden</option>
          </select>
          <button
            onClick={onEdit}
            className="p-1.5 rounded-lg text-gray-400 hover:text-white hover:bg-white/10 transition-colors"
            title="Edit"
          >
            ✏
          </button>
          <button
            onClick={onDelete}
            className="p-1.5 rounded-lg text-gray-400 hover:text-red-400 hover:bg-red-500/10 transition-colors"
            title="Delete"
          >
            🗑
          </button>
        </div>
      </div>
    </div>
  )
}

export default function AdminManualLists({ onRefresh }: { onRefresh: () => void }) {
  const { state, dispatch } = usePageStore()
  const allLists  = state.lists ?? []
  const manualLists = allLists.filter((l) => l.type === 'manual')

  // Local ordered copy — used while dragging; committed to store on Save Order.
  const [localOrder, setLocalOrder] = useState<ListWithTrips[]>(manualLists)
  // Keep localOrder in sync if the store changes from outside (e.g. after refresh).
  if (
    manualLists.length !== localOrder.length ||
    manualLists.some((l, i) => l.id !== localOrder[i]?.id)
  ) {
    setLocalOrder(manualLists)
  }

  const [showCreateModal, setShowCreateModal] = useState(false)
  const [editingList, setEditingList]         = useState<ListWithTrips | null>(null)
  const [saving, setSaving]                   = useState(false)

  const sensors = useSensors(useSensor(PointerSensor))

  function handleDragEnd(event: DragEndEvent) {
    const { active, over } = event
    if (!over || active.id === over.id) return
    const oldIdx = localOrder.findIndex((l) => l.id === active.id)
    const newIdx = localOrder.findIndex((l) => l.id === over.id)
    setLocalOrder(arrayMove(localOrder, oldIdx, newIdx))
  }

  async function saveOrder() {
    setSaving(true)
    await fetch('/api/lists/reorder', {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ order: localOrder.map((l, i) => ({ id: l.id, display_order: i })) }),
    })
    // Merge new order into store
    const otherLists = allLists.filter((l) => l.type !== 'manual')
    dispatch({ type: 'REORDER_LISTS', ordered: [...otherLists, ...localOrder] })
    setSaving(false)
    onRefresh()
  }

  async function deleteList(id: number) {
    if (!confirm('Delete this list? This cannot be undone.')) return
    await fetch(`/api/lists/${id}`, { method: 'DELETE' })
    onRefresh()
  }

  async function updateStatus(list: ListWithTrips, status: string) {
    await fetch(`/api/lists/${list.id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ ...list, status }),
    })
    onRefresh()
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-lg font-semibold text-white">Manual Lists</h2>
          <p className="text-sm text-gray-400 mt-1">Drag to reorder. Changes go live on save.</p>
        </div>
        <div className="flex items-center gap-3">
          <button
            onClick={saveOrder}
            disabled={saving}
            className="flex items-center gap-2 bg-white/10 hover:bg-white/15 text-white border border-white/20 px-4 py-2 rounded-lg text-sm transition-colors disabled:opacity-50"
          >
            {saving ? (
              <div className="w-3 h-3 border border-white border-t-transparent rounded-full animate-spin" />
            ) : '↕'}
            Save Order
          </button>
          <button
            onClick={() => setShowCreateModal(true)}
            className="flex items-center gap-2 bg-[#ccff00] text-black font-semibold px-4 py-2 rounded-lg text-sm hover:bg-[#bbee00] transition-colors"
          >
            + New List
          </button>
        </div>
      </div>

      <div className="space-y-3">
        <DndContext sensors={sensors} onDragEnd={handleDragEnd}>
          <SortableContext items={localOrder.map((l) => l.id)} strategy={verticalListSortingStrategy}>
            {localOrder.map((list) => (
              <SortableListCard
                key={list.id}
                list={list}
                onEdit={() => setEditingList(list)}
                onDelete={() => deleteList(list.id)}
                onStatusChange={(s) => updateStatus(list, s)}
              />
            ))}
          </SortableContext>
        </DndContext>

        {localOrder.length === 0 && (
          <div className="text-center py-16 border border-dashed border-white/20 rounded-xl">
            <p className="text-gray-400 mb-4">No manual lists yet.</p>
            <button onClick={() => setShowCreateModal(true)} className="bg-[#ccff00] text-black px-4 py-2 rounded-lg text-sm font-semibold">
              Create your first list
            </button>
          </div>
        )}
      </div>

      {(showCreateModal || editingList) && (
        <CreateListModal
          editingList={editingList}
          onClose={() => { setShowCreateModal(false); setEditingList(null) }}
          onSave={() => { setShowCreateModal(false); setEditingList(null); onRefresh() }}
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
  }
  return (
    <span className={`text-xs px-2.5 py-1 rounded-full border capitalize ${map[status] || map.draft}`}>
      {status}
    </span>
  )
}
