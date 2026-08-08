cat > /tmp/day7_setup.sh << 'SCRIPT_EOF'
#!/bin/bash
set -e
BASE="$HOME/shivatech-crm/crm-frontend"
cd "$BASE"

echo "📦 Installing packages..."
pnpm dlx shadcn@latest add input select table --yes 2>/dev/null || true
pnpm add @tanstack/react-table

echo "📁 Creating directories..."
mkdir -p src/app/api/seo/keywords
mkdir -p src/app/api/seo/pages
mkdir -p src/app/seo/keywords
mkdir -p src/app/seo/pages
mkdir -p src/components/dashboard/data-table
mkdir -p src/components/layout
mkdir -p src/hooks

echo "✍️  Writing files..."

# ── 1. API: keywords ──────────────────────────────────────────
cat > src/app/api/seo/keywords/route.ts << 'EOF'
import { NextResponse } from 'next/server'
import { auth } from '@/lib/auth/auth'
import { gscService } from '@/lib/google/search-console'
import { getDateRange } from '@/lib/utils/dates'

export async function GET(request: Request) {
  try {
    const session = await auth()
    if (!session?.user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    const { searchParams } = new URL(request.url)
    const days = parseInt(searchParams.get('days') || '7')
    const limit = parseInt(searchParams.get('limit') || '100')
    const { startDate, endDate } = getDateRange(days)

    const keywords = await gscService.getTopKeywords(startDate, endDate, limit)

    const totalClicks = keywords.reduce((sum: number, k: any) => sum + k.clicks, 0)
    const totalImpressions = keywords.reduce((sum: number, k: any) => sum + k.impressions, 0)
    const avgPosition = keywords.length > 0 ? keywords.reduce((sum: number, k: any) => sum + k.position, 0) / keywords.length : 0
    const avgCTR = totalImpressions > 0 ? (totalClicks / totalImpressions) * 100 : 0

    return NextResponse.json({
      success: true,
      dateRange: { startDate, endDate, days },
      stats: {
        total: keywords.length,
        totalClicks,
        totalImpressions,
        avgPosition: avgPosition.toFixed(1),
        avgCTR: avgCTR.toFixed(2),
        top3: keywords.filter((k: any) => k.position <= 3).length,
        top10: keywords.filter((k: any) => k.position <= 10).length,
        top20: keywords.filter((k: any) => k.position <= 20).length,
        beyond20: keywords.filter((k: any) => k.position > 20).length,
      },
      keywords,
    })
  } catch (error: any) {
    return NextResponse.json({ error: error.message || 'Failed' }, { status: 500 })
  }
}
EOF

# ── 2. API: pages ─────────────────────────────────────────────
cat > src/app/api/seo/pages/route.ts << 'EOF'
import { NextResponse } from 'next/server'
import { auth } from '@/lib/auth/auth'
import { gscService } from '@/lib/google/search-console'
import { getDateRange } from '@/lib/utils/dates'

export async function GET(request: Request) {
  try {
    const session = await auth()
    if (!session?.user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    const { searchParams } = new URL(request.url)
    const days = parseInt(searchParams.get('days') || '7')
    const limit = parseInt(searchParams.get('limit') || '100')
    const { startDate, endDate } = getDateRange(days)

    const pages = await gscService.getTopPages(startDate, endDate, limit)

    const totalClicks = pages.reduce((sum: number, p: any) => sum + p.clicks, 0)
    const totalImpressions = pages.reduce((sum: number, p: any) => sum + p.impressions, 0)
    const avgPosition = pages.length > 0 ? pages.reduce((sum: number, p: any) => sum + p.position, 0) / pages.length : 0
    const avgCTR = totalImpressions > 0 ? (totalClicks / totalImpressions) * 100 : 0

    return NextResponse.json({
      success: true,
      dateRange: { startDate, endDate, days },
      stats: { total: pages.length, totalClicks, totalImpressions, avgPosition: avgPosition.toFixed(1), avgCTR: avgCTR.toFixed(2) },
      pages,
    })
  } catch (error: any) {
    return NextResponse.json({ error: error.message || 'Failed' }, { status: 500 })
  }
}
EOF

# ── 3. Hook: use-seo-data ─────────────────────────────────────
cat > src/hooks/use-seo-data.ts << 'EOF'
'use client'

import { useQuery } from '@tanstack/react-query'
import axios from 'axios'
import { useDateRangeStore } from '@/store/date-range-store'

export function useKeywords(limit: number = 100) {
  const days = useDateRangeStore((state) => state.days)
  return useQuery({
    queryKey: ['seo-keywords', days, limit],
    queryFn: async () => {
      const { data } = await axios.get(`/api/seo/keywords?days=${days}&limit=${limit}`)
      return data
    },
    refetchOnWindowFocus: false,
    staleTime: 5 * 60 * 1000,
  })
}

export function usePages(limit: number = 100) {
  const days = useDateRangeStore((state) => state.days)
  return useQuery({
    queryKey: ['seo-pages', days, limit],
    queryFn: async () => {
      const { data } = await axios.get(`/api/seo/pages?days=${days}&limit=${limit}`)
      return data
    },
    refetchOnWindowFocus: false,
    staleTime: 5 * 60 * 1000,
  })
}
EOF

# ── 4. DataTable component ────────────────────────────────────
cat > src/components/dashboard/data-table/data-table.tsx << 'EOF'
'use client'

import {
  ColumnDef, flexRender, getCoreRowModel, getFilteredRowModel,
  getPaginationRowModel, getSortedRowModel, SortingState,
  useReactTable, ColumnFiltersState,
} from '@tanstack/react-table'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { ChevronLeft, ChevronRight, Download, Search, ArrowUpDown, ArrowUp, ArrowDown } from 'lucide-react'
import { useState } from 'react'
import { Card } from '@/components/ui/card'

interface DataTableProps<TData, TValue> {
  columns: ColumnDef<TData, TValue>[]
  data: TData[]
  searchPlaceholder?: string
  enableExport?: boolean
  exportFilename?: string
}

export function DataTable<TData, TValue>({ columns, data, searchPlaceholder = 'Search...', enableExport = true, exportFilename = 'export' }: DataTableProps<TData, TValue>) {
  const [sorting, setSorting] = useState<SortingState>([])
  const [columnFilters, setColumnFilters] = useState<ColumnFiltersState>([])
  const [globalFilter, setGlobalFilter] = useState('')

  const table = useReactTable({
    data, columns,
    onSortingChange: setSorting,
    onColumnFiltersChange: setColumnFilters,
    onGlobalFilterChange: setGlobalFilter,
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    state: { sorting, columnFilters, globalFilter },
    initialState: { pagination: { pageSize: 20 } },
  })

  const exportToCSV = () => {
    const headers = columns.map((col: any) => col.header || col.accessorKey).join(',')
    const rows = table.getFilteredRowModel().rows.map((row) =>
      row.getVisibleCells().map((cell) => {
        const value = cell.getValue()
        return typeof value === 'string' && value.includes(',') ? `"${value}"` : value
      }).join(',')
    )
    const csv = [headers, ...rows].join('\n')
    const blob = new Blob([csv], { type: 'text/csv' })
    const url = window.URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `${exportFilename}-${new Date().toISOString().split('T')[0]}.csv`
    a.click()
    window.URL.revokeObjectURL(url)
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between gap-2">
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input placeholder={searchPlaceholder} value={globalFilter ?? ''} onChange={(e) => setGlobalFilter(e.target.value)} className="pl-9" />
        </div>
        <div className="flex items-center gap-2">
          <p className="text-sm text-muted-foreground">{table.getFilteredRowModel().rows.length} results</p>
          {enableExport && (
            <Button variant="outline" size="sm" onClick={exportToCSV} disabled={data.length === 0}>
              <Download className="w-4 h-4 mr-1.5" />Export
            </Button>
          )}
        </div>
      </div>
      <Card>
        <Table>
          <TableHeader>
            {table.getHeaderGroups().map((headerGroup) => (
              <TableRow key={headerGroup.id} className="hover:bg-transparent">
                {headerGroup.headers.map((header) => (
                  <TableHead key={header.id} className="font-semibold">
                    {header.isPlaceholder ? null : (
                      <div className={header.column.getCanSort() ? 'flex items-center gap-1 cursor-pointer select-none hover:text-primary' : ''} onClick={header.column.getToggleSortingHandler()}>
                        {flexRender(header.column.columnDef.header, header.getContext())}
                        {header.column.getCanSort() && (
                          <span className="ml-1">
                            {header.column.getIsSorted() === 'asc' ? <ArrowUp className="w-3 h-3" /> : header.column.getIsSorted() === 'desc' ? <ArrowDown className="w-3 h-3" /> : <ArrowUpDown className="w-3 h-3 opacity-50" />}
                          </span>
                        )}
                      </div>
                    )}
                  </TableHead>
                ))}
              </TableRow>
            ))}
          </TableHeader>
          <TableBody>
            {table.getRowModel().rows?.length ? (
              table.getRowModel().rows.map((row) => (
                <TableRow key={row.id} className="hover:bg-muted/50">
                  {row.getVisibleCells().map((cell) => (
                    <TableCell key={cell.id}>{flexRender(cell.column.columnDef.cell, cell.getContext())}</TableCell>
                  ))}
                </TableRow>
              ))
            ) : (
              <TableRow><TableCell colSpan={columns.length} className="h-24 text-center text-muted-foreground">No results found.</TableCell></TableRow>
            )}
          </TableBody>
        </Table>
      </Card>
      <div className="flex items-center justify-between">
        <div className="text-sm text-muted-foreground">Page {table.getState().pagination.pageIndex + 1} of {table.getPageCount()}</div>
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" onClick={() => table.previousPage()} disabled={!table.getCanPreviousPage()}><ChevronLeft className="w-4 h-4 mr-1" />Previous</Button>
          <Button variant="outline" size="sm" onClick={() => table.nextPage()} disabled={!table.getCanNextPage()}>Next<ChevronRight className="w-4 h-4 ml-1" /></Button>
        </div>
      </div>
    </div>
  )
}
EOF

# ── 5. Keywords columns ───────────────────────────────────────
cat > src/components/dashboard/data-table/keywords-columns.tsx << 'EOF'
'use client'

import { ColumnDef } from '@tanstack/react-table'
import { Badge } from '@/components/ui/badge'

export type Keyword = {
  keyword: string
  clicks: number
  impressions: number
  ctr: number
  position: number
}

export const keywordsColumns: ColumnDef<Keyword>[] = [
  {
    accessorKey: 'keyword',
    header: 'Keyword',
    cell: ({ row }) => <div className="font-medium max-w-md"><p className="truncate" title={row.original.keyword}>{row.original.keyword}</p></div>,
  },
  {
    accessorKey: 'clicks',
    header: 'Clicks',
    cell: ({ row }) => <span className="font-semibold">{row.original.clicks.toLocaleString()}</span>,
  },
  {
    accessorKey: 'impressions',
    header: 'Impressions',
    cell: ({ row }) => <span className="text-muted-foreground">{row.original.impressions.toLocaleString()}</span>,
  },
  {
    accessorKey: 'ctr',
    header: 'CTR',
    cell: ({ row }) => {
      const ctr = row.original.ctr
      const color = ctr > 5 ? 'text-green-500' : ctr > 2 ? 'text-yellow-500' : 'text-red-500'
      return <span className={`font-medium ${color}`}>{ctr.toFixed(2)}%</span>
    },
  },
  {
    accessorKey: 'position',
    header: 'Position',
    cell: ({ row }) => {
      const pos = row.original.position
      let variant: 'default' | 'secondary' | 'destructive' = 'destructive'
      let label = `${pos.toFixed(1)}`
      if (pos <= 3) { variant = 'default'; label = `🏆 ${pos.toFixed(1)}` }
      else if (pos <= 10) { variant = 'default' }
      else if (pos <= 20) { variant = 'secondary' }
      return <Badge variant={variant}>{label}</Badge>
    },
  },
  {
    id: 'opportunity',
    header: 'Opportunity',
    cell: ({ row }) => {
      const { position, impressions, ctr } = row.original
      if (position > 10 && position <= 20 && impressions > 100)
        return <Badge variant="outline" className="border-orange-500/50 text-orange-500">🎯 Easy Win</Badge>
      if (position <= 10 && ctr < 2)
        return <Badge variant="outline" className="border-blue-500/50 text-blue-500">💡 Optimize CTR</Badge>
      if (position <= 3)
        return <Badge variant="outline" className="border-green-500/50 text-green-500">⭐ Top Rank</Badge>
      return <span className="text-xs text-muted-foreground">-</span>
    },
  },
]
EOF

# ── 6. Pages columns ──────────────────────────────────────────
cat > src/components/dashboard/data-table/pages-columns.tsx << 'EOF'
'use client'

import { ColumnDef } from '@tanstack/react-table'
import { Badge } from '@/components/ui/badge'
import { ExternalLink } from 'lucide-react'
import Link from 'next/link'

export type Page = {
  page: string
  clicks: number
  impressions: number
  ctr: number
  position: number
}

export const pagesColumns: ColumnDef<Page>[] = [
  {
    accessorKey: 'page',
    header: 'Page URL',
    cell: ({ row }) => {
      const url = row.original.page
      const path = url.replace(/^https?:\/\/[^\/]+/, '') || '/'
      return (
        <div className="flex items-center gap-2 max-w-md">
          <Link href={url} target="_blank" rel="noopener noreferrer" className="text-sm hover:text-primary truncate group flex items-center gap-1">
            <span className="truncate">{path}</span>
            <ExternalLink className="w-3 h-3 opacity-0 group-hover:opacity-100 flex-shrink-0" />
          </Link>
        </div>
      )
    },
  },
  {
    accessorKey: 'clicks',
    header: 'Clicks',
    cell: ({ row }) => <span className="font-semibold">{row.original.clicks.toLocaleString()}</span>,
  },
  {
    accessorKey: 'impressions',
    header: 'Impressions',
    cell: ({ row }) => <span className="text-muted-foreground">{row.original.impressions.toLocaleString()}</span>,
  },
  {
    accessorKey: 'ctr',
    header: 'CTR',
    cell: ({ row }) => {
      const ctr = row.original.ctr
      const color = ctr > 5 ? 'text-green-500' : ctr > 2 ? 'text-yellow-500' : 'text-red-500'
      return <span className={`font-medium ${color}`}>{ctr.toFixed(2)}%</span>
    },
  },
  {
    accessorKey: 'position',
    header: 'Avg Position',
    cell: ({ row }) => {
      const pos = row.original.position
      let variant: 'default' | 'secondary' | 'destructive' = 'destructive'
      if (pos <= 10) variant = 'default'
      else if (pos <= 20) variant = 'secondary'
      return <Badge variant={variant}>{pos.toFixed(1)}</Badge>
    },
  },
]
EOF
]
EOF

# ── 7. AppLayout component ────────────────────────────────────
cat > src/components/layout/app-layout.tsx << 'EOF'
'use client'

import { Sidebar } from '@/components/layout/sidebar'
import { Topbar } from '@/components/layout/topbar'

export function AppLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-background">
      <Sidebar />
      <div className="lg:pl-64">
        <Topbar />
        <main className="p-6">{children}</main>
      </div>
    </div>
  )
}
EOF

