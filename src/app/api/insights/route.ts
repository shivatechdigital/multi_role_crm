import { NextResponse } from 'next/server'
import { auth } from '@/lib/auth/auth'
import { prisma } from '@/lib/db/prisma'

export async function GET(request: Request) {
  try {
    const session = await auth()
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const type = searchParams.get('type')
    const status = searchParams.get('status')
    const limit = parseInt(searchParams.get('limit') || '50')

    const where: any = {}
    if (type) where.type = type
    if (status) where.status = status

    const insights = await prisma.aiInsight.findMany({
      where,
      orderBy: { createdAt: 'desc' },
      take: limit,
    })

    const stats = {
      total: await prisma.aiInsight.count(),
      new: await prisma.aiInsight.count({ where: { status: 'new' } }),
      actioned: await prisma.aiInsight.count({ where: { status: 'actioned' } }),
    }

    return NextResponse.json({
      success: true,
      stats,
      insights,
    })
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message || 'Failed to fetch insights' },
      { status: 500 }
    )
  }
}
