// src/components/seo-pages/editor/seo-score-badge.tsx

'use client'

import { Card, CardContent } from '@/components/ui/card'
import { TrendingUp, Award } from 'lucide-react'
import { getSeoScoreColor } from '@/lib/utils/seo-helpers'

interface SeoScoreBadgeProps {
  score: number
  className?: string
}

export function SeoScoreBadge({ score, className = '' }: SeoScoreBadgeProps) {
  const color = getSeoScoreColor(score)
  
  return (
    <Card className={`${color.bg} ${color.border} border ${className}`}>
      <CardContent className="p-4">
        <div className="flex items-center gap-3">
          <div className="p-2 rounded-lg bg-background/50">
            <Award className={`h-5 w-5 ${color.text}`} />
          </div>
          <div className="flex-1">
            <p className="text-xs text-muted-foreground uppercase tracking-wider font-semibold">
              SEO Score
            </p>
            <div className="flex items-baseline gap-2">
              <span className={`text-2xl font-bold ${color.text}`}>{score}</span>
              <span className="text-sm text-muted-foreground">/100</span>
              <span className={`text-xs font-medium ${color.text}`}>
                {color.label}
              </span>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
