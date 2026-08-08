// src/app/api/service-pages/[slug]/duplicate/route.ts

import { NextRequest, NextResponse } from 'next/server'
import { servicePagesApi } from '@/lib/api/service-pages'
import { auth } from '@/lib/auth/auth'
import { canManageOperations, getUserRole } from '@/lib/auth/permissions'

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ slug: string }> }
) {
  try {
    const session = await auth()
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    if (!canManageOperations(getUserRole(session.user.role))) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }

    const { slug } = await params
    const data = await servicePagesApi.duplicate(slug)
    return NextResponse.json(data)
  } catch (error: any) {
    return NextResponse.json(
      {
        success: false,
        message: error.response?.data?.message || 'Failed to duplicate page',
      },
      { status: error.response?.status || 500 }
    )
  }
}
