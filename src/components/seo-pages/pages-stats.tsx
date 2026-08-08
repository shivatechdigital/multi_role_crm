// src/components/seo-pages/pages-stats.tsx

'use client'

import { Card, CardContent } from '@/components/ui/card'
import { Skeleton } from '@/components/ui/skeleton'
import {
  FileText,
  Target,
  Award,
  TrendingUp,
} from 'lucide-react'
import { useSeoPagesStats } from '@/hooks/use-seo-pages'

export function PagesStats() {
  const { data, isLoading } = useSeoPagesStats()
  const stats = data?.data?.pages
  
  const items = [
    {
      title: 'Total Pages',
      value: stats?.total ?? 0,
      icon: FileText,
      color: 'blue',
      description: 'All managed pages',
    },
    {
      title: 'Optimized',
      value: stats?.optimized ?? 0,
      icon: Target,
      color: 'green',
      description: 'With focus keyword',
    },
    {
      title: 'With Schema',
      value: stats?.with_schema ?? 0,
      icon: Award,
      color: 'purple',
      description: 'Schema markup added',
    },
    {
      title: 'Avg SEO Score',
      value: stats?.avg_seo_score ?? 0,
      icon: TrendingUp,
      color: 'orange',
      description: 'Overall health',
      suffix: '/100',
    },
  ]
  
  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
      {items.map((item) => (
        <StatCard
          key={item.title}
          {...item}
          isLoading={isLoading}
        />
      ))}
    </div>
  )
}

function StatCard({
  title,
  value,
  icon: Icon,
  color,
  description,
  suffix,
  isLoading,
}: {
  title: string
  value: number
  icon: any
  color: string
  description: string
  suffix?: string
  isLoading: boolean
}) {
  const colorClasses = {
    blue: 'bg-blue-500/10 text-blue-400 border-blue-500/20',
    green: 'bg-green-500/10 text-green-400 border-green-500/20',
    purple: 'bg-purple-500/10 text-purple-400 border-purple-500/20',
    orange: 'bg-orange-500/10 text-orange-400 border-orange-500/20',
  }
  
  return (
    <Card>
      <CardContent className="p-5">
        {isLoading ? (
          <div className="space-y-3">
            <Skeleton className="h-4 w-24" />
            <Skeleton className="h-8 w-16" />
            <Skeleton className="h-3 w-32" />
          </div>
        ) : (
          <div className="flex items-start justify-between">
            <div className="flex-1">
              <p className="text-sm font-medium text-muted-foreground">{title}</p>
              <p className="text-3xl font-bold mt-1">
                {value}
                {suffix && <span className="text-base text-muted-foreground ml-1">{suffix}</span>}
              </p>
              <p className="text-xs text-muted-foreground mt-2">{description}</p>
            </div>
            <div className={`p-2.5 rounded-lg border ${colorClasses[color as keyof typeof colorClasses]}`}>
              <Icon className="h-5 w-5" />
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  )
}
