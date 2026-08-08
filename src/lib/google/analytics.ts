import { BetaAnalyticsDataClient } from '@google-analytics/data'

const GA4_PROPERTY_ID = process.env.GA4_PROPERTY_ID || '509783221'

export interface GA4Metrics {
  users: number
  newUsers: number
  sessions: number
  pageviews: number
  bounceRate: number
  avgSessionDuration: number
  pagesPerSession: number
}

export interface TrafficSource {
  source: string
  medium: string
  users: number
  sessions: number
  bounceRate: number
}

class AnalyticsService {
  private client: BetaAnalyticsDataClient

  constructor() {
    this.client = new BetaAnalyticsDataClient({
      keyFilename: process.env.GOOGLE_SERVICE_ACCOUNT_PATH,
    })
  }

  /**
   * Get overall metrics for date range
   */
  async getOverallMetrics(startDate: string, endDate: string): Promise<GA4Metrics> {
    try {
      const [response] = await this.client.runReport({
        property: `properties/${GA4_PROPERTY_ID}`,
        dateRanges: [{ startDate, endDate }],
        metrics: [
          { name: 'activeUsers' },
          { name: 'newUsers' },
          { name: 'sessions' },
          { name: 'screenPageViews' },
          { name: 'bounceRate' },
          { name: 'averageSessionDuration' },
          { name: 'screenPageViewsPerSession' },
        ],
      })

      const row = response.rows?.[0]
      const values = row?.metricValues || []

      return {
        users: parseInt(values[0]?.value || '0'),
        newUsers: parseInt(values[1]?.value || '0'),
        sessions: parseInt(values[2]?.value || '0'),
        pageviews: parseInt(values[3]?.value || '0'),
        bounceRate: parseFloat(values[4]?.value || '0') * 100,
        avgSessionDuration: parseFloat(values[5]?.value || '0'),
        pagesPerSession: parseFloat(values[6]?.value || '0'),
      }
    } catch (error) {
      console.error('GA4 Overall Metrics Error:', error)
      throw error
    }
  }

  /**
   * Get daily metrics
   */
  async getDailyMetrics(startDate: string, endDate: string) {
    try {
      const [response] = await this.client.runReport({
        property: `properties/${GA4_PROPERTY_ID}`,
        dateRanges: [{ startDate, endDate }],
        dimensions: [{ name: 'date' }],
        metrics: [
          { name: 'activeUsers' },
          { name: 'newUsers' },
          { name: 'sessions' },
          { name: 'screenPageViews' },
          { name: 'bounceRate' },
        ],
        orderBys: [{ dimension: { dimensionName: 'date' } }],
      })

      return (response.rows || []).map((row) => ({
        date: row.dimensionValues?.[0]?.value || '',
        users: parseInt(row.metricValues?.[0]?.value || '0'),
        newUsers: parseInt(row.metricValues?.[1]?.value || '0'),
        sessions: parseInt(row.metricValues?.[2]?.value || '0'),
        pageviews: parseInt(row.metricValues?.[3]?.value || '0'),
        bounceRate: parseFloat(row.metricValues?.[4]?.value || '0') * 100,
      }))
    } catch (error) {
      console.error('GA4 Daily Metrics Error:', error)
      throw error
    }
  }

  /**
   * Get traffic sources
   */
  async getTrafficSources(startDate: string, endDate: string): Promise<TrafficSource[]> {
    try {
      const [response] = await this.client.runReport({
        property: `properties/${GA4_PROPERTY_ID}`,
        dateRanges: [{ startDate, endDate }],
        dimensions: [
          { name: 'sessionSource' },
          { name: 'sessionMedium' },
        ],
        metrics: [
          { name: 'activeUsers' },
          { name: 'sessions' },
          { name: 'bounceRate' },
        ],
        orderBys: [{ metric: { metricName: 'sessions' }, desc: true }],
        limit: 20,
      })

      return (response.rows || []).map((row) => ({
        source: row.dimensionValues?.[0]?.value || '',
        medium: row.dimensionValues?.[1]?.value || '',
        users: parseInt(row.metricValues?.[0]?.value || '0'),
        sessions: parseInt(row.metricValues?.[1]?.value || '0'),
        bounceRate: parseFloat(row.metricValues?.[2]?.value || '0') * 100,
      }))
    } catch (error) {
      console.error('GA4 Traffic Sources Error:', error)
      throw error
    }
  }

  /**
   * Get top pages
   */
  async getTopPages(startDate: string, endDate: string, limit: number = 50) {
    try {
      const [response] = await this.client.runReport({
        property: `properties/${GA4_PROPERTY_ID}`,
        dateRanges: [{ startDate, endDate }],
        dimensions: [
          { name: 'pagePath' },
          { name: 'pageTitle' },
        ],
        metrics: [
          { name: 'activeUsers' },
          { name: 'screenPageViews' },
          { name: 'averageSessionDuration' },
          { name: 'bounceRate' },
        ],
        orderBys: [{ metric: { metricName: 'screenPageViews' }, desc: true }],
        limit,
      })

      return (response.rows || []).map((row) => ({
        pageUrl: row.dimensionValues?.[0]?.value || '',
        pageTitle: row.dimensionValues?.[1]?.value || '',
        users: parseInt(row.metricValues?.[0]?.value || '0'),
        pageviews: parseInt(row.metricValues?.[1]?.value || '0'),
        avgTimeOnPage: parseFloat(row.metricValues?.[2]?.value || '0'),
        bounceRate: parseFloat(row.metricValues?.[3]?.value || '0') * 100,
      }))
    } catch (error) {
      console.error('GA4 Top Pages Error:', error)
      throw error
    }
  }

  /**
   * Get demographics (country, device)
   */
  async getDemographics(startDate: string, endDate: string) {
    try {
      const [response] = await this.client.runReport({
        property: `properties/${GA4_PROPERTY_ID}`,
        dateRanges: [{ startDate, endDate }],
        dimensions: [
          { name: 'country' },
          { name: 'deviceCategory' },
        ],
        metrics: [
          { name: 'activeUsers' },
          { name: 'sessions' },
        ],
        orderBys: [{ metric: { metricName: 'activeUsers' }, desc: true }],
        limit: 50,
      })

      return (response.rows || []).map((row) => ({
        country: row.dimensionValues?.[0]?.value || '',
        device: row.dimensionValues?.[1]?.value || '',
        users: parseInt(row.metricValues?.[0]?.value || '0'),
        sessions: parseInt(row.metricValues?.[1]?.value || '0'),
      }))
    } catch (error) {
      console.error('GA4 Demographics Error:', error)
      throw error
    }
  }

  /**
   * Get real-time active users
   */
  async getRealtimeUsers() {
    try {
      const [response] = await this.client.runRealtimeReport({
        property: `properties/${GA4_PROPERTY_ID}`,
        metrics: [{ name: 'activeUsers' }],
      })

      const value = response.rows?.[0]?.metricValues?.[0]?.value || '0'
      return parseInt(value)
    } catch (error) {
      console.error('GA4 Realtime Error:', error)
      return 0
    }
  }
}

export const ga4Service = new AnalyticsService()

