'use client'

import { useEffect, useState } from 'react'
import AdminOverview from '@/components/admin/AdminOverview'
import AdminAutoLists from '@/components/admin/AdminAutoLists'
import AdminManualLists from '@/components/admin/AdminManualLists'
import { usePageStore } from '@/lib/pageStore'

export default function AdminPage() {
  const { dispatch } = usePageStore()
  const [tab, setTab] = useState<'overview' | 'automatic' | 'manual'>('overview')
  const [loading, setLoading] = useState(true)

  async function fetchLists() {
    try {
      const res = await fetch('/api/lists')
      if (!res.ok) throw new Error(`API error ${res.status}`)
      const data = await res.json()
      dispatch({ type: 'SET_LISTS', lists: data })
    } catch (err) {
      console.error('Failed to fetch lists:', err)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => { fetchLists() }, [])

  const tabs = [
    { key: 'overview',  label: 'Overview' },
    { key: 'automatic', label: 'Automatic lists' },
    { key: 'manual',    label: 'Manual lists' },
  ] as const

  return (
    <div className="flex min-h-screen bg-[#0a0a0a] text-white" style={{ fontFamily: "'DM Sans', sans-serif" }}>
      {/* Sidebar */}
      <aside className="w-60 border-r border-white/10 flex-shrink-0 flex flex-col">
        <div className="p-6 border-b border-white/10">
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 bg-[#ccff00] rounded flex items-center justify-center">
              <span className="text-black font-bold text-sm">Z</span>
            </div>
            <span className="font-semibold text-white">Zostel Admin</span>
          </div>
        </div>
        <nav className="p-4 flex-1">
          <div className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-3 px-3">Content</div>
          {[
            { icon: '🏠', label: 'Dashboard', active: false },
            { icon: '✈️', label: 'Zo Trips', active: true },
            { icon: '🏨', label: 'Hostels', active: false },
            { icon: '📦', label: 'Packages', active: false },
          ].map((item) => (
            <div
              key={item.label}
              className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm cursor-pointer mb-1 transition-colors ${
                item.active ? 'bg-[#ccff00]/10 text-[#ccff00]' : 'text-gray-400 hover:text-white hover:bg-white/5'
              }`}
            >
              <span>{item.icon}</span>
              <span>{item.label}</span>
            </div>
          ))}
          <div className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-3 px-3 mt-6">Settings</div>
          {[
            { icon: '⚙️', label: 'Configuration' },
            { icon: '👥', label: 'Users' },
          ].map((item) => (
            <div key={item.label} className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm cursor-pointer mb-1 text-gray-400 hover:text-white hover:bg-white/5 transition-colors">
              <span>{item.icon}</span>
              <span>{item.label}</span>
            </div>
          ))}
        </nav>
        <div className="p-4 border-t border-white/10">
          <a href="/zo-trips" target="_blank" className="flex items-center gap-2 text-xs text-gray-500 hover:text-[#ccff00] transition-colors px-3 py-2">
            <span>↗</span> View Consumer Page
          </a>
        </div>
      </aside>

      {/* Main content */}
      <main className="flex-1 flex flex-col overflow-hidden">
        <header className="border-b border-white/10 px-8 py-5 flex items-center justify-between flex-shrink-0">
          <div>
            <h1 className="text-xl font-semibold text-white">Landing Page</h1>
            <p className="text-sm text-gray-400">Manage Zo Trips consumer page content</p>
          </div>
          <a href="/zo-trips" target="_blank" className="flex items-center gap-2 bg-[#ccff00]/10 text-[#ccff00] border border-[#ccff00]/20 px-4 py-2 rounded-lg text-sm hover:bg-[#ccff00]/20 transition-colors">
            <span>↗</span> Preview Page
          </a>
        </header>

        {/* Tabs */}
        <div className="border-b border-white/10 px-8 flex-shrink-0">
          <div className="flex gap-1">
            {tabs.map((t) => (
              <button
                key={t.key}
                onClick={() => setTab(t.key)}
                className={`px-4 py-3 text-sm font-medium border-b-2 transition-colors ${
                  tab === t.key
                    ? 'border-[#ccff00] text-[#ccff00]'
                    : 'border-transparent text-gray-400 hover:text-white'
                }`}
              >
                {t.label}
              </button>
            ))}
          </div>
        </div>

        <div className="flex-1 overflow-y-auto p-8">
          {loading ? (
            <div className="flex items-center justify-center h-40">
              <div className="w-6 h-6 border-2 border-[#ccff00] border-t-transparent rounded-full animate-spin" />
            </div>
          ) : (
            <>
              {tab === 'overview'  && <AdminOverview onRefresh={fetchLists} />}
              {tab === 'automatic' && <AdminAutoLists onRefresh={fetchLists} />}
              {tab === 'manual'    && <AdminManualLists onRefresh={fetchLists} />}
            </>
          )}
        </div>
      </main>
    </div>
  )
}
