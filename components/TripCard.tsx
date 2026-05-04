import type { CuratedListTrip } from '@prisma/client'

export function getUrgencyLabel(trip: CuratedListTrip): { label: string; color: string } | null {
  if (trip.seats_left !== null && trip.seats_left > 0 && trip.seats_left <= 5) {
    return { label: `ONLY ${trip.seats_left} SPOTS LEFT`, color: 'text-amber-500' }
  }
  return null
}

export default function TripCard({ trip, index }: { trip: CuratedListTrip; index: number }) {
  const urgency = getUrgencyLabel(trip)
  const batches: unknown[] = []
  const nights = parseInt(trip.trip_duration)
  const price = trip.trip_price.toLocaleString('en-IN')

  return (
    <div className="animate-fade-in-up cursor-pointer flex flex-col items-center" style={{ animationDelay: `${index * 10}ms` }}>
      <a className="flex w-full flex-col gap-3 cursor-pointer" href={`/zo-trip/${trip.trip_id}`}>
        <div className="relative w-full group rounded-2xl overflow-hidden">
          <div className="w-full aspect-[49/54]"></div>
          <div className="absolute inset-0 pointer-events-none">
            <div style={{ position: 'absolute', inset: 0 }}>
              <div className="w-full h-full object-cover rounded-2xl" style={{ overflow: 'hidden', display: 'block', position: 'relative', borderRadius: '16px' }}>
                <img alt={trip.trip_name} loading="eager" src={trip.trip_image} style={{ visibility: 'visible', display: 'block', width: '100%', height: '100%', objectFit: 'cover' }} />
              </div>
            </div>
          </div>
          {trip.trip_tag && (
            <div className="absolute top-3 left-3 bg-light-background-primary dark:bg-dark-background-primary rounded-full px-3 py-1 z-10">
              <span className="font-caption capitalize text-light-text-primary dark:text-dark-text-primary text-xs">{trip.trip_tag}</span>
            </div>
          )}
          <div className="absolute bottom-3 left-3 z-10 bg-black/50 backdrop-blur-sm rounded-full px-3 py-1 group-hover:hidden">
            <span className="font-caption text-white text-xs">{nights} Nights</span>
          </div>
          <div className="absolute bottom-0 inset-x-0 z-10 bg-gradient-to-t p-4 pt-8 from-dark-background-primary/70 dark:from-dark-background-secondary/70 via-dark-background-primary/70 dark:via-dark-background-secondary/70 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex flex-col justify-end rounded-b-lg">
            <h3 className="font-sectiontitle text-dark-text-primary/70 dark:text-dark-text-primary/70 mb-3 line-clamp-2">Select a day</h3>
            <div className="flex gap-2 flex-wrap">
              {batches.map((_, i) => (
                <button key={i} className="flex items-center justify-center font-caption text-xs transition-all duration-200 bg-dark-background-primary dark:bg-light-background-primary text-dark-text-primary dark:text-light-text-primary hover:bg-light-background-primary dark:hover:bg-dark-background-primary hover:text-light-text-primary dark:hover:text-dark-text-primary h-8 w-8 rounded-full" aria-label={`Select day ${i + 1}`}>{i + 1}</button>
              ))}
              <button className="cursor-pointer py-2 px-3 h-8 flex items-center gap-1 transition-colors duration-200 bg-dark-background-primary dark:bg-light-background-primary text-dark-text-primary dark:text-light-text-primary rounded-full" aria-label="See All">
                <span className="font-caption text-dark-text-primary dark:text-light-text-primary">See All</span>
                <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" className="text-dark-icon-primary fill-current dark:text-light-icon-primary w-4 h-4"><path fill="currentColor" fillRule="evenodd" d="M7.58579 19.4142C6.80474 18.6332 6.80474 17.3668 7.58579 16.5858L12.1716 12L7.58579 7.41421C6.80474 6.63317 6.80474 5.36683 7.58579 4.58579C8.36683 3.80474 9.63316 3.80474 10.4142 4.58579L16.4142 10.5858C17.1953 11.3668 17.1953 12.6332 16.4142 13.4142L10.4142 19.4142C9.63316 20.1953 8.36683 20.1953 7.58579 19.4142Z" clipRule="evenodd"></path></svg>
              </button>
            </div>
          </div>
        </div>
        <div className="flex flex-col items-start w-full">
          <span className="font-body">{trip.trip_name}</span>
          <span className="font-caption text-light-text-secondary dark:text-dark-text-secondary mt-1">{trip.next_batch}</span>
          <div className="h-4 mt-1">
            {urgency && (
              <span className={`font-caption font-bold uppercase tracking-wide ${urgency.color}`}>
                {urgency.label}
              </span>
            )}
          </div>
          <span className="font-body font-semibold text-light-text-primary dark:text-dark-text-primary mt-1">
            ₹{price}
          </span>
        </div>
      </a>
    </div>
  )
}
