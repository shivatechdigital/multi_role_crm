'use client'

import { useRealtimeData } from '@/hooks/use-analytics-data'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Skeleton } from '@/components/ui/skeleton'
import {
  Activity,
  Users,
  Globe,
  Smartphone,
  Monitor,
  Tablet,
  RefreshCw,
} from 'lucide-react'
import { format } from 'date-fns'

const DEVICE_ICONS: Record<string, any> = {
  desktop: Monitor,
  mobile: Smartphone,
  tablet: Tablet,
}

const DEVICE_COLORS: Record<string, string> = {
  desktop: 'text-blue-500 bg-blue-500/10 border-blue-500/20',
  mobile: 'text-green-500 bg-green-500/10 border-green-500/20',
  tablet: 'text-orange-500 bg-orange-500/10 border-orange-500/20',
}

export default function RealtimePage() {
  const { data, isLoading, isFetching, dataUpdatedAt } = useRealtimeData()

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight flex items-center gap-3">
            Real-time View
            <span className="relative flex h-3 w-3">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-500 opacity-75" />
              <span className="relative inline-flex rounded-full h-3 w-3 bg-green-500" />
            </span>
          </h1>
          <p className="text-muted-foreground mt-1">
            Live users on your website right now
          </p>
        </div>
        <div className="flex items-center gap-2">
          {isFetching && (
            <Badge variant="outline" className="gap-1">
              <RefreshCw className="w-3 h-3 animate-spin" />
              Refreshing
            </Badge>
          )}
          <Badge variant="outline" className="font-mono text-xs">
            Last update: {format(new Date(dataUpdatedAt || Date.now()), 'HH:mm:ss')}
          </Badge>
        </div>
      </div>

      {/* Main Active Users Card */}
      <Card className="border-green-500/30 bg-gradient-to-br from-green-500/5 to-transparent">
        <CardContent className="p-8">
          {isLoading ? (
            <Skeleton className="h-32 w-full" />
          ) : (
            <div className="flex items-center justify-between">
              <div>
                <div className="flex items-center gap-2 mb-2">
                  <Activity className="w-5 h-5 text-green-500" />
                  <p className="text-sm font-medium text-muted-foreground uppercase tracking-wider">
                    Active Users Right Now
                  </p>
                </div>
                <h2 className="text-7xl font-bold tracking-tight bg-gradient-to-br from-green-500 to-green-700 bg-clip-text text-transparent">
                  {data?.activeUsers || 0}
                </h2>
                <p className="text-sm text-muted-foreground mt-2">
                  Auto-refreshes every 10 seconds
                </p>
              </div>
              <div className="hidden lg:flex w-32 h-32 rounded-full bg-green-500/10 items-center justify-center">
                <Users className="w-16 h-16 text-green-500" />
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Devices Row */}
      <div className="grid gap-4 md:grid-cols-3">
        {isLoading ? (
          [...Array(3)].map((_, i) => (
            <Skeleton key={i} className="h-32 w-full" />
          ))
        ) : data?.devices?.length === 0 ? (
          <Card className="md:col-span-3">
            <CardContent className="p-8 text-center text-muted-foreground">
              No active users at the moment
            </CardContent>
          </Card>
        ) : (
          data?.devices?.map((device: any, i: number) => {
            const Icon = DEVICE_ICONS[device.device.toLowerCase()] || Monitor
            const colorClass = DEVICE_COLORS[device.device.toLowerCase()] || 'text-gray-500 bg-gray-500/10'
            
            return (
              <Card key={i} className={`border ${colorClass.split(' ')[2]}`}>
                <CardContent className="p-6">
                  <div className="flex items-center justify-between mb-2">
                    <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${colorClass}`}>
                      <Icon className="w-6 h-6" />
                    </div>
                    <Badge variant="outline" className={colorClass}>
                      {device.users} active
                    </Badge>
                  </div>
                  <h3 className="text-2xl font-bold capitalize">{device.device}</h3>
                  <p className="text-sm text-muted-foreground mt-1">
                    {data.activeUsers > 0 
                      ? `${((device.users / data.activeUsers) * 100).toFixed(0)}% of total`
                      : 'No data'
                    }
                  </p>
                </CardContent>
              </Card>
            )
          })
        )}
      </div>

      {/* Countries & Pages */}
      <div className="grid gap-4 lg:grid-cols-2">
        {/* Active Countries */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              🌍 Active Countries
            </CardTitle>
            <CardDescription>
              Where your live users are from
            </CardDescription>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <div className="space-y-2">
                {[...Array(5)].map((_, i) => (
                  <Skeleton key={i} className="h-14 w-full" />
                ))}
              </div>
            ) : !data?.countries || data.countries.length === 0 ? (
              <p className="text-sm text-muted-foreground text-center py-8">
                No active users
              </p>
            ) : (
              <div className="space-y-2">
                {data.countries.map((country: any, i: number) => {
                  const percentage = data.activeUsers > 0
                    ? ((country.users / data.activeUsers) * 100).toFixed(0)
                    : 0
                  
                  return (
                    <div
                      key={i}
                      className="flex flex-col gap-3 rounded-lg bg-muted/50 p-3 sm:flex-row sm:items-center sm:justify-between"
                    >
                      <div className="flex items-center gap-3 flex-1">
                        <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center text-xs font-bold text-primary">
                          {i + 1}
                        </div>
                        <span className="font-medium">{country.country}</span>
                      </div>
                      <div className="flex flex-wrap items-center gap-3">
                        <div className="w-24 bg-muted rounded-full h-2 overflow-hidden">
                          <div
                            className="h-full bg-green-500 rounded-full transition-all"
                            style={{ width: `${percentage}%` }}
                          />
                        </div>
                        <Badge variant="outline" className="min-w-[60px] justify-center">
                          {country.users} {country.users === 1 ? 'user' : 'users'}
                        </Badge>
                      </div>
                    </div>
                  )
                })}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Active Pages */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              📄 Active Pages
            </CardTitle>
            <CardDescription>
              Pages being viewed right now
            </CardDescription>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <div className="space-y-2">
                {[...Array(5)].map((_, i) => (
                  <Skeleton key={i} className="h-14 w-full" />
                ))}
              </div>
            ) : !data?.pages || data.pages.length === 0 ? (
              <p className="text-sm text-muted-foreground text-center py-8">
                No active pages
              </p>
            ) : (
              <div className="space-y-2">
                {data.pages.map((page: any, i: number) => (
                  <div
                    key={i}
                    className="flex flex-col gap-3 rounded-lg bg-muted/50 p-3 sm:flex-row sm:items-center sm:justify-between"
                  >
                    <div className="flex items-center gap-3 flex-1 min-w-0">
                      <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center text-xs font-bold text-primary flex-shrink-0">
                        {i + 1}
                      </div>
                      <p className="text-sm font-medium truncate" title={page.page}>
                        {page.page || '/'}
                      </p>
                    </div>
                    <Badge variant="outline" className="ml-2">
                      {page.users} {page.users === 1 ? 'viewer' : 'viewers'}
                    </Badge>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Live Indicator */}
      <Card className="border-dashed">
        <CardContent className="p-4 text-center">
          <p className="text-xs text-muted-foreground flex items-center justify-center gap-2">
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-500 opacity-75" />
              <span className="relative inline-flex rounded-full h-2 w-2 bg-green-500" />
            </span>
            Live data • Auto-refreshing every 10 seconds
          </p>
        </CardContent>
      </Card>
    </div>
  )
}
