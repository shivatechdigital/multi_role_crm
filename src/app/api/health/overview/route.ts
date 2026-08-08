import { NextResponse } from 'next/server'
import { auth } from '@/lib/auth/auth'
import { prisma } from '@/lib/db/prisma'

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000'

export async function GET() {
  try {
    const session = await auth()
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Get latest PageSpeed scores
    const latestPageSpeed = await prisma.pageSpeedMetrics.findMany({
      where: { url: SITE_URL },
      orderBy: { date: 'desc' },
      take: 2,
    })

    const mobile = latestPageSpeed.find(p => p.strategy === 'mobile')
    const desktop = latestPageSpeed.find(p => p.strategy === 'desktop')

    // Get latest uptime
    const latestUptime = await prisma.uptimeCheck.findFirst({
      orderBy: { timestamp: 'desc' },
    })

    // Calculate 24h uptime
    const yesterday = new Date()
    yesterday.setHours(yesterday.getHours() - 24)
    
    const recentChecks = await prisma.uptimeCheck.findMany({
      where: { timestamp: { gte: yesterday } },
    })

    const uptimePercent = recentChecks.length > 0
      ? (recentChecks.filter(c => c.status === 'UP').length / recentChecks.length) * 100
      : 100

    // Get active issues
    const issues = await prisma.technicalIssue.findMany({
      where: { status: 'open' },
      orderBy: { detectedAt: 'desc' },
      take: 10,
    })

    // SEO health checks
    const seoChecks = await runSeoChecks()

    return NextResponse.json({
      success: true,
      pagespeed: {
        mobile: mobile ? {
          performance: mobile.performanceScore,
          seo: mobile.seoScore,
          accessibility: mobile.accessibilityScore,
          bestPractices: mobile.bestPracticesScore,
          lastChecked: mobile.date,
        } : null,
        desktop: desktop ? {
          performance: desktop.performanceScore,
          seo: desktop.seoScore,
          accessibility: desktop.accessibilityScore,
          bestPractices: desktop.bestPracticesScore,
          lastChecked: desktop.date,
        } : null,
      },
      uptime: {
        status: latestUptime?.status || 'UNKNOWN',
        responseTime: latestUptime?.responseTime || 0,
        uptime24h: uptimePercent.toFixed(2),
        lastChecked: latestUptime?.timestamp || null,
      },
      issues: {
        total: issues.length,
        list: issues,
      },
      seo: seoChecks,
    })
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message || 'Failed to fetch health data' },
      { status: 500 }
    )
  }
}

async function runSeoChecks() {
  const checks = []

  try {
    // Check sitemap.xml
    try {
      const sitemapResponse = await fetch(`${SITE_URL}/sitemap.xml`, {
        signal: AbortSignal.timeout(5000),
      })
      checks.push({
        name: 'Sitemap',
        status: sitemapResponse.ok ? 'PASS' : 'FAIL',
        message: sitemapResponse.ok ? 'Sitemap is accessible' : 'Sitemap not found',
        critical: true,
      })
    } catch {
      checks.push({
        name: 'Sitemap',
        status: 'FAIL',
        message: 'Could not check sitemap',
        critical: true,
      })
    }

    // Check robots.txt
    try {
      const robotsResponse = await fetch(`${SITE_URL}/robots.txt`, {
        signal: AbortSignal.timeout(5000),
      })
      checks.push({
        name: 'Robots.txt',
        status: robotsResponse.ok ? 'PASS' : 'FAIL',
        message: robotsResponse.ok ? 'Robots.txt is accessible' : 'Robots.txt not found',
        critical: false,
      })
    } catch {
      checks.push({
        name: 'Robots.txt',
        status: 'FAIL',
        message: 'Could not check robots.txt',
        critical: false,
      })
    }

    // Check HTTPS
    try {
      const httpsResponse = await fetch(SITE_URL, {
        method: 'HEAD',
        signal: AbortSignal.timeout(5000),
      })
      const isHttps = SITE_URL.startsWith('https://')
      checks.push({
        name: 'HTTPS',
        status: isHttps && httpsResponse.ok ? 'PASS' : 'FAIL',
        message: isHttps ? 'Site uses HTTPS' : 'Site should use HTTPS',
        critical: true,
      })
    } catch {
      checks.push({
        name: 'HTTPS',
        status: 'FAIL',
        message: 'Could not check HTTPS',
        critical: true,
      })
    }
  } catch (error) {
    console.error('SEO checks error:', error)
  }

  const passed = checks.filter(c => c.status === 'PASS').length
  const failed = checks.filter(c => c.status === 'FAIL').length
  const criticalFailed = checks.filter(c => c.status === 'FAIL' && c.critical).length

  return {
    score: checks.length > 0 ? Math.round((passed / checks.length) * 100) : 0,
    passed,
    failed,
    criticalFailed,
    checks,
  }
}
