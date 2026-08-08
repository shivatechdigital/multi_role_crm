'use client'

import { useSeoOverview } from '@/hooks/use-dashboard-data'
import { useKeywords, usePages } from '@/hooks/use-seo-data'
import { StatsCard } from '@/components/dashboard/stats-card'
import { DateRangePicker } from '@/components/dashboard/date-range-picker'
import { SeoChart } from '@/components/dashboard/charts/seo-chart'
import { KeywordsChart } from '@/components/dashboard/charts/keywords-chart'
import { DevicesChart } from '@/components/dashboard/charts/devices-chart'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Skeleton } from '@/components/ui/skeleton'
import {
  MousePointer,
  Eye,
  TrendingUp,
  Search,
  Target,
  Sparkles,
  ArrowRight,
  Globe,
} from 'lucide-react'
import Link from 'next/link'

export default function SeoOverviewPage() {
  const { data: seoData, isLoading: seoLoading } = useSeoOverview()
  const { data: keywordsData, isLoading: keywordsLoading } = useKeywords(50)
  const { data: pagesData, isLoading: pagesLoading } = usePages(50)

  // Calculate insights
  const opportunities = keywordsData?.keywords?.filter(
    (k: any) => k.position > 10 && k.position <= 20 && k.impressions > 100
  ) || []

  const lowCTR = keywordsData?.keywords?.filter(
    (k: any) => k.position <= 10 && k.ctr < 2
  ) || []

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">SEO Overview 📈</h1>
          <p className="text-muted-foreground mt-1">
            Complete search engine optimization dashboard
          </p>
        </div>
        <DateRangePicker />
      </div>

      {/* Main Stats */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <StatsCard
          title="Total Clicks"
          value={seoData?.overview?.clicks || 0}
          icon={MousePointer}
          isLoading={seoLoading}
          description="From Google Search"
          color="blue"
        />
        <StatsCard
          title="Impressions"
          value={seoData?.overview?.impressions || 0}
          icon={Eye}
          isLoading={seoLoading}
          description="Search visibility"
          color="purple"
        />
        <StatsCard
          title="Avg CTR"
          value={`${seoData?.overview?.ctr?.toFixed(2) || '0'}%`}
          icon={Target}
          isLoading={seoLoading}
          description="Click-through rate"
          color="green"
        />
        <StatsCard
          title="Avg Position"
          value={seoData?.overview?.position?.toFixed(1) || '0'}
          icon={TrendingUp}
          isLoading={seoLoading}
          description="Average ranking"
          color="orange"
        />
      </div>

      {/* Charts */}
      <div className="grid gap-4 lg:grid-cols-2">
        <SeoChart data={seoData?.daily || []} isLoading={seoLoading} />
        <DevicesChart data={seoData?.devices || []} isLoading={seoLoading} />
      </div>

      <KeywordsChart data={seoData?.keywords || []} isLoading={seoLoading} />

      {/* SEO Opportunities */}
      <div className="grid gap-4 lg:grid-cols-2">
        {/* Quick Win Keywords */}
        <Card className="border-orange-500/30">
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="flex items-center gap-2">
                  🎯 Quick Win Opportunities
                </CardTitle>
                <CardDescription>
                  Keywords on page 2 - push them to page 1!
                </CardDescription>
              </div>
              <Badge variant="outline" className="border-orange-500/50 text-orange-500">
                {opportunities.length} found
              </Badge>
            </div>
          </CardHeader>
          <CardContent>
            {keywordsLoading ? (
              <div className="space-y-2">
                {[...Array(3)].map((_, i) => (
                  <Skeleton key={i} className="h-14 w-full" />
                ))}
              </div>
            ) : opportunities.length === 0 ? (
              <p className="text-sm text-muted-foreground text-center py-8">
                No quick wins identified
              </p>
            ) : (
              <div className="space-y-2">
                {opportunities.slice(0, 5).map((kw: any, i: number) => (
                  <div
                    key={i}
                    className="flex items-center justify-between p-3 rounded-lg bg-orange-500/5 border border-orange-500/20"
                  >
                    <div className="flex-1 min-w-0">
                      <p className="font-medium text-sm truncate">{kw.keyword}</p>
                      <p className="text-xs text-muted-foreground">
                        {kw.impressions} impressions
                      </p>
                    </div>
                    <Badge variant="secondary">Pos {kw.position.toFixed(1)}</Badge>
                  </div>
                ))}
                <Link href="/seo/keywords">
                  <Button variant="ghost" size="sm" className="w-full mt-2">
                    View all keywords
                    <ArrowRight className="w-4 h-4 ml-1" />
                  </Button>
                </Link>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Low CTR Keywords */}
        <Card className="border-blue-500/30">
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="flex items-center gap-2">
                  💡 Optimize CTR
                </CardTitle>
                <CardDescription>
                  Top-ranked keywords with low click-through
                </CardDescription>
              </div>
              <Badge variant="outline" className="border-blue-500/50 text-blue-500">
                {lowCTR.length} found
              </Badge>
            </div>
          </CardHeader>
          <CardContent>
            {keywordsLoading ? (
              <div className="space-y-2">
                {[...Array(3)].map((_, i) => (
                  <Skeleton key={i} className="h-14 w-full" />
                ))}
              </div>
            ) : lowCTR.length === 0 ? (
              <p className="text-sm text-muted-foreground text-center py-8">
                All keywords have good CTR! 🎉
              </p>
            ) : (
              <div className="space-y-2">
                {lowCTR.slice(0, 5).map((kw: any, i: number) => (
                  <div
                    key={i}
                    className="flex items-center justify-between p-3 rounded-lg bg-blue-500/5 border border-blue-500/20"
                  >
                    <div className="flex-1 min-w-0">
                      <p className="font-medium text-sm truncate">{kw.keyword}</p>
                      <p className="text-xs text-muted-foreground">
                        Pos {kw.position.toFixed(1)} • {kw.impressions} impr.
                      </p>
                    </div>
                    <Badge variant="destructive">{kw.ctr.toFixed(2)}%</Badge>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Quick Links */}
      <div className="grid gap-4 md:grid-cols-3">
        <Link href="/seo/keywords">
          <Card className="hover:border-primary transition-colors cursor-pointer h-full">
            <CardContent className="p-6">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-xl bg-blue-500/10 flex items-center justify-center">
                  <Search className="w-6 h-6 text-blue-500" />
                </div>
                <div className="flex-1">
                  <h3 className="font-semibold">Keywords Tracker</h3>
                  <p className="text-sm text-muted-foreground">
                    Detailed keyword analysis
                  </p>
                </div>
                <ArrowRight className="w-5 h-5 text-muted-foreground" />
              </div>
            </CardContent>
          </Card>
        </Link>

        <Link href="/seo/pages">
          <Card className="hover:border-primary transition-colors cursor-pointer h-full">
            <CardContent className="p-6">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-xl bg-purple-500/10 flex items-center justify-center">
                  <Globe className="w-6 h-6 text-purple-500" />
                </div>
                <div className="flex-1">
                  <h3 className="font-semibold">Pages Performance</h3>
                  <p className="text-sm text-muted-foreground">
                    Page-wise SEO data
                  </p>
                </div>
                <ArrowRight className="w-5 h-5 text-muted-foreground" />
              </div>
            </CardContent>
          </Card>
        </Link>

        <Link href="/dashboard">
          <Card className="hover:border-primary transition-colors cursor-pointer h-full">
            <CardContent className="p-6">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-xl bg-green-500/10 flex items-center justify-center">
                  <Sparkles className="w-6 h-6 text-green-500" />
                </div>
                <div className="flex-1">
                  <h3 className="font-semibold">Main Dashboard</h3>
                  <p className="text-sm text-muted-foreground">
                    Full overview
                  </p>
                </div>
                <ArrowRight className="w-5 h-5 text-muted-foreground" />
              </div>
            </CardContent>
          </Card>
        </Link>
      </div>
    </div>
  )
}
