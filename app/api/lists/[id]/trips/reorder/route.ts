import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { revalidatePath } from 'next/cache'

export async function PUT(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  const { id } = await params
  const { order } = await req.json() // [{ trip_id: string, position: number }]
  await Promise.all(
    order.map(({ trip_id, position }: { trip_id: string; position: number }) =>
      prisma.curatedListTrip.updateMany({
        where: { list_id: parseInt(id), trip_id },
        data: { position },
      }),
    ),
  )
  revalidatePath('/zo-trips')
  return NextResponse.json({ ok: true })
}
