import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { revalidatePath } from 'next/cache'

export async function DELETE(_req: NextRequest, { params }: { params: Promise<{ id: string; tripId: string }> }) {
  const { id, tripId } = await params
  await prisma.curatedListTrip.deleteMany({
    where: { list_id: parseInt(id), trip_id: tripId },
  })
  revalidatePath('/zo-trips')
  return NextResponse.json({ ok: true })
}
