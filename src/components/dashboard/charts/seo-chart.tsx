'use client'

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Skeleton } from '@/components/ui/skeleton'
import {
  Bar,
  BarChart,
  CartesianGrid,
  Line,
  ComposedChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
  Legend,
} from 'recharts'
import { format, parseISO } from 'date-fns'

interface SeoChartProps {
  data: any[]
  isLoading: boolean
}

export function SeoChart({ data, isLoading }: SeoChartProps) {
  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>SEO Performance</CardTitle>
          <CardDescription>Loading...</CardDescription>
        </CardHeader>
        <CardContent>
          <Skeleton className="h-[300px] w-full" />
        </CardContent>
      </Card>
    )
  }

  const chartData = (data || []).map((item) => ({
    date: item.date ? format(parseISO(item.date), 'MMM dd') : '',
    clicks: item.clicks || 0,
    impressions: item.impressions || 0,
    position: parseFloat((item.position || 0).toFixed(1)),
  }))

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          🎯 SEO Performance
        </CardTitle>
        <CardDescription>Clicks, impressions, and average position</CardDescription>
      </CardHeader>
      <CardContent>
        <ResponsiveContainer width="100%" height={300}>
          <ComposedChart data={chartData}>
            <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
            <XAxis 
              dataKey="date" 
              className="text-xs"
              tick={{ fill: 'currentColor', fontSize: 11 }}
            />
            <YAxis 
              yAxisId="left"
              className="text-xs"
              tick={{ fill: 'currentColor', fontSize: 11 }}
            />
            <YAxis 
              yAxisId="right"
              orientation="right"
              reversed
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
            <Legend wrapperStyle={{ fontSize: '12px' }} />
            <Bar yAxisId="left" dataKey="clicks" fill="#3b82f6" radius={[4, 4, 0, 0]} name="Clicks" />
            <Bar yAxisId="left" dataKey="impressions" fill="#8b5cf6" radius={[4, 4, 0, 0]} name="Impressions" />
            <Line
              yAxisId="right"
              type="monotone"
              dataKey="position"
              stroke="#f59e0b"
              strokeWidth={2}
              dot={{ fill: '#f59e0b', r: 4 }}
              name="Avg Position"
            />
          </ComposedChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  )
}
