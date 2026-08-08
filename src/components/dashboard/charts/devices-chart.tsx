'use client'

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Skeleton } from '@/components/ui/skeleton'
import {
  Cell,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  Legend,
} from 'recharts'
import { Smartphone, Monitor, Tablet } from 'lucide-react'

interface DevicesChartProps {
  data: any[]
  isLoading: boolean
}

const DEVICE_COLORS: Record<string, string> = {
  desktop: '#3b82f6',
  mobile: '#10b981',
  tablet: '#f59e0b',
  DESKTOP: '#3b82f6',
  MOBILE: '#10b981',
  TABLET: '#f59e0b',
}

export function DevicesChart({ data, isLoading }: DevicesChartProps) {
  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Devices</CardTitle>
          <CardDescription>Loading...</CardDescription>
        </CardHeader>
        <CardContent>
          <Skeleton className="h-[300px] w-full" />
        </CardContent>
      </Card>
    )
  }

  const chartData = (data || []).map((item) => ({
    name: item.device || 'Unknown',
    value: item.clicks || 0,
    impressions: item.impressions || 0,
  }))

  const total = chartData.reduce((sum, item) => sum + item.value, 0)

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          📱 Device Breakdown
        </CardTitle>
        <CardDescription>Clicks by device type</CardDescription>
      </CardHeader>
      <CardContent>
        {chartData.length === 0 ? (
          <div className="h-[300px] flex items-center justify-center text-muted-foreground">
            No data available
          </div>
        ) : (
          <div className="space-y-4">
            <ResponsiveContainer width="100%" height={200}>
              <PieChart>
                <Pie
                  data={chartData}
                  cx="50%"
                  cy="50%"
                  innerRadius={50}
                  outerRadius={80}
                  paddingAngle={2}
                  dataKey="value"
                >
                  {chartData.map((entry, index) => (
                    <Cell 
                      key={`cell-${index}`} 
                      fill={DEVICE_COLORS[entry.name.toLowerCase()] || '#6b7280'} 
                    />
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

            {/* Custom Legend with Stats */}
            <div className="grid grid-cols-3 gap-2">
              {chartData.map((device, index) => {
                const percentage = total > 0 ? ((device.value / total) * 100).toFixed(1) : 0
                const Icon = device.name.toLowerCase() === 'mobile' 
                  ? Smartphone 
                  : device.name.toLowerCase() === 'tablet'
                  ? Tablet
                  : Monitor

                return (
                  <div 
                    key={index}
                    className="p-3 rounded-lg bg-muted/50 text-center"
                  >
                    <Icon className="w-5 h-5 mx-auto mb-1" style={{ 
                      color: DEVICE_COLORS[device.name.toLowerCase()] || '#6b7280' 
                    }} />
                    <p className="text-xs font-medium capitalize">{device.name}</p>
                    <p className="text-lg font-bold">{percentage}%</p>
                    <p className="text-xs text-muted-foreground">{device.value} clicks</p>
                  </div>
                )
              })}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  )
}
