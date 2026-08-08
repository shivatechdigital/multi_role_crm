'use client'

import { Card, CardContent } from '@/components/ui/card'
import { Skeleton } from '@/components/ui/skeleton'
import { LucideIcon } from 'lucide-react'
import { cn } from '@/lib/utils'

interface StatsCardProps {
  title: string
  value: number | string
  icon: LucideIcon
  isLoading?: boolean
  error?: any
  description?: string
  trend?: {
    value: number
    isPositive: boolean
  }
  highlight?: boolean
  color?: 'blue' | 'green' | 'purple' | 'orange' | 'red'
}

const colorClasses = {
  blue: 'from-blue-500/10 to-blue-500/5 text-blue-500',
  green: 'from-green-500/10 to-green-500/5 text-green-500',
  purple: 'from-purple-500/10 to-purple-500/5 text-purple-500',
  orange: 'from-orange-500/10 to-orange-500/5 text-orange-500',
  red: 'from-red-500/10 to-red-500/5 text-red-500',
}

export function StatsCard({
  title,
  value,
  icon: Icon,
  isLoading,
  error,
  description,
  trend,
  highlight = false,
  color = 'blue',
}: StatsCardProps) {
  return (
    <Card 
      className={cn(
        'overflow-hidden transition-all hover:shadow-md',
        highlight && 'border-primary shadow-sm'
      )}
    >
      <CardContent className="p-6">
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <p className="text-sm font-medium text-muted-foreground">{title}</p>
            
            {isLoading ? (
              <Skeleton className="h-8 w-24 mt-2" />
            ) : error ? (
              <p className="text-sm text-destructive mt-2">Error</p>
            ) : (
              <div className="mt-2">
                <p className="text-3xl font-bold tracking-tight">
                  {typeof value === 'number' ? value.toLocaleString() : value}
                </p>
                {description && (
                  <p className="text-xs text-muted-foreground mt-1">{description}</p>
                )}
                {trend && (
                  <div className="flex items-center gap-1 mt-2">
                    <span className={cn(
                      'text-xs font-medium',
                      trend.isPositive ? 'text-green-500' : 'text-red-500'
                    )}>
                      {trend.isPositive ? '↑' : '↓'} {Math.abs(trend.value)}%
                    </span>
                    <span className="text-xs text-muted-foreground">vs previous</span>
                  </div>
                )}
              </div>
            )}
          </div>
          
          <div className={cn(
            'w-12 h-12 rounded-xl bg-gradient-to-br flex items-center justify-center',
            colorClasses[color]
          )}>
            <Icon className="w-6 h-6" />
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