# ── 8. Dashboard layout update ────────────────────────────────
cat > src/app/dashboard/layout.tsx << 'EOF'
import { auth } from '@/lib/auth/auth'
import { redirect } from 'next/navigation'
import { AppLayout } from '@/components/layout/app-layout'

export default async function DashboardLayout({ children }: { children: React.ReactNode }) {
  const session = await auth()
  if (!session?.user) redirect('/auth/login')
  return <AppLayout>{children}</AppLayout>
}
EOF

# ── 9. SEO layout ─────────────────────────────────────────────
cat > src/app/seo/layout.tsx << 'EOF'
import { auth } from '@/lib/auth/auth'
import { redirect } from 'next/navigation'
import { AppLayout } from '@/components/layout/app-layout'

export default async function SeoLayout({ children }: { children: React.ReactNode }) {
  const session = await auth()
  if (!session?.user) redirect('/auth/login')
  return <AppLayout>{children}</AppLayout>
}
EOF

# ── 10. Keywords page ─────────────────────────────────────────
cat > src/app/seo/keywords/page.tsx << 'EOF'
'use client'

import { Card, CardContent } from '@/components/ui/card'
import { Skeleton } from '@/components/ui/skeleton'
import { useKeywords } from '@/hooks/use-seo-data'
import { DateRangePicker } from '@/components/dashboard/date-range-picker'
import { DataTable } from '@/components/dashboard/data-table/data-table'
import { keywordsColumns } from '@/components/dashboard/data-table/keywords-columns'
import { Eye, MousePointer, Search, TrendingUp } from 'lucide-react'
import { StatsCard } from '@/components/dashboard/stats-card'

