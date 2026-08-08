// src/app/api/service-pages/[slug]/duplicate/route.ts

import { NextRequest, NextResponse } from 'next/server'
import { servicePagesApi } from '@/lib/api/service-pages'

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ slug: string }> }
) {
  try {
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
