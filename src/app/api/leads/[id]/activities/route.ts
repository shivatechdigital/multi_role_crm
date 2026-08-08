import { NextResponse } from 'next/server'
import { auth } from '@/lib/auth/auth'
import { prisma } from '@/lib/db/prisma'

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

    const { id } = await params
    const body = await request.json()
    const { type, description, metadata } = body

    if (!type || !description) {
      return NextResponse.json(
        { error: 'Type and description required' },
        { status: 400 }
      )
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
