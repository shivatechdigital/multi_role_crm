import { google } from 'googleapis'
import { getGoogleAuth } from './auth'

const GSC_PROPERTY = process.env.GSC_PROPERTY || 'sc-domain:example.com'

export interface GSCMetrics {
  clicks: number
  impressions: number
  ctr: number
  position: number
}

export interface GSCKeyword {
  keyword: string
  clicks: number
  impressions: number
  ctr: number
  position: number
}

export interface GSCPage {
  page: string
  clicks: number
  impressions: number
  ctr: number
  position: number
}

class SearchConsoleService {
  private getClient() {
    const auth = getGoogleAuth()
    return google.searchconsole({ version: 'v1', auth })
  }

  /**
   * Get overall performance metrics
   */
  async getOverallMetrics(startDate: string, endDate: string): Promise<GSCMetrics> {
    try {
      const client = this.getClient()
      const response = await client.searchanalytics.query({
        siteUrl: GSC_PROPERTY,
        requestBody: {
          startDate,
          endDate,
          dimensions: [],
          rowLimit: 1,
        },
      })

      const row = response.data.rows?.[0]
      return {
        clicks: row?.clicks || 0,
        impressions: row?.impressions || 0,
        ctr: (row?.ctr || 0) * 100,
        position: row?.position || 0,
      }
    } catch (error) {
      console.error('GSC Overall Metrics Error:', error)
      throw error
    }
  }

  /**
   * Get daily metrics for date range
   */
  async getDailyMetrics(startDate: string, endDate: string) {
    try {
      const client = this.getClient()
      const response = await client.searchanalytics.query({
        siteUrl: GSC_PROPERTY,
        requestBody: {
          startDate,
          endDate,
          dimensions: ['date'],
          rowLimit: 1000,
        },
      })

      return (response.data.rows || []).map((row) => ({
        date: row.keys?.[0] || '',
        clicks: row.clicks || 0,
        impressions: row.impressions || 0,
        ctr: (row.ctr || 0) * 100,
        position: row.position || 0,
      }))
    } catch (error) {
      console.error('GSC Daily Metrics Error:', error)
      throw error
    }
  }

  /**
   * Get top keywords
   */
  async getTopKeywords(
    startDate: string,
    endDate: string,
    limit: number = 50
  ): Promise<GSCKeyword[]> {
    try {
      const client = this.getClient()
      const response = await client.searchanalytics.query({
        siteUrl: GSC_PROPERTY,
        requestBody: {
          startDate,
          endDate,
          dimensions: ['query'],
          rowLimit: limit,
        },
      })

      return (response.data.rows || []).map((row) => ({
        keyword: row.keys?.[0] || '',
        clicks: row.clicks || 0,
        impressions: row.impressions || 0,
        ctr: (row.ctr || 0) * 100,
        position: row.position || 0,
      }))
    } catch (error) {
      console.error('GSC Keywords Error:', error)
      throw error
    }
  }

  /**
   * Get top pages
   */
  async getTopPages(
    startDate: string,
    endDate: string,
    limit: number = 50
  ): Promise<GSCPage[]> {
    try {
      const client = this.getClient()
      const response = await client.searchanalytics.query({
        siteUrl: GSC_PROPERTY,
        requestBody: {
          startDate,
          endDate,
          dimensions: ['page'],
          rowLimit: limit,
        },
      })

      return (response.data.rows || []).map((row) => ({
        page: row.keys?.[0] || '',
        clicks: row.clicks || 0,
        impressions: row.impressions || 0,
        ctr: (row.ctr || 0) * 100,
        position: row.position || 0,
      }))
    } catch (error) {
      console.error('GSC Pages Error:', error)
      throw error
    }
  }

  /**
   * Get country-wise data
   */
  async getCountries(startDate: string, endDate: string, limit: number = 20) {
    try {
      const client = this.getClient()
      const response = await client.searchanalytics.query({
        siteUrl: GSC_PROPERTY,
        requestBody: {
          startDate,
          endDate,
          dimensions: ['country'],
          rowLimit: limit,
        },
      })

      return (response.data.rows || []).map((row) => ({
        country: row.keys?.[0] || '',
        clicks: row.clicks || 0,
        impressions: row.impressions || 0,
        ctr: (row.ctr || 0) * 100,
        position: row.position || 0,
      }))
    } catch (error) {
      console.error('GSC Countries Error:', error)
      throw error
    }
  }

  /**
   * Get device-wise data
   */
  async getDevices(startDate: string, endDate: string) {
    try {
      const client = this.getClient()
      const response = await client.searchanalytics.query({
        siteUrl: GSC_PROPERTY,
        requestBody: {
          startDate,
          endDate,
          dimensions: ['device'],
        },
      })

      return (response.data.rows || []).map((row) => ({
        device: row.keys?.[0] || '',
        clicks: row.clicks || 0,
        impressions: row.impressions || 0,
        ctr: (row.ctr || 0) * 100,
        position: row.position || 0,
      }))
    } catch (error) {
      console.error('GSC Devices Error:', error)
      throw error
    }
  }
}

export const gscService = new SearchConsoleService()
