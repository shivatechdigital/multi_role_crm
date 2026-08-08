import { NextResponse } from 'next/server'
import { auth } from '@/lib/auth/auth'
import { ga4Service } from '@/lib/google/analytics'
import { getDateRange } from '@/lib/utils/dates'

export async function GET(request: Request) {
  try {
    const session = await auth()
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const days = parseInt(searchParams.get('days') || '7')
    const { startDate, endDate } = getDateRange(days)

    const [overview, daily, sources, pages, demographics, realtime] = await Promise.all([
      ga4Service.getOverallMetrics(startDate, endDate),
      ga4Service.getDailyMetrics(startDate, endDate),
      ga4Service.getTrafficSources(startDate, endDate),
      ga4Service.getTopPages(startDate, endDate, 10),
      ga4Service.getDemographics(startDate, endDate),
      ga4Service.getRealtimeUsers(),
    ])

    return NextResponse.json({
      success: true,
      dateRange: { startDate, endDate, days },
      overview,
      daily,
      sources,
      pages,
      demographics,
      realtime,
    })
  } catch (error: any) {
    console.error('Analytics Overview Error:', error)
    return NextResponse.json(
      { error: error.message || 'Failed to fetch analytics data' },
      { status: 500 }
    )
  }
}
