'use client'

import { useState } from 'react'
import { usePageStore } from '@/lib/pageStore'
import type { ListWithTrips } from '@/lib/pageStore'

const AUTO_TEMPLATES = [
  {
    key: 'leaving-soon',
    title: 'Leaving Soon',
    defaultSubtitle: 'Trips departing in the next 30 days',
    description: 'Trips with next batch departing within 14 days',
    rule: 'next_batch_within_days',
    rule_parameter: '14',
    icon: '🚀',
  },
  {
    key: 'filling-fast',
    title: 'Filling Fast',
    defaultSubtitle: 'Limited seats — grab your spot now',
    description: 'Trips with fewer than 6 seats remaining',
    rule: 'seats_left_below',
    rule_parameter: '6',
    icon: '🔥',
  },
  {
    key: 'newly-added',
    title: 'Newly Added',
    defaultSubtitle: 'Fresh trips just added to the lineup',
    description: 'Trips added in the last 30 days',
    rule: 'added_within_days',
    rule_parameter: '30',
    icon: '✨',
  },
  {
    key: 'budget-picks',
    title: 'Budget Picks',
    defaultSubtitle: 'Great experiences under ₹20,000',
    description: 'Trips priced under ₹20,000',
    rule: 'price_below',
    rule_parameter: '20000',
    icon: '💰',
  },
]

export default function AdminAutoLists({ onRefresh }: { onRefresh: () => void }) {
  const { state } = usePageStore()
  const lists = (state.lists ?? []).filter((l) => l.type === 'automatic')
  const [toggling, setToggling] = useState<string | null>(null)
  const [subtitles, setSubtitles] = useState<Record<string, string>>({})
  const [savingSubtitle, setSavingSubtitle] = useState<string | null>(null)

  function getSubtitle(template: typeof AUTO_TEMPLATES[0], existing?: ListWithTrips) {
    if (template.key in subtitles) return subtitles[template.key]
    return existing?.subtitle ?? template.defaultSubtitle
  }

  async function saveSubtitle(template: typeof AUTO_TEMPLATES[0], existing?: ListWithTrips) {
    if (!existing) return
    setSavingSubtitle(template.key)
    try {
      await fetch(`/api/lists/${existing.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...existing, subtitle: subtitles[template.key] ?? existing.subtitle }),
      })
      onRefresh()
    } finally {
      setSavingSubtitle(null)
    }
  }

  async function toggleList(template: typeof AUTO_TEMPLATES[0], currentList?: ListWithTrips) {
    setToggling(template.key)
    try {
      if (currentList) {
        await fetch(`/api/lists/${currentList.id}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ ...currentList, enabled: !currentList.enabled, status: !currentList.enabled ? 'live' : 'hidden' }),
        })
      } else {
        await fetch('/api/lists', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            type: 'automatic',
            title: template.title,
            subtitle: subtitles[template.key] ?? template.defaultSubtitle,
            slug: template.key,
            rule: template.rule,
            rule_parameter: template.rule_parameter,
            enabled: true,
            status: 'live',
          }),
        })
      }
      onRefresh()
    } finally {
      setToggling(null)
    }
  }

  return (
    <div className="space-y-4">
      <div className="mb-6">
        <h2 className="text-lg font-semibold text-white">Automatic Lists</h2>
        <p className="text-sm text-gray-400 mt-1">Rule-based lists that update automatically based on trip data.</p>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {AUTO_TEMPLATES.map((template) => {
          const existing = lists.find(l => l.slug === template.key)
          const isActive = existing?.enabled && existing?.status === 'live'
          const isLoading = toggling === template.key

          return (
            <div
              key={template.key}
              className={`border rounded-xl p-5 transition-colors ${
                isActive ? 'border-[#ccff00]/30 bg-[#ccff00]/5' : 'border-white/10 bg-white/5'
              }`}
            >
              <div className="flex items-start justify-between mb-3">
                <div className="flex items-center gap-3">
                  <div className="text-2xl">{template.icon}</div>
                  <div>
                    <div className="font-semibold text-white">{template.title}</div>
                    <div className="text-xs text-gray-400 mt-0.5">{template.description}</div>
                  </div>
                </div>
                <button
                  onClick={() => toggleList(template, existing)}
                  disabled={isLoading}
                  className={`relative w-12 h-6 rounded-full transition-colors flex-shrink-0 ${
                    isActive ? 'bg-[#ccff00]' : 'bg-white/20'
                  } disabled:opacity-50`}
                >
                  <div className={`absolute top-1 w-4 h-4 rounded-full bg-white transition-transform ${isActive ? 'translate-x-7' : 'translate-x-1'}`} />
                </button>
              </div>
              <div className="flex items-center gap-3 mt-4">
                <div className="text-xs text-gray-500">Rule: <span className="text-gray-300">{template.rule}</span></div>
                <div className="text-xs text-gray-500">Param: <span className="text-gray-300">{template.rule_parameter}</span></div>
              </div>
              <div className="mt-3">
                <label className="text-xs text-gray-500 mb-1 block">Subtitle</label>
                <div className="flex gap-2">
                  <input
                    value={getSubtitle(template, existing)}
                    onChange={(e) => setSubtitles((prev) => ({ ...prev, [template.key]: e.target.value }))}
                    placeholder={template.defaultSubtitle}
                    className="flex-1 bg-white/5 border border-white/10 rounded-lg px-3 py-1.5 text-xs text-white placeholder-gray-600 focus:outline-none focus:border-[#ccff00]/50"
                  />
                  {existing && template.key in subtitles && (
                    <button
                      onClick={() => saveSubtitle(template, existing)}
                      disabled={savingSubtitle === template.key}
                      className="text-xs px-3 py-1.5 rounded-lg bg-[#ccff00]/10 text-[#ccff00] hover:bg-[#ccff00]/20 transition-colors disabled:opacity-50"
                    >
                      Save
                    </button>
                  )}
                </div>
              </div>
              {existing && (
                <div className="mt-3 pt-3 border-t border-white/10 flex items-center justify-between">
                  <span className="text-xs text-gray-400">{existing.trips.length} trips matched</span>
                  <StatusPill status={existing.status} />
                </div>
              )}
              {!existing && (
                <div className="mt-3 pt-3 border-t border-white/10">
                  <span className="text-xs text-gray-500">Not yet activated</span>
                </div>
              )}
            </div>
          )
        })}
      </div>
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
