'use client'

import { useState } from 'react'
import { usePageSpeed, useRunPageSpeed } from '@/hooks/use-health-data'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Skeleton } from '@/components/ui/skeleton'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { ScoreCard } from '@/components/health/score-card'
import {
  Zap,
  Smartphone,
  Monitor,
  RefreshCw,
  AlertTriangle,
  TrendingUp,
  ArrowLeft,
  Clock,
  Image,
  Gauge,
} from 'lucide-react'
import Link from 'next/link'
import { toast } from 'sonner'
import {
  ResponsiveContainer,
  LineChart,
  Line,
  CartesianGrid,
  XAxis,
  YAxis,
  Tooltip,
  Legend,
} from 'recharts'
import { format, parseISO } from 'date-fns'

export default function PageSpeedPage() {
  const { data, isLoading, refetch, isFetching } = usePageSpeed()
  const runPageSpeed = useRunPageSpeed()

  const [selectedTab, setSelectedTab] = useState<'mobile' | 'desktop'>('mobile')

  const handleRunTest = async () => {
    toast.info('Running PageSpeed test... This may take 30-60 seconds')
    try {
      await runPageSpeed.mutateAsync(undefined)
      await refetch()
      toast.success('PageSpeed test complete!')
    } catch (error) {
      toast.error('Failed to run PageSpeed test')
    }
  }

  const currentData = selectedTab === 'mobile' ? data?.mobile : data?.desktop

  // Process history for chart
  const historyData = (data?.history || [])
    .filter((h: any) => h.strategy === selectedTab)
    .reverse()
    .map((h: any) => ({
      date: format(new Date(h.date), 'MMM dd'),
      Performance: h.performanceScore,
      SEO: h.seoScore,
      Accessibility: h.accessibilityScore,
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
        
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold tracking-tight sm:text-3xl">PageSpeed Insights ⚡</h1>
            <p className="text-muted-foreground mt-1">
              {data?.url || 'Loading...'}
            </p>
          </div>
          <Button
            onClick={handleRunTest}
            disabled={runPageSpeed.isPending || isFetching}
            className="w-full sm:w-auto"
          >
            <RefreshCw className={`w-4 h-4 mr-2 ${runPageSpeed.isPending ? 'animate-spin' : ''}`} />
            {runPageSpeed.isPending ? 'Running...' : 'Run New Test'}
          </Button>
        </div>
      </div>

      {/* Mobile/Desktop Tabs */}
      <Tabs value={selectedTab} onValueChange={(v) => setSelectedTab(v as any)}>
        <TabsList className="grid h-auto w-full max-w-md grid-cols-2 gap-1">
          <TabsTrigger value="mobile" className="gap-2">
            <Smartphone className="w-4 h-4" />
            Mobile
          </TabsTrigger>
          <TabsTrigger value="desktop" className="gap-2">
            <Monitor className="w-4 h-4" />
            Desktop
          </TabsTrigger>
        </TabsList>

        <TabsContent value={selectedTab} className="space-y-6 mt-6">
          {isLoading ? (
            <Skeleton className="h-96 w-full" />
          ) : !currentData ? (
            <Card>
              <CardContent className="p-12 text-center">
                <Gauge className="w-12 h-12 mx-auto text-muted-foreground mb-4" />
                <h3 className="font-semibold text-lg mb-2">No PageSpeed Data Yet</h3>
                <p className="text-sm text-muted-foreground mb-4">
                  Click "Run New Test" to analyze your website
                </p>
                <Button onClick={handleRunTest} disabled={runPageSpeed.isPending}>
                  <Zap className="w-4 h-4 mr-2" />
                  Run First Test
                </Button>
              </CardContent>
            </Card>
          ) : (
            <>
              {/* Main Scores */}
              <Card>
                <CardHeader>
                  <CardTitle>
                    {selectedTab === 'mobile' ? '📱 Mobile' : '🖥️ Desktop'} Scores
                  </CardTitle>
                  <CardDescription>
                    Lighthouse scores for {selectedTab} performance
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-2 gap-4 sm:gap-6 md:grid-cols-4">
                    <ScoreCard label="Performance" score={currentData.performance} size="md" />
                    <ScoreCard label="Accessibility" score={currentData.accessibility} size="md" />
                    <ScoreCard label="Best Practices" score={currentData.bestPractices} size="md" />
                    <ScoreCard label="SEO" score={currentData.seo} size="md" />
                  </div>
                </CardContent>
              </Card>

              {/* Core Web Vitals */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Gauge className="w-5 h-5" />
                    Core Web Vitals
                  </CardTitle>
                  <CardDescription>
                    Key performance metrics that affect user experience
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                    <VitalCard
                      name="LCP"
                      fullName="Largest Contentful Paint"
                      value={currentData.lcp.display}
                      score={currentData.lcp.score}
                      description="Loading performance"
                      threshold="< 2.5s good"
                    />
                    <VitalCard
                      name="CLS"
                      fullName="Cumulative Layout Shift"
                      value={currentData.cls.display}
                      score={currentData.cls.score}
                      description="Visual stability"
                      threshold="< 0.1 good"
                    />
                    <VitalCard
                      name="TBT"
                      fullName="Total Blocking Time"
                      value={currentData.tbt.display}
                      score={currentData.tbt.score}
                      description="Interactivity"
                      threshold="< 200ms good"
                    />
                    <VitalCard
                      name="FCP"
                      fullName="First Contentful Paint"
                      value={currentData.fcp.display}
                      score={currentData.fcp.score}
                      description="First paint time"
                      threshold="< 1.8s good"
                    />
                    <VitalCard
                      name="SI"
                      fullName="Speed Index"
                      value={currentData.si.display}
                      score={currentData.si.score}
                      description="Visual completion"
                      threshold="< 3.4s good"
                    />
                    <VitalCard
                      name="TTI"
                      fullName="Time to Interactive"
                      value={currentData.tti.display}
                      score={currentData.tti.score}
                      description="Full interactivity"
                      threshold="< 3.8s good"
                    />
                  </div>
                </CardContent>
              </Card>

              {/* Historical Chart */}
              {historyData.length > 1 && (
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <TrendingUp className="w-5 h-5" />
                      Performance History
                    </CardTitle>
                    <CardDescription>
                      Scores trend over time
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <ResponsiveContainer width="100%" height={300}>
                      <LineChart data={historyData}>
                        <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                        <XAxis 
                          dataKey="date" 
                          className="text-xs"
                          tick={{ fill: 'currentColor', fontSize: 11 }}
                        />
                        <YAxis 
                          className="text-xs"
                          tick={{ fill: 'currentColor', fontSize: 11 }}
                          domain={[0, 100]}
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
                        <Line type="monotone" dataKey="Performance" stroke="#3b82f6" strokeWidth={2} />
                        <Line type="monotone" dataKey="SEO" stroke="#10b981" strokeWidth={2} />
                        <Line type="monotone" dataKey="Accessibility" stroke="#f59e0b" strokeWidth={2} />
                      </LineChart>
                    </ResponsiveContainer>
                  </CardContent>
                </Card>
              )}

              {/* Opportunities */}
              {currentData.opportunities?.length > 0 && (
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <AlertTriangle className="w-5 h-5 text-orange-500" />
                      Optimization Opportunities
                    </CardTitle>
                    <CardDescription>
                      Improve these to boost your score
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      {currentData.opportunities.slice(0, 6).map((opp: any, i: number) => (
                        <div
                          key={i}
                          className="p-4 rounded-lg bg-orange-500/5 border border-orange-500/20"
                        >
                          <div className="flex items-start justify-between gap-3 mb-2">
                            <h4 className="font-semibold text-sm">{opp.title}</h4>
                            {opp.displayValue && (
                              <Badge variant="outline" className="text-xs whitespace-nowrap">
                                Save {opp.displayValue}
                              </Badge>
                            )}
                          </div>
                          <p className="text-xs text-muted-foreground line-clamp-2">
                            {opp.description.replace(/<[^>]*>/g, '')}
                          </p>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              )}
            </>
          )}
        </TabsContent>
      </Tabs>
    </div>
  )
}

function VitalCard({
  name,
  fullName,
  value,
  score,
  description,
  threshold,
}: {
  name: string
  fullName: string
  value: string
  score: number
  description: string
  threshold: string
}) {
  const getColor = (s: number) => {
    if (s >= 0.9) return { bg: 'bg-green-500/10 border-green-500/30', text: 'text-green-500', label: 'Good' }
    if (s >= 0.5) return { bg: 'bg-orange-500/10 border-orange-500/30', text: 'text-orange-500', label: 'Needs Work' }
    return { bg: 'bg-red-500/10 border-red-500/30', text: 'text-red-500', label: 'Poor' }
  }

  const colors = getColor(score)

  return (
    <div className={`p-4 rounded-lg border ${colors.bg}`}>
      <div className="flex items-start justify-between mb-2">
        <div>
          <h4 className="font-bold text-lg">{name}</h4>
          <p className="text-xs text-muted-foreground">{fullName}</p>
        </div>
        <Badge variant="outline" className={colors.text}>
          {colors.label}
        </Badge>
      </div>
      <p className="text-2xl font-bold mb-1">{value}</p>
      <p className="text-xs text-muted-foreground">{description}</p>
      <p className="text-xs text-muted-foreground mt-2 pt-2 border-t">
        Target: {threshold}
      </p>
    </div>
  )
}
