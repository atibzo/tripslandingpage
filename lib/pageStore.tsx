'use client'

import React, { createContext, useContext, useEffect, useReducer } from 'react'
import type { CuratedList, CuratedListTrip } from '@/lib/prismaTypes'

export type ListWithTrips = CuratedList & { trips: CuratedListTrip[] }
export type TrendingDest = { name: string; img: string; duration: string }

export type FeaturedTrip = {
  trip_id: string
  trip_name: string
  trip_image: string
  trip_tag: string | null
  trip_duration: string
  trip_price: number
  trip_sold_out: boolean
  seats_left: number | null
  next_batch: string | null
}

export const DEFAULT_TRENDING: TrendingDest[] = [
  { name: 'Meghalaya', img: 'https://images.unsplash.com/photo-1544735716-392fe2489ffa?w=300', duration: '5N/6D' },
  { name: 'Spiti',     img: 'https://images.unsplash.com/photo-1596895111956-bf1cf0599ce5?w=300', duration: '7N/8D' },
  { name: 'Ladakh',   img: 'https://images.unsplash.com/photo-1527838832700-5059252407fa?w=300', duration: '8N/9D' },
  { name: 'Kashmir',  img: 'https://images.unsplash.com/photo-1506461883276-594a12b11cf3?w=300', duration: '6N/7D' },
  { name: 'Bhutan',   img: 'https://images.unsplash.com/photo-1526772662000-3f88f10405ff?w=300', duration: '7N/8D' },
  { name: 'Andaman',  img: 'https://images.unsplash.com/photo-1583623025817-d180a2221d0a?w=300', duration: '5N/6D' },
  { name: 'Kerala',   img: 'https://images.unsplash.com/photo-1602216056096-3b40cc0c9944?w=300', duration: '5N/6D' },
  { name: 'Bali',     img: 'https://images.unsplash.com/photo-1537996194471-e657df975ab4?w=300', duration: '6N/7D' },
  { name: 'Japan',    img: 'https://images.unsplash.com/photo-1540959733332-eab4deabeeaf?w=300', duration: '9N/10D' },
  { name: 'Coorg',    img: 'https://images.unsplash.com/photo-1588416936097-41850ab3d86d?w=300', duration: '2N/3D' },
]

interface State {
  lists: ListWithTrips[] | null
  trending: TrendingDest[]
  featured: FeaturedTrip[]
}

type Action =
  | { type: 'SET_LISTS';      lists: ListWithTrips[] }
  | { type: 'REORDER_LISTS';  ordered: ListWithTrips[] }
  | { type: 'SET_TRENDING';   trending: TrendingDest[] }
  | { type: 'SET_FEATURED';   featured: FeaturedTrip[] }

function reducer(state: State, action: Action): State {
  switch (action.type) {
    case 'SET_LISTS':     return { ...state, lists: action.lists }
    case 'REORDER_LISTS': return { ...state, lists: action.ordered }
    case 'SET_TRENDING':  return { ...state, trending: action.trending }
    case 'SET_FEATURED':  return { ...state, featured: action.featured }
  }
}

interface CtxValue { state: State; dispatch: React.Dispatch<Action> }
const Ctx = createContext<CtxValue | null>(null)

const LS_FEATURED  = 'zo-featured'
const LS_TRENDING  = 'zo-trending'

export function PageStoreProvider({ children }: { children: React.ReactNode }) {
  const [state, dispatch] = useReducer(reducer, { lists: null, trending: DEFAULT_TRENDING, featured: [] })

  // Seed both from localStorage on first mount
  useEffect(() => {
    try {
      const rawFeatured = localStorage.getItem(LS_FEATURED)
      if (rawFeatured) {
        const parsed = JSON.parse(rawFeatured) as FeaturedTrip[]
        if (Array.isArray(parsed) && parsed.length > 0) {
          dispatch({ type: 'SET_FEATURED', featured: parsed })
        }
      }
    } catch {}

    try {
      const rawTrending = localStorage.getItem(LS_TRENDING)
      if (rawTrending) {
        const parsed = JSON.parse(rawTrending) as TrendingDest[]
        if (Array.isArray(parsed) && parsed.length > 0) {
          dispatch({ type: 'SET_TRENDING', trending: parsed })
        }
      }
    } catch {}
  }, [])

  // Write-through: persist whenever either value changes
  useEffect(() => {
    try { localStorage.setItem(LS_FEATURED, JSON.stringify(state.featured)) } catch {}
  }, [state.featured])

  useEffect(() => {
    try { localStorage.setItem(LS_TRENDING, JSON.stringify(state.trending)) } catch {}
  }, [state.trending])

  return <Ctx.Provider value={{ state, dispatch }}>{children}</Ctx.Provider>
}

export function usePageStore() {
  const ctx = useContext(Ctx)
  if (!ctx) throw new Error('usePageStore must be inside PageStoreProvider')
  return ctx
}
