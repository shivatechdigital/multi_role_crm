import { NextResponse } from 'next/server'
import { auth } from '@/lib/auth/auth'
import { prisma } from '@/lib/db/prisma'
import { canManageLeads, getUserRole } from '@/lib/auth/permissions'
import {
  isLeadActivitiesEmailConfigured,
  sendLeadActivitiesEmail,
} from '@/lib/notifications/lead-activities-email'

export async function POST(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await auth()
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const role = getUserRole(session.user.role)
    const { id } = await params

    const lead = await prisma.lead.findUnique({
      where: { id },
      include: {
        activities: {
          orderBy: { createdAt: 'desc' },
          include: {
            user: {
              select: { name: true },
            },
          },
        },
      },
    })

    if (!lead) {
      return NextResponse.json({ error: 'Lead not found' }, { status: 404 })
    }

    if (!canManageLeads(role) && lead.assignedTo !== session.user.id) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }

    if (!lead.email) {
      return NextResponse.json({ error: 'Lead email is missing' }, { status: 400 })
    }

    if (!lead.activities.length) {
      return NextResponse.json({ error: 'No activities available to send' }, { status: 400 })
    }

    if (!isLeadActivitiesEmailConfigured()) {
      return NextResponse.json({ error: 'SMTP configuration is incomplete' }, { status: 500 })
    }

    const appName = process.env.APP_NAME?.trim() || 'Multi-Role CRM'

    await sendLeadActivitiesEmail({
      to: lead.email,
      appName,
      leadName: lead.name,
      activities: lead.activities.map((activity) => ({
        type: activity.type,
        description: activity.description,
        createdAt: activity.createdAt,
        userName: activity.user?.name,
      })),
    })

    return NextResponse.json({ success: true, message: 'Activity email sent successfully' })
  } catch (error: any) {
    console.error('Lead activity email error:', error)
    return NextResponse.json(
      { error: error.message || 'Failed to send activity email' },
      { status: 500 }
    )
  }
}
