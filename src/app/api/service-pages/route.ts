// src/app/api/service-pages/route.ts

import { NextRequest, NextResponse } from 'next/server'
import { servicePagesApi } from '@/lib/api/service-pages'

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams
    const filters: any = {}
    
    // Parse query params
    searchParams.forEach((value, key) => {
      filters[key] = value
    })
    
    const data = await servicePagesApi.getAll(filters)
    return NextResponse.json(data)
  } catch (error: any) {
    console.error('Failed to fetch service pages:', error)
    return NextResponse.json(
      {
        success: false,
        message: error.response?.data?.message || 'Failed to fetch pages',
      },
      { status: error.response?.status || 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const data = await servicePagesApi.create(body)
    return NextResponse.json(data, { status: 201 })
  } catch (error: any) {
    console.error('Failed to create service page:', error)
    return NextResponse.json(
      {
        success: false,
        message: error.response?.data?.message || 'Failed to create page',
        errors: error.response?.data?.errors,
      },
      { status: error.response?.status || 500 }
    )
  }
}
