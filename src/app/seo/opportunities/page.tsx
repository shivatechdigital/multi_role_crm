// src/app/seo/opportunities/page.tsx

'use client'

import { useState } from 'react'
import { Card, CardContent } from '@/components/ui/card'
import { Skeleton } from '@/components/ui/skeleton'
import { Button } from '@/components/ui/button'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { StatsCard } from '@/components/dashboard/stats-card'
import { DateRangePicker } from '@/components/dashboard/date-range-picker'
import { OpportunityCard } from '@/components/opportunities/opportunity-card'
import { useOpportunities } from '@/hooks/use-opportunities'
import {
  Target,
  Zap,
  AlertTriangle,
  TrendingUp,
  RefreshCw,
  Sparkles,
  AlertCircle,
} from 'lucide-react'
import { toast } from 'sonner'

export default function OpportunitiesPage() {
  const { data, isLoading, error, refetch, isFetching } = useOpportunities()
  
  const handleRefresh = async () => {
    await refetch()
    toast.success('Opportunities refreshed!')
  }
  
  const stats = data?.stats
  const opps = data?.opportunities
  
  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-3">
        <div>
          <h1 className="text-3xl font-bold tracking-tight flex items-center gap-2">
            SEO Opportunities <Sparkles className="h-7 w-7 text-yellow-400" />
          </h1>
          <p className="text-muted-foreground mt-1">
            AI-detected opportunities to grow your search traffic
          </p>
        </div>
        
        <div className="flex flex-col sm:flex-row gap-3 items-stretch sm:items-center sm:justify-between">
          <DateRangePicker />
          <Button
            variant="outline"
            size="sm"
            onClick={handleRefresh}
            disabled={isFetching}
          >
            <RefreshCw className={`h-4 w-4 mr-2 ${isFetching ? 'animate-spin' : ''}`} />
            Refresh
          </Button>
        </div>
      </div>
      
      {/* Stats */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <StatsCard
          title="Total Opportunities"
          value={stats?.totalOpportunities || 0}
          icon={Target}
          isLoading={isLoading}
          description="Across all categories"
          color="blue"
        />
        <StatsCard
          title="Quick Wins"
          value={stats?.quickWinsCount || 0}
          icon={Zap}
          isLoading={isLoading}
          description="Position 4-15"
          color="orange"
        />
        <StatsCard
          title="CTR Issues"
          value={stats?.ctrIssuesCount || 0}
          icon={AlertTriangle}
          isLoading={isLoading}
          description="Low click-through rates"
          color="purple"
        />
        <StatsCard
          title="Potential Traffic"
          value={`+${stats?.potentialTraffic || 0}`}
          icon={TrendingUp}
          isLoading={isLoading}
          description="Clicks/month possible"
          color="green"
        />
      </div>
      
      {/* Error State */}
      {error && (
        <Card className="border-destructive/30 bg-destructive/5">
          <CardContent className="p-6 text-center">
            <AlertCircle className="h-8 w-8 text-destructive mx-auto mb-2" />
            <p className="text-sm font-semibold mb-1">Failed to load opportunities</p>
            <p className="text-xs text-muted-foreground mb-3">
              {(error as any)?.message || 'Unknown error'}
            </p>
            <Button onClick={handleRefresh} variant="outline" size="sm">
              <RefreshCw className="h-4 w-4 mr-2" />
              Try Again
            </Button>
          </CardContent>
        </Card>
      )}
      
      {/* Tabs */}
      {!error && (
        <Tabs defaultValue="top" className="space-y-4">
          <TabsList className="grid w-full max-w-2xl grid-cols-4">
            <TabsTrigger value="top">
              ⭐ Top ({stats?.topOpportunities?.length || 0})
            </TabsTrigger>
            <TabsTrigger value="quick">
              ⚡ Quick Wins ({opps?.quickWins?.length || 0})
            </TabsTrigger>
            <TabsTrigger value="ctr">
              📉 CTR ({(opps?.ctrIssues?.length || 0) + (opps?.pageCtrIssues?.length || 0)})
            </TabsTrigger>
            <TabsTrigger value="striking">
              🎯 Close ({opps?.strikingDistance?.length || 0})
            </TabsTrigger>
          </TabsList>
          
          <TabsContent value="top" className="mt-0">
            <OpportunitiesGrid
              opportunities={data?.opportunities?.topOpportunities || []}
              isLoading={isLoading}
              emptyMessage="No opportunities yet. Wait for GSC data to populate."
            />
          </TabsContent>
          
          <TabsContent value="quick" className="mt-0">
            <OpportunitiesGrid
              opportunities={opps?.quickWins || []}
              isLoading={isLoading}
              emptyMessage="No quick wins detected. Your rankings might be too low or too high."
            />
          </TabsContent>
          
          <TabsContent value="ctr" className="mt-0">
            <OpportunitiesGrid
              opportunities={[...(opps?.ctrIssues || []), ...(opps?.pageCtrIssues || [])]}
              isLoading={isLoading}
              emptyMessage="No CTR issues detected. Your meta tags are performing well!"
            />
          </TabsContent>
          
          <TabsContent value="striking" className="mt-0">
            <OpportunitiesGrid
              opportunities={opps?.strikingDistance || []}
              isLoading={isLoading}
              emptyMessage="No striking distance keywords. Keep optimizing!"
            />
          </TabsContent>
        </Tabs>
      )}
    </div>
  )
}

function OpportunitiesGrid({
  opportunities,
  isLoading,
  emptyMessage,
}: {
  opportunities: any[]
  isLoading: boolean
  emptyMessage: string
}) {
  if (isLoading) {
    return (
      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
        {[...Array(6)].map((_, i) => (
          <Card key={i}>
            <CardContent className="p-5 space-y-3">
              <Skeleton className="h-6 w-32" />
              <Skeleton className="h-4 w-full" />
              <Skeleton className="h-20 w-full" />
              <Skeleton className="h-12 w-full" />
            </CardContent>
          </Card>
        ))}
      </div>
    )
  }
  
  if (opportunities.length === 0) {
    return (
      <Card>
        <CardContent className="p-12 text-center">
          <Sparkles className="h-12 w-12 text-muted-foreground/50 mx-auto mb-3" />
          <h3 className="font-semibold mb-2">No opportunities found</h3>
          <p className="text-sm text-muted-foreground">{emptyMessage}</p>
        </CardContent>
      </Card>
    )
  }
  
  return (
    <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
      {opportunities.map((opp, idx) => (
        <OpportunityCard key={idx} opportunity={opp} />
      ))}
    </div>
  )
}
