'use client'

import { useHealthOverview } from '@/hooks/use-health-data'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Skeleton } from '@/components/ui/skeleton'
import { Button } from '@/components/ui/button'
import { ScoreCard } from '@/components/health/score-card'
import {
  Activity,
  AlertCircle,
  CheckCircle2,
  Smartphone,
  Monitor,
  Zap,
  Shield,
  Globe,
  ArrowRight,
  Clock,
  TrendingUp,
  XCircle,
} from 'lucide-react'
import Link from 'next/link'
import { formatDistanceToNow } from 'date-fns'

export default function HealthOverviewPage() {
  const { data, isLoading } = useHealthOverview()

  const mobile = data?.pagespeed?.mobile
  const desktop = data?.pagespeed?.desktop
  const uptime = data?.uptime
  const seo = data?.seo

  // Calculate overall health
  const calculateOverallHealth = () => {
    if (!mobile && !desktop) return 0
    const scores = []
    if (mobile) scores.push(mobile.performance, mobile.seo, mobile.accessibility)
    if (desktop) scores.push(desktop.performance, desktop.seo, desktop.accessibility)
    if (seo) scores.push(seo.score)
    return scores.length > 0 ? Math.round(scores.reduce((a, b) => a + b, 0) / scores.length) : 0
  }

  const overallHealth = calculateOverallHealth()

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold tracking-tight sm:text-3xl">Technical Health 🏥</h1>
        <p className="text-muted-foreground mt-1">
          Monitor your website's technical performance and SEO health
        </p>
      </div>

      {/* Overall Health Card */}
      <Card className="border-primary/20 bg-gradient-to-br from-primary/5 to-transparent">
        <CardContent className="p-5 sm:p-8">
          {isLoading ? (
            <Skeleton className="h-40 w-full" />
          ) : (
            <div className="flex flex-col items-center gap-6 lg:flex-row lg:gap-8">
              <ScoreCard label="Overall Health" score={overallHealth} size="lg" />
              
              <div className="grid flex-1 grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
                <HealthStat
                  icon={Activity}
                  label="Uptime"
                  value={`${uptime?.uptime24h || '100'}%`}
                  status={parseFloat(uptime?.uptime24h || '100') >= 99 ? 'good' : 'warning'}
                />
                <HealthStat
                  icon={Clock}
                  label="Response"
                  value={uptime?.responseTime ? `${uptime.responseTime}ms` : 'N/A'}
                  status={uptime?.responseTime && uptime.responseTime < 500 ? 'good' : 'warning'}
                />
                <HealthStat
                  icon={Smartphone}
                  label="Mobile"
                  value={mobile?.performance || 0}
                  status={(mobile?.performance || 0) >= 50 ? 'good' : 'warning'}
                />
                <HealthStat
                  icon={Monitor}
                  label="Desktop"
                  value={desktop?.performance || 0}
                  status={(desktop?.performance || 0) >= 50 ? 'good' : 'warning'}
                />
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* PageSpeed Scores Row */}
      <div className="grid gap-4 lg:grid-cols-2">
        {/* Mobile Scores */}
        <Card>
          <CardHeader>
            <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <CardTitle className="flex items-center gap-2">
                  <Smartphone className="w-5 h-5" />
                  Mobile Performance
                </CardTitle>
                <CardDescription>
                  {mobile?.lastChecked 
                    ? `Updated ${formatDistanceToNow(new Date(mobile.lastChecked), { addSuffix: true })}`
                    : 'Not yet analyzed'
                  }
                </CardDescription>
              </div>
              <Link href="/health/pagespeed">
                <Button variant="ghost" size="sm">
                  Details
                  <ArrowRight className="w-4 h-4 ml-1" />
                </Button>
              </Link>
            </div>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <Skeleton className="h-48 w-full" />
            ) : !mobile ? (
              <div className="text-center py-8">
                <p className="text-sm text-muted-foreground mb-4">
                  No data yet. Run analysis to see scores.
                </p>
                <Link href="/health/pagespeed">
                  <Button>
                    <Zap className="w-4 h-4 mr-2" />
                    Run PageSpeed Test
                  </Button>
                </Link>
              </div>
            ) : (
              <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
                <ScoreCard label="Performance" score={mobile.performance} size="sm" />
                <ScoreCard label="Accessibility" score={mobile.accessibility} size="sm" />
                <ScoreCard label="Best Practices" score={mobile.bestPractices} size="sm" />
                <ScoreCard label="SEO" score={mobile.seo} size="sm" />
              </div>
            )}
          </CardContent>
        </Card>

        {/* Desktop Scores */}
        <Card>
          <CardHeader>
            <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <CardTitle className="flex items-center gap-2">
                  <Monitor className="w-5 h-5" />
                  Desktop Performance
                </CardTitle>
                <CardDescription>
                  {desktop?.lastChecked 
                    ? `Updated ${formatDistanceToNow(new Date(desktop.lastChecked), { addSuffix: true })}`
                    : 'Not yet analyzed'
                  }
                </CardDescription>
              </div>
              <Link href="/health/pagespeed">
                <Button variant="ghost" size="sm">
                  Details
                  <ArrowRight className="w-4 h-4 ml-1" />
                </Button>
              </Link>
            </div>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <Skeleton className="h-48 w-full" />
            ) : !desktop ? (
              <div className="text-center py-8">
                <p className="text-sm text-muted-foreground">
                  No data yet
                </p>
              </div>
            ) : (
              <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
                <ScoreCard label="Performance" score={desktop.performance} size="sm" />
                <ScoreCard label="Accessibility" score={desktop.accessibility} size="sm" />
                <ScoreCard label="Best Practices" score={desktop.bestPractices} size="sm" />
                <ScoreCard label="SEO" score={desktop.seo} size="sm" />
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Uptime & SEO Health */}
      <div className="grid gap-4 lg:grid-cols-2">
        {/* Uptime Card */}
        <Card>
          <CardHeader>
            <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <CardTitle className="flex items-center gap-2">
                  <Activity className="w-5 h-5" />
                  Uptime Status
                </CardTitle>
                <CardDescription>Last 24 hours availability</CardDescription>
              </div>
              <Link href="/health/uptime">
                <Button variant="ghost" size="sm">
                  History
                  <ArrowRight className="w-4 h-4 ml-1" />
                </Button>
              </Link>
            </div>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <Skeleton className="h-32 w-full" />
            ) : (
              <div className="space-y-4">
                <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:gap-4">
                  <div className={`w-3 h-3 rounded-full ${
                    uptime?.status === 'UP' ? 'bg-green-500 animate-pulse' : 'bg-red-500'
                  }`} />
                  <div className="flex-1">
                    <p className="font-semibold">
                      {uptime?.status === 'UP' ? '✅ Website is Online' : '❌ Website is Down'}
                    </p>
                    <p className="text-sm text-muted-foreground">
                      Last checked: {uptime?.lastChecked 
                        ? formatDistanceToNow(new Date(uptime.lastChecked), { addSuffix: true })
                        : 'Never'
                      }
                    </p>
                  </div>
                  <Badge variant={uptime?.status === 'UP' ? 'default' : 'destructive'}>
                    {uptime?.uptime24h}%
                  </Badge>
                </div>

                <div className="grid grid-cols-1 gap-3 border-t pt-4 sm:grid-cols-3">
                  <div>
                    <p className="text-xs text-muted-foreground">Response Time</p>
                    <p className="text-xl font-bold">{uptime?.responseTime || 0}ms</p>
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground">24h Uptime</p>
                    <p className="text-xl font-bold">{uptime?.uptime24h}%</p>
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground">Status</p>
                    <Badge variant={uptime?.status === 'UP' ? 'default' : 'destructive'}>
                      {uptime?.status || 'N/A'}
                    </Badge>
                  </div>
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        {/* SEO Health Checks */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Shield className="w-5 h-5" />
              SEO Health Checks
            </CardTitle>
            <CardDescription>
              Technical SEO essentials
            </CardDescription>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <Skeleton className="h-32 w-full" />
            ) : (
              <div className="space-y-3">
                <div className="flex flex-col gap-2 rounded-lg bg-muted/50 p-3 sm:flex-row sm:items-center sm:justify-between">
                  <span className="text-sm">SEO Score</span>
                  <Badge variant={seo?.score >= 80 ? 'default' : 'secondary'}>
                    {seo?.score || 0}/100
                  </Badge>
                </div>

                {seo?.checks?.map((check: any, i: number) => (
                  <div key={i} className="flex items-center gap-3 p-3 rounded-lg bg-muted/30">
                    {check.status === 'PASS' ? (
                      <CheckCircle2 className="w-5 h-5 text-green-500 flex-shrink-0" />
                    ) : (
                      <XCircle className="w-5 h-5 text-red-500 flex-shrink-0" />
                    )}
                    <div className="flex-1">
                      <p className="text-sm font-medium">{check.name}</p>
                      <p className="text-xs text-muted-foreground">{check.message}</p>
                    </div>
                    {check.critical && (
                      <Badge variant="outline" className="text-xs">Critical</Badge>
                    )}
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Active Issues */}
      {data?.issues?.total > 0 && (
        <Card className="border-orange-500/30">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <AlertCircle className="w-5 h-5 text-orange-500" />
              Active Issues ({data.issues.total})
            </CardTitle>
            <CardDescription>
              Technical issues that need attention
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {data.issues.list.map((issue: any, i: number) => (
                <div key={i} className="flex items-start gap-3 p-3 rounded-lg bg-muted/50">
                  <Badge variant={
                    issue.severity === 'critical' ? 'destructive' : 
                    issue.severity === 'high' ? 'destructive' : 'secondary'
                  }>
                    {issue.severity}
                  </Badge>
                  <div className="flex-1">
                    <p className="text-sm font-medium">{issue.type}</p>
                    <p className="text-xs text-muted-foreground">{issue.description}</p>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Quick Links */}
      <div className="grid gap-4 md:grid-cols-2">
        <Link href="/health/pagespeed">
          <Card className="hover:border-primary transition-colors cursor-pointer h-full">
            <CardContent className="p-6">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-xl bg-blue-500/10 flex items-center justify-center">
                  <Zap className="w-6 h-6 text-blue-500" />
                </div>
                <div className="flex-1">
                  <h3 className="font-semibold">PageSpeed Insights</h3>
                  <p className="text-sm text-muted-foreground">
                    Detailed performance metrics & Core Web Vitals
                  </p>
                </div>
                <ArrowRight className="w-5 h-5 text-muted-foreground" />
              </div>
            </CardContent>
          </Card>
        </Link>

        <Link href="/health/uptime">
          <Card className="hover:border-primary transition-colors cursor-pointer h-full">
            <CardContent className="p-6">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-xl bg-green-500/10 flex items-center justify-center">
                  <Activity className="w-6 h-6 text-green-500" />
                </div>
                <div className="flex-1">
                  <h3 className="font-semibold">Uptime Monitoring</h3>
                  <p className="text-sm text-muted-foreground">
                    Track availability & response times
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

function HealthStat({
  icon: Icon,
  label,
  value,
  status,
}: {
  icon: any
  label: string
  value: string | number
  status: 'good' | 'warning' | 'bad'
}) {
  const colors = {
    good: 'text-green-500 bg-green-500/10',
    warning: 'text-orange-500 bg-orange-500/10',
    bad: 'text-red-500 bg-red-500/10',
  }

  return (
    <div className="text-center">
      <div className={`w-10 h-10 rounded-lg mx-auto flex items-center justify-center mb-2 ${colors[status]}`}>
        <Icon className="w-5 h-5" />
      </div>
      <p className="text-2xl font-bold">{value}</p>
      <p className="text-xs text-muted-foreground">{label}</p>
    </div>
  )
}
