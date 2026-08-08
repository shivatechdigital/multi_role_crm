import { NextResponse } from 'next/server'
import { auth } from '@/lib/auth/auth'
import { prisma } from '@/lib/db/prisma'

export async function GET(request: Request) {
  try {
    const token = new URL(request.url).searchParams.get('token')?.trim() || ''
    if (!token) {
      return NextResponse.json({ error: 'Invite token is required' }, { status: 400 })
    }

    const invite = await prisma.teamInvite.findUnique({
      where: { token },
      select: {
        email: true,
        role: true,
        status: true,
        expiresAt: true,
      },
    })

    if (!invite) {
      return NextResponse.json({ error: 'Invite not found' }, { status: 404 })
    }

    if (invite.status !== 'pending') {
      return NextResponse.json(
        { error: `Invite is ${invite.status}` },
        { status: 400 }
      )
    }

    if (invite.expiresAt < new Date()) {
      return NextResponse.json({ error: 'Invite has expired' }, { status: 400 })
    }

    return NextResponse.json({
      success: true,
      invite: {
        email: invite.email,
        role: invite.role,
        expiresAt: invite.expiresAt,
      },
    })
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message || 'Failed to validate invite' },
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

    const body = await request.json()
    const token = String(body?.token || '').trim()

    if (!token) {
      return NextResponse.json({ error: 'Invite token is required' }, { status: 400 })
    }

    const invite = await prisma.teamInvite.findUnique({
      where: { token },
      select: {
        id: true,
        email: true,
        role: true,
        status: true,
        expiresAt: true,
      },
    })

    if (!invite) {
      return NextResponse.json({ error: 'Invite not found' }, { status: 404 })
    }

    if (invite.status !== 'pending') {
      return NextResponse.json(
        { error: `Invite is ${invite.status}` },
        { status: 400 }
      )
    }

    if (invite.expiresAt < new Date()) {
      await prisma.teamInvite.update({
        where: { id: invite.id },
        data: { status: 'expired' },
      })

      return NextResponse.json({ error: 'Invite has expired' }, { status: 400 })
    }

    const currentEmail = (session.user.email || '').toLowerCase()
    if (!currentEmail || currentEmail !== invite.email.toLowerCase()) {
      return NextResponse.json(
        { error: 'Invite email does not match your signed-in account' },
        { status: 403 }
      )
    }

    await prisma.$transaction([
      prisma.user.update({
        where: { id: session.user.id },
        data: { role: invite.role },
      }),
      prisma.teamInvite.update({
        where: { id: invite.id },
        data: {
          status: 'accepted',
          acceptedAt: new Date(),
        },
      }),
    ])

    return NextResponse.json({
      success: true,
      role: invite.role,
      message: 'Invite accepted. Your workspace access has been updated.',
    })
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message || 'Failed to accept invite' },
      { status: 500 }
    )
  }
}