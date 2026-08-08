// src/app/api/seo-pages/route.ts

import { NextResponse } from 'next/server'
import { seoPagesApi } from '@/lib/api/seo-pages'

export async function GET() {
  try {
    const data = await seoPagesApi.getAllPages()
    return NextResponse.json(data)
  } catch (error: any) {
    console.error('Failed to fetch pages:', error)
    return NextResponse.json(
      { 
        success: false, 
        message: error.response?.data?.message || 'Failed to fetch pages',
      },
      { status: error.response?.status || 500 }
    )
  }
}
