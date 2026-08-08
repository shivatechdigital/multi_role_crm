// src/components/distribution/distribution-card.tsx

'use client'

import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { 
  CheckCircle2, 
  XCircle, 
  Clock, 
  ExternalLink,
  AlertCircle,
  Loader2,
} from 'lucide-react'
import { PLATFORM_INFO, type Platform } from '@/lib/types/distribution'
import { formatRelativeTime } from '@/lib/utils/seo-helpers'

interface DistributionCardProps {
  distribution: any
}

export function DistributionCard({ distribution }: DistributionCardProps) {
  const statusConfig = getStatusConfig(distribution.status)
  
  return (
    <Card className="hover:border-primary/40 transition-all">
      <CardContent className="p-5">
        {/* Header */}
        <div className="flex items-start justify-between gap-3 mb-4">
          <div className="flex-1 min-w-0">
            <h3 className="font-semibold text-base mb-1 line-clamp-2">
              {distribution.blogTitle}
            </h3>
            <div className="flex flex-wrap items-center gap-2 text-xs text-muted-foreground">
              {distribution.blogCategory && (
                <Badge variant="outline" className="text-xs">
                  {distribution.blogCategory}
                </Badge>
              )}
              <span>•</span>
              <span>{formatRelativeTime(distribution.triggeredAt)}</span>
            </div>
          </div>
          <Badge 
            variant="outline" 
            className={`${statusConfig.bg} ${statusConfig.text} ${statusConfig.border}`}
          >
            <statusConfig.Icon className="h-3 w-3 mr-1" />
            {statusConfig.label}
          </Badge>
        </div>
        
        {/* Progress Bar */}
        <div className="mb-4">
          <div className="flex items-center justify-between text-xs text-muted-foreground mb-1.5">
            <span>Progress</span>
            <span>
              {distribution.successCount} / {distribution.totalPlatforms} platforms
            </span>
          </div>
          <div className="h-2 bg-muted rounded-full overflow-hidden">
            <div 
              className="h-full bg-gradient-to-r from-green-500 to-blue-500 transition-all"
              style={{ 
                width: `${(distribution.successCount / distribution.totalPlatforms) * 100}%` 
              }}
            />
          </div>
        </div>
        
        {/* Platform Posts Grid */}
        <div className="mb-4 grid grid-cols-2 gap-2 sm:grid-cols-4">
          {distribution.posts.map((post: any) => (
            <PlatformPostBadge key={post.id} post={post} />
          ))}
        </div>
        
        {/* Actions */}
        <div className="flex flex-col gap-2 border-t border-border/40 pt-3 sm:flex-row">
          <Button
            variant="outline"
            size="sm"
            className="flex-1 h-8 text-xs"
            asChild
          >
            <a 
              href={distribution.blogUrl}
              target="_blank"
              rel="noopener noreferrer"
            >
              <ExternalLink className="h-3 w-3 mr-1" />
              View Blog
            </a>
          </Button>
          
          {distribution.successCount > 0 && (
            <Button
              variant="outline"
              size="sm"
              className="h-8 text-xs sm:w-auto"
            >
              <CheckCircle2 className="h-3 w-3 mr-1 text-green-400" />
              {distribution.successCount} Posted
            </Button>
          )}
        </div>
      </CardContent>
    </Card>
  )
}

function PlatformPostBadge({ post }: { post: any }) {
  const info = PLATFORM_INFO[post.platform as Platform]
  if (!info) return null
  
  const statusConfig = getPostStatusConfig(post.status)
  
  return (
    <div
      title={`${info.name}: ${post.status}${post.errorMessage ? ' - ' + post.errorMessage : ''}`}
      className={`relative flex flex-col items-center justify-center p-2 rounded-lg border ${statusConfig.bg} ${statusConfig.border} cursor-pointer hover:scale-105 transition-transform`}
    >
      <span className="text-lg leading-none mb-1">{info.icon}</span>
      <span className="text-[9px] uppercase font-semibold tracking-wider text-muted-foreground">
        {info.name.split(' ')[0]}
      </span>
      <div className="absolute -top-1 -right-1">
        <statusConfig.Icon className={`h-3 w-3 ${statusConfig.text}`} />
      </div>
      
      {post.status === 'success' && post.platformUrl && (
        <a 
          href={post.platformUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="absolute inset-0 z-10"
          onClick={(e) => e.stopPropagation()}
        />
      )}
    </div>
  )
}

function getStatusConfig(status: string) {
  switch (status) {
    case 'completed':
      return {
        label: 'Completed',
        Icon: CheckCircle2,
        bg: 'bg-green-500/10',
        text: 'text-green-400',
        border: 'border-green-500/30',
      }
    case 'processing':
      return {
        label: 'Processing',
        Icon: Loader2,
        bg: 'bg-blue-500/10',
        text: 'text-blue-400',
        border: 'border-blue-500/30',
      }
    case 'partial':
      return {
        label: 'Partial',
        Icon: AlertCircle,
        bg: 'bg-yellow-500/10',
        text: 'text-yellow-400',
        border: 'border-yellow-500/30',
      }
    case 'failed':
      return {
        label: 'Failed',
        Icon: XCircle,
        bg: 'bg-red-500/10',
        text: 'text-red-400',
        border: 'border-red-500/30',
      }
    default:
      return {
        label: 'Pending',
        Icon: Clock,
        bg: 'bg-gray-500/10',
        text: 'text-gray-400',
        border: 'border-gray-500/30',
      }
  }
}

function getPostStatusConfig(status: string) {
  switch (status) {
    case 'success':
      return {
        Icon: CheckCircle2,
        bg: 'bg-green-500/5',
        text: 'text-green-400',
        border: 'border-green-500/20',
      }
    case 'failed':
      return {
        Icon: XCircle,
        bg: 'bg-red-500/5',
        text: 'text-red-400',
        border: 'border-red-500/20',
      }
    case 'processing':
      return {
        Icon: Loader2,
        bg: 'bg-blue-500/5',
        text: 'text-blue-400',
        border: 'border-blue-500/20',
      }
    default:
      return {
        Icon: Clock,
        bg: 'bg-gray-500/5',
        text: 'text-gray-400',
        border: 'border-gray-500/20',
      }
  }
}
