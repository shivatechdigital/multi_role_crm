import { NextResponse } from 'next/server'
import { auth } from '@/lib/auth/auth'
import { gscService } from '@/lib/google/search-console'
import { getDateRange } from '@/lib/utils/dates'

export async function GET(request: Request) {
  try {
    // Check authentication
    const session = await auth()
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Get date range from query params
    const { searchParams } = new URL(request.url)
    const days = parseInt(searchParams.get('days') || '7')
    const { startDate, endDate } = getDateRange(days)

    // Fetch all GSC data in parallel
    const [overview, keywords, pages, countries, devices, daily] = await Promise.all([
      gscService.getOverallMetrics(startDate, endDate),
      gscService.getTopKeywords(startDate, endDate, 10),
      gscService.getTopPages(startDate, endDate, 10),
      gscService.getCountries(startDate, endDate, 10),
      gscService.getDevices(startDate, endDate),
      gscService.getDailyMetrics(startDate, endDate),
    ])

    return NextResponse.json({
      success: true,
      dateRange: { startDate, endDate, days },
      overview,
      keywords,
      pages,
      countries,
      devices,
      daily,
    })
  } catch (error: any) {
    console.error('SEO Overview Error:', error)
    return NextResponse.json(
      { error: error.message || 'Failed to fetch SEO data' },
      { status: 500 }
    )
  }
}
