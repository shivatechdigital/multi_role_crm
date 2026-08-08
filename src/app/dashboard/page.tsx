'use client'

import { useSession } from 'next-auth/react'
import { useSeoOverview, useAnalyticsOverview } from '@/hooks/use-dashboard-data'
import { StatsCard } from '@/components/dashboard/stats-card'
import { DateRangePicker } from '@/components/dashboard/date-range-picker'
import { TrafficChart } from '@/components/dashboard/charts/traffic-chart'
import { SeoChart } from '@/components/dashboard/charts/seo-chart'
import { SourcesChart } from '@/components/dashboard/charts/sources-chart'
import { DevicesChart } from '@/components/dashboard/charts/devices-chart'
import { KeywordsChart } from '@/components/dashboard/charts/keywords-chart'
import {
  Users,
  MousePointer,
  Eye,
  TrendingUp,
  Globe,
  ArrowDown,
  Sparkles,
  FileText,
} from 'lucide-react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Skeleton } from '@/components/ui/skeleton'

export default function DashboardPage() {
  const { data: session } = useSession()
  const { data: seoData, isLoading: seoLoading, error: seoError } = useSeoOverview()
  const { data: analyticsData, isLoading: analyticsLoading, error: analyticsError } = useAnalyticsOverview()

  const userName = session?.user?.name?.split(' ')[0] || 'User'

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight sm:text-3xl">
            Welcome back, {userName}! 👋
          </h1>
          <p className="text-muted-foreground mt-1">
            Here's an overview of your website performance
          </p>
        </div>
        <DateRangePicker />
      </div>

      {/* Primary Stats */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <StatsCard
          title="Total Users"
          value={analyticsData?.overview?.users || 0}
          icon={Users}
          isLoading={analyticsLoading}
          error={analyticsError}
          description="Unique visitors"
          color="blue"
        />
        <StatsCard
          title="Total Clicks"
          value={seoData?.overview?.clicks || 0}
          icon={MousePointer}
          isLoading={seoLoading}
          error={seoError}
          description="From Google Search"
          color="green"
        />
        <StatsCard
          title="Impressions"
          value={seoData?.overview?.impressions || 0}
          icon={Eye}
          isLoading={seoLoading}
          error={seoError}
          description="Search visibility"
          color="purple"
        />
        <StatsCard
          title="Avg Position"
          value={seoData?.overview?.position?.toFixed(1) || '0'}
          icon={TrendingUp}
          isLoading={seoLoading}
          error={seoError}
          description="Search ranking"
          color="orange"
        />
      </div>

      {/* Secondary Stats */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <StatsCard
          title="Sessions"
          value={analyticsData?.overview?.sessions || 0}
          icon={Globe}
          isLoading={analyticsLoading}
          description="Total sessions"
          color="blue"
        />
        <StatsCard
          title="Pageviews"
          value={analyticsData?.overview?.pageviews || 0}
          icon={FileText}
          isLoading={analyticsLoading}
          description="Total page views"
          color="purple"
        />
        <StatsCard
          title="Bounce Rate"
          value={`${analyticsData?.overview?.bounceRate?.toFixed(1) || '0'}%`}
          icon={ArrowDown}
          isLoading={analyticsLoading}
          description="Single page visits"
          color="orange"
        />
        <StatsCard
          title="Live Users"
          value={analyticsData?.realtime || 0}
          icon={Sparkles}
          isLoading={analyticsLoading}
          description="Active right now"
          highlight
          color="green"
        />
      </div>

      {/* Main Charts Row */}
      <div className="grid gap-4 lg:grid-cols-2">
        <TrafficChart 
          data={analyticsData?.daily || []} 
          isLoading={analyticsLoading} 
        />
        <SeoChart 
          data={seoData?.daily || []} 
          isLoading={seoLoading} 
        />
      </div>

      {/* Keywords Chart - Full Width */}
      <KeywordsChart 
        data={seoData?.keywords || []} 
        isLoading={seoLoading} 
      />

      {/* Sources & Devices Row */}
      <div className="grid gap-4 lg:grid-cols-2">
        <SourcesChart 
          data={analyticsData?.sources || []} 
          isLoading={analyticsLoading} 
        />
        <DevicesChart 
          data={seoData?.devices || []} 
          isLoading={seoLoading} 
        />
      </div>

      {/* Top Pages & Countries */}
      <div className="grid gap-4 lg:grid-cols-2">
        <TopPagesList 
          data={analyticsData?.pages || []} 
          isLoading={analyticsLoading} 
        />
        <TopCountriesList 
          data={seoData?.countries || []} 
          isLoading={seoLoading} 
        />
      </div>

      {/* Error Display */}
      {(seoError || analyticsError) && (
        <Card className="border-destructive">
          <CardHeader>
            <CardTitle className="text-destructive">⚠️ Data Loading Issues</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            {seoError && (
              <p className="text-sm">
                <strong>SEO:</strong> {(seoError as any).message}
              </p>
            )}
            {analyticsError && (
              <p className="text-sm">
                <strong>Analytics:</strong> {(analyticsError as any).message}
              </p>
            )}
          </CardContent>
        </Card>
      )}
    </div>
  )
}

function TopPagesList({ data, isLoading }: { data: any[]; isLoading: boolean }) {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">📄 Top Pages</CardTitle>
        <CardDescription>Most viewed pages on your site</CardDescription>
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <div className="space-y-2">
            {[...Array(5)].map((_, i) => (
              <Skeleton key={i} className="h-14 w-full" />
            ))}
          </div>
        ) : data.length === 0 ? (
          <p className="text-sm text-muted-foreground text-center py-8">
            No data available
          </p>
        ) : (
          <div className="space-y-2">
            {data.slice(0, 5).map((page: any, i: number) => (
              <div
                key={i}
                className="group flex flex-col gap-3 rounded-lg bg-muted/50 p-3 transition-colors hover:bg-muted sm:flex-row sm:items-center sm:justify-between"
              >
                <div className="flex items-center gap-3 flex-1 min-w-0">
                  <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center text-xs font-bold text-primary flex-shrink-0">
                    {i + 1}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-medium text-sm truncate">{page.pageTitle || page.pageUrl}</p>
                    <p className="text-xs text-muted-foreground truncate">{page.pageUrl}</p>
                  </div>
                </div>
                <div className="ml-0 text-left sm:ml-2 sm:text-right">
                  <p className="font-bold text-sm">{page.pageviews.toLocaleString()}</p>
                  <p className="text-xs text-muted-foreground">views</p>
                </div>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  )
}

function TopCountriesList({ data, isLoading }: { data: any[]; isLoading: boolean }) {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">🌍 Top Countries</CardTitle>
        <CardDescription>Geographic distribution of search traffic</CardDescription>
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <div className="space-y-2">
            {[...Array(5)].map((_, i) => (
              <Skeleton key={i} className="h-14 w-full" />
            ))}
          </div>
        ) : data.length === 0 ? (
          <p className="text-sm text-muted-foreground text-center py-8">
            No data available
          </p>
        ) : (
          <div className="space-y-2">
            {data.slice(0, 5).map((country: any, i: number) => (
              <div
                key={i}
                className="flex flex-col gap-3 rounded-lg bg-muted/50 p-3 transition-colors hover:bg-muted sm:flex-row sm:items-center sm:justify-between"
              >
                <div className="flex flex-wrap items-center gap-3">
                  <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center text-xs font-bold text-primary">
                    {i + 1}
                  </div>
                  <div>
                    <p className="font-medium text-sm uppercase">{country.country}</p>
                    <p className="text-xs text-muted-foreground">
                      {country.impressions} impressions
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <Badge variant="secondary">Pos {country.position.toFixed(1)}</Badge>
                  <p className="font-bold text-sm">{country.clicks}</p>
                </div>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  )
}
