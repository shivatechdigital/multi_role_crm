// src/app/api/service-pages/preview/route.ts

import { NextRequest, NextResponse } from 'next/server'
import { servicePagesApi } from '@/lib/api/service-pages'

export async function POST(request: NextRequest) {
  try {
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
