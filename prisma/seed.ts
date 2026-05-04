import { PrismaLibSql } from '@prisma/adapter-libsql'
import { PrismaClient } from '@prisma/client'

const adapter = new PrismaLibSql({ url: process.env.DATABASE_URL ?? 'file:./dev.db' })
const prisma = new PrismaClient({ adapter })

const SEED_TRIPS = [
  {
    id: 'trip-bhutan',
    name: 'Bhutan: Land of the Thunder Dragon',
    image: 'https://images.unsplash.com/photo-1526772662000-3f88f10405ff?w=800',
    tag: 'International',
    duration: '7N/8D',
    price: 42000,
    sold_out: false,
    seats_left: 3,
    next_batch: 'Jun 14, 2026',
  },
  {
    id: 'trip-meghalaya',
    name: 'Meghalaya: Abode of Clouds',
    image: 'https://images.unsplash.com/photo-1544735716-392fe2489ffa?w=800',
    tag: 'Northeast',
    duration: '5N/6D',
    price: 18500,
    sold_out: false,
    seats_left: 8,
    next_batch: 'May 28, 2026',
  },
  {
    id: 'trip-kashmir',
    name: 'Kashmir: Paradise on Earth',
    image: 'https://images.unsplash.com/photo-1506461883276-594a12b11cf3?w=800',
    tag: 'Himalayan',
    duration: '6N/7D',
    price: 22000,
    sold_out: false,
    seats_left: 12,
    next_batch: 'Jun 5, 2026',
  },
  {
    id: 'trip-ladakh',
    name: 'Ladakh: The Land of High Passes',
    image: 'https://images.unsplash.com/photo-1527838832700-5059252407fa?w=800',
    tag: 'Himalayan',
    duration: '8N/9D',
    price: 31000,
    sold_out: false,
    seats_left: 5,
    next_batch: 'Jun 20, 2026',
  },
  {
    id: 'trip-spiti',
    name: 'Spiti Valley: Cold Desert Adventure',
    image: 'https://images.unsplash.com/photo-1596895111956-bf1cf0599ce5?w=800',
    tag: 'Adventure',
    duration: '7N/8D',
    price: 26000,
    sold_out: false,
    seats_left: 4,
    next_batch: 'Jul 3, 2026',
  },
  {
    id: 'trip-andaman',
    name: 'Andaman: Emerald Islands',
    image: 'https://images.unsplash.com/photo-1583623025817-d180a2221d0a?w=800',
    tag: 'Beaches',
    duration: '5N/6D',
    price: 28000,
    sold_out: true,
    seats_left: 0,
    next_batch: 'Jun 10, 2026',
  },
  {
    id: 'trip-kerala',
    name: "Kerala: God's Own Country",
    image: 'https://images.unsplash.com/photo-1602216056096-3b40cc0c9944?w=800',
    tag: 'Nature',
    duration: '5N/6D',
    price: 19500,
    sold_out: false,
    seats_left: 15,
    next_batch: 'May 30, 2026',
  },
  {
    id: 'trip-bali',
    name: 'Bali: Island of Gods',
    image: 'https://images.unsplash.com/photo-1537996194471-e657df975ab4?w=800',
    tag: 'International',
    duration: '6N/7D',
    price: 52000,
    sold_out: false,
    seats_left: 6,
    next_batch: 'Jun 28, 2026',
  },
  {
    id: 'trip-japan',
    name: 'Japan: Cherry Blossoms & Beyond',
    image: 'https://images.unsplash.com/photo-1540959733332-eab4deabeeaf?w=800',
    tag: 'International',
    duration: '9N/10D',
    price: 89000,
    sold_out: false,
    seats_left: 2,
    next_batch: 'Jul 12, 2026',
  },
  {
    id: 'trip-singapore-gp',
    name: 'Singapore Grand Prix 2026',
    image: 'https://images.unsplash.com/photo-1525625293386-3f8f99389edd?w=800',
    tag: 'Grand Prix',
    duration: '4N/5D',
    price: 125000,
    sold_out: false,
    seats_left: 8,
    next_batch: 'Sep 18, 2026',
  },
  {
    id: 'trip-coorg',
    name: 'Coorg: Scotland of India',
    image: 'https://images.unsplash.com/photo-1588416936097-41850ab3d86d?w=800',
    tag: 'Weekend',
    duration: '2N/3D',
    price: 8500,
    sold_out: false,
    seats_left: 20,
    next_batch: 'May 24, 2026',
  },
  {
    id: 'trip-arunachal',
    name: 'Arunachal Pradesh: The Rising Sun State',
    image: 'https://images.unsplash.com/photo-1591017403521-0af265a36ad9?w=800',
    tag: 'Northeast',
    duration: '8N/9D',
    price: 34000,
    sold_out: false,
    seats_left: 7,
    next_batch: 'Jun 8, 2026',
  },
]

