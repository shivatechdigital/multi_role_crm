import { NextResponse } from 'next/server'
import { prisma } from '@/lib/db/prisma'

const SYNC_SECRET = process.env.SYNC_SECRET || 'change-this-secret'
const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000'

export async function POST(request: Request) {
  try {
    const authHeader = request.headers.get('authorization')
    if (authHeader !== `Bearer ${SYNC_SECRET}`) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const startTime = Date.now()
    let status: any = { status: 'UNKNOWN', responseTime: 0, statusCode: 0 }

    try {
      const response = await fetch(SITE_URL, {
        method: 'HEAD',
        signal: AbortSignal.timeout(10000),
      })
      
      status = {
        status: response.ok ? 'UP' : 'DOWN',
        responseTime: Date.now() - startTime,
        statusCode: response.status,
        error: response.ok ? null : `HTTP ${response.status}`,
      }
    } catch (error: any) {
      status = {
        status: 'DOWN',
        responseTime: Date.now() - startTime,
        statusCode: 0,
        error: error.message || 'Connection failed',
      }
    }

    // Save check
    await prisma.uptimeCheck.create({
      data: {
        status: status.status,
        responseTime: status.responseTime,
        statusCode: status.statusCode,
        error: status.error,
      },
    })

    // Create alert if down
    if (status.status === 'DOWN') {
      await prisma.alert.create({
        data: {
          type: 'uptime',
          severity: 'critical',
          title: '🚨 Website is DOWN!',
          message: `${SITE_URL} is not responding. ${status.error}`,
          data: status,
        },
      })
    }

    return NextResponse.json({
      success: true,
      ...status,
      timestamp: new Date().toISOString(),
    })
  } catch (error: any) {
    console.error('Uptime Sync Error:', error)
    return NextResponse.json(
      { error: error.message || 'Check failed' },
      { status: 500 }
    )
  }
}

export async function GET() {
  return NextResponse.json({
    endpoint: 'Uptime Check',
    method: 'POST',
    auth: 'Bearer token required',
  })
}
