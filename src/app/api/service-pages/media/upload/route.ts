// src/app/api/service-pages/media/upload/route.ts

import { NextRequest, NextResponse } from 'next/server'
import { mediaApi } from '@/lib/api/media'

export const runtime = 'nodejs'
export const maxDuration = 60

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData()
    const file = formData.get('file') as File
    
    if (!file) {
      return NextResponse.json(
        { success: false, message: 'No file provided' },
        { status: 400 }
      )
    }

    const options = {
      folder: formData.get('folder') as string || undefined,
      alt_text: formData.get('alt_text') as string || undefined,
      caption: formData.get('caption') as string || undefined,
      uploaded_by: formData.get('uploaded_by') as string || 'crm',
    }

    const data = await mediaApi.upload(file, options)
    return NextResponse.json(data, { status: 201 })
  } catch (error: any) {
    console.error('Upload failed:', error)
    return NextResponse.json(
      {
        success: false,
        message: error.response?.data?.message || error.message || 'Upload failed',
      },
      { status: error.response?.status || 500 }
    )
  }
}
