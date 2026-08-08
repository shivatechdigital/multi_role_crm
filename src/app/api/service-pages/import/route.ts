// src/app/api/service-pages/import/route.ts

import { NextRequest, NextResponse } from 'next/server'
import { servicePagesApi } from '@/lib/api/service-pages'
import { auth } from '@/lib/auth/auth'
import { canManageOperations, getUserRole } from '@/lib/auth/permissions'

export async function POST(request: NextRequest) {
  try {
    const session = await auth()
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    if (!canManageOperations(getUserRole(session.user.role))) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }

    const body = await request.json()
    const data = await servicePagesApi.importHtml(body)
    return NextResponse.json(data, { status: 201 })
  } catch (error: any) {
    return NextResponse.json(
      {
        success: false,
        message: error.response?.data?.message || 'Failed to import HTML',
      },
      { status: error.response?.status || 500 }
    )
  }
}
