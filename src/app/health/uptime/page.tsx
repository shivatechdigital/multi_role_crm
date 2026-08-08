'use client'

import { useUptime } from '@/hooks/use-health-data'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Skeleton } from '@/components/ui/skeleton'
import { Button } from '@/components/ui/button'
import { StatsCard } from '@/components/dashboard/stats-card'
import {
  Activity,
  Clock,
  AlertCircle,
  CheckCircle2,
  XCircle,
  ArrowLeft,
  TrendingUp,
} from 'lucide-react'
import Link from 'next/link'
import {
  ResponsiveContainer,
  LineChart,
  Line,
  CartesianGrid,
  XAxis,
  YAxis,
  Tooltip,
} from 'recharts'
import { format, formatDistanceToNow } from 'date-fns'

export default function UptimePage() {
  const { data, isLoading } = useUptime()

  // Process chart data
  const chartData = (data?.checks || []).slice(0, 30).reverse().map((check: any) => ({
    time: format(new Date(check.timestamp), 'HH:mm'),
    responseTime: check.responseTime || 0,
    status: check.status === 'UP' ? 1 : 0,
  }))

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <Link href="/health">
          <Button variant="ghost" size="sm" className="mb-4">
            <ArrowLeft className="w-4 h-4 mr-1" />
            Back to Health
          </Button>
        </Link>
        
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold tracking-tight flex items-center gap-3">
              Uptime Monitor
              {data?.current?.status === 'UP' && (
                <span className="relative flex h-3 w-3">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-500 opacity-75" />
                  <span className="relative inline-flex rounded-full h-3 w-3 bg-green-500" />
                </span>
              )}
            </h1>
            <p className="text-muted-foreground mt-1">
              Track your website's availability
            </p>
          </div>
        </div>
      </div>

      {/* Current Status */}
      <Card className={data?.current?.status === 'UP' ? 'border-green-500/30 bg-green-500/5' : 'border-red-500/30 bg-red-500/5'}>
        <CardContent className="p-8">
          {isLoading ? (
            <Skeleton className="h-32 w-full" />
          ) : (
            <div className="flex items-center justify-between">
              <div>
                <div className="flex items-center gap-3 mb-2">
                  {data?.current?.status === 'UP' ? (
                    <CheckCircle2 className="w-8 h-8 text-green-500" />
                  ) : (
                    <XCircle className="w-8 h-8 text-red-500" />
                  )}
                  <h2 className="text-3xl font-bold">
                    {data?.current?.status === 'UP' ? 'Website is Online' : 'Website is Down'}
                  </h2>
                </div>
                <p className="text-muted-foreground">
                  Response time: {data?.current?.responseTime}ms • Status code: {data?.current?.statusCode}
                </p>
              </div>
              <Badge 
                variant={data?.current?.status === 'UP' ? 'default' : 'destructive'}
                className="text-lg px-4 py-2"
              >
                {data?.current?.status}
              </Badge>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Stats */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <StatsCard
          title="24h Uptime"
          value={`${data?.stats?.uptime24h || 100}%`}
          icon={Activity}
          isLoading={isLoading}
          description="Last 24 hours"
          color="green"
        />
        <StatsCard
          title="7d Uptime"
          value={`${data?.stats?.uptime7d || 100}%`}
          icon={TrendingUp}
          isLoading={isLoading}
          description="Last 7 days"
          color="blue"
        />
        <StatsCard
          title="Avg Response"
          value={`${data?.stats?.avgResponseTime || 0}ms`}
          icon={Clock}
          isLoading={isLoading}
          description="Average time"
          color="purple"
        />
        <StatsCard
          title="Total Checks"
          value={data?.stats?.totalChecks || 0}
          icon={Activity}
          isLoading={isLoading}
          description={`${data?.stats?.downChecks || 0} failures`}
          color="orange"
        />
      </div>

      {/* Response Time Chart */}
      <Card>
        <CardHeader>
          <CardTitle>📊 Response Time History</CardTitle>
          <CardDescription>Last 30 checks</CardDescription>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <Skeleton className="h-[300px] w-full" />
          ) : chartData.length === 0 ? (
            <div className="h-[300px] flex items-center justify-center text-muted-foreground">
              No data yet. Checks happen automatically.
            </div>
          ) : (
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                <XAxis 
                  dataKey="time" 
                  className="text-xs"
                  tick={{ fill: 'currentColor', fontSize: 11 }}
                />
                <YAxis 
                  className="text-xs"
                  tick={{ fill: 'currentColor', fontSize: 11 }}
                  label={{ value: 'Response Time (ms)', angle: -90, position: 'insideLeft', style: { fontSize: 11 } }}
                />
                <Tooltip
                  contentStyle={{
                    backgroundColor: 'hsl(var(--card))',
                    border: '1px solid hsl(var(--border))',
                    borderRadius: '8px',
                    fontSize: '12px',
                  }}
                />
                <Line 
                  type="monotone" 
                  dataKey="responseTime" 
                  stroke="#3b82f6" 
                  strokeWidth={2}
                  dot={{ fill: '#3b82f6', r: 3 }}
                  name="Response Time (ms)"
                />
              </LineChart>
            </ResponsiveContainer>
          )}
        </CardContent>
      </Card>

      {/* Recent Incidents */}
      {data?.incidents && data.incidents.length > 0 && (
        <Card className="border-red-500/30">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <AlertCircle className="w-5 h-5 text-red-500" />
              Recent Incidents
            </CardTitle>
            <CardDescription>
              Last {data.incidents.length} downtime events
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {data.incidents.map((incident: any, i: number) => (
                <div
                  key={i}
                  className="flex items-center justify-between p-3 rounded-lg bg-red-500/5 border border-red-500/20"
                >
                  <div className="flex items-center gap-3">
                    <XCircle className="w-5 h-5 text-red-500" />
                    <div>
                      <p className="font-medium text-sm">
                        {incident.error || 'Connection failed'}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        {format(new Date(incident.timestamp), 'MMM d, yyyy HH:mm:ss')}
                      </p>
                    </div>
                  </div>
                  <Badge variant="destructive">DOWN</Badge>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Recent Checks Log */}
      <Card>
        <CardHeader>
          <CardTitle>📋 Recent Checks</CardTitle>
          <CardDescription>Last 20 uptime checks</CardDescription>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="space-y-2">
              {[...Array(5)].map((_, i) => (
                <Skeleton key={i} className="h-12 w-full" />
              ))}
            </div>
          ) : !data?.checks || data.checks.length === 0 ? (
            <p className="text-sm text-muted-foreground text-center py-8">
              No checks yet
            </p>
          ) : (
            <div className="space-y-1 max-h-96 overflow-y-auto">
              {data.checks.slice(0, 20).map((check: any, i: number) => (
                <div
                  key={i}
                  className="flex items-center justify-between p-2 rounded-lg hover:bg-muted/50 transition-colors"
                >
                  <div className="flex items-center gap-3">
                    {check.status === 'UP' ? (
                      <div className="w-2 h-2 rounded-full bg-green-500" />
                    ) : (
                      <div className="w-2 h-2 rounded-full bg-red-500" />
                    )}
                    <span className="text-sm">
                      {formatDistanceToNow(new Date(check.timestamp), { addSuffix: true })}
                    </span>
                  </div>
                  <div className="flex items-center gap-3 text-xs">
                    <span className="text-muted-foreground">{check.responseTime}ms</span>
                    <Badge 
                      variant={check.status === 'UP' ? 'default' : 'destructive'}
                      className="text-xs"
                    >
                      {check.statusCode || check.status}
                    </Badge>
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
