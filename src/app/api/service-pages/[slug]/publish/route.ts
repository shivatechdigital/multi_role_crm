// src/app/api/service-pages/[slug]/publish/route.ts

import { NextRequest, NextResponse } from 'next/server'
import { servicePagesApi } from '@/lib/api/service-pages'

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ slug: string }> }
) {
  try {
    const { slug } = await params
    const body = await request.json().catch(() => ({}))
    const action = body.action || 'publish'
    
    const data = await servicePagesApi.publish(slug, action)
    return NextResponse.json(data)
  } catch (error: any) {
    return NextResponse.json(
      {
        success: false,
        message: error.response?.data?.message || 'Failed to change status',
      },
      { status: error.response?.status || 500 }
    )
  }
}
