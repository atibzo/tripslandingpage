import { NextResponse } from 'next/server'

const SEED_TRIPS = [
  { id: 'trip-bhutan', name: 'Bhutan: Land of the Thunder Dragon', image: 'https://images.unsplash.com/photo-1580289180078-b28571d9c2b9?w=800&q=80', tag: 'International', duration: '7N/8D', price: 42000, sold_out: false, seats_left: 3, next_batch: 'Jun 14, 2026' },
  { id: 'trip-meghalaya', name: 'Meghalaya: Abode of Clouds', image: 'https://images.unsplash.com/photo-1601980031404-0f8ce4f1c421?w=800&q=80', tag: 'Northeast', duration: '5N/6D', price: 18500, sold_out: false, seats_left: 8, next_batch: 'May 28, 2026' },
  { id: 'trip-kashmir', name: 'Kashmir: Paradise on Earth', image: 'https://images.unsplash.com/photo-1620555696516-7a5ccfaad1d6?w=800&q=80', tag: 'Himalayan', duration: '6N/7D', price: 22000, sold_out: false, seats_left: 12, next_batch: 'Jun 5, 2026' },
  { id: 'trip-ladakh', name: 'Ladakh: The Land of High Passes', image: 'https://images.unsplash.com/photo-1589308078059-be1415eab4c3?w=800&q=80', tag: 'Himalayan', duration: '8N/9D', price: 31000, sold_out: false, seats_left: 5, next_batch: 'Jun 20, 2026' },
  { id: 'trip-spiti', name: 'Spiti Valley: Cold Desert Adventure', image: 'https://images.unsplash.com/photo-1626016064396-4db82f6ea576?w=800&q=80', tag: 'Adventure', duration: '7N/8D', price: 26000, sold_out: false, seats_left: 4, next_batch: 'Jul 3, 2026' },
  { id: 'trip-andaman', name: 'Andaman: Emerald Islands', image: 'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?w=800&q=80', tag: 'Beaches', duration: '5N/6D', price: 28000, sold_out: true, seats_left: 0, next_batch: 'Jun 10, 2026' },
  { id: 'trip-kerala', name: "Kerala: God's Own Country", image: 'https://images.unsplash.com/photo-1602216056096-3b40cc0c9944?w=800&q=80', tag: 'Nature', duration: '5N/6D', price: 19500, sold_out: false, seats_left: 15, next_batch: 'May 30, 2026' },
  { id: 'trip-bali', name: 'Bali: Island of Gods', image: 'https://images.unsplash.com/photo-1537996194471-e657df975ab4?w=800&q=80', tag: 'International', duration: '6N/7D', price: 52000, sold_out: false, seats_left: 6, next_batch: 'Jun 28, 2026' },
  { id: 'trip-japan', name: 'Japan: Cherry Blossoms & Beyond', image: 'https://images.unsplash.com/photo-1528360983277-13d401cdc186?w=800&q=80', tag: 'International', duration: '9N/10D', price: 89000, sold_out: false, seats_left: 2, next_batch: 'Jul 12, 2026' },
  { id: 'trip-singapore-gp', name: 'Singapore Grand Prix 2026', image: 'https://images.unsplash.com/photo-1541625602330-2277a4c46182?w=800&q=80', tag: 'Grand Prix', duration: '4N/5D', price: 125000, sold_out: false, seats_left: 8, next_batch: 'Sep 18, 2026' },
  { id: 'trip-coorg', name: 'Coorg: Scotland of India', image: 'https://images.unsplash.com/photo-1591017403286-fd8493524e1e?w=800&q=80', tag: 'Weekend', duration: '2N/3D', price: 8500, sold_out: false, seats_left: 20, next_batch: 'May 24, 2026' },
  { id: 'trip-arunachal', name: 'Arunachal Pradesh: The Rising Sun State', image: 'https://images.unsplash.com/photo-1573407683064-e77e5c93fbd5?w=800&q=80', tag: 'Northeast', duration: '8N/9D', price: 34000, sold_out: false, seats_left: 7, next_batch: 'Jun 8, 2026' },
]

export async function GET() {
  return NextResponse.json(SEED_TRIPS)
}