export default function KeywordsPage() {
  const { data, isLoading, error } = useKeywords(100)

  return (
    <div className="space-y-6">
      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Keywords Tracker 🎯</h1>
          <p className="text-muted-foreground mt-1">Detailed analysis of all your search keywords</p>
        </div>
        <DateRangePicker />
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <StatsCard title="Total Keywords" value={data?.stats?.total || 0} icon={Search} isLoading={isLoading} description="Tracked queries" color="blue" />
        <StatsCard title="Total Clicks" value={data?.stats?.totalClicks || 0} icon={MousePointer} isLoading={isLoading} description="From all keywords" color="green" />
        <StatsCard title="Avg Position" value={data?.stats?.avgPosition || '0'} icon={TrendingUp} isLoading={isLoading} description="Average ranking" color="orange" />
        <StatsCard title="Avg CTR" value={`${data?.stats?.avgCTR || '0'}%`} icon={Eye} isLoading={isLoading} description="Click-through rate" color="purple" />
      </div>

      <div className="grid gap-4 md:grid-cols-4">
        {[
          { title: 'Top 3', key: 'top3', icon: '🏆', color: 'bg-yellow-500/10 border-yellow-500/30' },
          { title: 'Top 10', key: 'top10', icon: '🥇', color: 'bg-green-500/10 border-green-500/30' },
          { title: 'Top 20', key: 'top20', icon: '📈', color: 'bg-blue-500/10 border-blue-500/30' },
          { title: 'Beyond 20', key: 'beyond20', icon: '📊', color: 'bg-gray-500/10 border-gray-500/30' },
        ].map(({ title, key, icon, color }) => {
          const value = data?.stats?.[key] || 0
          const total = data?.stats?.total || 0
          const pct = total > 0 ? ((value / total) * 100).toFixed(1) : '0'
          return (
            <Card key={key} className={`border ${color}`}>
              <CardContent className="p-4">
                {isLoading ? <Skeleton className="h-16 w-full" /> : (
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-muted-foreground">{title}</p>
                      <p className="text-2xl font-bold mt-1">{value}</p>
                      <p className="text-xs text-muted-foreground mt-1">{pct}% of total</p>
                    </div>
                    <span className="text-3xl">{icon}</span>
                  </div>
                )}
              </CardContent>
            </Card>
          )
        })}
      </div>

      <Card>
        <CardContent className="p-6">
          {isLoading ? (
            <div className="space-y-2">{[...Array(10)].map((_, i) => <Skeleton key={i} className="h-12 w-full" />)}</div>
          ) : error ? (
            <div className="text-center py-12">
              <p className="text-destructive">Failed to load keywords</p>
              <p className="text-sm text-muted-foreground mt-1">{(error as any).message}</p>
            </div>
          ) : (
            <DataTable columns={keywordsColumns} data={data?.keywords || []} searchPlaceholder="Search keywords..." exportFilename="keywords" />
          )}
        </CardContent>
      </Card>
    </div>
  )
}
EOF

