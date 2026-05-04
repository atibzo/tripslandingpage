import type { FeaturedTrip } from '@/lib/pageStore'

export default function FeaturedTripCard({ trip }: { trip: FeaturedTrip }) {
  const price = trip.trip_price.toLocaleString('en-IN')

  return (
    <div className="relative rounded-[24px] overflow-hidden cursor-pointer group flex-shrink-0 snap-start w-[80vw] lg:w-[288px] aspect-[3/4]">
      {/* Layer 1: full-bleed background image */}
      <img
        src={trip.trip_image}
        alt={trip.trip_name}
        className="absolute inset-0 w-full h-full object-cover rounded-[24px] transition-transform duration-500 group-hover:scale-105"
      />

      {/* Layer 2: gradient overlay */}
      <div
        className="absolute inset-0 rounded-[24px]"
        style={{
          background:
            'linear-gradient(180deg, rgba(17,17,17,0.51) 0%, rgba(17,17,17,0.408) 25.586%, rgba(17,17,17,0) 49.519%, rgba(17,17,17,0.408) 75.962%, rgba(17,17,17,0.51) 100%)',
        }}
      />

      {/* Layer 3: category chip — top left, spans card width */}
      <div
        className="absolute top-0 left-0 bg-[#202020] rounded-br-[24px] px-3 py-2 flex items-center gap-1 h-[48px] max-w-full"
        style={{ width: '288px' }}
      >
        <img
          src={trip.trip_image}
          alt=""
          className="w-9 h-9 flex-shrink-0 object-cover rounded"
        />
        <span
          className="text-white truncate"
          style={{
            fontFamily: 'Rubik, sans-serif',
            fontWeight: 500,
            fontSize: '14px',
            lineHeight: '21px',
            letterSpacing: '0.14px',
          }}
        >
          {trip.trip_tag ?? 'Travel'}
        </span>
      </div>

      {/* Layer 4: content at bottom center */}
      <div className="absolute bottom-0 left-[8.33%] right-[8.33%] pb-4 flex flex-col gap-1 items-center text-center text-white">
        <span
          className="line-clamp-2"
          style={{
            fontFamily: 'Kalam, cursive',
            fontWeight: 700,
            fontSize: '24px',
            lineHeight: 1.4,
          }}
        >
          {trip.trip_name}
        </span>
        {trip.next_batch && (
          <div
            className="flex gap-3 items-center justify-center"
            style={{
              fontFamily: 'Rubik, sans-serif',
              fontWeight: 400,
              fontSize: '14px',
              lineHeight: '21px',
              letterSpacing: '0.14px',
            }}
          >
            <span>{trip.next_batch}</span>
          </div>
        )}
        <span
          style={{
            fontFamily: 'Rubik, sans-serif',
            fontWeight: 400,
            fontSize: '14px',
            lineHeight: '21px',
          }}
        >
          From ₹{price}/person
        </span>
      </div>
    </div>
  )
}
