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

    const sources = await ga4Service.getTrafficSources(startDate, endDate)

    // Categorize by channel
    const channelMap = new Map<string, { users: number; sessions: number; bounceRate: number; count: number }>()
    
    sources.forEach((item: any) => {
      const channel = categorizeChannel(item.source, item.medium)
      const existing = channelMap.get(channel) || { users: 0, sessions: 0, bounceRate: 0, count: 0 }
      channelMap.set(channel, {
        users: existing.users + item.users,
        sessions: existing.sessions + item.sessions,
        bounceRate: existing.bounceRate + item.bounceRate,
        count: existing.count + 1,
      })
    })

    const channels = Array.from(channelMap.entries())
      .map(([name, data]) => ({
        name,
        users: data.users,
        sessions: data.sessions,
        avgBounceRate: data.count > 0 ? data.bounceRate / data.count : 0,
      }))
      .sort((a, b) => b.users - a.users)

    // Top sources detail
    const topSources = sources.slice(0, 15)

    // Calculate totals
    const totalUsers = sources.reduce((sum: number, s: any) => sum + s.users, 0)
    const totalSessions = sources.reduce((sum: number, s: any) => sum + s.sessions, 0)
    const avgBounceRate = sources.length > 0
      ? sources.reduce((sum: number, s: any) => sum + s.bounceRate, 0) / sources.length
      : 0

    return NextResponse.json({
      success: true,
      stats: {
        totalUsers,
        totalSessions,
        avgBounceRate: avgBounceRate.toFixed(1),
        totalSources: sources.length,
        totalChannels: channels.length,
      },
      channels,
      topSources,
      allSources: sources,
    })
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message || 'Failed to fetch sources data' },
      { status: 500 }
    )
  }
}

function categorizeChannel(source: string, medium: string): string {
  const src = source?.toLowerCase() || ''
  const med = medium?.toLowerCase() || ''

  if (med === 'organic' || src === 'google' && med === 'organic') return '🔍 Organic Search'
  if (med === 'cpc' || med === 'ppc' || med === 'paid') return '💰 Paid Search'
  if (src === '(direct)' || med === '(none)' || med === 'direct') return '🌐 Direct'
  if (src.includes('facebook') || src.includes('instagram') || src.includes('twitter') || 
      src.includes('linkedin') || src.includes('youtube') || med === 'social') return '📱 Social Media'
  if (med === 'email' || med === 'newsletter') return '✉️ Email'
  if (med === 'referral') return '🔗 Referral'
  if (med === 'display' || med === 'banner') return '🎯 Display Ads'
  return '🌍 Other'
}
