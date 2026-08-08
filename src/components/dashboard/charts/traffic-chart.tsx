'use client'

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Skeleton } from '@/components/ui/skeleton'
import {
  Area,
  AreaChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts'
import { format, parseISO } from 'date-fns'

interface TrafficChartProps {
  data: any[]
  isLoading: boolean
}

export function TrafficChart({ data, isLoading }: TrafficChartProps) {
  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Traffic Trends</CardTitle>
          <CardDescription>Loading...</CardDescription>
        </CardHeader>
        <CardContent>
          <Skeleton className="h-[300px] w-full" />
        </CardContent>
      </Card>
    )
  }

  // Format data for chart
  const chartData = (data || []).map((item) => ({
    date: item.date ? format(parseISO(item.date.replace(/(\d{4})(\d{2})(\d{2})/, '$1-$2-$3')), 'MMM dd') : '',
    users: item.users || 0,
    sessions: item.sessions || 0,
    pageviews: item.pageviews || 0,
  }))

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          📈 Traffic Trends
        </CardTitle>
        <CardDescription>Users, sessions and pageviews over time</CardDescription>
      </CardHeader>
      <CardContent>
        <ResponsiveContainer width="100%" height={300}>
          <AreaChart data={chartData}>
            <defs>
              <linearGradient id="colorUsers" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.3} />
                <stop offset="95%" stopColor="#3b82f6" stopOpacity={0} />
              </linearGradient>
              <linearGradient id="colorSessions" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#8b5cf6" stopOpacity={0.3} />
                <stop offset="95%" stopColor="#8b5cf6" stopOpacity={0} />
              </linearGradient>
              <linearGradient id="colorPageviews" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#10b981" stopOpacity={0.3} />
                <stop offset="95%" stopColor="#10b981" stopOpacity={0} />
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
            <XAxis 
              dataKey="date" 
              className="text-xs"
              tick={{ fill: 'currentColor', fontSize: 11 }}
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
            <Area
              type="monotone"
              dataKey="users"
              stroke="#3b82f6"
              fillOpacity={1}
              fill="url(#colorUsers)"
              strokeWidth={2}
              name="Users"
            />
            <Area
              type="monotone"
              dataKey="sessions"
              stroke="#8b5cf6"
              fillOpacity={1}
              fill="url(#colorSessions)"
              strokeWidth={2}
              name="Sessions"
            />
            <Area
              type="monotone"
              dataKey="pageviews"
              stroke="#10b981"
              fillOpacity={1}
              fill="url(#colorPageviews)"
              strokeWidth={2}
              name="Pageviews"
            />
          </AreaChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  )
}
