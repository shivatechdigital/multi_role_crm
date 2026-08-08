import { NextResponse } from 'next/server'
import { auth } from '@/lib/auth/auth'
import { prisma } from '@/lib/db/prisma'
import { canManageInvites, getUserRole } from '@/lib/auth/permissions'

export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await auth()
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    if (!canManageInvites(getUserRole(session.user.role))) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }

    const { id } = await params
    const mode = new URL(request.url).searchParams.get('mode')

    const invite = await prisma.teamInvite.findUnique({
      where: { id },
      select: { id: true, status: true },
    })

    if (!invite) {
      return NextResponse.json({ error: 'Invite not found' }, { status: 404 })
    }

    if (mode === 'delete') {
      await prisma.teamInvite.delete({
        where: { id },
      })

      return NextResponse.json({ success: true, deleted: true })
    }

    if (invite.status !== 'pending') {
      return NextResponse.json(
        { error: 'Only pending invites can be revoked' },
        { status: 400 }
      )
    }

    const revoked = await prisma.teamInvite.update({
      where: { id },
      data: { status: 'revoked' },
    })

    return NextResponse.json({ success: true, invite: revoked })
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message || 'Failed to revoke invite' },
      { status: 500 }
    )
  }
}