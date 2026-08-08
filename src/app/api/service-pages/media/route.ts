// src/app/api/service-pages/media/route.ts

import { NextRequest, NextResponse } from 'next/server'
import { mediaApi } from '@/lib/api/media'

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams
    const filters: any = {}
    
    searchParams.forEach((value, key) => {
      filters[key] = value
    })
    
    const data = await mediaApi.getAll(filters)
    return NextResponse.json(data)
  } catch (error: any) {
    return NextResponse.json(
      {
        success: false,
        message: error.response?.data?.message || 'Failed to fetch media',
      },
      { status: error.response?.status || 500 }
    )
  }
}
