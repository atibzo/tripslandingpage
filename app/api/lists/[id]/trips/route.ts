import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { revalidatePath } from 'next/cache'

export async function POST(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const body = await req.json()
  const listId = parseInt(id)
  const maxPos = await prisma.curatedListTrip.aggregate({ where: { list_id: listId }, _max: { position: true } })
  const trip = await prisma.curatedListTrip.create({
    data: {
      list_id: listId,
      trip_id: body.trip_id,
      trip_name: body.trip_name,
      trip_image: body.trip_image,
      trip_tag: body.trip_tag,
      trip_duration: body.trip_duration,
      trip_price: body.trip_price,
      trip_sold_out: body.trip_sold_out ?? false,
      seats_left: body.seats_left,
      next_batch: body.next_batch,
      position: (maxPos._max.position ?? -1) + 1,
    },
  })
  revalidatePath('/zo-trips')
  return NextResponse.json(trip, { status: 201 })
}
