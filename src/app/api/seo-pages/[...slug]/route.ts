// src/app/api/seo-pages/[...slug]/route.ts

import { NextRequest, NextResponse } from 'next/server'
import { seoPagesApi } from '@/lib/api/seo-pages'

interface RouteContext {
  params: Promise<{ slug: string[] }>
}

export async function GET(req: NextRequest, context: RouteContext) {
  try {
    const { slug } = await context.params
    const fullSlug = slug.join('/')
    
    const data = await seoPagesApi.getPage(fullSlug)
    return NextResponse.json(data)
  } catch (error: any) {
    return NextResponse.json(
      { 
        success: false, 
        message: error.response?.data?.message || 'Failed to fetch page',
      },
      { status: error.response?.status || 500 }
    )
  }
}

export async function PUT(req: NextRequest, context: RouteContext) {
  try {
    const { slug } = await context.params
    const fullSlug = slug.join('/')
    const body = await req.json()
    
    const data = await seoPagesApi.updatePage(fullSlug, body)
    return NextResponse.json(data)
  } catch (error: any) {
    return NextResponse.json(
      { 
        success: false, 
        message: error.response?.data?.message || 'Failed to update page',
        errors: error.response?.data?.errors,
      },
      { status: error.response?.status || 500 }
    )
  }
}
