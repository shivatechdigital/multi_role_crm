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

    const keywords = await gscService.getTopKeywords(startDate, endDate, limit)

    // Calculate stats
    const totalClicks = keywords.reduce((sum, k) => sum + k.clicks, 0)
    const totalImpressions = keywords.reduce((sum, k) => sum + k.impressions, 0)
    const avgPosition = keywords.length > 0
      ? keywords.reduce((sum, k) => sum + k.position, 0) / keywords.length
      : 0
    const avgCTR = totalImpressions > 0 ? (totalClicks / totalImpressions) * 100 : 0

    // Categorize keywords by position
    const top3 = keywords.filter(k => k.position <= 3).length
    const top10 = keywords.filter(k => k.position <= 10).length
    const top20 = keywords.filter(k => k.position <= 20).length
    const beyond20 = keywords.filter(k => k.position > 20).length

    return NextResponse.json({
      success: true,
      dateRange: { startDate, endDate, days },
      stats: {
        total: keywords.length,
        totalClicks,
        totalImpressions,
        avgPosition: avgPosition.toFixed(1),
        avgCTR: avgCTR.toFixed(2),
        top3,
        top10,
        top20,
        beyond20,
      },
      keywords,
    })
  } catch (error: any) {
    console.error('SEO Keywords Error:', error)
    return NextResponse.json(
      { error: error.message || 'Failed to fetch keywords' },
      { status: 500 }
    )
  }
}
