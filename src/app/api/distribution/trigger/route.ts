// src/app/api/distribution/trigger/route.ts

import { NextResponse } from 'next/server'
import { prisma } from '@/lib/db/prisma'
import type { BlogDistributionInput, Platform } from '@/lib/types/distribution'

// Secret for n8n auth
const SYNC_SECRET = process.env.SYNC_SECRET || 'change-this-secret'

export async function POST(request: Request) {
  try {
    // Verify secret
    const authHeader = request.headers.get('authorization')
    if (authHeader !== `Bearer ${SYNC_SECRET}`) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json() as BlogDistributionInput

    // Validate required fields
    if (!body.blogTitle || !body.blogUrl) {
      return NextResponse.json(
        { error: 'blogTitle and blogUrl are required' },
        { status: 400 }
      )
    }

    console.log('🚀 New blog distribution triggered:', body.blogTitle)

    // Get enabled platforms
    const platforms = await prisma.platformConfig.findMany({
      where: { isEnabled: true },
      orderBy: { postDelay: 'asc' },
    })

    if (platforms.length === 0) {
      return NextResponse.json(
        { error: 'No enabled platforms' },
        { status: 400 }
      )
    }

    // Create distribution record
    const distribution = await prisma.blogDistribution.create({
      data: {
        blogId: body.blogId,
        blogTitle: body.blogTitle,
        blogSlug: body.blogSlug,
        blogUrl: body.blogUrl,
        blogExcerpt: body.blogExcerpt,
        blogContent: body.blogContent,
        blogImage: body.blogImage,
        blogCategory: body.blogCategory,
        blogTags: body.blogTags || [],
        status: 'processing',
        totalPlatforms: platforms.length,
        posts: {
          create: platforms.map((p) => ({
            platform: p.platform,
            status: 'pending',
          })),
        },
      },
      include: {
        posts: true,
      },
    })

    // Return task list for n8n
    const tasks = distribution.posts.map((post) => {
      const platformConfig = platforms.find((p) => p.platform === post.platform)
      return {
        postId: post.id,
        platform: post.platform,
        delay: platformConfig?.postDelay || 60,
        blog: {
          title: body.blogTitle,
          slug: body.blogSlug,
          url: body.blogUrl,
          excerpt: body.blogExcerpt,
          content: body.blogContent,
          image: body.blogImage,
          category: body.blogCategory,
          tags: body.blogTags || [],
        },
      }
    })

    return NextResponse.json({
      success: true,
      distributionId: distribution.id,
      totalPlatforms: platforms.length,
      tasks,
    })
  } catch (error: any) {
    console.error('Distribution trigger error:', error)
    return NextResponse.json(
      { error: error.message || 'Failed to trigger distribution' },
      { status: 500 }
    )
  }
}

// Health check
export async function GET() {
  return NextResponse.json({
    endpoint: 'Blog Distribution Trigger',
    method: 'POST',
    auth: 'Bearer token required',
    body: {
      blogId: 'string (optional)',
      blogTitle: 'string (required)',
      blogSlug: 'string (required)',
      blogUrl: 'string (required)',
      blogExcerpt: 'string (optional)',
      blogContent: 'string (optional)',
      blogImage: 'string (optional)',
      blogCategory: 'string (optional)',
      blogTags: 'string[] (optional)',
    },
  })
}
