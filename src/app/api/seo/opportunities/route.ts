// src/app/api/seo/opportunities/route.ts

import { NextResponse } from 'next/server'
import { auth } from '@/lib/auth/auth'
import { gscService } from '@/lib/google/search-console'
import { getDateRange } from '@/lib/utils/dates'

export interface Opportunity {
  type: 'quick_win' | 'ctr_issue' | 'striking_distance' | 'declining' | 'rising'
  priority: 'high' | 'medium' | 'low'
  keyword?: string
  page?: string
  currentPosition: number
  currentClicks: number
  currentImpressions: number
  currentCtr: number
  potentialClicks: number
  potentialGain: number
  reasoning: string
  recommendations: string[]
  impactScore: number
}

export async function GET(request: Request) {
  try {
    const session = await auth()
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const days = parseInt(searchParams.get('days') || '28')
    const { startDate, endDate } = getDateRange(days)

    // Fetch data
    const [keywords, pages] = await Promise.all([
      gscService.getTopKeywords(startDate, endDate, 500),
      gscService.getTopPages(startDate, endDate, 100),
    ])

    // Detect opportunities
    const opportunities = {
      quickWins: detectQuickWins(keywords),
      strikingDistance: detectStrikingDistance(keywords),
      ctrIssues: detectCtrIssues(keywords),
      pageCtrIssues: detectPageCtrIssues(pages),
      topOpportunities: [] as Opportunity[],
    }

    // Build top opportunities (sorted by impact)
    const allOpps: Opportunity[] = [
      ...opportunities.quickWins,
      ...opportunities.strikingDistance,
      ...opportunities.ctrIssues,
      ...opportunities.pageCtrIssues,
    ]

    opportunities.topOpportunities = allOpps
      .sort((a, b) => b.impactScore - a.impactScore)
      .slice(0, 20)

    // Stats
    const stats = {
      totalOpportunities: allOpps.length,
      quickWinsCount: opportunities.quickWins.length,
      ctrIssuesCount: opportunities.ctrIssues.length + opportunities.pageCtrIssues.length,
      strikingDistanceCount: opportunities.strikingDistance.length,
      potentialTraffic: allOpps.reduce((sum, opp) => sum + opp.potentialGain, 0),
      highPriorityCount: allOpps.filter(o => o.priority === 'high').length,
    }

    return NextResponse.json({
      success: true,
      dateRange: { startDate, endDate, days },
      stats,
      opportunities,
    })
  } catch (error: any) {
    console.error('Opportunities Error:', error)
    return NextResponse.json(
      { error: error.message || 'Failed to fetch opportunities' },
      { status: 500 }
    )
  }
}

/**
 * QUICK WINS: Keywords at position 4-15 with decent impressions
 * Easy to push to top 3 with optimization
 */
function detectQuickWins(keywords: any[]): Opportunity[] {
  return keywords
    .filter(k => 
      k.position >= 4 && 
      k.position <= 15 && 
      k.impressions >= 10
    )
    .map(k => {
      // Estimate potential clicks if moved to position 3
      const currentCtr = k.ctr
      const targetCtr = estimateCtr(3) // ~10%
      const potentialClicks = Math.round((k.impressions * targetCtr) / 100)
      const potentialGain = potentialClicks - k.clicks

      const impactScore = potentialGain * (16 - k.position) // Higher score for closer to top

      return {
        type: 'quick_win' as const,
        priority: getPriority(impactScore),
        keyword: k.keyword,
        currentPosition: k.position,
        currentClicks: k.clicks,
        currentImpressions: k.impressions,
        currentCtr: k.ctr,
        potentialClicks,
        potentialGain,
        reasoning: `Currently ranking #${k.position.toFixed(0)}. Pushing to top 3 could ${potentialGain > 0 ? `gain ${potentialGain} clicks/month` : 'maintain rankings'}.`,
        recommendations: [
          'Update page title to include this exact keyword',
          'Add this keyword in H1 and first paragraph',
          'Build 2-3 internal links to this page',
          'Create FAQ section answering this query',
          'Add related LSI keywords throughout content',
        ],
        impactScore,
      }
    })
    .sort((a, b) => b.impactScore - a.impactScore)
}

/**
 * STRIKING DISTANCE: Position 6-10 - very close to top 5
 */
