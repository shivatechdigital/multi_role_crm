import { NextResponse } from 'next/server'
import { auth } from '@/lib/auth/auth'
import { prisma } from '@/lib/db/prisma'
import { canManageLeads, getUserRole } from '@/lib/auth/permissions'

async function getAuthorizedLead(id: string, userId: string, role: string) {
  const lead = await prisma.lead.findUnique({
    where: { id },
    include: {
      user: {
        select: { id: true, name: true, email: true, image: true },
      },
      activities: {
        orderBy: { createdAt: 'desc' },
        include: {
          user: {
            select: { id: true, name: true, image: true },
          },
        },
      },
    },
  })

  if (!lead) {
    return { error: NextResponse.json({ error: 'Lead not found' }, { status: 404 }) }
  }

  if (!canManageLeads(role) && lead.assignedTo !== userId) {
    return { error: NextResponse.json({ error: 'Forbidden' }, { status: 403 }) }
  }

  return { lead }
}

// GET - Get single lead with activities
export async function GET(
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

    const { lead, error } = await getAuthorizedLead(id, session.user.id, role)
    if (error) return error

    return NextResponse.json({ success: true, lead })
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message || 'Failed to fetch lead' },
      { status: 500 }
    )
  }
}

// PATCH - Update lead
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

    const { id } = await params
    const body = await request.json()

    const { error } = await getAuthorizedLead(id, session.user.id, role)
    if (error) return error

    const isManager = canManageLeads(role)

    // Users can update only status and cannot reassign or overwrite ownership-related fields.
    const updateData = isManager
      ? body
      : {
          status: body.status,
        }

    if (!isManager && !updateData.status) {
      return NextResponse.json(
        { error: 'You can only update lead status' },
        { status: 403 }
      )
    }

    const lead = await prisma.lead.update({
      where: { id },
      data: updateData,
    })

    // Log activity if status changed
    if (updateData.status) {
      await prisma.leadActivity.create({
        data: {
          leadId: id,
          userId: session.user.id,
          type: 'status_change',
          description: `Status changed to ${updateData.status}`,
          metadata: { newStatus: updateData.status },
        },
      })
    }

    return NextResponse.json({ success: true, lead })
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message || 'Failed to update lead' },
      { status: 500 }
    )
  }
}

// DELETE - Delete lead
export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await auth()
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const role = getUserRole(session.user.role)
    if (!canManageLeads(role)) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }

    const { id } = await params

    const exists = await prisma.lead.findUnique({ where: { id }, select: { id: true } })
    if (!exists) {
      return NextResponse.json({ error: 'Lead not found' }, { status: 404 })
    }

    await prisma.lead.delete({ where: { id } })

    return NextResponse.json({ success: true })
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message || 'Failed to delete lead' },
      { status: 500 }
    )
  }
}
