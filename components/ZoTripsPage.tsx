'use client'

import { useEffect, useRef, useState } from 'react'
import { usePageStore, DEFAULT_TRENDING } from '@/lib/pageStore'
import type { FeaturedTrip } from '@/lib/pageStore'
import type { CuratedList, CuratedListTrip } from '@/lib/prismaTypes'
import FeaturedTripCard from './FeaturedTripCard'
import TripCard from './TripCard'

type ListWithTrips = CuratedList & { trips: CuratedListTrip[] }

const NAV_CHIPS = [
  'Zostel', 'Zostel Plus', 'Zostel Homes', 'Zo Trips',
  'Zo House', 'Zo Selections', 'Destinations', 'Work with us', 'Open Franchise',
]

const TRENDING_PLACEHOLDER = [
  { name: 'Meghalaya', img: 'https://images.unsplash.com/photo-1544735716-392fe2489ffa?w=300', duration: '5N/6D' },
  { name: 'Spiti', img: 'https://images.unsplash.com/photo-1596895111956-bf1cf0599ce5?w=300', duration: '7N/8D' },
  { name: 'Ladakh', img: 'https://images.unsplash.com/photo-1527838832700-5059252407fa?w=300', duration: '8N/9D' },
  { name: 'Kashmir', img: 'https://images.unsplash.com/photo-1506461883276-594a12b11cf3?w=300', duration: '6N/7D' },
  { name: 'Bhutan', img: 'https://images.unsplash.com/photo-1526772662000-3f88f10405ff?w=300', duration: '7N/8D' },
  { name: 'Andaman', img: 'https://images.unsplash.com/photo-1583623025817-d180a2221d0a?w=300', duration: '5N/6D' },
  { name: 'Kerala', img: 'https://images.unsplash.com/photo-1602216056096-3b40cc0c9944?w=300', duration: '5N/6D' },
  { name: 'Bali', img: 'https://images.unsplash.com/photo-1537996194471-e657df975ab4?w=300', duration: '6N/7D' },
  { name: 'Japan', img: 'https://images.unsplash.com/photo-1540959733332-eab4deabeeaf?w=300', duration: '9N/10D' },
  { name: 'Coorg', img: 'https://images.unsplash.com/photo-1588416936097-41850ab3d86d?w=300', duration: '2N/3D' },
]

const LIST_SUBTITLES: Record<string, string> = {
  'leaving-soon': 'Trips departing in the next 30 days',
  'filling-fast': 'Limited seats — grab your spot now',
  'grand-prix-2026': 'Experience the thrill of Formula 1 racing',
  'weekend-escapes': 'Short getaways perfect for a quick break',
}

// ─── Icons ────────────────────────────────────────────────────────────────────

function IconSearch({ className = 'w-4 h-4' }: { className?: string }) {
  return (
    <svg className={className} fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
      <circle cx="11" cy="11" r="8" />
      <path d="m21 21-4.35-4.35" strokeLinecap="round" />
    </svg>
  )
}

function IconUser({ className = 'w-4 h-4' }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="currentColor">
      <path d="M12 12c2.7 0 4.8-2.1 4.8-4.8S14.7 2.4 12 2.4 7.2 4.5 7.2 7.2 9.3 12 12 12zm0 2.4c-3.2 0-9.6 1.6-9.6 4.8v2.4h19.2v-2.4c0-3.2-6.4-4.8-9.6-4.8z" />
    </svg>
  )
}

function IconSliders({ className = 'w-4 h-4' }: { className?: string }) {
  return (
    <svg className={className} fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
      <line x1="4" y1="21" x2="4" y2="14" /><line x1="4" y1="10" x2="4" y2="3" />
      <line x1="12" y1="21" x2="12" y2="12" /><line x1="12" y1="8" x2="12" y2="3" />
      <line x1="20" y1="21" x2="20" y2="16" /><line x1="20" y1="12" x2="20" y2="3" />
      <line x1="1" y1="14" x2="7" y2="14" /><line x1="9" y1="8" x2="15" y2="8" />
      <line x1="17" y1="16" x2="23" y2="16" />
    </svg>
  )
}

