import { NextResponse } from 'next/server'
import { ga4Service } from '@/lib/google/analytics'
import { prisma } from '@/lib/db/prisma'
import { format, subDays } from 'date-fns'

const SYNC_SECRET = process.env.SYNC_SECRET || 'change-this-secret'

export async function POST(request: Request) {
  try {
    const authHeader = request.headers.get('authorization')
    if (authHeader !== `Bearer ${SYNC_SECRET}`) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json().catch(() => ({}))
    const daysAgo = body.daysAgo || 1

    const targetDate = format(subDays(new Date(), daysAgo), 'yyyy-MM-dd')

    console.log(`📊 Syncing GA4 data for: ${targetDate}`)

    const [overview, sources, pages, demographics] = await Promise.all([
      ga4Service.getOverallMetrics(targetDate, targetDate),
      ga4Service.getTrafficSources(targetDate, targetDate),
      ga4Service.getTopPages(targetDate, targetDate, 50),
      ga4Service.getDemographics(targetDate, targetDate),
    ])

    const date = new Date(targetDate)
    date.setHours(0, 0, 0, 0)

    let saved = { overview: 0, sources: 0, pages: 0, demographics: 0 }

    // Save overview
    try {
      await prisma.analyticsDaily.upsert({
        where: { date },
        update: {
          users: overview.users,
          newUsers: overview.newUsers,
          sessions: overview.sessions,
          pageviews: overview.pageviews,
          bounceRate: overview.bounceRate,
          avgSessionDuration: overview.avgSessionDuration,
          pagesPerSession: overview.pagesPerSession,
        },
        create: {
          date,
          users: overview.users,
          newUsers: overview.newUsers,
          sessions: overview.sessions,
          pageviews: overview.pageviews,
          bounceRate: overview.bounceRate,
          avgSessionDuration: overview.avgSessionDuration,
          pagesPerSession: overview.pagesPerSession,
        },
      })
      saved.overview = 1
    } catch (err: any) {
      console.error('Failed to save GA4 overview:', err.message)
    }

    // Save traffic sources
    for (const source of sources) {
      try {
        await prisma.trafficSource.upsert({
          where: {
            date_source_medium: {
              date,
              source: source.source,
              medium: source.medium || '',
            },
          },
          update: {
            users: source.users,
            sessions: source.sessions,
            bounceRate: source.bounceRate,
          },
          create: {
            date,
            source: source.source,
            medium: source.medium,
            users: source.users,
            sessions: source.sessions,
            bounceRate: source.bounceRate,
          },
        })
        saved.sources++
      } catch (err) {
        // Skip duplicates
      }
    }

    // Save page analytics
    for (const page of pages) {
      try {
        await prisma.pageAnalytics.upsert({
          where: {
            date_pageUrl: {
              date,
              pageUrl: page.pageUrl,
            },
          },
          update: {
            pageTitle: page.pageTitle,
            users: page.users,
            pageviews: page.pageviews,
            avgTimeOnPage: page.avgTimeOnPage,
            bounceRate: page.bounceRate,
          },
          create: {
            date,
            pageUrl: page.pageUrl,
            pageTitle: page.pageTitle,
            users: page.users,
            pageviews: page.pageviews,
            avgTimeOnPage: page.avgTimeOnPage,
            bounceRate: page.bounceRate,
          },
        })
        saved.pages++
      } catch (err) {
        // Skip duplicates
      }
    }

    // Save demographics
    for (const demo of demographics) {
      try {
        await prisma.userDemographics.create({
          data: {
            date,
            country: demo.country,
            device: demo.device,
            users: demo.users,
            sessions: demo.sessions,
          },
        })
        saved.demographics++
      } catch (err) {
        // Skip duplicates
      }
    }

    return NextResponse.json({
      success: true,
      message: `GA4 data synced for ${targetDate}`,
      date: targetDate,
      saved,
      data: {
        users: overview.users,
        sessions: overview.sessions,
        pageviews: overview.pageviews,
        sourcesCount: sources.length,
        pagesCount: pages.length,
      },
    })
  } catch (error: any) {
    console.error('GA4 Sync Error:', error)
    return NextResponse.json(
      { error: error.message || 'Sync failed' },
      { status: 500 }
    )
  }
}

export async function GET() {
  return NextResponse.json({
    endpoint: 'GA4 Sync',
    method: 'POST',
    auth: 'Bearer token required',
  })
}
