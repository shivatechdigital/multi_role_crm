const PAGESPEED_API = 'https://www.googleapis.com/pagespeedonline/v5/runPagespeed'
const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || 'https://shivatechdigital.com'

export interface PageSpeedMetrics {
  performance: number
  accessibility: number
  bestPractices: number
  seo: number
  fcp: { value: number; display: string; score: number }
  lcp: { value: number; display: string; score: number }
  cls: { value: number; display: string; score: number }
  tbt: { value: number; display: string; score: number }
  si: { value: number; display: string; score: number }
  tti: { value: number; display: string; score: number }
  fid?: { value: number; display: string; score: number }
  inp?: { value: number; display: string; score: number }
  screenshot?: string
  opportunities: Array<{
    title: string
    description: string
    savings: number
    displayValue: string
  }>
  diagnostics: Array<{
    title: string
    description: string
    score: number
  }>
}

class PageSpeedService {
  /**
   * Run PageSpeed analysis
   */
  async analyze(url: string, strategy: 'mobile' | 'desktop' = 'mobile'): Promise<PageSpeedMetrics> {
    try {
      const categories = ['performance', 'accessibility', 'best-practices', 'seo']
      const params = new URLSearchParams({
        url,
        strategy,
      })
      categories.forEach(cat => params.append('category', cat))

      const response = await fetch(`${PAGESPEED_API}?${params.toString()}`, {
        next: { revalidate: 3600 }, // Cache for 1 hour
      })

      if (!response.ok) {
        throw new Error(`PageSpeed API error: ${response.status}`)
      }

      const data = await response.json()
      return this.parseResults(data)
    } catch (error) {
      console.error('PageSpeed Error:', error)
      throw error
    }
  }

  /**
   * Analyze both mobile and desktop
   */
  async analyzeBoth(url: string) {
    const [mobile, desktop] = await Promise.all([
      this.analyze(url, 'mobile'),
      this.analyze(url, 'desktop'),
    ])
    return { mobile, desktop }
  }

  /**
   * Parse PageSpeed API results
   */
  private parseResults(data: any): PageSpeedMetrics {
    const lighthouse = data.lighthouseResult
    const categories = lighthouse.categories
    const audits = lighthouse.audits

    // Extract opportunities (things to improve)
    const opportunities = Object.values(audits)
      .filter((audit: any) => 
        audit.details?.type === 'opportunity' && 
        audit.numericValue > 0
      )
      .map((audit: any) => ({
        title: audit.title,
        description: audit.description,
        savings: audit.numericValue || 0,
        displayValue: audit.displayValue || '',
      }))
      .sort((a, b) => b.savings - a.savings)
      .slice(0, 10)

    // Extract diagnostics
    const diagnostics = Object.values(audits)
      .filter((audit: any) => 
        audit.details?.type === 'diagnostic' && 
        audit.score !== null && 
        audit.score < 1
      )
      .map((audit: any) => ({
        title: audit.title,
        description: audit.description,
        score: audit.score,
      }))
      .slice(0, 10)

    return {
      performance: Math.round((categories.performance?.score || 0) * 100),
      accessibility: Math.round((categories.accessibility?.score || 0) * 100),
      bestPractices: Math.round((categories['best-practices']?.score || 0) * 100),
      seo: Math.round((categories.seo?.score || 0) * 100),
      fcp: this.parseMetric(audits['first-contentful-paint']),
      lcp: this.parseMetric(audits['largest-contentful-paint']),
      cls: this.parseMetric(audits['cumulative-layout-shift']),
      tbt: this.parseMetric(audits['total-blocking-time']),
      si: this.parseMetric(audits['speed-index']),
      tti: this.parseMetric(audits['interactive']),
      screenshot: audits['final-screenshot']?.details?.data,
      opportunities,
      diagnostics,
    }
  }

  private parseMetric(audit: any) {
    return {
      value: audit?.numericValue || 0,
      display: audit?.displayValue || 'N/A',
      score: audit?.score || 0,
    }
  }
}

export const pagespeedService = new PageSpeedService()
