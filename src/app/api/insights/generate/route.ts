import { NextResponse } from 'next/server'
import { auth } from '@/lib/auth/auth'
import { aiService } from '@/lib/ai/freellm'
import { gscService } from '@/lib/google/search-console'
import { prisma } from '@/lib/db/prisma'
import { getDateRange } from '@/lib/utils/dates'

export async function POST(request: Request) {
  try {
    const session = await auth()
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()
    const { type = 'overview', days = 7 } = body

    const { startDate, endDate } = getDateRange(days)

    // Fetch data based on type
    const [overview, keywords, pages] = await Promise.all([
      gscService.getOverallMetrics(startDate, endDate),
      gscService.getTopKeywords(startDate, endDate, 50),
      gscService.getTopPages(startDate, endDate, 20),
    ])

    let aiContent = ''
    let title = ''
    let category = 'seo'

    switch (type) {
      case 'overview':
        title = '📊 Daily SEO Analysis'
        aiContent = await aiService.analyzeSEO({
          clicks: overview.clicks,
          impressions: overview.impressions,
          ctr: overview.ctr,
          position: overview.position,
          topKeywords: keywords,
          topPages: pages,
        })
        break

      case 'opportunities':
        title = '🎯 Keyword Opportunities'
        aiContent = await aiService.findOpportunities(keywords)
        break

      case 'content_ideas':
        title = '💡 Content Ideas'
        aiContent = await aiService.generateContentIdeas(keywords)
        category = 'content'
        break

      default:
        return NextResponse.json({ error: 'Invalid type' }, { status: 400 })
    }

    // Save to database
    const insight = await prisma.aiInsight.create({
      data: {
        date: new Date(),
        type,
        category,
        title,
        description: aiContent,
        priority: 'medium',
        data: {
          clicks: overview.clicks,
          impressions: overview.impressions,
          ctr: overview.ctr,
          position: overview.position,
          dateRange: { startDate, endDate, days },
        },
      },
    })

    return NextResponse.json({
      success: true,
      insight,
    })
  } catch (error: any) {
    console.error('Insights Generation Error:', error)
    return NextResponse.json(
      { error: error.message || 'Failed to generate insights' },
      { status: 500 }
    )
  }
}
