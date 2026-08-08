// src/app/api/service-pages/import/route.ts

import { NextRequest, NextResponse } from 'next/server'
import { servicePagesApi } from '@/lib/api/service-pages'

export async function POST(request: NextRequest) {
  try {
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
