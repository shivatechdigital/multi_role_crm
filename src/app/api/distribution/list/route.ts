// src/app/api/distribution/list/route.ts

import { NextResponse } from 'next/server'
import { auth } from '@/lib/auth/auth'
import { prisma } from '@/lib/db/prisma'

export async function GET(request: Request) {
  try {
    const session = await auth()
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const limit = parseInt(searchParams.get('limit') || '50')
    const status = searchParams.get('status')

    const distributions = await prisma.blogDistribution.findMany({
      where: status ? { status } : undefined,
      orderBy: { triggeredAt: 'desc' },
      take: limit,
      include: {
        posts: {
          orderBy: { platform: 'asc' },
        },
      },
    })

    // Calculate stats
    const totalDistributions = await prisma.blogDistribution.count()
    const platformStats = await prisma.platformConfig.findMany({
      orderBy: { successfulPosts: 'desc' },
    })

    const totalSuccessful = platformStats.reduce(
      (sum, p) => sum + p.successfulPosts,
      0
    )
    const totalFailed = platformStats.reduce(
      (sum, p) => sum + p.failedPosts,
      0
    )
    const totalPosts = totalSuccessful + totalFailed

    return NextResponse.json({
      success: true,
      stats: {
        totalDistributions,
        successfulPosts: totalSuccessful,
        failedPosts: totalFailed,
        pendingPosts: totalPosts - totalSuccessful - totalFailed,
        successRate: totalPosts > 0 ? (totalSuccessful / totalPosts) * 100 : 0,
        topPlatform: platformStats[0]?.platform || 'N/A',
      },
      platformStats,
      distributions,
    })
  } catch (error: any) {
    console.error('Distribution list error:', error)
    return NextResponse.json(
      { error: error.message || 'Failed to fetch' },
      { status: 500 }
    )
  }
}
