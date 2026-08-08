import { NextResponse } from 'next/server'
import { auth } from '@/lib/auth/auth'
import { prisma } from '@/lib/db/prisma'
import { canManageLeads, getUserRole } from '@/lib/auth/permissions'

// POST - Add activity to lead
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
    const body = await request.json()
    const { type, description, metadata } = body

    if (!type || !description) {
      return NextResponse.json(
        { error: 'Type and description required' },
        { status: 400 }
      )
    }

    const lead = await prisma.lead.findUnique({
      where: { id },
      select: { id: true, assignedTo: true },
    })

    if (!lead) {
      return NextResponse.json({ error: 'Lead not found' }, { status: 404 })
    }

    if (!canManageLeads(role) && lead.assignedTo !== session.user.id) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }

    const activity = await prisma.leadActivity.create({
      data: {
        leadId: id,
        userId: session.user.id,
        type,
        description,
        metadata,
      },
      include: {
        user: {
          select: { id: true, name: true, image: true },
        },
      },
    })

    return NextResponse.json({ success: true, activity })
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message || 'Failed to add activity' },
      { status: 500 }
    )
  }
}
