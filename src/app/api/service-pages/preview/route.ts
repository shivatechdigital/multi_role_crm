// src/app/api/service-pages/preview/route.ts

import { NextRequest, NextResponse } from 'next/server'
import { servicePagesApi } from '@/lib/api/service-pages'
import { auth } from '@/lib/auth/auth'

export async function POST(request: NextRequest) {
  try {
    const session = await auth()
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()
    const data = await servicePagesApi.preview(body.layout_json, body.page_settings)
    return NextResponse.json(data)
  } catch (error: any) {
    return NextResponse.json(
      {
        success: false,
        message: error.response?.data?.message || 'Failed to generate preview',
      },
      { status: error.response?.status || 500 }
    )
  }
}