# ── 11. Pages page ────────────────────────────────────────────
cat > src/app/seo/pages/page.tsx << 'EOF'
'use client'

import { Card, CardContent } from '@/components/ui/card'
import { Skeleton } from '@/components/ui/skeleton'
import { usePages } from '@/hooks/use-seo-data'
import { DateRangePicker } from '@/components/dashboard/date-range-picker'
import { DataTable } from '@/components/dashboard/data-table/data-table'
import { pagesColumns } from '@/components/dashboard/data-table/pages-columns'
import { StatsCard } from '@/components/dashboard/stats-card'
import { FileText, MousePointer, Eye, TrendingUp } from 'lucide-react'

export default function SeoPagesPage() {
  const { data, isLoading, error } = usePages(100)

  return (
    <div className="space-y-6">
      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Page Performance 📄</h1>
          <p className="text-muted-foreground mt-1">SEO performance for all your pages</p>
        </div>
        <DateRangePicker />
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <StatsCard title="Total Pages" value={data?.stats?.total || 0} icon={FileText} isLoading={isLoading} description="Indexed pages" color="blue" />
        <StatsCard title="Total Clicks" value={data?.stats?.totalClicks || 0} icon={MousePointer} isLoading={isLoading} description="From all pages" color="green" />
        <StatsCard title="Total Impressions" value={data?.stats?.totalImpressions || 0} icon={Eye} isLoading={isLoading} description="Search visibility" color="purple" />
        <StatsCard title="Avg Position" value={data?.stats?.avgPosition || '0'} icon={TrendingUp} isLoading={isLoading} description="Average ranking" color="orange" />
      </div>

      <Card>
        <CardContent className="p-6">
          {isLoading ? (
            <div className="space-y-2">{[...Array(10)].map((_, i) => <Skeleton key={i} className="h-12 w-full" />)}</div>
          ) : error ? (
            <div className="text-center py-12">
              <p className="text-destructive">Failed to load pages</p>
              <p className="text-sm text-muted-foreground mt-1">{(error as any).message}</p>
            </div>
          ) : (
            <DataTable columns={pagesColumns} data={data?.pages || []} searchPlaceholder="Search pages..." exportFilename="pages" />
          )}
        </CardContent>
      </Card>
    </div>
  )
}
EOF

