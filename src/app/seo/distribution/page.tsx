// src/app/seo/distribution/page.tsx

'use client'

import { useState } from 'react'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Skeleton } from '@/components/ui/skeleton'
import { StatsCard } from '@/components/dashboard/stats-card'
import { DistributionCard } from '@/components/distribution/distribution-card'
import { PlatformSettings } from '@/components/distribution/platform-settings'
import { useDistributions } from '@/hooks/use-distribution'
import { 
  Send, 
  CheckCircle2, 
  XCircle, 
  TrendingUp,
  RefreshCw,
  Sparkles,
  Settings,
  History,
  Globe,
  Rocket,
} from 'lucide-react'
import { toast } from 'sonner'

export default function DistributionPage() {
  const [statusFilter, setStatusFilter] = useState<string | undefined>()
  const { data, isLoading, refetch, isFetching } = useDistributions(50, statusFilter)
  
  const stats = data?.stats
  const distributions = data?.distributions || []
  
  const handleRefresh = async () => {
    await refetch()
    toast.success('Refreshed!')
  }
  
  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-3">
        <div>
          <h1 className="flex items-center gap-2 text-2xl font-bold tracking-tight sm:text-3xl">
            Blog Distribution <Rocket className="h-7 w-7 text-orange-400" />
          </h1>
          <p className="text-muted-foreground mt-1">
            Auto-distribute blogs to 8 platforms for maximum reach & backlinks
          </p>
        </div>
        
        <div className="flex justify-end">
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
      
      {/* Stats Cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <StatsCard
          title="Total Distributions"
          value={stats?.totalDistributions || 0}
          icon={Send}
          isLoading={isLoading}
          description="Blogs distributed"
          color="blue"
        />
        <StatsCard
          title="Successful Posts"
          value={stats?.successfulPosts || 0}
          icon={CheckCircle2}
          isLoading={isLoading}
          description="Across all platforms"
          color="green"
        />
        <StatsCard
          title="Success Rate"
          value={`${(stats?.successRate || 0).toFixed(1)}%`}
          icon={TrendingUp}
          isLoading={isLoading}
          description="Overall performance"
          color="purple"
        />
        <StatsCard
          title="Failed Posts"
          value={stats?.failedPosts || 0}
          icon={XCircle}
          isLoading={isLoading}
          description="Need attention"
          color="orange"
        />
      </div>
      
      {/* Tabs */}
      <Tabs defaultValue="history" className="space-y-6">
        <TabsList className="grid h-auto w-full max-w-md grid-cols-2 gap-1">
          <TabsTrigger value="history" className="flex items-center gap-2">
            <History className="h-4 w-4" />
            History
          </TabsTrigger>
          <TabsTrigger value="platforms" className="flex items-center gap-2">
            <Settings className="h-4 w-4" />
            Platforms
          </TabsTrigger>
        </TabsList>
        
        {/* History Tab */}
        <TabsContent value="history" className="space-y-4 mt-0">
          {/* Status Filter */}
          <Card>
            <CardContent className="p-3">
              <div className="flex items-center gap-2 flex-wrap">
                <span className="text-xs text-muted-foreground mr-2">Filter:</span>
                <FilterButton 
                  active={!statusFilter} 
                  onClick={() => setStatusFilter(undefined)}
                  label="All"
                />
                <FilterButton 
                  active={statusFilter === 'completed'} 
                  onClick={() => setStatusFilter('completed')}
                  label="✅ Completed"
                />
                <FilterButton 
                  active={statusFilter === 'partial'} 
                  onClick={() => setStatusFilter('partial')}
                  label="⚠️ Partial"
                />
                <FilterButton 
                  active={statusFilter === 'failed'} 
                  onClick={() => setStatusFilter('failed')}
                  label="❌ Failed"
                />
                <FilterButton 
                  active={statusFilter === 'processing'} 
                  onClick={() => setStatusFilter('processing')}
                  label="⏳ Processing"
                />
              </div>
            </CardContent>
          </Card>
          
          {/* Distributions Grid */}
          {isLoading ? (
            <DistributionsSkeleton />
          ) : distributions.length === 0 ? (
            <EmptyState hasFilter={!!statusFilter} />
          ) : (
            <div className="grid gap-4 md:grid-cols-2">
              {distributions.map((dist: any) => (
                <DistributionCard key={dist.id} distribution={dist} />
              ))}
            </div>
          )}
        </TabsContent>
        
        {/* Platforms Tab */}
        <TabsContent value="platforms" className="space-y-4 mt-0">
          <Card>
            <CardContent className="p-4">
              <div className="flex items-start gap-3">
                <Sparkles className="h-5 w-5 text-primary flex-shrink-0 mt-0.5" />
                <div>
                  <p className="text-sm font-medium mb-1">Platform Configuration</p>
                  <p className="text-xs text-muted-foreground">
                    Enable or disable platforms for auto-distribution. 
                    Delay = seconds to wait before posting (helps avoid spam detection).
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
          
          <PlatformSettings />
        </TabsContent>
      </Tabs>
    </div>
  )
}

function FilterButton({ 
  active, 
  onClick, 
  label 
}: { 
  active: boolean
  onClick: () => void
  label: string
}) {
  return (
    <button
      onClick={onClick}
      className={`px-3 py-1 rounded-full text-xs font-medium transition-colors ${
        active 
          ? 'bg-primary text-primary-foreground' 
          : 'bg-muted hover:bg-muted/70'
      }`}
    >
      {label}
    </button>
  )
}

function DistributionsSkeleton() {
  return (
    <div className="grid gap-4 md:grid-cols-2">
      {[...Array(4)].map((_, i) => (
        <Card key={i}>
          <CardContent className="p-5 space-y-3">
            <Skeleton className="h-5 w-3/4" />
            <Skeleton className="h-3 w-1/2" />
            <Skeleton className="h-2 w-full" />
            <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
              {[...Array(8)].map((_, j) => (
                <Skeleton key={j} className="h-12 rounded-lg" />
              ))}
            </div>
            <Skeleton className="h-8 w-full" />
          </CardContent>
        </Card>
      ))}
    </div>
  )
}

function EmptyState({ hasFilter }: { hasFilter: boolean }) {
  return (
    <Card>
      <CardContent className="p-12 text-center">
        <Globe className="h-12 w-12 text-muted-foreground/50 mx-auto mb-3" />
        <h3 className="font-semibold mb-2">
          {hasFilter ? 'No distributions match filter' : 'No distributions yet'}
        </h3>
        <p className="text-sm text-muted-foreground">
          {hasFilter 
            ? 'Try changing the filter or wait for new distributions.'
            : 'Once you connect n8n workflow, distributions will appear here automatically.'
          }
        </p>
      </CardContent>
    </Card>
  )
}
