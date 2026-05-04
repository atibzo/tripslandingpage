import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { revalidatePath } from 'next/cache'

export async function PUT(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const body = await req.json()
  const list = await prisma.curatedList.update({
    where: { id: parseInt(id) },
    data: {
      title: body.title,
      slug: body.slug,
      rule: body.rule,
      rule_parameter: body.rule_parameter,
      enabled: body.enabled,
      status: body.status,
      display_order: body.display_order,
      published_at: body.status === 'live' ? new Date() : undefined,
      last_reviewed_at: new Date(),
    },
    include: { trips: { orderBy: { position: 'asc' } } },
  })
  revalidatePath('/zo-trips')
  return NextResponse.json(list)
}

export async function DELETE(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  await prisma.curatedList.delete({ where: { id: parseInt(id) } })
  revalidatePath('/zo-trips')
  return NextResponse.json({ ok: true })
}
