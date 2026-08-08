// src/app/seo/pages/page.tsx

'use client'

import { useState, useMemo } from 'react'
import { Card, CardContent } from '@/components/ui/card'
import { Skeleton } from '@/components/ui/skeleton'
import { Button } from '@/components/ui/button'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { usePages } from '@/hooks/use-seo-data'
import { useSeoPages } from '@/hooks/use-seo-pages'
import { DateRangePicker } from '@/components/dashboard/date-range-picker'
import { DataTable } from '@/components/dashboard/data-table/data-table'
import { pagesColumns } from '@/components/dashboard/data-table/pages-columns'
import { StatsCard } from '@/components/dashboard/stats-card'
import { PageCard } from '@/components/seo-pages/page-card'
import { PagesStats } from '@/components/seo-pages/pages-stats'
import { PagesFilters, type FilterState } from '@/components/seo-pages/pages-filters'
import {
  FileText,
  MousePointer,
  Eye,
  TrendingUp,
  BarChart3,
  Settings,
  RefreshCw,
  AlertCircle,
} from 'lucide-react'
import { toast } from 'sonner'

export default function SeoPagesPage() {
  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex flex-col gap-2">
        <h1 className="text-3xl font-bold tracking-tight">SEO Pages 📄</h1>
        <p className="text-muted-foreground">
          View performance metrics and manage on-page SEO for all your pages
        </p>
      </div>

      {/* Tabs */}
      <Tabs defaultValue="manage" className="space-y-6">
        <TabsList className="grid w-full max-w-md grid-cols-2">
          <TabsTrigger value="performance" className="flex items-center gap-2">
            <BarChart3 className="h-4 w-4" />
            Performance
          </TabsTrigger>
          <TabsTrigger value="manage" className="flex items-center gap-2">
            <Settings className="h-4 w-4" />
            Manage SEO
          </TabsTrigger>
        </TabsList>

        {/* TAB 1: Performance (Existing GSC Data) */}
        <TabsContent value="performance" className="space-y-6 mt-0">
          <PerformanceTab />
        </TabsContent>

        {/* TAB 2: Manage SEO (New Feature) */}
        <TabsContent value="manage" className="space-y-6 mt-0">
          <ManageSeoTab />
        </TabsContent>
      </Tabs>
    </div>
  )
}

