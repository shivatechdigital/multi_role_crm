'use client'

import { useAnalyticsOverview } from '@/hooks/use-dashboard-data'
import { useUsersData, useSourcesData } from '@/hooks/use-analytics-data'
import { StatsCard } from '@/components/dashboard/stats-card'
import { DateRangePicker } from '@/components/dashboard/date-range-picker'
import { TrafficChart } from '@/components/dashboard/charts/traffic-chart'
import { SourcesChart } from '@/components/dashboard/charts/sources-chart'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Skeleton } from '@/components/ui/skeleton'
import { Button } from '@/components/ui/button'
import {
  Users,
  UserPlus,
  Globe,
  Activity,
  Clock,
  ArrowDown,
  TrendingUp,
  ArrowRight,
  BarChart3,
  PieChart,
} from 'lucide-react'
import Link from 'next/link'

export default function AnalyticsPage() {
  const { data: overview, isLoading: overviewLoading } = useAnalyticsOverview()
  const { data: users, isLoading: usersLoading } = useUsersData()
  const { data: sources, isLoading: sourcesLoading } = useSourcesData()

  // Format duration
  const formatDuration = (seconds: number) => {
    const mins = Math.floor(seconds / 60)
    const secs = Math.floor(seconds % 60)
    return `${mins}m ${secs}s`
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight sm:text-3xl">Analytics 📊</h1>
          <p className="text-muted-foreground mt-1">
            Complete website analytics and user behavior
          </p>
        </div>
        <DateRangePicker />
      </div>

      {/* Primary Stats */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <StatsCard
          title="Total Users"
          value={overview?.overview?.users || 0}
          icon={Users}
          isLoading={overviewLoading}
          description="Unique visitors"
          color="blue"
        />
        <StatsCard
          title="New Users"
          value={overview?.overview?.newUsers || 0}
          icon={UserPlus}
          isLoading={overviewLoading}
          description="First time visitors"
          color="green"
        />
        <StatsCard
          title="Sessions"
          value={overview?.overview?.sessions || 0}
          icon={Activity}
          isLoading={overviewLoading}
          description="Total sessions"
          color="purple"
        />
        <StatsCard
          title="Live Users"
          value={overview?.realtime || 0}
          icon={TrendingUp}
          isLoading={overviewLoading}
          description="Active right now"
          color="orange"
          highlight
        />
      </div>

      {/* Engagement Stats */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <StatsCard
          title="Pageviews"
          value={overview?.overview?.pageviews || 0}
          icon={Globe}
          isLoading={overviewLoading}
          description="Total views"
          color="blue"
        />
        <StatsCard
          title="Bounce Rate"
          value={`${overview?.overview?.bounceRate?.toFixed(1) || '0'}%`}
          icon={ArrowDown}
          isLoading={overviewLoading}
          description="Single page visits"
          color="orange"
        />
        <StatsCard
          title="Avg Duration"
          value={formatDuration(overview?.overview?.avgSessionDuration || 0)}
          icon={Clock}
          isLoading={overviewLoading}
          description="Session length"
          color="green"
        />
        <StatsCard
          title="Pages/Session"
          value={overview?.overview?.pagesPerSession?.toFixed(2) || '0'}
          icon={BarChart3}
          isLoading={overviewLoading}
          description="Pages per visit"
          color="purple"
        />
      </div>

      {/* Charts */}
      <div className="grid gap-4 lg:grid-cols-2">
        <TrafficChart 
          data={overview?.daily || []} 
          isLoading={overviewLoading} 
        />
        <SourcesChart 
          data={overview?.sources || []} 
          isLoading={overviewLoading} 
        />
      </div>

      {/* New vs Returning Users */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            👥 User Type Breakdown
          </CardTitle>
          <CardDescription>
            New visitors vs returning users
          </CardDescription>
        </CardHeader>
        <CardContent>
          {usersLoading ? (
            <Skeleton className="h-24 w-full" />
          ) : (
            <div className="grid gap-4 md:grid-cols-2">
              <div className="p-6 rounded-lg bg-green-500/10 border border-green-500/20">
                <div className="flex items-center justify-between mb-2">
                  <UserPlus className="w-8 h-8 text-green-500" />
                  <Badge variant="outline" className="border-green-500/50 text-green-500">
                    {users?.userTypes?.newPercent || 0}%
                  </Badge>
                </div>
                <h3 className="text-3xl font-bold">{users?.userTypes?.new || 0}</h3>
                <p className="text-sm text-muted-foreground mt-1">New Users</p>
              </div>
              <div className="p-6 rounded-lg bg-blue-500/10 border border-blue-500/20">
                <div className="flex items-center justify-between mb-2">
                  <Users className="w-8 h-8 text-blue-500" />
                  <Badge variant="outline" className="border-blue-500/50 text-blue-500">
                    {users?.userTypes?.returningPercent || 0}%
                  </Badge>
                </div>
                <h3 className="text-3xl font-bold">{users?.userTypes?.returning || 0}</h3>
                <p className="text-sm text-muted-foreground mt-1">Returning Users</p>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Top Channels */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            📊 Traffic Channels
          </CardTitle>
          <CardDescription>
            Performance by marketing channel
          </CardDescription>
        </CardHeader>
        <CardContent>
          {sourcesLoading ? (
            <div className="space-y-2">
              {[...Array(5)].map((_, i) => (
                <Skeleton key={i} className="h-16 w-full" />
              ))}
            </div>
          ) : !sources?.channels || sources.channels.length === 0 ? (
            <p className="text-sm text-muted-foreground text-center py-8">
              No data available
            </p>
          ) : (
            <div className="space-y-2">
              {sources.channels.slice(0, 6).map((channel: any, i: number) => {
                const percentage = sources.stats.totalUsers > 0
                  ? ((channel.users / sources.stats.totalUsers) * 100).toFixed(1)
                  : 0
                
                return (
                  <div
                    key={i}
                    className="flex flex-col gap-3 rounded-lg bg-muted/50 p-4 transition-colors hover:bg-muted sm:flex-row sm:items-center sm:justify-between"
                  >
                    <div className="flex items-center gap-3 flex-1 min-w-0">
                      <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center text-lg flex-shrink-0">
                        {channel.name.split(' ')[0]}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="font-medium text-sm truncate">
                          {channel.name.split(' ').slice(1).join(' ')}
                        </p>
                        <div className="mt-1 flex items-center gap-2">
                          <div className="h-1.5 flex-1 overflow-hidden rounded-full bg-muted sm:max-w-[200px]">
                            <div 
                              className="h-full bg-primary rounded-full transition-all"
                              style={{ width: `${percentage}%` }}
                            />
                          </div>
                          <span className="text-xs text-muted-foreground">{percentage}%</span>
                        </div>
                      </div>
                    </div>
                    <div className="ml-0 text-left sm:ml-4 sm:text-right">
                      <p className="font-bold text-lg">{channel.users.toLocaleString()}</p>
                      <p className="text-xs text-muted-foreground">users</p>
                    </div>
                  </div>
                )
              })}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Quick Links */}
      <div className="grid gap-4 md:grid-cols-3">
        <Link href="/analytics/users">
          <Card className="hover:border-primary transition-colors cursor-pointer h-full">
            <CardContent className="p-6">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-xl bg-blue-500/10 flex items-center justify-center">
                  <Users className="w-6 h-6 text-blue-500" />
                </div>
                <div className="flex-1">
                  <h3 className="font-semibold">User Analytics</h3>
                  <p className="text-sm text-muted-foreground">
                    Demographics & behavior
                  </p>
                </div>
                <ArrowRight className="w-5 h-5 text-muted-foreground" />
              </div>
            </CardContent>
          </Card>
        </Link>

        <Link href="/analytics/sources">
          <Card className="hover:border-primary transition-colors cursor-pointer h-full">
            <CardContent className="p-6">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-xl bg-purple-500/10 flex items-center justify-center">
                  <PieChart className="w-6 h-6 text-purple-500" />
                </div>
                <div className="flex-1">
                  <h3 className="font-semibold">Traffic Sources</h3>
                  <p className="text-sm text-muted-foreground">
                    Channel performance
                  </p>
                </div>
                <ArrowRight className="w-5 h-5 text-muted-foreground" />
              </div>
            </CardContent>
          </Card>
        </Link>

        <Link href="/dashboard/realtime">
          <Card className="hover:border-primary transition-colors cursor-pointer h-full border-green-500/30">
            <CardContent className="p-6">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-xl bg-green-500/10 flex items-center justify-center relative">
                  <Activity className="w-6 h-6 text-green-500" />
                  <span className="absolute -top-1 -right-1 w-3 h-3 bg-green-500 rounded-full animate-pulse" />
                </div>
                <div className="flex-1">
                  <h3 className="font-semibold">Real-time View</h3>
                  <p className="text-sm text-muted-foreground">
                    Live active users
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
