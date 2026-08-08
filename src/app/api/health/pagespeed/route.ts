import { NextResponse } from 'next/server'
import { auth } from '@/lib/auth/auth'
import { prisma } from '@/lib/db/prisma'

const PAGESPEED_API = 'https://www.googleapis.com/pagespeedonline/v5/runPagespeed'

async function runPageSpeed(url: string, strategy: 'mobile' | 'desktop') {
  const apiKey = process.env.GOOGLE_PAGESPEED_API_KEY
  const endpoint = `${PAGESPEED_API}?url=${encodeURIComponent(url)}&strategy=${strategy}${apiKey ? `&key=${apiKey}` : ''}`
  
  const res = await fetch(endpoint)
  if (!res.ok) throw new Error(`PageSpeed API failed: ${res.statusText}`)
  
  const data = await res.json()
  const cats = data.lighthouseResult?.categories
  const audits = data.lighthouseResult?.audits

  return {
    performance: Math.round((cats?.performance?.score || 0) * 100),
    seo: Math.round((cats?.seo?.score || 0) * 100),
    accessibility: Math.round((cats?.accessibility?.score || 0) * 100),
    bestPractices: Math.round((cats?.['best-practices']?.score || 0) * 100),
    fcp: { value: audits?.['first-contentful-paint']?.numericValue || 0, display: audits?.['first-contentful-paint']?.displayValue || '' },
    lcp: { value: audits?.['largest-contentful-paint']?.numericValue || 0, display: audits?.['largest-contentful-paint']?.displayValue || '' },
    cls: { value: audits?.['cumulative-layout-shift']?.numericValue || 0, display: audits?.['cumulative-layout-shift']?.displayValue || '' },
    tbt: { value: audits?.['total-blocking-time']?.numericValue || 0, display: audits?.['total-blocking-time']?.displayValue || '' },
    si: { value: audits?.['speed-index']?.numericValue || 0, display: audits?.['speed-index']?.displayValue || '' },
    tti: { value: audits?.['interactive']?.numericValue || 0, display: audits?.['interactive']?.displayValue || '' },
  }
}

export async function GET(request: Request) {
  try {
    const session = await auth()
    if (!session?.user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    const { searchParams } = new URL(request.url)
    const url = searchParams.get('url') || process.env.NEXT_PUBLIC_SITE_URL || 'https://shivatechdigital.com'

    const [mobile, desktop] = await Promise.all([
      runPageSpeed(url, 'mobile'),
      runPageSpeed(url, 'desktop'),
    ])

    try {
      await prisma.pageSpeedMetrics.create({
        data: {
          url,
          date: new Date(),
          mobilePerformance: mobile.performance,
          mobileSeo: mobile.seo,
          mobileAccessibility: mobile.accessibility,
          mobileBestPractices: mobile.bestPractices,
          mobileFcp: mobile.fcp.value,
          mobileLcp: mobile.lcp.value,
          mobileCls: mobile.cls.value,
          mobileTbt: mobile.tbt.value,
          performanceScore: desktop.performance,
          seoScore: desktop.seo,
          accessibilityScore: desktop.accessibility,
          bestPracticesScore: desktop.bestPractices,
          fcp: desktop.fcp.value,
          lcp: desktop.lcp.value,
          cls: desktop.cls.value,
          tbt: desktop.tbt.value,
          si: desktop.si.value,
          tti: desktop.tti.value,
        },
      })
    } catch (dbError) {
      console.error('DB save error:', dbError)
    }

    const history = await prisma.pageSpeedMetrics.findMany({
      where: { url },
      orderBy: { date: 'desc' },
      take: 30,
    })

    return NextResponse.json({
      success: true,
      url,
      mobile,
      desktop,
      history,
    })
  } catch (error: any) {
    console.error('PageSpeed API Error:', error)
    return NextResponse.json(
      { error: error.message || 'Failed to fetch PageSpeed data' },
      { status: 500 }
    )
  }
}
