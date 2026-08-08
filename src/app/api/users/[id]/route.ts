import { NextResponse } from 'next/server'
import { auth } from '@/lib/auth/auth'
import { prisma } from '@/lib/db/prisma'
import { canManageRoles, getUserRole, isAppRole } from '@/lib/auth/permissions'

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await auth()
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    if (!canManageRoles(getUserRole(session.user.role))) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }

    const { id } = await params
    const body = await request.json()
    const nextRole = body?.role

    if (!isAppRole(nextRole)) {
      return NextResponse.json({ error: 'Invalid role' }, { status: 400 })
    }

    if (id === session.user.id) {
      return NextResponse.json(
        { error: 'You cannot change your own role' },
        { status: 400 }
      )
    }

    const existingUser = await prisma.user.findUnique({
      where: { id },
      select: { id: true, role: true, name: true, email: true, image: true, createdAt: true },
    })

    if (!existingUser) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 })
    }

    if (existingUser.role === 'ADMIN' && nextRole !== 'ADMIN') {
      const adminCount = await prisma.user.count({ where: { role: 'ADMIN' } })
      if (adminCount <= 1) {
        return NextResponse.json(
          { error: 'At least one admin must remain assigned' },
          { status: 400 }
        )
      }
    }

    const user = await prisma.user.update({
      where: { id },
      data: { role: nextRole },
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

    return NextResponse.json({ success: true, user })
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message || 'Failed to update role' },
      { status: 500 }
    )
  }
}