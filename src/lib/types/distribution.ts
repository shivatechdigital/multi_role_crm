// src/lib/types/distribution.ts

export type Platform = 
  | 'linkedin' 
  | 'medium' 
  | 'devto' 
  | 'hashnode' 
  | 'facebook' 
  | 'instagram' 
  | 'twitter' 
  | 'gbp'

export type DistributionStatus = 
  | 'pending' 
  | 'processing' 
  | 'completed' 
  | 'failed' 
  | 'partial'

export type PlatformPostStatus = 
  | 'pending' 
  | 'processing' 
  | 'success' 
  | 'failed'

export interface BlogDistributionInput {
  blogId?: string
  blogTitle: string
  blogSlug: string
  blogUrl: string
  blogExcerpt?: string
  blogContent?: string
  blogImage?: string
  blogCategory?: string
  blogTags?: string[]
}

export interface PlatformPostUpdate {
  platform: Platform
  status: PlatformPostStatus
  platformPostId?: string
  platformUrl?: string
  errorMessage?: string
}

export interface DistributionStats {
  totalDistributions: number
  successfulPosts: number
  failedPosts: number
  pendingPosts: number
  successRate: number
  topPlatform: string
}

export const PLATFORM_INFO: Record<Platform, {
  name: string
  icon: string
  color: string
  domain: string
}> = {
  linkedin: {
    name: 'LinkedIn',
    icon: '💼',
    color: 'blue',
    domain: 'linkedin.com',
  },
  medium: {
    name: 'Medium',
    icon: '📝',
    color: 'green',
    domain: 'medium.com',
  },
  devto: {
    name: 'Dev.to',
    icon: '💻',
    color: 'purple',
    domain: 'dev.to',
  },
  hashnode: {
    name: 'Hashnode',
    icon: '📰',
    color: 'indigo',
    domain: 'hashnode.com',
  },
  facebook: {
    name: 'Facebook',
    icon: '📘',
    color: 'blue',
    domain: 'facebook.com',
  },
  instagram: {
    name: 'Instagram',
    icon: '📷',
    color: 'pink',
    domain: 'instagram.com',
  },
  twitter: {
    name: 'Twitter/X',
    icon: '🐦',
    color: 'sky',
    domain: 'twitter.com',
  },
  gbp: {
    name: 'Google Business',
    icon: '🗺️',
    color: 'red',
    domain: 'business.google.com',
  },
}
