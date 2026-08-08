import { NextResponse } from 'next/server'
import { auth } from '@/lib/auth/auth'
import { prisma } from '@/lib/db/prisma'
import { canManageOperations, getUserRole } from '@/lib/auth/permissions'

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await auth()
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const role = getUserRole(session.user.role)
    const canManage = canManageOperations(role)

    const { id } = await params
    const body = await request.json()

    const updateData = canManage
      ? body
      : {
          isRead: !!body.isRead,
        }

    if (!canManage) {
      const keys = Object.keys(body || {})
      const onlyReadField = keys.length > 0 && keys.every((key) => key === 'isRead')
      if (!onlyReadField) {
        return NextResponse.json(
          { error: 'Only read status can be updated' },
          { status: 403 }
        )
      }
    }

    const alert = await prisma.alert.update({
      where: { id },
      data: updateData,
    })

    return NextResponse.json({ success: true, alert })
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message || 'Failed to update alert' },
      { status: 500 }
    )
  }
}

export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await auth()
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    if (!canManageOperations(getUserRole(session.user.role))) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }

    const { id } = await params
    await prisma.alert.delete({ where: { id } })

    return NextResponse.json({ success: true })
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message || 'Failed to delete alert' },
      { status: 500 }
    )
  }
}
