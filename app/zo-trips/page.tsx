import type { Metadata } from 'next'
import { prisma } from '@/lib/prisma'
import ZoTripsPage from '@/components/ZoTripsPage'

export const revalidate = 0

export const metadata: Metadata = {
  title: 'Zo Trips — Invaluable trips for most valuable prices',
  description: 'Curated travel experiences with travel & meals always included. Himalayas, International, Weekend escapes and more.',
}

async function getLists() {
  try {
    return await prisma.curatedList.findMany({
      where: { status: 'live', enabled: true },
      include: { trips: { orderBy: { position: 'asc' } } },
      orderBy: { display_order: 'asc' },
    })
  } catch (err) {
    console.error('getLists error:', err)
    return []
  }
}

export default async function Page() {
  const lists = await getLists()
  return <ZoTripsPage serverLists={lists} />
}
