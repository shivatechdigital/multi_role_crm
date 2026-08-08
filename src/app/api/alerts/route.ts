import { NextResponse } from 'next/server'
import { auth } from '@/lib/auth/auth'
import { prisma } from '@/lib/db/prisma'
import { canManageOperations, getUserRole } from '@/lib/auth/permissions'

export async function GET(request: Request) {
  try {
    const session = await auth()
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const isRead = searchParams.get('isRead')

    const where: any = {}
    if (isRead !== null) where.isRead = isRead === 'true'

    const alerts = await prisma.alert.findMany({
      where,
      orderBy: { createdAt: 'desc' },
      take: 100,
    })

    const stats = {
      total: await prisma.alert.count(),
      unread: await prisma.alert.count({ where: { isRead: false } }),
      critical: await prisma.alert.count({ where: { severity: 'critical', isResolved: false } }),
    }

    return NextResponse.json({ success: true, stats, alerts })
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message || 'Failed to fetch alerts' },
      { status: 500 }
    )
  }
}

export async function POST(request: Request) {
  try {
    const session = await auth()
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    if (!canManageOperations(getUserRole(session.user.role))) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }

    const body = await request.json()
    const alert = await prisma.alert.create({ data: body })
    
    return NextResponse.json({ success: true, alert })
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message || 'Failed to create alert' },
      { status: 500 }
    )
  }
}
