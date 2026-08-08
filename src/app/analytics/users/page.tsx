'use client'

import { useUsersData } from '@/hooks/use-analytics-data'
import { StatsCard } from '@/components/dashboard/stats-card'
import { DateRangePicker } from '@/components/dashboard/date-range-picker'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Skeleton } from '@/components/ui/skeleton'
import {
  Users,
  UserPlus,
  UserCheck,
  Smartphone,
  Monitor,
  Tablet,
  Globe,
} from 'lucide-react'
import {
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  Tooltip,
  Legend,
  BarChart,
  Bar,
  CartesianGrid,
  XAxis,
  YAxis,
} from 'recharts'

const DEVICE_COLORS: Record<string, string> = {
  desktop: '#3b82f6',
  mobile: '#10b981',
  tablet: '#f59e0b',
}

export default function UsersAnalyticsPage() {
  const { data, isLoading } = useUsersData()

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">User Analytics 👥</h1>
          <p className="text-muted-foreground mt-1">
            Detailed user demographics and behavior
          </p>
        </div>
        <DateRangePicker />
      </div>

      {/* Stats */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <StatsCard
          title="Total Users"
          value={data?.overview?.users || 0}
          icon={Users}
          isLoading={isLoading}
          description="Unique visitors"
          color="blue"
        />
        <StatsCard
          title="New Users"
          value={data?.overview?.newUsers || 0}
          icon={UserPlus}
          isLoading={isLoading}
          description="First time"
          color="green"
        />
        <StatsCard
          title="Returning"
          value={data?.userTypes?.returning || 0}
          icon={UserCheck}
          isLoading={isLoading}
          description="Repeat visitors"
          color="purple"
        />
        <StatsCard
          title="Sessions"
          value={data?.overview?.sessions || 0}
          icon={Globe}
          isLoading={isLoading}
          description="Total visits"
          color="orange"
        />
      </div>

      {/* User Type & Devices */}
      <div className="grid gap-4 lg:grid-cols-2">
        {/* New vs Returning */}
        <Card>
          <CardHeader>
            <CardTitle>👥 New vs Returning</CardTitle>
            <CardDescription>User type distribution</CardDescription>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <Skeleton className="h-[300px] w-full" />
            ) : (
              <ResponsiveContainer width="100%" height={300}>
                <PieChart>
                  <Pie
                    data={[
                      { name: 'New Users', value: data?.userTypes?.new || 0 },
                      { name: 'Returning Users', value: data?.userTypes?.returning || 0 },
                    ]}
                    cx="50%"
                    cy="50%"
                    innerRadius={60}
                    outerRadius={100}
                    paddingAngle={4}
                    dataKey="value"
                  >
                    <Cell fill="#10b981" />
                    <Cell fill="#3b82f6" />
                  </Pie>
                  <Tooltip
                    contentStyle={{
                      backgroundColor: 'hsl(var(--card))',
                      border: '1px solid hsl(var(--border))',
                      borderRadius: '8px',
                      fontSize: '12px',
                    }}
                  />
                  <Legend wrapperStyle={{ fontSize: '12px' }} />
                </PieChart>
              </ResponsiveContainer>
            )}
          </CardContent>
        </Card>

        {/* Devices */}
        <Card>
          <CardHeader>
            <CardTitle>📱 Device Breakdown</CardTitle>
            <CardDescription>Users by device type</CardDescription>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <Skeleton className="h-[300px] w-full" />
            ) : !data?.devices || data.devices.length === 0 ? (
              <div className="h-[300px] flex items-center justify-center text-muted-foreground">
                No data available
              </div>
            ) : (
              <div className="space-y-3">
                {data.devices.map((device: any, i: number) => {
                  const Icon = device.name === 'mobile' ? Smartphone : 
                               device.name === 'tablet' ? Tablet : Monitor
                  const total = data.devices.reduce((sum: number, d: any) => sum + d.users, 0)
                  const percentage = total > 0 ? ((device.users / total) * 100).toFixed(1) : 0
                  
                  return (
                    <div key={i} className="space-y-2">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <Icon className="w-5 h-5" style={{ color: DEVICE_COLORS[device.name] || '#6b7280' }} />
                          <span className="font-medium capitalize">{device.name}</span>
                        </div>
                        <div className="flex items-center gap-3">
                          <span className="text-sm font-bold">{device.users.toLocaleString()}</span>
                          <Badge variant="outline">{percentage}%</Badge>
                        </div>
                      </div>
                      <div className="w-full bg-muted rounded-full h-2 overflow-hidden">
                        <div
                          className="h-full rounded-full transition-all"
                          style={{ 
                            width: `${percentage}%`,
                            backgroundColor: DEVICE_COLORS[device.name] || '#6b7280',
                          }}
                        />
                      </div>
                    </div>
                  )
                })}
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Top Countries */}
      <Card>
        <CardHeader>
          <CardTitle>🌍 Top Countries</CardTitle>
          <CardDescription>
            Users by country
          </CardDescription>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <Skeleton className="h-[400px] w-full" />
          ) : !data?.countries || data.countries.length === 0 ? (
            <p className="text-sm text-muted-foreground text-center py-8">
              No data available
            </p>
          ) : (
            <ResponsiveContainer width="100%" height={400}>
              <BarChart data={data.countries.slice(0, 10)} layout="vertical" margin={{ left: 100 }}>
                <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                <XAxis 
                  type="number" 
                  className="text-xs"
                  tick={{ fill: 'currentColor', fontSize: 11 }}
                />
                <YAxis 
                  type="category" 
                  dataKey="name"
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
                />
                <Bar dataKey="users" fill="#3b82f6" radius={[0, 4, 4, 0]} name="Users" />
              </BarChart>
            </ResponsiveContainer>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
