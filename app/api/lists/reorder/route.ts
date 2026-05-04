import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { revalidatePath } from 'next/cache'

export async function PUT(req: NextRequest) {
  const { order } = await req.json() // array of { id, display_order }
  await Promise.all(
    order.map(({ id, display_order }: { id: number; display_order: number }) =>
      prisma.curatedList.update({ where: { id }, data: { display_order } })
    )
  )
  revalidatePath('/zo-trips')
  return NextResponse.json({ ok: true })
}
