import { NextResponse } from 'next/server'
import { gscService } from '@/lib/google/search-console'
import { prisma } from '@/lib/db/prisma'
import { format, subDays } from 'date-fns'

// Secret key for webhook auth (n8n will use this)
const SYNC_SECRET = process.env.SYNC_SECRET || 'change-this-secret'

export async function POST(request: Request) {
  try {
    // Verify secret
    const authHeader = request.headers.get('authorization')
    if (authHeader !== `Bearer ${SYNC_SECRET}`) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json().catch(() => ({}))
    const daysAgo = body.daysAgo || 1 // Default: yesterday's data

    // Get yesterday's date
    const targetDate = format(subDays(new Date(), daysAgo), 'yyyy-MM-dd')
    
    console.log(`📊 Syncing GSC data for: ${targetDate}`)

    // Fetch all data
    const [overview, dailyMetrics, keywords, pages] = await Promise.all([
      gscService.getOverallMetrics(targetDate, targetDate),
      gscService.getDailyMetrics(targetDate, targetDate),
      gscService.getTopKeywords(targetDate, targetDate, 100),
      gscService.getTopPages(targetDate, targetDate, 100),
    ])

    const date = new Date(targetDate)
    date.setHours(0, 0, 0, 0)

    let saved = { overview: 0, keywords: 0, pages: 0 }

    // Save overview metrics
    try {
      await prisma.seoMetricsDaily.upsert({
        where: { date },
        update: {
          clicks: overview.clicks,
          impressions: overview.impressions,
          ctr: overview.ctr,
          position: overview.position,
        },
        create: {
          date,
          clicks: overview.clicks,
          impressions: overview.impressions,
          ctr: overview.ctr,
          position: overview.position,
        },
      })
      saved.overview = 1
    } catch (err: any) {
      console.error('Failed to save overview:', err.message)
    }

    // Save keyword rankings
    for (const kw of keywords) {
      try {
        await prisma.keywordRanking.upsert({
          where: {
            date_keyword_pageUrl: {
              date,
              keyword: kw.keyword,
              pageUrl: '',
            },
          },
          update: {
            position: kw.position,
            clicks: kw.clicks,
            impressions: kw.impressions,
            ctr: kw.ctr,
          },
          create: {
            date,
            keyword: kw.keyword,
            position: kw.position,
            clicks: kw.clicks,
            impressions: kw.impressions,
            ctr: kw.ctr,
            pageUrl: '',
          },
        })
        saved.keywords++
      } catch (err: any) {
        // Skip duplicates silently
      }
    }

    // Save page performance
    for (const page of pages) {
      try {
        await prisma.pagePerformance.upsert({
          where: {
            date_pageUrl: {
              date,
              pageUrl: page.page,
            },
          },
          update: {
            clicks: page.clicks,
            impressions: page.impressions,
            ctr: page.ctr,
            position: page.position,
          },
          create: {
            date,
            pageUrl: page.page,
            clicks: page.clicks,
            impressions: page.impressions,
            ctr: page.ctr,
            position: page.position,
          },
        })
        saved.pages++
      } catch (err) {
        // Skip duplicates
      }
    }

    return NextResponse.json({
      success: true,
      message: `GSC data synced for ${targetDate}`,
      date: targetDate,
      saved,
      data: {
        clicks: overview.clicks,
        impressions: overview.impressions,
        ctr: overview.ctr,
        position: overview.position,
        keywordsCount: keywords.length,
        pagesCount: pages.length,
      },
    })
  } catch (error: any) {
    console.error('GSC Sync Error:', error)
    return NextResponse.json(
      { error: error.message || 'Sync failed' },
      { status: 500 }
    )
  }
}

// Health check
export async function GET() {
  return NextResponse.json({
    endpoint: 'GSC Sync',
    method: 'POST',
    auth: 'Bearer token required',
    body: { daysAgo: 1 },
  })
}
