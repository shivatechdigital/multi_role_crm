import { NextResponse } from 'next/server'
import { auth } from '@/lib/auth/auth'
import { prisma } from '@/lib/db/prisma'
import { canManageTeam, getUserRole } from '@/lib/auth/permissions'

export async function GET() {
  try {
    const session = await auth()
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    if (!canManageTeam(getUserRole(session.user.role))) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }

    const users = await prisma.user.findMany({
      orderBy: { createdAt: 'asc' },
      select: {
        id: true,
        name: true,
        email: true,
        image: true,
        role: true,
        createdAt: true,
        _count: {
          select: {
            leads: true,
            activities: true,
          },
        },
      },
    })

    return NextResponse.json({
      success: true,
      users,
      stats: {
        total: users.length,
        admins: users.filter((user) => user.role === 'ADMIN').length,
        managers: users.filter((user) => user.role === 'MANAGER').length,
        members: users.filter((user) => user.role === 'USER').length,
      },
    })
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message || 'Failed to fetch users' },
      { status: 500 }
    )
  }
}