function IconChevronDown({ className = 'w-3 h-3' }: { className?: string }) {
  return (
    <svg className={className} fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
      <path d="M6 9l6 6 6-6" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  )
}

// ─── Featured Experiences section ─────────────────────────────────────────────

function FeaturedExperiences({ featured }: { featured: FeaturedTrip[] }) {
  const scrollRef = useRef<HTMLDivElement>(null)

  function scrollPrev() {
    scrollRef.current?.scrollBy({ left: -292, behavior: 'smooth' })
  }

  function scrollNext() {
    scrollRef.current?.scrollBy({ left: 292, behavior: 'smooth' })
  }

  return (
    <div style={{ padding: '0 108px 48px' }}>
      <div className="flex items-center justify-between mb-4">
        <div>
          <h2 className="font-mobiletitle lg:font-sectiontitle">Featured Experiences</h2>
          <p className="font-caption text-light-text-secondary mt-1">Handpicked by the Zo Trips team</p>
        </div>
        <div className="flex gap-2">
          <button
            onClick={scrollPrev}
            className="w-10 h-10 rounded-full border border-light-stroke-primary flex items-center justify-center hover:bg-light-background-secondary transition-colors"
          >
            <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M15 18l-6-6 6-6" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </button>
          <button
            onClick={scrollNext}
            className="w-10 h-10 rounded-full border border-light-stroke-primary flex items-center justify-center hover:bg-light-background-secondary transition-colors"
          >
            <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M9 18l6-6-6-6" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </button>
        </div>
      </div>
      <div
        ref={scrollRef}
        className="flex gap-4 overflow-x-auto scrollbar-hide scroll-smooth snap-x snap-mandatory"
      >
        {featured.map((trip) => (
          <FeaturedTripCard key={trip.trip_id} trip={trip} />
        ))}
      </div>
    </div>
  )
}

// ─── Curated List Row ─────────────────────────────────────────────────────────

function CuratedListRow({ list }: { list: ListWithTrips }) {
  if (!list.trips.length) return null
  const subtitle = LIST_SUBTITLES[list.slug] ?? 'Curated trips for every explorer'

  const scrollRef = useRef<HTMLDivElement>(null)
  const [atStart, setAtStart] = useState(true)
  const [atEnd, setAtEnd] = useState(list.trips.length <= 5)
  const showArrows = list.trips.length > 5

  function syncArrows() {
    const el = scrollRef.current
    if (!el) return
    setAtStart(el.scrollLeft <= 0)
    setAtEnd(el.scrollLeft + el.clientWidth >= el.scrollWidth - 1)
  }

  // One "page" = 5 cards + 4 gaps (16 px each) = clientWidth + 16 px
  function scroll(dir: 1 | -1) {
    const el = scrollRef.current
    if (!el) return
    el.scrollBy({ left: dir * (el.clientWidth + 16), behavior: 'smooth' })
  }

  return (
    <section style={{ paddingTop: '20px', paddingBottom: '48px' }}>
      <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: '24px' }}>
        <div>
          <h2 style={{ fontSize: '32px', fontWeight: 700, color: '#111111', lineHeight: '1.2', margin: 0 }}>
            {list.title}
          </h2>
          <p style={{ fontSize: '16px', color: '#666666', marginTop: '4px', marginBottom: 0 }}>
            {subtitle}
          </p>
        </div>
        <div className="flex flex-col items-end gap-2 flex-shrink-0 mt-2">
          {showArrows && (
            <div className="flex gap-2">
              <button
                onClick={() => scroll(-1)}
                disabled={atStart}
                className="w-8 h-8 rounded-full border border-[#e2e2e4] flex items-center justify-center hover:bg-[#f5f5f5] transition-colors disabled:opacity-30 disabled:cursor-not-allowed"
              >
                <svg className="w-3.5 h-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                  <path d="M15 18l-6-6 6-6" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              </button>
              <button
                onClick={() => scroll(1)}
                disabled={atEnd}
                className="w-8 h-8 rounded-full border border-[#e2e2e4] flex items-center justify-center hover:bg-[#f5f5f5] transition-colors disabled:opacity-30 disabled:cursor-not-allowed"
              >
                <svg className="w-3.5 h-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                  <path d="M9 18l6-6-6-6" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              </button>
            </div>
          )}
          <a
            href={`/zo-trips/list/${list.slug}`}
            style={{ fontSize: '13px', fontWeight: 500, color: '#BF3158', textDecoration: 'none', whiteSpace: 'nowrap' }}
            onMouseEnter={(e) => (e.currentTarget.style.textDecoration = 'underline')}
            onMouseLeave={(e) => (e.currentTarget.style.textDecoration = 'none')}
          >
            See all {list.trips.length} trips →
          </a>
        </div>
      </div>
      <div
        ref={scrollRef}
        onScroll={syncArrows}
        className="flex gap-4 overflow-x-auto scrollbar-hide scroll-smooth"
      >
        {list.trips.map((trip, i) => (
          <div key={trip.id} style={{ flexShrink: 0, width: 'calc((100% - 64px) / 5)' }}>
            <TripCard trip={trip} index={i} />
          </div>
        ))}
      </div>
    </section>
  )
}

