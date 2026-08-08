// src/app/api/distribution/platforms/route.ts

import { NextResponse } from 'next/server'
import { auth } from '@/lib/auth/auth'
import { prisma } from '@/lib/db/prisma'

export async function GET() {
  try {
    const session = await auth()
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const platforms = await prisma.platformConfig.findMany({
      orderBy: { platform: 'asc' },
    })

    return NextResponse.json({
      success: true,
      platforms,
    })
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message },
      { status: 500 }
    )
  }
}

export async function PATCH(request: Request) {
  try {
    const session = await auth()
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()
    const { platform, isEnabled, postDelay } = body

    if (!platform) {
      return NextResponse.json(
        { error: 'platform is required' },
        { status: 400 }
      )
    }

    const updated = await prisma.platformConfig.update({
      where: { platform },
      data: {
        isEnabled: isEnabled !== undefined ? isEnabled : undefined,
        postDelay: postDelay !== undefined ? postDelay : undefined,
      },
    })

    return NextResponse.json({
      success: true,
      platform: updated,
    })
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message },
      { status: 500 }
    )
  }
}
