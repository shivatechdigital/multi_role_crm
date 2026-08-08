'use client'

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Skeleton } from '@/components/ui/skeleton'
import { Badge } from '@/components/ui/badge'
import {
  Bar,
  BarChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts'

interface KeywordsChartProps {
  data: any[]
  isLoading: boolean
}

export function KeywordsChart({ data, isLoading }: KeywordsChartProps) {
  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Top Keywords</CardTitle>
          <CardDescription>Loading...</CardDescription>
        </CardHeader>
        <CardContent>
          <Skeleton className="h-[400px] w-full" />
        </CardContent>
      </Card>
    )
  }

  const chartData = (data || []).slice(0, 8).map((item) => ({
    keyword: item.keyword.length > 25 ? item.keyword.substring(0, 25) + '...' : item.keyword,
    fullKeyword: item.keyword,
    clicks: item.clicks || 0,
    impressions: item.impressions || 0,
    position: item.position?.toFixed(1) || 0,
  }))

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          🔥 Top Performing Keywords
        </CardTitle>
        <CardDescription>Your best ranking search queries</CardDescription>
      </CardHeader>
      <CardContent>
        {chartData.length === 0 ? (
          <div className="h-[400px] flex items-center justify-center text-muted-foreground">
            No keyword data available
          </div>
        ) : (
          <>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart 
                data={chartData} 
                layout="vertical"
                margin={{ left: 100 }}
              >
                <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                <XAxis 
                  type="number"
                  className="text-xs"
                  tick={{ fill: 'currentColor', fontSize: 11 }}
                />
                <YAxis 
                  type="category"
                  dataKey="keyword"
                  className="text-xs"
                  tick={{ fill: 'currentColor', fontSize: 11 }}
                  width={100}
                />
                <Tooltip
                  contentStyle={{
                    backgroundColor: 'hsl(var(--card))',
                    border: '1px solid hsl(var(--border))',
                    borderRadius: '8px',
                    fontSize: '12px',
                  }}
                  content={({ active, payload }) => {
                    if (active && payload && payload[0]) {
                      const data = payload[0].payload
                      return (
                        <div className="bg-card border rounded-lg p-3 shadow-lg text-xs space-y-1">
                          <p className="font-medium">{data.fullKeyword}</p>
                          <p>Clicks: <strong>{data.clicks}</strong></p>
                          <p>Impressions: <strong>{data.impressions}</strong></p>
                          <p>Position: <strong>{data.position}</strong></p>
                        </div>
                      )
                    }
                    return null
                  }}
                />
                <Bar 
                  dataKey="clicks" 
                  fill="#3b82f6"
                  radius={[0, 4, 4, 0]}
                />
              </BarChart>
            </ResponsiveContainer>

            {/* Top 3 Highlighted */}
            <div className="mt-4 grid grid-cols-1 sm:grid-cols-3 gap-2">
              {data.slice(0, 3).map((kw: any, i: number) => (
                <div 
                  key={i}
                  className="p-3 rounded-lg bg-gradient-to-br from-primary/10 to-primary/5 border border-primary/20"
                >
                  <div className="flex items-center justify-between mb-1">
                    <Badge variant="secondary" className="text-xs">
                      #{i + 1}
                    </Badge>
                    <Badge variant="default" className="text-xs">
                      Pos {kw.position.toFixed(1)}
                    </Badge>
                  </div>
                  <p className="text-sm font-medium truncate" title={kw.keyword}>
                    {kw.keyword}
                  </p>
                  <p className="text-lg font-bold text-primary mt-1">{kw.clicks}</p>
                  <p className="text-xs text-muted-foreground">clicks</p>
                </div>
              ))}
            </div>
          </>
        )}
      </CardContent>
    </Card>
  )
}
