import { NextResponse } from 'next/server'
import { auth } from '@/lib/auth/auth'
import { ga4Service } from '@/lib/google/analytics'
import { BetaAnalyticsDataClient } from '@google-analytics/data'

const GA4_PROPERTY_ID = process.env.GA4_PROPERTY_ID || '509783221'

export async function GET() {
  try {
    const session = await auth()
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const client = new BetaAnalyticsDataClient({
      keyFilename: process.env.GOOGLE_SERVICE_ACCOUNT_PATH,
    })

    const [activeUsers, byCountry, byPage, byDevice] = await Promise.all([
      // Total active users
      client.runRealtimeReport({
        property: `properties/${GA4_PROPERTY_ID}`,
        metrics: [{ name: 'activeUsers' }],
      }),
      // Users by country
      client.runRealtimeReport({
        property: `properties/${GA4_PROPERTY_ID}`,
        dimensions: [{ name: 'country' }],
        metrics: [{ name: 'activeUsers' }],
        orderBys: [{ metric: { metricName: 'activeUsers' }, desc: true }],
        limit: 10,
      }),
      // Users by page
      client.runRealtimeReport({
        property: `properties/${GA4_PROPERTY_ID}`,
        dimensions: [{ name: 'unifiedScreenName' }],
        metrics: [{ name: 'activeUsers' }],
        orderBys: [{ metric: { metricName: 'activeUsers' }, desc: true }],
        limit: 10,
      }),
      // Users by device
      client.runRealtimeReport({
        property: `properties/${GA4_PROPERTY_ID}`,
        dimensions: [{ name: 'deviceCategory' }],
        metrics: [{ name: 'activeUsers' }],
      }),
    ])

    const totalActive = parseInt(activeUsers[0].rows?.[0]?.metricValues?.[0]?.value || '0')

    const countries = (byCountry[0].rows || []).map((row) => ({
      country: row.dimensionValues?.[0]?.value || '',
      users: parseInt(row.metricValues?.[0]?.value || '0'),
    }))

    const pages = (byPage[0].rows || []).map((row) => ({
      page: row.dimensionValues?.[0]?.value || '',
      users: parseInt(row.metricValues?.[0]?.value || '0'),
    }))

    const devices = (byDevice[0].rows || []).map((row) => ({
      device: row.dimensionValues?.[0]?.value || '',
      users: parseInt(row.metricValues?.[0]?.value || '0'),
    }))

    return NextResponse.json({
      success: true,
      activeUsers: totalActive,
      countries,
      pages,
      devices,
      timestamp: new Date().toISOString(),
    })
  } catch (error: any) {
    console.error('Realtime Error:', error)
    return NextResponse.json(
      { error: error.message || 'Failed to fetch realtime data' },
      { status: 500 }
    )
  }
}
