export type CuratedListTrip = {
  id: number
  list_id: number
  trip_id: string
  trip_name: string
  trip_image: string
  trip_tag: string | null
  trip_duration: string
  trip_price: number
  trip_sold_out: boolean
  seats_left: number | null
  next_batch: string | null
  position: number
}

export type CuratedList = {
  id: number
  type: string
  title: string
  subtitle: string | null
  slug: string
  rule: string | null
  rule_parameter: string | null
  enabled: boolean
  display_order: number
  status: string
  published_at: Date | null
  last_reviewed_at: Date | null
  created_at: Date
  updated_at: Date
}
