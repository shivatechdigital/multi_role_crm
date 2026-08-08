import { NextResponse } from 'next/server'
import { auth } from '@/lib/auth/auth'
import { prisma } from '@/lib/db/prisma'

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000'

export async function GET(request: Request) {
  try {
    const session = await auth()
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Perform live uptime check
    const startTime = Date.now()
    let currentStatus: any = { status: 'UNKNOWN', responseTime: 0, statusCode: 0 }

    try {
      const response = await fetch(SITE_URL, {
        method: 'HEAD',
        signal: AbortSignal.timeout(10000),
      })
      
      const responseTime = Date.now() - startTime
      
      currentStatus = {
        status: response.ok ? 'UP' : 'DOWN',
        responseTime,
        statusCode: response.status,
        error: response.ok ? null : `HTTP ${response.status}`,
      }
    } catch (error: any) {
      currentStatus = {
        status: 'DOWN',
        responseTime: Date.now() - startTime,
        statusCode: 0,
        error: error.message || 'Connection failed',
      }
    }

    // Save current check to database
    try {
      await prisma.uptimeCheck.create({
        data: {
          status: currentStatus.status,
          responseTime: currentStatus.responseTime,
          statusCode: currentStatus.statusCode,
          error: currentStatus.error,
        },
      })
    } catch (dbError) {
      console.error('DB save error:', dbError)
    }

    // Get historical data (last 24 hours)
    const yesterday = new Date()
    yesterday.setHours(yesterday.getHours() - 24)

    const checks = await prisma.uptimeCheck.findMany({
      where: { timestamp: { gte: yesterday } },
      orderBy: { timestamp: 'desc' },
      take: 100,
    })

    // Calculate uptime percentage
    const totalChecks = checks.length || 1
    const upChecks = checks.filter(c => c.status === 'UP').length
    const uptimePercent = (upChecks / totalChecks) * 100

    // Calculate average response time
    const avgResponseTime = checks.length > 0
      ? checks.reduce((sum, c) => sum + (c.responseTime || 0), 0) / checks.length
      : 0

    // Get last 7 days summary
    const last7Days = new Date()
    last7Days.setDate(last7Days.getDate() - 7)
    
    const weekChecks = await prisma.uptimeCheck.findMany({
      where: { timestamp: { gte: last7Days } },
    })

    const weekUpChecks = weekChecks.filter(c => c.status === 'UP').length
    const weekUptimePercent = weekChecks.length > 0 
      ? (weekUpChecks / weekChecks.length) * 100 
      : 100

    // Find incidents (downtime events)
    const incidents = checks
      .filter(c => c.status === 'DOWN')
      .slice(0, 10)

    return NextResponse.json({
      success: true,
      current: currentStatus,
      stats: {
        uptime24h: uptimePercent.toFixed(2),
        uptime7d: weekUptimePercent.toFixed(2),
        avgResponseTime: Math.round(avgResponseTime),
        totalChecks,
        upChecks,
        downChecks: totalChecks - upChecks,
      },
      checks: checks.slice(0, 50),
      incidents,
    })
  } catch (error: any) {
    console.error('Uptime API Error:', error)
    return NextResponse.json(
      { error: error.message || 'Failed to fetch uptime data' },
      { status: 500 }
    )
  }
}
