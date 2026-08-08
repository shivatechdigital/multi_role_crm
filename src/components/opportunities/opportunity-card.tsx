// src/components/opportunities/opportunity-card.tsx

'use client'

import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import {
  TrendingUp,
  Target,
  Zap,
  AlertTriangle,
  ChevronRight,
  Sparkles,
  ExternalLink,
  ArrowUpRight,
} from 'lucide-react'
import type { Opportunity } from '@/lib/types/opportunities'

interface OpportunityCardProps {
  opportunity: Opportunity
}

export function OpportunityCard({ opportunity }: OpportunityCardProps) {
  const typeConfig = getTypeConfig(opportunity.type)
  const priorityConfig = getPriorityConfig(opportunity.priority)
  
  return (
    <Card className={`hover:border-primary/40 transition-all ${typeConfig.border}`}>
      <CardContent className="p-5">
        {/* Header */}
        <div className="flex items-start justify-between gap-3 mb-3">
          <div className="flex items-center gap-2 flex-wrap">
            <Badge variant="outline" className={`${typeConfig.bg} ${typeConfig.text} ${typeConfig.border} text-xs`}>
              <typeConfig.Icon className="h-3 w-3 mr-1" />
              {typeConfig.label}
            </Badge>
            <Badge variant="outline" className={`${priorityConfig.bg} ${priorityConfig.text} text-xs`}>
              {priorityConfig.label}
            </Badge>
          </div>
          
          {/* Impact Score */}
          <div className="text-right">
            <div className="text-xs text-muted-foreground">Impact</div>
            <div className={`text-lg font-bold ${getImpactColor(opportunity.impactScore)}`}>
              {opportunity.impactScore.toFixed(0)}
            </div>
          </div>
        </div>
        
        {/* Title */}
        <div className="mb-3">
          {opportunity.keyword && (
            <h3 className="font-semibold text-base mb-1 line-clamp-1">
              "{opportunity.keyword}"
            </h3>
          )}
          {opportunity.page && (
            <p className="text-xs text-muted-foreground font-mono truncate">
              {opportunity.page}
            </p>
          )}
        </div>
        
        {/* Stats Grid */}
        <div className="grid grid-cols-4 gap-2 mb-3 p-3 bg-muted/30 rounded-lg">
          <div className="text-center">
            <div className="text-[10px] uppercase text-muted-foreground font-semibold">Position</div>
            <div className="text-sm font-bold">#{opportunity.currentPosition.toFixed(0)}</div>
          </div>
          <div className="text-center">
            <div className="text-[10px] uppercase text-muted-foreground font-semibold">Clicks</div>
            <div className="text-sm font-bold">{opportunity.currentClicks}</div>
          </div>
          <div className="text-center">
            <div className="text-[10px] uppercase text-muted-foreground font-semibold">Impr.</div>
            <div className="text-sm font-bold">{opportunity.currentImpressions}</div>
          </div>
          <div className="text-center">
            <div className="text-[10px] uppercase text-muted-foreground font-semibold">CTR</div>
            <div className="text-sm font-bold">{opportunity.currentCtr.toFixed(1)}%</div>
          </div>
        </div>
        
        {/* Potential Gain */}
        {opportunity.potentialGain > 0 && (
          <div className="flex items-center gap-2 mb-3 p-2.5 bg-green-500/10 border border-green-500/20 rounded-lg">
            <ArrowUpRight className="h-4 w-4 text-green-400 flex-shrink-0" />
            <div className="flex-1 min-w-0">
              <p className="text-xs font-semibold text-green-400">
                +{opportunity.potentialGain} clicks/month potential
              </p>
              <p className="text-[10px] text-muted-foreground">
                {opportunity.currentClicks} → {opportunity.potentialClicks} clicks
              </p>
            </div>
          </div>
        )}
        
        {/* Reasoning */}
        <p className="text-xs text-muted-foreground mb-3 line-clamp-2">
          💡 {opportunity.reasoning}
        </p>
        
        {/* Recommendations */}
        <details className="group mb-3">
          <summary className="cursor-pointer text-xs font-semibold text-primary flex items-center gap-1 hover:text-primary/80">
            <Sparkles className="h-3 w-3" />
            View Recommendations ({opportunity.recommendations.length})
            <ChevronRight className="h-3 w-3 transition-transform group-open:rotate-90 ml-auto" />
          </summary>
          <ul className="mt-2 space-y-1 pl-4">
            {opportunity.recommendations.map((rec, idx) => (
              <li key={idx} className="text-xs text-muted-foreground flex items-start gap-2">
                <span className="text-primary mt-0.5">✓</span>
                <span>{rec}</span>
              </li>
            ))}
          </ul>
        </details>
        
        {/* Actions */}
        <div className="flex gap-2 pt-2 border-t border-border/40">
          {opportunity.page && (
            <Button
              variant="outline"
              size="sm"
              className="flex-1 h-8 text-xs"
              asChild
            >
              <a 
                href={opportunity.page.startsWith('http') ? opportunity.page : `https://shivatechdigital.com${opportunity.page}`}
                target="_blank"
                rel="noopener noreferrer"
              >
                <ExternalLink className="h-3 w-3 mr-1" />
                View Page
              </a>
            </Button>
          )}
          {opportunity.keyword && (
            <Button
              variant="outline"
              size="sm"
              className="flex-1 h-8 text-xs"
              asChild
            >
              <a 
                href={`https://www.google.com/search?q=${encodeURIComponent(opportunity.keyword)}`}
                target="_blank"
                rel="noopener noreferrer"
              >
                <ExternalLink className="h-3 w-3 mr-1" />
                Google
              </a>
            </Button>
          )}
        </div>
      </CardContent>
    </Card>
  )
}

