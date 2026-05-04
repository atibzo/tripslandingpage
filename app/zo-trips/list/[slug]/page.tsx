import type { Metadata } from 'next'
import { notFound } from 'next/navigation'
import { Prisma } from '@prisma/client'
import { prisma } from '@/lib/prisma'
import TripCard from '@/components/TripCard'

type Trip = Prisma.CuratedListTripGetPayload<Record<string, never>>

export const revalidate = 0

const LIST_SUBTITLES: Record<string, string> = {
  'leaving-soon':   'Trips departing in the next 30 days',
  'filling-fast':   'Limited seats — grab your spot now',
  'grand-prix-2026':'Experience the thrill of Formula 1 racing',
  'weekend-escapes':'Short getaways perfect for a quick break',
}

export async function generateMetadata(
  { params }: { params: Promise<{ slug: string }> },
): Promise<Metadata> {
  const { slug } = await params
  const list = await prisma.curatedList.findUnique({ where: { slug } })
  if (!list) return { title: 'Zo Trips' }
  return { title: `${list.title} — Zo Trips` }
}

export default async function Page({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params

  const list = await prisma.curatedList.findUnique({
    where: { slug },
    include: { trips: { orderBy: { position: 'asc' } } },
  })

  if (!list || list.status !== 'live') notFound()

  const subtitle = LIST_SUBTITLES[list.slug] ?? 'Curated trips for every explorer'

  return (
    <div style={{ background: '#ffffff', minHeight: '100vh', color: '#111111' }}>

      {/* ── HEADER ── */}
      <header style={{ background: 'white', borderBottom: '1px solid #e2e2e4', position: 'sticky', top: 0, zIndex: 50 }}>
        <div style={{ maxWidth: '1440px', margin: '0 auto', padding: '0 108px', height: '64px', display: 'flex', alignItems: 'center', gap: '20px' }}>
          <a
            href="/zo-trips"
            style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '13px', color: '#666', textDecoration: 'none', flexShrink: 0 }}
          >
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
              <path d="M19 12H5M12 19l-7-7 7-7" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
            Zo Trips
          </a>
          <span style={{ color: '#e2e2e4', fontSize: '18px', lineHeight: 1 }}>|</span>
          <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
            <span style={{ fontSize: '17px', fontWeight: 700, color: '#111111' }}>ZOSTEL</span>
            <span style={{ fontSize: '14px', color: '#BF3158' }}>✳</span>
          </div>
        </div>
      </header>

      {/* ── LIST HEADER ── */}
      <div style={{ maxWidth: '1440px', margin: '0 auto', padding: '48px 108px 36px' }}>
        <h1 style={{ fontSize: '40px', fontWeight: 700, color: '#111111', lineHeight: 1.2, margin: '0 0 8px' }}>
          {list.title}
        </h1>
        <p style={{ fontSize: '16px', color: '#666666', margin: '0 0 12px' }}>
          {subtitle}
        </p>
        <span style={{ display: 'inline-block', fontSize: '13px', color: '#999999', background: '#f5f5f5', borderRadius: '100px', padding: '4px 12px' }}>
          {list.trips.length} trip{list.trips.length !== 1 ? 's' : ''}
        </span>
      </div>

      {/* ── TRIPS GRID ── */}
      <div style={{ maxWidth: '1440px', margin: '0 auto', padding: '0 108px 80px' }}>
        {list.trips.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '80px 0', color: '#999' }}>
            <p style={{ fontSize: '16px', margin: 0 }}>No trips in this list yet.</p>
          </div>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
            {list.trips.map((trip: Trip, i: number) => (
              <TripCard key={trip.id} trip={trip} index={i} />
            ))}
          </div>
        )}
      </div>

    </div>
  )
}
