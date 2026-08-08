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

    const [overview, daily, demographics] = await Promise.all([
      ga4Service.getOverallMetrics(startDate, endDate),
      ga4Service.getDailyMetrics(startDate, endDate),
      ga4Service.getDemographics(startDate, endDate),
    ])

    // Process demographics
    const countryMap = new Map<string, number>()
    const deviceMap = new Map<string, number>()

    demographics.forEach((item: any) => {
      if (item.country) {
        countryMap.set(item.country, (countryMap.get(item.country) || 0) + item.users)
      }
      if (item.device) {
        deviceMap.set(item.device, (deviceMap.get(item.device) || 0) + item.users)
      }
    })

    const countries = Array.from(countryMap.entries())
      .map(([name, users]) => ({ name, users }))
      .sort((a, b) => b.users - a.users)
      .slice(0, 15)

    const devices = Array.from(deviceMap.entries())
      .map(([name, users]) => ({ name, users }))
      .sort((a, b) => b.users - a.users)

    // User type breakdown
    const newUsersPercent = overview.users > 0 
      ? (overview.newUsers / overview.users) * 100 
      : 0
    const returningUsersPercent = 100 - newUsersPercent

    return NextResponse.json({
      success: true,
      overview,
      daily,
      countries,
      devices,
      userTypes: {
        new: overview.newUsers,
        returning: overview.users - overview.newUsers,
        newPercent: newUsersPercent.toFixed(1),
        returningPercent: returningUsersPercent.toFixed(1),
      },
    })
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message || 'Failed to fetch users data' },
      { status: 500 }
    )
  }
}