function detectStrikingDistance(keywords: any[]): Opportunity[] {
  return keywords
    .filter(k => 
      k.position >= 6 && 
      k.position <= 10 && 
      k.impressions >= 5
    )
    .map(k => {
      const targetCtr = estimateCtr(5)
      const potentialClicks = Math.round((k.impressions * targetCtr) / 100)
      const potentialGain = Math.max(0, potentialClicks - k.clicks)

      return {
        type: 'striking_distance' as const,
        priority: 'high' as const,
        keyword: k.keyword,
        currentPosition: k.position,
        currentClicks: k.clicks,
        currentImpressions: k.impressions,
        currentCtr: k.ctr,
        potentialClicks,
        potentialGain,
        reasoning: `Striking distance! Position #${k.position.toFixed(0)} - very close to top 5.`,
        recommendations: [
          'Update title with exact keyword match',
          'Improve meta description for CTR',
          'Add fresh content/sections to page',
          'Get 1-2 quality backlinks',
        ],
        impactScore: potentialGain * 2,
      }
    })
    .slice(0, 15)
}

/**
 * CTR ISSUES: High impressions but low CTR (keyword level)
 */
function detectCtrIssues(keywords: any[]): Opportunity[] {
  return keywords
    .filter(k => {
      const expectedCtr = estimateCtr(k.position)
      return (
        k.impressions >= 100 && 
        k.position <= 10 && 
        k.ctr < expectedCtr * 0.5 // Less than 50% of expected
      )
    })
    .map(k => {
      const expectedCtr = estimateCtr(k.position)
      const potentialClicks = Math.round((k.impressions * expectedCtr) / 100)
      const potentialGain = potentialClicks - k.clicks

      return {
        type: 'ctr_issue' as const,
        priority: 'high' as const,
        keyword: k.keyword,
        currentPosition: k.position,
        currentClicks: k.clicks,
        currentImpressions: k.impressions,
        currentCtr: k.ctr,
        potentialClicks,
        potentialGain,
        reasoning: `${k.impressions} impressions but only ${k.ctr.toFixed(1)}% CTR (expected ${expectedCtr}%). Title/description needs improvement.`,
        recommendations: [
          'Rewrite title to be more compelling',
          'Add power words: "Best", "Top", "2024"',
          'Include numbers or year in title',
          'Test emotional triggers in description',
          'Add unique value proposition',
        ],
        impactScore: potentialGain * 3,
      }
    })
    .slice(0, 10)
}

/**
 * PAGE-LEVEL CTR ISSUES
 */
function detectPageCtrIssues(pages: any[]): Opportunity[] {
  return pages
    .filter(p => {
      const expectedCtr = estimateCtr(p.position)
      return (
        p.impressions >= 50 && 
        p.position <= 10 && 
        p.ctr < expectedCtr * 0.6
      )
    })
    .map(p => {
      const expectedCtr = estimateCtr(p.position)
      const potentialClicks = Math.round((p.impressions * expectedCtr) / 100)
      const potentialGain = potentialClicks - p.clicks

      return {
        type: 'ctr_issue' as const,
        priority: getPriority(potentialGain * 2),
        page: p.page,
        currentPosition: p.position,
        currentClicks: p.clicks,
        currentImpressions: p.impressions,
        currentCtr: p.ctr,
        potentialClicks,
        potentialGain,
        reasoning: `Page gets ${p.impressions} impressions but low ${p.ctr.toFixed(1)}% CTR.`,
        recommendations: [
          'Rewrite meta title with stronger hook',
          'Update meta description with clear value',
          'Add schema markup for rich snippets',
          'Test FAQ schema for better SERP visibility',
        ],
        impactScore: potentialGain * 2,
      }
    })
    .slice(0, 10)
}

/**
 * Estimate CTR based on position
 * Based on industry averages
 */
function estimateCtr(position: number): number {
  const ctrMap: { [key: number]: number } = {
    1: 31.7,
    2: 24.7,
    3: 18.7,
    4: 13.6,
    5: 9.5,
    6: 6.2,
    7: 4.3,
    8: 3.1,
    9: 2.6,
    10: 2.4,
  }
  
  const rounded = Math.round(position)
  if (rounded <= 10) return ctrMap[rounded] || 2.0
  if (rounded <= 20) return 1.5
  return 1.0
}

/**
 * Get priority based on impact
 */
function getPriority(score: number): 'high' | 'medium' | 'low' {
  if (score >= 50) return 'high'
  if (score >= 20) return 'medium'
  return 'low'
}