async function main() {
  // Clear existing data
  await prisma.curatedListTrip.deleteMany()
  await prisma.curatedList.deleteMany()

  // Create automatic lists
  const leavingSoon = await prisma.curatedList.create({
    data: {
      type: 'automatic',
      title: 'Leaving Soon',
      slug: 'leaving-soon',
      rule: 'next_batch_within_days',
      rule_parameter: '14',
      enabled: true,
      display_order: 0,
      status: 'live',
      published_at: new Date(),
      trips: {
        create: [
          { ...tripToListTrip(SEED_TRIPS[1], 0) }, // Meghalaya
          { ...tripToListTrip(SEED_TRIPS[6], 1) }, // Kerala
          { ...tripToListTrip(SEED_TRIPS[10], 2) }, // Coorg
        ],
      },
    },
  })

  const fillingFast = await prisma.curatedList.create({
    data: {
      type: 'automatic',
      title: 'Filling Fast',
      slug: 'filling-fast',
      rule: 'seats_left_below',
      rule_parameter: '6',
      enabled: true,
      display_order: 1,
      status: 'live',
      published_at: new Date(),
      trips: {
        create: [
          { ...tripToListTrip(SEED_TRIPS[0], 0) }, // Bhutan
          { ...tripToListTrip(SEED_TRIPS[3], 1) }, // Ladakh
          { ...tripToListTrip(SEED_TRIPS[4], 2) }, // Spiti
          { ...tripToListTrip(SEED_TRIPS[8], 3) }, // Japan
          { ...tripToListTrip(SEED_TRIPS[7], 4) }, // Bali
        ],
      },
    },
  })

  // Create manual lists
  const grandPrix = await prisma.curatedList.create({
    data: {
      type: 'manual',
      title: 'Grand Prix 2026',
      slug: 'grand-prix-2026',
      enabled: true,
      display_order: 2,
      status: 'live',
      published_at: new Date(),
      trips: {
        create: [
          { ...tripToListTrip(SEED_TRIPS[9], 0) }, // Singapore GP
          { ...tripToListTrip(SEED_TRIPS[8], 1) }, // Japan
          { ...tripToListTrip(SEED_TRIPS[7], 2) }, // Bali
          { ...tripToListTrip(SEED_TRIPS[0], 3) }, // Bhutan
        ],
      },
    },
  })

  const weekendEscapes = await prisma.curatedList.create({
    data: {
      type: 'manual',
      title: 'Weekend Escapes',
      slug: 'weekend-escapes',
      enabled: true,
      display_order: 3,
      status: 'draft',
      trips: {
        create: [
          { ...tripToListTrip(SEED_TRIPS[10], 0) }, // Coorg
          { ...tripToListTrip(SEED_TRIPS[6], 1) }, // Kerala
          { ...tripToListTrip(SEED_TRIPS[1], 2) }, // Meghalaya
        ],
      },
    },
  })

  console.log('Seed complete:', { leavingSoon: leavingSoon.id, fillingFast: fillingFast.id, grandPrix: grandPrix.id, weekendEscapes: weekendEscapes.id })
}

function tripToListTrip(trip: typeof SEED_TRIPS[0], position: number) {
  return {
    trip_id: trip.id,
    trip_name: trip.name,
    trip_image: trip.image,
    trip_tag: trip.tag,
    trip_duration: trip.duration,
    trip_price: trip.price,
    trip_sold_out: trip.sold_out,
    seats_left: trip.seats_left,
    next_batch: trip.next_batch,
    position,
  }
}

main().catch(console.error).finally(() => prisma.$disconnect())
