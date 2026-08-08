import { NextResponse } from 'next/server'
import { aiService } from '@/lib/ai/freellm'
import { gscService } from '@/lib/google/search-console'
import { prisma } from '@/lib/db/prisma'
import { getDateRange } from '@/lib/utils/dates'

const SYNC_SECRET = process.env.SYNC_SECRET || 'change-this-secret'

export async function POST(request: Request) {
  try {
    const authHeader = request.headers.get('authorization')
    if (authHeader !== `Bearer ${SYNC_SECRET}`) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json().catch(() => ({}))
    const type = body.type || 'overview' // overview | opportunities | content_ideas

    const { startDate, endDate } = getDateRange(7)

    const [overview, keywords, pages] = await Promise.all([
      gscService.getOverallMetrics(startDate, endDate),
      gscService.getTopKeywords(startDate, endDate, 50),
      gscService.getTopPages(startDate, endDate, 20),
    ])

    let aiContent = ''
    let title = ''
    let category = 'seo'

    if (type === 'overview') {
      title = '📊 Daily SEO Analysis (Auto)'
      aiContent = await aiService.analyzeSEO({
        clicks: overview.clicks,
        impressions: overview.impressions,
        ctr: overview.ctr,
        position: overview.position,
        topKeywords: keywords,
        topPages: pages,
      })
    } else if (type === 'opportunities') {
      title = '🎯 Daily Opportunities (Auto)'
      aiContent = await aiService.findOpportunities(keywords)
    } else if (type === 'content_ideas') {
      title = '💡 Content Ideas (Auto)'
      aiContent = await aiService.generateContentIdeas(keywords)
      category = 'content'
    }

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
        },
      },
    })

    return NextResponse.json({
      success: true,
      message: 'AI insight generated',
      insight: {
        id: insight.id,
        title: insight.title,
        type: insight.type,
      },
    })
  } catch (error: any) {
    console.error('AI Insight Sync Error:', error)
    return NextResponse.json(
      { error: error.message || 'Generation failed' },
      { status: 500 }
    )
  }
}

export async function GET() {
  return NextResponse.json({
    endpoint: 'AI Insights Sync',
    method: 'POST',
    auth: 'Bearer token required',
    body: { type: 'overview | opportunities | content_ideas' },
  })
}
