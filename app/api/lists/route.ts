import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { revalidatePath } from 'next/cache'

export async function GET() {
  const lists = await prisma.curatedList.findMany({
    include: { trips: { orderBy: { position: 'asc' } } },
    orderBy: { display_order: 'asc' },
  })
  return NextResponse.json(lists)
}

export async function POST(req: NextRequest) {
  const body = await req.json()
  const list = await prisma.curatedList.create({
    data: {
      type: body.type || 'manual',
      title: body.title,
      slug: body.slug || body.title.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, ''),
      rule: body.rule,
      rule_parameter: body.rule_parameter,
      enabled: body.enabled ?? true,
      display_order: body.display_order ?? 99,
      status: body.status || 'draft',
    },
    include: { trips: true },
  })
  revalidatePath('/zo-trips')
  return NextResponse.json(list, { status: 201 })
}
