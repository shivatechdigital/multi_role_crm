// src/app/api/seo-pages/stats/route.ts

import { NextResponse } from 'next/server'
import { seoPagesApi } from '@/lib/api/seo-pages'

export async function GET() {
  try {
    const data = await seoPagesApi.getStats()
    return NextResponse.json(data)
  } catch (error: any) {
    return NextResponse.json(
      { 
        success: false, 
        message: error.response?.data?.message || 'Failed to fetch stats',
      },
      { status: error.response?.status || 500 }
    )
  }
}
