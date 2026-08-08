'use client'

import { Card, CardContent } from '@/components/ui/card'
import { Skeleton } from '@/components/ui/skeleton'
import { useKeywords } from '@/hooks/use-seo-data'
import { DateRangePicker } from '@/components/dashboard/date-range-picker'
import { DataTable } from '@/components/dashboard/data-table/data-table'
import { keywordsColumns } from '@/components/dashboard/data-table/keywords-columns'
import {
  Trophy,
  Target,
  TrendingUp,
  Eye,
  MousePointer,
  Search,
} from 'lucide-react'
import { StatsCard } from '@/components/dashboard/stats-card'

export default function KeywordsPage() {
  const { data, isLoading, error } = useKeywords(100)

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Keywords Tracker 🎯</h1>
          <p className="text-muted-foreground mt-1">
            Detailed analysis of all your search keywords
          </p>
        </div>
        <DateRangePicker />
      </div>

      {/* Stats */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <StatsCard
          title="Total Keywords"
          value={data?.stats?.total || 0}
          icon={Search}
          isLoading={isLoading}
          description="Tracked queries"
          color="blue"
        />
        <StatsCard
          title="Total Clicks"
          value={data?.stats?.totalClicks || 0}
          icon={MousePointer}
          isLoading={isLoading}
          description="From all keywords"
          color="green"
        />
        <StatsCard
          title="Avg Position"
          value={data?.stats?.avgPosition || '0'}
          icon={TrendingUp}
          isLoading={isLoading}
          description="Average ranking"
          color="orange"
        />
        <StatsCard
          title="Avg CTR"
          value={`${data?.stats?.avgCTR || '0'}%`}
          icon={Eye}
          isLoading={isLoading}
          description="Click-through rate"
          color="purple"
        />
      </div>

      {/* Position Distribution */}
      <div className="grid gap-4 md:grid-cols-4">
        <PositionCard
          title="Top 3"
          value={data?.stats?.top3 || 0}
          total={data?.stats?.total || 0}
          icon="🏆"
          color="bg-yellow-500/10 border-yellow-500/30"
          isLoading={isLoading}
        />
        <PositionCard
          title="Top 10"
          value={data?.stats?.top10 || 0}
          total={data?.stats?.total || 0}
          icon="🥇"
          color="bg-green-500/10 border-green-500/30"
          isLoading={isLoading}
        />
        <PositionCard
          title="Top 20"
          value={data?.stats?.top20 || 0}
          total={data?.stats?.total || 0}
          icon="📈"
          color="bg-blue-500/10 border-blue-500/30"
          isLoading={isLoading}
        />
        <PositionCard
          title="Beyond 20"
          value={data?.stats?.beyond20 || 0}
          total={data?.stats?.total || 0}
          icon="📊"
          color="bg-gray-500/10 border-gray-500/30"
          isLoading={isLoading}
        />
      </div>

      {/* Keywords Table */}
      <Card>
        <CardContent className="p-6">
          {isLoading ? (
            <div className="space-y-2">
              {[...Array(10)].map((_, i) => (
                <Skeleton key={i} className="h-12 w-full" />
              ))}
            </div>
          ) : error ? (
            <div className="text-center py-12">
              <p className="text-destructive">Failed to load keywords</p>
              <p className="text-sm text-muted-foreground mt-1">
                {(error as any).message}
              </p>
            </div>
          ) : (
            <DataTable
              columns={keywordsColumns}
              data={data?.keywords || []}
              searchPlaceholder="Search keywords..."
              exportFilename="keywords"
            />
          )}
        </CardContent>
      </Card>
    </div>
  )
}

function PositionCard({
  title,
  value,
  total,
  icon,
  color,
  isLoading,
}: {
  title: string
  value: number
  total: number
  icon: string
  color: string
  isLoading: boolean
}) {
  const percentage = total > 0 ? ((value / total) * 100).toFixed(1) : '0'

  return (
    <Card className={`border ${color}`}>
      <CardContent className="p-4">
        {isLoading ? (
          <Skeleton className="h-16 w-full" />
        ) : (
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-muted-foreground">{title}</p>
              <p className="text-2xl font-bold mt-1">{value}</p>
              <p className="text-xs text-muted-foreground mt-1">{percentage}% of total</p>
            </div>
            <span className="text-3xl">{icon}</span>
          </div>
        )}
      </CardContent>
    </Card>
  )
}