function getTypeConfig(type: Opportunity['type']) {
  switch (type) {
    case 'quick_win':
      return {
        label: 'Quick Win',
        Icon: Zap,
        bg: 'bg-yellow-500/10',
        text: 'text-yellow-400',
        border: 'border-yellow-500/30',
      }
    case 'striking_distance':
      return {
        label: 'Striking Distance',
        Icon: Target,
        bg: 'bg-orange-500/10',
        text: 'text-orange-400',
        border: 'border-orange-500/30',
      }
    case 'ctr_issue':
      return {
        label: 'Low CTR',
        Icon: AlertTriangle,
        bg: 'bg-red-500/10',
        text: 'text-red-400',
        border: 'border-red-500/30',
      }
    case 'rising':
      return {
        label: 'Rising',
        Icon: TrendingUp,
        bg: 'bg-green-500/10',
        text: 'text-green-400',
        border: 'border-green-500/30',
      }
    case 'declining':
      return {
        label: 'Declining',
        Icon: TrendingUp,
        bg: 'bg-red-500/10',
        text: 'text-red-400',
        border: 'border-red-500/30',
      }
    default:
      return {
        label: 'Opportunity',
        Icon: Target,
        bg: 'bg-blue-500/10',
        text: 'text-blue-400',
        border: 'border-blue-500/30',
      }
  }
}

function getPriorityConfig(priority: Opportunity['priority']) {
  switch (priority) {
    case 'high':
      return { label: '🔥 High', bg: 'bg-red-500/10', text: 'text-red-400' }
    case 'medium':
      return { label: '⚡ Medium', bg: 'bg-yellow-500/10', text: 'text-yellow-400' }
    case 'low':
      return { label: '💡 Low', bg: 'bg-blue-500/10', text: 'text-blue-400' }
  }
}

function getImpactColor(score: number): string {
  if (score >= 100) return 'text-green-400'
  if (score >= 50) return 'text-yellow-400'
  if (score >= 20) return 'text-orange-400'
  return 'text-muted-foreground'
}
