// src/app/api/distribution/update/route.ts

import { NextResponse } from 'next/server'
import { prisma } from '@/lib/db/prisma'
import type { PlatformPostStatus } from '@/lib/types/distribution'

const SYNC_SECRET = process.env.SYNC_SECRET || 'change-this-secret'

export async function POST(request: Request) {
  try {
    const authHeader = request.headers.get('authorization')
    if (authHeader !== `Bearer ${SYNC_SECRET}`) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()
    const { postId, status, platformPostId, platformUrl, errorMessage } = body

    if (!postId || !status) {
      return NextResponse.json(
        { error: 'postId and status are required' },
        { status: 400 }
      )
    }

    // Update the platform post
    const post = await prisma.platformPost.update({
      where: { id: postId },
      data: {
        status: status as PlatformPostStatus,
        platformPostId,
        platformUrl,
        errorMessage,
        postedAt: status === 'success' ? new Date() : undefined,
      },
      include: {
        distribution: {
          include: { posts: true },
        },
      },
    })

    // Update platform config stats
    await prisma.platformConfig.update({
      where: { platform: post.platform },
      data: {
        totalPosts: { increment: 1 },
        successfulPosts: status === 'success' ? { increment: 1 } : undefined,
        failedPosts: status === 'failed' ? { increment: 1 } : undefined,
        lastUsedAt: new Date(),
      },
    })

    // Check if all posts are complete
    const allPosts = post.distribution.posts
    const completedPosts = allPosts.filter(
      (p) => p.status === 'success' || p.status === 'failed'
    )

    if (completedPosts.length === allPosts.length) {
      // All posts complete - update distribution
      const successCount = allPosts.filter((p) => p.status === 'success').length
      const failureCount = allPosts.filter((p) => p.status === 'failed').length

      let finalStatus: string = 'completed'
      if (successCount === 0) finalStatus = 'failed'
      else if (failureCount > 0) finalStatus = 'partial'

      await prisma.blogDistribution.update({
        where: { id: post.distributionId },
        data: {
          status: finalStatus,
          successCount,
          failureCount,
          completedAt: new Date(),
        },
      })
    }

    return NextResponse.json({
      success: true,
      post,
    })
  } catch (error: any) {
    console.error('Distribution update error:', error)
    return NextResponse.json(
      { error: error.message || 'Failed to update' },
      { status: 500 }
    )
  }
}
