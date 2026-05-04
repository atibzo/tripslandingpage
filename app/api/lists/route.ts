import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { revalidatePath } from 'next/cache'

export async function GET() {
  try {
    const lists = await prisma.curatedList.findMany({
      include: { trips: { orderBy: { position: 'asc' } } },
      orderBy: { display_order: 'asc' },
    })
    return NextResponse.json(lists)
  } catch (err) {
    console.error('GET /api/lists error:', err)
    return NextResponse.json({ error: 'Failed to fetch lists' }, { status: 500 })
  }
}

export async function POST(req: NextRequest) {
  const body = await req.json()
  const list = await prisma.curatedList.create({
    data: {
      type: body.type || 'manual',
      title: body.title,
      subtitle: body.subtitle ?? null,
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
