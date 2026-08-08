'use client'

import { useSourcesData } from '@/hooks/use-analytics-data'
import { StatsCard } from '@/components/dashboard/stats-card'
import { DateRangePicker } from '@/components/dashboard/date-range-picker'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Skeleton } from '@/components/ui/skeleton'
import {
  Users,
  Activity,
  ArrowDown,
  Globe,
} from 'lucide-react'
import {
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  Tooltip,
  BarChart,
  Bar,
  CartesianGrid,
  XAxis,
  YAxis,
} from 'recharts'

const CHANNEL_COLORS = [
  '#3b82f6', '#10b981', '#f59e0b', '#8b5cf6', 
  '#ef4444', '#06b6d4', '#ec4899', '#6b7280'
]

export default function SourcesAnalyticsPage() {
  const { data, isLoading } = useSourcesData()

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Traffic Sources 🌐</h1>
          <p className="text-muted-foreground mt-1">
            Where your visitors come from
          </p>
        </div>
        <DateRangePicker />
      </div>

      {/* Stats */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <StatsCard
          title="Total Users"
          value={data?.stats?.totalUsers || 0}
          icon={Users}
          isLoading={isLoading}
          color="blue"
        />
        <StatsCard
          title="Sessions"
          value={data?.stats?.totalSessions || 0}
          icon={Activity}
          isLoading={isLoading}
          color="purple"
        />
        <StatsCard
          title="Channels"
          value={data?.stats?.totalChannels || 0}
          icon={Globe}
          isLoading={isLoading}
          color="green"
        />
        <StatsCard
          title="Avg Bounce"
          value={`${data?.stats?.avgBounceRate || '0'}%`}
          icon={ArrowDown}
          isLoading={isLoading}
          color="orange"
        />
      </div>

      {/* Channel Distribution */}
      <div className="grid gap-4 lg:grid-cols-2">
        {/* Pie Chart */}
        <Card>
          <CardHeader>
            <CardTitle>📊 Channel Distribution</CardTitle>
            <CardDescription>Users by marketing channel</CardDescription>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <Skeleton className="h-[350px] w-full" />
            ) : !data?.channels || data.channels.length === 0 ? (
              <div className="h-[350px] flex items-center justify-center text-muted-foreground">
                No data available
              </div>
            ) : (
              <ResponsiveContainer width="100%" height={350}>
                <PieChart>
                  <Pie
                    data={data.channels}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    label={(entry) => {
                      const total = data.channels.reduce((sum: number, c: any) => sum + c.users, 0)
                      const percent = total > 0 ? ((entry.users / total) * 100).toFixed(0) : 0
                      return `${percent}%`
                    }}
                    outerRadius={120}
                    fill="#8884d8"
                    dataKey="users"
                  >
                    {data.channels.map((entry: any, index: number) => (
                      <Cell key={`cell-${index}`} fill={CHANNEL_COLORS[index % CHANNEL_COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip
                    contentStyle={{
                      backgroundColor: 'hsl(var(--card))',
                      border: '1px solid hsl(var(--border))',
                      borderRadius: '8px',
                      fontSize: '12px',
                    }}
                  />
                </PieChart>
              </ResponsiveContainer>
            )}
          </CardContent>
        </Card>

        {/* Channel Bar Chart */}
        <Card>
          <CardHeader>
            <CardTitle>📈 Channels Comparison</CardTitle>
            <CardDescription>Users vs Sessions by channel</CardDescription>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <Skeleton className="h-[350px] w-full" />
            ) : (
              <ResponsiveContainer width="100%" height={350}>
                <BarChart data={data?.channels || []}>
                  <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                  <XAxis 
                    dataKey="name" 
                    className="text-xs"
                    tick={{ fill: 'currentColor', fontSize: 10 }}
                    angle={-15}
                    textAnchor="end"
                    height={80}
                  />
                  <YAxis 
                    className="text-xs"
                    tick={{ fill: 'currentColor', fontSize: 11 }}
                  />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: 'hsl(var(--card))',
                      border: '1px solid hsl(var(--border))',
                      borderRadius: '8px',
                      fontSize: '12px',
                    }}
                  />
                  <Bar dataKey="users" fill="#3b82f6" radius={[4, 4, 0, 0]} name="Users" />
                  <Bar dataKey="sessions" fill="#8b5cf6" radius={[4, 4, 0, 0]} name="Sessions" />
                </BarChart>
              </ResponsiveContainer>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Top Sources Table */}
      <Card>
        <CardHeader>
          <CardTitle>🔝 Top Traffic Sources</CardTitle>
          <CardDescription>Detailed source breakdown</CardDescription>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="space-y-2">
              {[...Array(5)].map((_, i) => (
                <Skeleton key={i} className="h-16 w-full" />
              ))}
            </div>
          ) : !data?.topSources || data.topSources.length === 0 ? (
            <p className="text-sm text-muted-foreground text-center py-8">
              No data available
            </p>
          ) : (
            <div className="space-y-2">
              {data.topSources.map((source: any, i: number) => (
                <div
                  key={i}
                  className="flex flex-col gap-3 rounded-lg bg-muted/50 p-4 transition-colors hover:bg-muted sm:flex-row sm:items-center sm:justify-between"
                >
                  <div className="flex items-center gap-3 flex-1 min-w-0">
                    <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center text-sm font-bold text-primary flex-shrink-0">
                      {i + 1}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-medium text-sm truncate">{source.source}</p>
                      <div className="flex items-center gap-2 mt-1">
                        <Badge variant="outline" className="text-xs">
                          {source.medium}
                        </Badge>
                      </div>
                    </div>
                  </div>
                  <div className="flex flex-wrap items-center gap-4 text-sm sm:gap-6">
                    <div className="text-left sm:text-right">
                      <p className="font-bold">{source.users.toLocaleString()}</p>
                      <p className="text-xs text-muted-foreground">users</p>
                    </div>
                    <div className="text-left sm:text-right">
                      <p className="font-bold">{source.sessions.toLocaleString()}</p>
                      <p className="text-xs text-muted-foreground">sessions</p>
                    </div>
                    <div className="text-right hidden sm:block">
                      <p className="font-bold">{source.bounceRate.toFixed(1)}%</p>
                      <p className="text-xs text-muted-foreground">bounce</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
