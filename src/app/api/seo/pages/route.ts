import { NextResponse } from 'next/server'
import { auth } from '@/lib/auth/auth'
import { gscService } from '@/lib/google/search-console'
import { getDateRange } from '@/lib/utils/dates'

export async function GET(request: Request) {
  try {
    const session = await auth()
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const days = parseInt(searchParams.get('days') || '7')
    const limit = parseInt(searchParams.get('limit') || '100')
    const { startDate, endDate } = getDateRange(days)

    const pages = await gscService.getTopPages(startDate, endDate, limit)

    const totalClicks = pages.reduce((sum, p) => sum + p.clicks, 0)
    const totalImpressions = pages.reduce((sum, p) => sum + p.impressions, 0)
    const avgPosition = pages.length > 0
      ? pages.reduce((sum, p) => sum + p.position, 0) / pages.length
      : 0
    const avgCTR = totalImpressions > 0 ? (totalClicks / totalImpressions) * 100 : 0

    return NextResponse.json({
      success: true,
      dateRange: { startDate, endDate, days },
      stats: {
        total: pages.length,
        totalClicks,
        totalImpressions,
        avgPosition: avgPosition.toFixed(1),
        avgCTR: avgCTR.toFixed(2),
      },
      pages,
    })
  } catch (error: any) {
    console.error('SEO Pages Error:', error)
    return NextResponse.json(
      { error: error.message || 'Failed to fetch pages' },
      { status: 500 }
    )
  }
}
