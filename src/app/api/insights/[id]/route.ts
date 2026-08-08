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
          status: body.status,
        }

    if (!canManage && !updateData.status) {
      return NextResponse.json(
        { error: 'You can only update insight status' },
        { status: 403 }
      )
    }

    const insight = await prisma.aiInsight.update({
      where: { id },
      data: updateData,
    })

    return NextResponse.json({ success: true, insight })
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message || 'Failed to update insight' },
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

    await prisma.aiInsight.delete({ where: { id } })

    return NextResponse.json({ success: true })
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message || 'Failed to delete insight' },
      { status: 500 }
    )
  }
}
