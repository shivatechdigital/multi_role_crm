// src/app/api/service-pages/[slug]/route.ts

import { NextRequest, NextResponse } from 'next/server'
import { servicePagesApi } from '@/lib/api/service-pages'
import { auth } from '@/lib/auth/auth'
import { canManageOperations, getUserRole } from '@/lib/auth/permissions'

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ slug: string }> }
) {
  try {
    const session = await auth()
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { slug } = await params
    const data = await servicePagesApi.get(slug)
    return NextResponse.json(data)
  } catch (error: any) {
    console.error('Failed to fetch page:', error)
    return NextResponse.json(
      {
        success: false,
        message: error.response?.data?.message || 'Failed to fetch page',
      },
      { status: error.response?.status || 500 }
    )
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ slug: string }> }
) {
  try {
    const session = await auth()
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    if (!canManageOperations(getUserRole(session.user.role))) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }

    const { slug } = await params
    const body = await request.json()
    const data = await servicePagesApi.update(slug, body)
    return NextResponse.json(data)
  } catch (error: any) {
    console.error('Failed to update page:', error)
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

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ slug: string }> }
) {
  try {
    const session = await auth()
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    if (!canManageOperations(getUserRole(session.user.role))) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }

    const { slug } = await params
    const data = await servicePagesApi.delete(slug)
    return NextResponse.json(data)
  } catch (error: any) {
    console.error('Failed to delete page:', error)
    return NextResponse.json(
      {
        success: false,
        message: error.response?.data?.message || 'Failed to delete page',
      },
      { status: error.response?.status || 500 }
    )
  }
}
