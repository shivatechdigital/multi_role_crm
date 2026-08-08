// src/components/seo-pages/page-card.tsx

'use client'

import Link from 'next/link'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import {
  ExternalLink,
  Pencil,
  TrendingUp,
  Eye,
  MousePointer,
  Target,
  Clock,
  CheckCircle2,
  AlertCircle,
} from 'lucide-react'
import type { PageListItem } from '@/lib/types/seo-pages'
import {
  getSeoScoreColor,
  getPageTypeColor,
  getUpdatedByColor,
  formatRelativeTime,
  getNicePageName,
} from '@/lib/utils/seo-helpers'

interface PageCardProps {
  page: PageListItem
}

export function PageCard({ page }: PageCardProps) {
  const scoreColor = getSeoScoreColor(page.seo_score)
  const typeColor = getPageTypeColor(page.type)
  const updatedByColor = getUpdatedByColor(page.last_updated_by)
  const niceName = getNicePageName(page.slug)
  
  // Title length check
  const titleLength = page.meta_title?.length || 0
  const titleOptimal = titleLength >= 30 && titleLength <= 60
  
  // Description length check
  const descLength = page.meta_description?.length || 0
  const descOptimal = descLength >= 120 && descLength <= 160
  
  return (
    <Card className="group hover:border-primary/40 transition-all duration-200 hover:shadow-lg hover:shadow-primary/5">
      <CardContent className="p-5">
        {/* Header Row */}
        <div className="flex items-start justify-between gap-3 mb-3">
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-1">
              <h3 className="font-semibold text-base truncate group-hover:text-primary transition-colors">
                {niceName}
              </h3>
              <Badge variant="outline" className={`${typeColor.bg} ${typeColor.text} ${typeColor.border} text-xs`}>
                {page.type}
              </Badge>
            </div>
            <p className="text-xs text-muted-foreground truncate font-mono">
              /{page.slug}
            </p>
          </div>
          
          {/* SEO Score Badge */}
          <div className={`flex flex-col items-center justify-center min-w-[64px] py-2 rounded-lg border ${scoreColor.bg} ${scoreColor.border}`}>
            <span className={`text-xl font-bold ${scoreColor.text}`}>
              {page.seo_score || 0}
            </span>
            <span className="text-[10px] text-muted-foreground font-medium">SCORE</span>
          </div>
        </div>
        
        {/* Meta Title Preview */}
        {page.meta_title && (
          <div className="mb-2">
            <div className="flex items-center justify-between mb-1">
              <span className="text-[10px] uppercase tracking-wider text-muted-foreground font-semibold">
                Meta Title
              </span>
              <span className={`text-[10px] font-mono ${titleOptimal ? 'text-green-400' : 'text-orange-400'}`}>
                {titleLength}/60
              </span>
            </div>
            <p className="text-xs text-foreground/80 line-clamp-1">
              {page.meta_title}
            </p>
          </div>
        )}
        
        {/* Meta Description Preview */}
        {page.meta_description && (
          <div className="mb-3">
            <div className="flex items-center justify-between mb-1">
              <span className="text-[10px] uppercase tracking-wider text-muted-foreground font-semibold">
                Description
              </span>
              <span className={`text-[10px] font-mono ${descOptimal ? 'text-green-400' : 'text-orange-400'}`}>
                {descLength}/160
              </span>
            </div>
            <p className="text-xs text-muted-foreground line-clamp-2">
              {page.meta_description}
            </p>
          </div>
        )}
        
        {/* Focus Keyword */}
        {page.focus_keyword && (
          <div className="flex items-center gap-2 mb-3 px-3 py-1.5 rounded-md bg-primary/5 border border-primary/10">
            <Target className="h-3 w-3 text-primary" />
            <span className="text-xs font-medium text-primary truncate">
              {page.focus_keyword}
            </span>
          </div>
        )}
        
        {/* Stats Row */}
        <div className="grid grid-cols-3 gap-2 mb-3 pb-3 border-b border-border/40">
          <div className="text-center">
            <div className="flex items-center justify-center gap-1 text-muted-foreground mb-0.5">
              <MousePointer className="h-3 w-3" />
              <span className="text-[10px] uppercase font-semibold">Clicks</span>
            </div>
            <p className="text-sm font-bold">{page.current_clicks}</p>
          </div>
          <div className="text-center">
            <div className="flex items-center justify-center gap-1 text-muted-foreground mb-0.5">
              <Eye className="h-3 w-3" />
              <span className="text-[10px] uppercase font-semibold">Impr.</span>
            </div>
            <p className="text-sm font-bold">{page.current_impressions}</p>
          </div>
          <div className="text-center">
            <div className="flex items-center justify-center gap-1 text-muted-foreground mb-0.5">
              <TrendingUp className="h-3 w-3" />
              <span className="text-[10px] uppercase font-semibold">Pos.</span>
            </div>
            <p className="text-sm font-bold">
              {page.current_position && Number(page.current_position) > 0
                ? Number(page.current_position).toFixed(1)
                : '-'}
            </p>
          </div>
        </div>
        
        {/* Footer Row */}
        <div className="flex items-center justify-between gap-2">
          {/* Last Updated */}
          <div className="flex items-center gap-2 text-xs text-muted-foreground min-w-0">
            <Clock className="h-3 w-3 flex-shrink-0" />
            <span className="truncate">
              {formatRelativeTime(page.last_optimized_at || page.updated_at)}
            </span>
            <span className={`px-1.5 py-0.5 rounded text-[10px] ${updatedByColor.bg} ${updatedByColor.text}`}>
              {updatedByColor.icon} {page.last_updated_by}
            </span>
          </div>
          
          {/* Actions */}
          <div className="flex items-center gap-1 flex-shrink-0">
            {page.url && (
              <Button
                size="icon"
                variant="ghost"
                className="h-7 w-7"
                asChild
              >
                <a 
                  href={page.url} 
                  target="_blank" 
                  rel="noopener noreferrer"
                  title="View live page"
                >
                  <ExternalLink className="h-3.5 w-3.5" />
                </a>
              </Button>
            )}
            <Button
              size="sm"
              variant="default"
              className="h-7 px-3 text-xs"
              asChild
            >
              <Link href={`/seo/pages/edit/${page.slug}`}>
                <Pencil className="h-3 w-3 mr-1" />
                Edit
              </Link>
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