// ─── Page root ────────────────────────────────────────────────────────────────

export default function ZoTripsPage({ serverLists }: { serverLists: ListWithTrips[] }) {
  const { state, dispatch } = usePageStore()
  const [activeFilter, setActiveFilter] = useState<string | null>(null)

  // Seed store on first mount; afterwards use whatever the store holds.
  useEffect(() => {
    if (!state.lists) dispatch({ type: 'SET_LISTS', lists: serverLists })
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const lists    = state.lists    ?? serverLists
  const trending = state.trending ?? DEFAULT_TRENDING
  const featured = state.featured

  return (
    <div style={{ background: '#ffffff', minHeight: '100vh', color: '#111111' }}>

      {/* ── HEADER ──────────────────────────────────────────────────────────── */}
      <header
        className="sticky top-0 z-50"
        style={{ background: 'white', borderBottom: '1px solid #e2e2e4', height: '129px' }}
      >
        <div style={{ maxWidth: '1440px', margin: '0 auto', paddingLeft: '108px', paddingRight: '108px' }}>

          {/* Top row — 56px tall, 16px from top */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '24px', height: '56px', paddingTop: '16px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '4px', flexShrink: 0, cursor: 'pointer' }}>
              <span style={{ fontSize: '20px', fontWeight: 700, letterSpacing: '-0.5px', color: '#111111' }}>ZOSTEL</span>
              <span style={{ fontSize: '16px', color: '#BF3158', lineHeight: 1 }}>✳</span>
            </div>

            <div
              style={{
                flex: 1, display: 'flex', alignItems: 'center', gap: '8px',
                background: '#F5F5F5', borderRadius: '100px',
                height: '42px', padding: '0 18px', cursor: 'text',
              }}
            >
              <IconSearch className="w-4 h-4 text-[#999999]" />
              <span style={{ fontSize: '14px', color: '#999' }}>Start your trip</span>
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexShrink: 0 }}>
              <button
                style={{
                  width: '42px', height: '42px',
                  background: '#111111', border: 'none', borderRadius: '100px',
                  cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center',
                  color: 'white',
                }}
              >
                <IconUser />
              </button>
              <button style={{ height: '42px', padding: '0 18px', background: 'transparent', border: '1.5px solid #111111', borderRadius: '100px', fontSize: '14px', fontWeight: 600, color: '#111111', cursor: 'pointer', whiteSpace: 'nowrap' }}>
                Get the App
              </button>
              <button style={{ height: '42px', padding: '0 18px', background: 'transparent', border: '1.5px solid #e2e2e4', borderRadius: '100px', fontSize: '14px', fontWeight: 600, color: '#111111', cursor: 'pointer', whiteSpace: 'nowrap' }}>
                Login
              </button>
            </div>
          </div>

          {/* Sub-nav chips — 29px tall, 12px below first row */}
          <div
            className="scrollbar-hide"
            style={{ display: 'flex', alignItems: 'center', gap: '8px', height: '29px', marginTop: '12px', overflowX: 'auto' }}
          >
            {NAV_CHIPS.map((chip) => {
              const active = chip === 'Zo Trips'
              return (
                <button
                  key={chip}
                  style={{
                    flexShrink: 0, height: '29px', padding: '0 14px',
                    borderRadius: '100px', fontSize: '13px', cursor: 'pointer',
                    whiteSpace: 'nowrap', fontWeight: active ? 600 : 400,
                    background: active ? '#111111' : 'transparent',
                    color: active ? '#ffffff' : '#666666',
                    border: active ? 'none' : '1px solid #DDDDDD',
                  }}
                >
                  {chip}
                </button>
              )
            })}
          </div>
        </div>
      </header>

      {/* ── ANNOUNCEMENT BANNER ─────────────────────────────────────────────── */}
      <a className="block w-full bg-gradient-to-r from-[#6E102A] to-[#BF3158]" href="/zo-selections">
        <div className="mx-auto max-w-screen-xl px-4 flex flex-col sm:flex-row items-center justify-center gap-2 sm:gap-4 py-2 text-center">
          <span className="flex items-center gap-2 text-xs sm:text-sm font-medium text-white">Your holiday just got more premium 🍷 Introducing Zo Selections!</span>
          <span className="border border-white rounded-full px-4 py-1 text-xs font-medium text-white hover:bg-white hover:text-[#6E102A] transition">Discover Now</span>
        </div>
      </a>

      {/* ── SPOTLIGHT CARD ──────────────────────────────────────────────────── */}
      <div style={{ maxWidth: '1440px', margin: '0 auto', padding: '32px 108px 0' }}>
        <a rel="noopener noreferrer" className="block group" href="/zo-trip/tag/grand-prix">
          <div className="relative overflow-hidden min-h-72 md:min-h-80 flex items-end md:items-center rounded-3xl">
            <div className="absolute inset-0 z-0">
              <img alt="Zo Trips Grand Prix 2026" loading="eager" className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105" src="https://proxy.cdn.zo.xyz/gallery/media/images/f960e600-aad9-4a41-863c-167a9f20684a_20251110122915.JPG?h=1080" />
              <div className="absolute inset-0 bg-gradient-to-t from-dark-background-primary via-dark-background-primary/80 to-transparent md:hidden"></div>
              <div className="absolute inset-0 hidden md:block bg-gradient-to-r from-dark-background-primary via-dark-background-primary/60 to-transparent"></div>
            </div>
            <div className="relative z-10 w-full p-5 md:p-10 lg:p-12">
              <div className="flex flex-col gap-3 md:gap-5 max-w-xl">
                <span className="font-smallbutton uppercase tracking-wider text-dark-text-primary w-fit">🏁 Grand Prix 2026</span>
                <h2 className="font-mobiletitle md:font-desktoptitle text-dark-text-primary">Zo Trips Grand Prix 2026 is Live</h2>
                <p className="font-subtitle md:font-body text-dark-text-primary max-w-md">Zo is bringing curated travel to the world&apos;s biggest Grand Prix. Join us for an unforgettable trackside experience.</p>
                <button className="shrink-0 h-14 whitespace-nowrap flex items-center text-dark-text-primary justify-center font-bigbutton transition-colors bg-light-background-zostel hover:bg-light-background-zostel/90 w-full max-w-xs mt-4 cursor-pointer rounded-2xl">
                  Check out the Line Up
                </button>
              </div>
            </div>
          </div>
        </a>
      </div>

      {/* ── HERO TAGLINE + SEARCH ────────────────────────────────────────────── */}
      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', textAlign: 'center', padding: '40px 108px' }}>
        <div className="flex flex-col items-center justify-center gap-6">
          <div className="flex flex-col items-center justify-center gap-6 lg:gap-0">
            <picture className="w-28 h-4 block lg:hidden">
              <img alt="Zo Trips" loading="lazy" src="https://proxy.cdn.zo.xyz/zo-media/brands/zo-trips-logo-dark.svg" />
            </picture>
            <div className="hidden lg:block">
              <img alt="zo-trips" className="w-48 h-6 block dark:hidden" src="https://proxy.cdn.zo.xyz/zo-media/brands/zo-trips-logo-light.svg" />
              <img alt="zo-trips" className="w-48 h-6 hidden dark:block" src="https://proxy.cdn.zo.xyz/zo-media/brands/zo-trips-logo-dark.svg" />
            </div>
            <h2 className="font-mobiletitle lg:font-desktoptitle text-center pt-4 text-white lg:text-inherit order-1 lg:order-2">Invaluable trips for most valuable prices</h2>
          </div>
          <div className="flex lg:flex-row flex-col items-center gap-2 bg-light-background-primary p-2 rounded-3xl lg:rounded-full w-80 lg:w-auto shadow-[0_0_0_1px_rgba(0,0,0,0.06),0_4px_24px_rgba(0,0,0,0.08)]">
            <div role="button" tabIndex={0} className="cursor-text flex items-center gap-4 py-2 px-4 lg:pl-3 lg:pr-4 lg:ml-1 hover:bg-light-background-secondary rounded-full">
              <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" className="w-6 h-6 text-light-text-secondary lg:hidden"><g clipPath="url(#a)"><path fill="currentColor" fillRule="evenodd" d="M7.657 7.172a4 4 0 1 0 5.657 5.656 4 4 0 0 0-5.657-5.656Zm-2.829 8.485a8 8 0 1 1 12.55-1.593l3.007 3.007a2 2 0 0 1-2.829 2.828l-3.006-3.006a8.004 8.004 0 0 1-9.722-1.236Z" clipRule="evenodd"></path></g><defs><clipPath id="a"><path fill="currentColor" d="M0 0h24v24H0z"></path></clipPath></defs></svg>
              <span className="hidden lg:inline">🧭</span>
              <div className="flex flex-col items-start">
                <span className="font-small dark:text-light-text-primary lg:block hidden">Where to?</span>
                <input className="font-body placeholder:font-body p-0 m-0 w-60 placeholder:text-light-text-secondary dark:text-light-text-primary focus:outline-none bg-transparent" placeholder="Search Trip" autoComplete="off" />
              </div>
            </div>
            <div role="button" tabIndex={0} className="cursor-pointer lg:ml-3 bg-light-brand-zostel h-16 w-full lg:w-32 flex items-center justify-center rounded-2xl lg:rounded-full">
              <span className="font-bigbutton text-dark-text-primary">Search</span>
            </div>
          </div>
        </div>
      </div>

      {/* ── TRENDING STRIP ──────────────────────────────────────────────────── */}
      <div style={{ padding: '0 108px 48px' }}>
        <h2 style={{ fontSize: '28px', fontWeight: 700, color: '#111111', margin: '0 0 20px' }}>
          Trending
        </h2>
        <div className="scrollbar-hide" style={{ display: 'flex', gap: '16px', overflowX: 'auto', paddingBottom: '6px' }}>
          {trending.map((dest) => (
            <div key={dest.name} className="group" style={{ flexShrink: 0, width: '120px', cursor: 'pointer' }}>
              <div style={{ width: '120px', height: '120px', overflow: 'hidden', borderRadius: '12px' }}>
                <img
                  src={dest.img}
                  alt={dest.name}
                  className="group-hover:scale-110 transition-transform duration-300"
                  style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }}
                />
              </div>
              <p style={{ fontSize: '14px', fontWeight: 500, color: '#111111', textAlign: 'center', margin: '8px 0 0' }}>{dest.name}</p>
              <p style={{ fontSize: '12px', color: '#666666', textAlign: 'center', margin: '2px 0 0' }}>{dest.duration}</p>
            </div>
          ))}
        </div>
      </div>

      {/* ── FEATURED EXPERIENCES ────────────────────────────────────────────── */}
      {featured.length > 0 && <FeaturedExperiences featured={featured} />}

      {/* ── FILTER BAR ──────────────────────────────────────────────────────── */}
      <div style={{ borderBottom: '1px solid #e2e2e4', background: 'white' }}>
        <div style={{ padding: '0 108px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '12px', height: '60px' }}>
          <button
            style={{ height: '36px', padding: '0 14px', background: 'white', border: '1px solid #DDD', borderRadius: '18px', fontSize: '13px', color: '#111111', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '5px', flexShrink: 0 }}
          >
            <IconSliders />
            Filters
          </button>

          <div className="flex gap-2 overflow-x-auto scrollbar-hide pb-2" style={{ flex: 1 }}>
            {(['Select Dates', 'India 🇮🇳', 'International ✈️', 'Weekend', 'Treks', 'Grand-Prix', 'Experiential', 'May', 'June', 'July'] as const).map((pill) => (
              <div
                key={pill}
                role="button"
                tabIndex={0}
                onClick={() => setActiveFilter(activeFilter === pill ? null : pill)}
                className="cursor-pointer flex-shrink-0 flex items-center gap-2 border border-light-stroke-primary dark:border-dark-stroke-primary py-2 px-3 hover:bg-light-background-secondary dark:hover:bg-dark-background-secondary rounded-full"
              >
                <span className="font-caption whitespace-nowrap">{pill}</span>
              </div>
            ))}
          </div>

          <button
            style={{ height: '36px', padding: '0 16px', background: 'white', border: '1px solid #DDD', borderRadius: '18px', fontSize: '13px', fontWeight: 500, color: '#111111', cursor: 'pointer', flexShrink: 0, display: 'flex', alignItems: 'center', gap: '5px' }}
          >
            Sort By <IconChevronDown />
          </button>
        </div>
      </div>

      {/* ── CURATED LIST ROWS ───────────────────────────────────────────────── */}
      <div style={{ maxWidth: '1440px', margin: '0 auto', padding: '0 108px' }}>
        {lists.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '80px 0', color: '#666' }}>
            <p style={{ fontSize: '16px', margin: '0 0 8px' }}>No curated lists published yet.</p>
            <a href="/admin/landing-page" style={{ color: '#BF3158', fontSize: '14px' }}>Go to Admin →</a>
          </div>
        ) : (
          lists.map((list) => <CuratedListRow key={list.id} list={list} />)
        )}
      </div>

      {/* ── FOOTER ──────────────────────────────────────────────────────────── */}
      <footer style={{ borderTop: '1px solid #e2e2e4', marginTop: '24px' }}>
        <div style={{ maxWidth: '1440px', margin: '0 auto', padding: '32px 108px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
            <span style={{ fontSize: '17px', fontWeight: 700, color: '#111111' }}>ZOSTEL</span>
            <span style={{ fontSize: '14px', color: '#BF3158' }}>✳</span>
          </div>
          <p style={{ fontSize: '13px', color: '#999', margin: 0 }}>© 2026 Zostel. All rights reserved.</p>
          <div style={{ display: 'flex', gap: '24px' }}>
            {['About', 'Careers', 'Blog', 'Privacy', 'Terms'].map((link) => (
              <a key={link} href="#" style={{ fontSize: '13px', color: '#666', textDecoration: 'none' }}>{link}</a>
            ))}
          </div>
        </div>
      </footer>

    </div>
  )
}