# ── 12. SEO Overview page ─────────────────────────────────────
cat > src/app/seo/page.tsx << 'EOF'
'use client'

import { useSeoOverview } from '@/hooks/use-dashboard-data'
import { useKeywords, usePages } from '@/hooks/use-seo-data'
import { StatsCard } from '@/components/dashboard/stats-card'
import { DateRangePicker } from '@/components/dashboard/date-range-picker'
import { SeoChart } from '@/components/dashboard/charts/seo-chart'
import { KeywordsChart } from '@/components/dashboard/charts/keywords-chart'
import { DevicesChart } from '@/components/dashboard/charts/devices-chart'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Skeleton } from '@/components/ui/skeleton'
import { MousePointer, Eye, TrendingUp, Search, Target, Sparkles, ArrowRight, Globe } from 'lucide-react'
import Link from 'next/link'

export default function SeoOverviewPage() {
  const { data: seoData, isLoading: seoLoading } = useSeoOverview()
  const { data: keywordsData, isLoading: keywordsLoading } = useKeywords(50)

  const opportunities = keywordsData?.keywords?.filter((k: any) => k.position > 10 && k.position <= 20 && k.impressions > 100) || []
  const lowCTR = keywordsData?.keywords?.filter((k: any) => k.position <= 10 && k.ctr < 2) || []

  return (
    <div className="space-y-6">
      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">SEO Overview 📈</h1>
          <p className="text-muted-foreground mt-1">Complete search engine optimization dashboard</p>
        </div>
        <DateRangePicker />
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <StatsCard title="Total Clicks" value={seoData?.overview?.clicks || 0} icon={MousePointer} isLoading={seoLoading} description="From Google Search" color="blue" />
        <StatsCard title="Impressions" value={seoData?.overview?.impressions || 0} icon={Eye} isLoading={seoLoading} description="Search visibility" color="purple" />
        <StatsCard title="Avg CTR" value={`${seoData?.overview?.ctr?.toFixed(2) || '0'}%`} icon={Target} isLoading={seoLoading} description="Click-through rate" color="green" />
        <StatsCard title="Avg Position" value={seoData?.overview?.position?.toFixed(1) || '0'} icon={TrendingUp} isLoading={seoLoading} description="Average ranking" color="orange" />
      </div>

      <div className="grid gap-4 lg:grid-cols-2">
        <SeoChart data={seoData?.daily || []} isLoading={seoLoading} />
        <DevicesChart data={seoData?.devices || []} isLoading={seoLoading} />
      </div>

      <KeywordsChart data={seoData?.keywords || []} isLoading={seoLoading} />

      <div className="grid gap-4 lg:grid-cols-2">
        <Card className="border-orange-500/30">
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle>🎯 Quick Win Opportunities</CardTitle>
                <CardDescription>Keywords on page 2 - push them to page 1!</CardDescription>
              </div>
              <Badge variant="outline" className="border-orange-500/50 text-orange-500">{opportunities.length} found</Badge>
            </div>
          </CardHeader>
          <CardContent>
            {keywordsLoading ? (
              <div className="space-y-2">{[...Array(3)].map((_, i) => <Skeleton key={i} className="h-14 w-full" />)}</div>
            ) : opportunities.length === 0 ? (
              <p className="text-sm text-muted-foreground text-center py-8">No quick wins identified</p>
            ) : (
              <div className="space-y-2">
                {opportunities.slice(0, 5).map((kw: any, i: number) => (
                  <div key={i} className="flex items-center justify-between p-3 rounded-lg bg-orange-500/5 border border-orange-500/20">
                    <div className="flex-1 min-w-0">
                      <p className="font-medium text-sm truncate">{kw.keyword}</p>
                      <p className="text-xs text-muted-foreground">{kw.impressions} impressions</p>
                    </div>
                    <Badge variant="secondary">Pos {kw.position.toFixed(1)}</Badge>
                  </div>
                ))}
                <Link href="/seo/keywords">
                  <Button variant="ghost" size="sm" className="w-full mt-2">View all keywords<ArrowRight className="w-4 h-4 ml-1" /></Button>
                </Link>
              </div>
            )}
          </CardContent>
        </Card>

        <Card className="border-blue-500/30">
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle>💡 Optimize CTR</CardTitle>
                <CardDescription>Top-ranked keywords with low click-through</CardDescription>
              </div>
              <Badge variant="outline" className="border-blue-500/50 text-blue-500">{lowCTR.length} found</Badge>
            </div>
          </CardHeader>
          <CardContent>
            {keywordsLoading ? (
              <div className="space-y-2">{[...Array(3)].map((_, i) => <Skeleton key={i} className="h-14 w-full" />)}</div>
            ) : lowCTR.length === 0 ? (
              <p className="text-sm text-muted-foreground text-center py-8">All keywords have good CTR! 🎉</p>
            ) : (
              <div className="space-y-2">
                {lowCTR.slice(0, 5).map((kw: any, i: number) => (
                  <div key={i} className="flex items-center justify-between p-3 rounded-lg bg-blue-500/5 border border-blue-500/20">
                    <div className="flex-1 min-w-0">
                      <p className="font-medium text-sm truncate">{kw.keyword}</p>
                      <p className="text-xs text-muted-foreground">Pos {kw.position.toFixed(1)} • {kw.impressions} impr.</p>
                    </div>
                    <Badge variant="destructive">{kw.ctr.toFixed(2)}%</Badge>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        {[
          { href: '/seo/keywords', icon: Search, color: 'bg-blue-500/10', iconColor: 'text-blue-500', title: 'Keywords Tracker', desc: 'Detailed keyword analysis' },
          { href: '/seo/pages', icon: Globe, color: 'bg-purple-500/10', iconColor: 'text-purple-500', title: 'Pages Performance', desc: 'Page-wise SEO data' },
          { href: '/dashboard', icon: Sparkles, color: 'bg-green-500/10', iconColor: 'text-green-500', title: 'Main Dashboard', desc: 'Full overview' },
        ].map(({ href, icon: Icon, color, iconColor, title, desc }) => (
          <Link key={href} href={href}>
            <Card className="hover:border-primary transition-colors cursor-pointer h-full">
              <CardContent className="p-6">
                <div className="flex items-center gap-4">
                  <div className={`w-12 h-12 rounded-xl ${color} flex items-center justify-center`}>
                    <Icon className={`w-6 h-6 ${iconColor}`} />
                  </div>
                  <div className="flex-1">
                    <h3 className="font-semibold">{title}</h3>
                    <p className="text-sm text-muted-foreground">{desc}</p>
                  </div>
                  <ArrowRight className="w-5 h-5 text-muted-foreground" />
                </div>
              </CardContent>
            </Card>
          </Link>
        ))}
      </div>
    </div>
  )
}
EOF

echo ""
echo "✅ All files created successfully!"
echo ""
echo "Now building..."
pnpm build

SCRIPT_EOF
