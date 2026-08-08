import { NextResponse } from 'next/server'
import { randomUUID } from 'crypto'
import { auth } from '@/lib/auth/auth'
import { prisma } from '@/lib/db/prisma'
import {
  isInviteEmailConfigured,
  sendTeamInviteEmail,
} from '@/lib/notifications/team-invite-email'
import {
  canManageInvites,
  getUserRole,
  isAppRole,
} from '@/lib/auth/permissions'

export async function GET(request: Request) {
  try {
    const session = await auth()
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    if (!canManageInvites(getUserRole(session.user.role))) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }

    const invites = await prisma.teamInvite.findMany({
      orderBy: { createdAt: 'desc' },
      take: 100,
      include: {
        createdByUser: {
          select: { id: true, name: true, email: true },
        },
      },
    })

    return NextResponse.json({ success: true, invites })
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message || 'Failed to fetch invites' },
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

    if (!canManageInvites(getUserRole(session.user.role))) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }

    const body = await request.json()
    const email = String(body?.email || '').trim().toLowerCase()
    const role = String(body?.role || 'USER').trim().toUpperCase()
    const expiresInDays = Number(body?.expiresInDays || 7)

    if (!email || !email.includes('@')) {
      return NextResponse.json({ error: 'Valid email is required' }, { status: 400 })
    }

    if (!isAppRole(role)) {
      return NextResponse.json({ error: 'Invalid role' }, { status: 400 })
    }

    if (!Number.isFinite(expiresInDays) || expiresInDays < 1 || expiresInDays > 30) {
      return NextResponse.json(
        { error: 'expiresInDays must be between 1 and 30' },
        { status: 400 }
      )
    }

    await prisma.teamInvite.updateMany({
      where: {
        email,
        status: 'pending',
      },
      data: {
        status: 'revoked',
      },
    })

    const expiresAt = new Date()
    expiresAt.setDate(expiresAt.getDate() + expiresInDays)

    const token = randomUUID().replace(/-/g, '')
    const invite = await prisma.teamInvite.create({
      data: {
        email,
        role,
        token,
        status: 'pending',
        expiresAt,
        createdBy: session.user.id,
      },
      include: {
        createdByUser: {
          select: { id: true, name: true, email: true },
        },
      },
    })

    const origin = new URL(request.url).origin
    const inviteUrl = `${origin}/invite?token=${token}`
    let emailSent = false
    let emailError: string | null = null

    if (isInviteEmailConfigured()) {
      try {
        await sendTeamInviteEmail({
          to: invite.email,
          inviteUrl,
          role: invite.role,
          inviterName: session.user.name,
          inviterEmail: session.user.email,
          expiresAt: invite.expiresAt,
        })
        emailSent = true
      } catch (error: any) {
        emailError = error?.message || 'Failed to send invite email'
      }
    } else {
      emailError = 'SMTP is not configured; invite link created but email not sent'
    }

    return NextResponse.json({
      success: true,
      invite,
      inviteUrl,
      emailSent,
      emailError,
    })
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message || 'Failed to create invite' },
      { status: 500 }
    )
  }
}