// ============================================
// TAB 1: PERFORMANCE (Existing GSC Data)
// ============================================
function PerformanceTab() {
  const { data, isLoading, error } = usePages(100)

  return (
    <div className="space-y-6">
      {/* Date Range */}
      <div className="flex justify-end">
        <DateRangePicker />
      </div>

      {/* GSC Stats */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <StatsCard
          title="Total Pages"
          value={data?.stats?.total || 0}
          icon={FileText}
          isLoading={isLoading}
          description="Indexed pages"
          color="blue"
        />
        <StatsCard
          title="Total Clicks"
          value={data?.stats?.totalClicks || 0}
          icon={MousePointer}
          isLoading={isLoading}
          description="From all pages"
          color="green"
        />
        <StatsCard
          title="Total Impressions"
          value={data?.stats?.totalImpressions || 0}
          icon={Eye}
          isLoading={isLoading}
          description="Search visibility"
          color="purple"
        />
        <StatsCard
          title="Avg Position"
          value={data?.stats?.avgPosition || '0'}
          icon={TrendingUp}
          isLoading={isLoading}
          description="Average ranking"
          color="orange"
        />
      </div>

      {/* Pages Table */}
      <Card>
        <CardContent className="p-6">
          {isLoading ? (
            <div className="space-y-2">
              {[...Array(10)].map((_, i) => (
                <Skeleton key={i} className="h-12 w-full" />
              ))}
            </div>
          ) : error ? (
            <div className="text-center py-12">
              <p className="text-destructive">Failed to load pages</p>
              <p className="text-sm text-muted-foreground mt-1">
                {(error as any).message}
              </p>
            </div>
          ) : (
            <DataTable
              columns={pagesColumns}
              data={data?.pages || []}
              searchPlaceholder="Search pages..."
              exportFilename="pages"
            />
          )}
        </CardContent>
      </Card>
    </div>
  )
}

// ============================================
// TAB 2: MANAGE SEO (New Feature)
// ============================================
function ManageSeoTab() {
  const { data, isLoading, error, refetch, isFetching } = useSeoPages()
  
  const [filters, setFilters] = useState<FilterState>({
    search: '',
    type: 'all',
    scoreRange: 'all',
    sortBy: 'name',
  })
  
  // Filter and sort pages
  const filteredPages = useMemo(() => {
    if (!data?.data) return []
    
    let result = [...data.data]
    
    // Search filter
    if (filters.search) {
      const search = filters.search.toLowerCase()
      result = result.filter(page => 
        page.slug.toLowerCase().includes(search) ||
        page.meta_title?.toLowerCase().includes(search) ||
        page.meta_description?.toLowerCase().includes(search) ||
        page.focus_keyword?.toLowerCase().includes(search)
      )
    }
    
    // Type filter
    if (filters.type !== 'all') {
      result = result.filter(page => page.type === filters.type)
    }
    
    // Score range filter
    if (filters.scoreRange !== 'all') {
      result = result.filter(page => {
        const score = page.seo_score || 0
        if (filters.scoreRange === 'high') return score >= 80
        if (filters.scoreRange === 'medium') return score >= 60 && score < 80
        if (filters.scoreRange === 'low') return score < 60
        return true
      })
    }
    
    // Sort
    result.sort((a, b) => {
      switch (filters.sortBy) {
        case 'score':
          return (b.seo_score || 0) - (a.seo_score || 0)
        case 'updated':
          return new Date(b.updated_at).getTime() - new Date(a.updated_at).getTime()
        case 'clicks':
          return b.current_clicks - a.current_clicks
        case 'name':
        default:
          return a.slug.localeCompare(b.slug)
      }
    })
    
    return result
  }, [data?.data, filters])
  
  const handleRefresh = async () => {
    await refetch()
    toast.success('Pages refreshed', {
      description: 'Latest data loaded from server.',
    })
  }
  
  return (
    <div className="space-y-6">
      {/* Top Action Bar */}
      <Card>
        <CardContent className="p-4">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
            <div className="flex items-start gap-3">
              <div className="p-2 rounded-lg bg-primary/10 border border-primary/20">
                <Settings className="h-4 w-4 text-primary" />
              </div>
              <div>
                <p className="text-sm font-medium">SEO Management</p>
                <p className="text-xs text-muted-foreground">
                  Edit meta tags, FAQs, and schemas. Changes apply immediately.
                </p>
              </div>
            </div>
            <Button
              variant="outline"
              size="sm"
              onClick={handleRefresh}
              disabled={isFetching}
              className="w-full sm:w-auto"
            >
              <RefreshCw className={`h-4 w-4 mr-2 ${isFetching ? 'animate-spin' : ''}`} />
              Refresh Data
            </Button>
          </div>
        </CardContent>
      </Card>
      
      {/* SEO Stats */}
      <PagesStats />
      
      {/* Filters */}
      <Card>
        <CardContent className="p-4">
          <PagesFilters
            filters={filters}
            onChange={setFilters}
            totalCount={data?.data?.length || 0}
            filteredCount={filteredPages.length}
          />
        </CardContent>
      </Card>
      
      {/* Pages Grid */}
      {isLoading ? (
        <PagesGridSkeleton />
      ) : error ? (
        <ErrorState onRetry={refetch} />
      ) : filteredPages.length === 0 ? (
        <EmptyState hasFilters={filters.search !== '' || filters.type !== 'all' || filters.scoreRange !== 'all'} />
      ) : (
        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
          {filteredPages.map((page) => (
            <PageCard key={page.id} page={page} />
          ))}
        </div>
      )}
    </div>
  )
}

function PagesGridSkeleton() {
  return (
    <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
      {[...Array(6)].map((_, i) => (
        <Card key={i}>
          <CardContent className="p-5 space-y-3">
            <div className="flex justify-between">
              <Skeleton className="h-6 w-32" />
              <Skeleton className="h-14 w-14 rounded-lg" />
            </div>
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-4 w-3/4" />
            <Skeleton className="h-8 w-full" />
            <div className="grid grid-cols-3 gap-2">
              <Skeleton className="h-8" />
              <Skeleton className="h-8" />
              <Skeleton className="h-8" />
            </div>
            <div className="flex justify-between">
              <Skeleton className="h-6 w-24" />
              <Skeleton className="h-7 w-20" />
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  )
}

function ErrorState({ onRetry }: { onRetry: () => void }) {
  return (
    <Card>
      <CardContent className="p-12 text-center">
        <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-destructive/10 mb-4">
          <AlertCircle className="h-8 w-8 text-destructive" />
        </div>
        <h3 className="text-lg font-semibold mb-2">Failed to load pages</h3>
        <p className="text-sm text-muted-foreground mb-4">
          There was an error connecting to the server. Please try again.
        </p>
        <Button onClick={onRetry} variant="outline">
          <RefreshCw className="h-4 w-4 mr-2" />
          Try Again
        </Button>
      </CardContent>
    </Card>
  )
}

function EmptyState({ hasFilters }: { hasFilters: boolean }) {
  return (
    <Card>
      <CardContent className="p-12 text-center">
        <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-muted mb-4">
          <FileText className="h-8 w-8 text-muted-foreground" />
        </div>
        <h3 className="text-lg font-semibold mb-2">
          {hasFilters ? 'No pages match your filters' : 'No pages found'}
        </h3>
        <p className="text-sm text-muted-foreground">
          {hasFilters 
            ? 'Try adjusting your search or filters.'
            : 'Pages will appear here once added to the database.'
          }
        </p>
      </CardContent>
    </Card>
  )
}
