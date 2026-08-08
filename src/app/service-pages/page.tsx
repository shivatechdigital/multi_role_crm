'use client'

import { useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import {
  Plus,
  Search,
  Filter,
  MoreVertical,
  Eye,
  Edit,
  Copy,
  Trash2,
  Globe,
  FileText,
  Layers,
  Upload,
  ExternalLink,
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog'
import {
  useServicePages,
  useDeleteServicePage,
  usePublishServicePage,
  useDuplicateServicePage,
} from '@/hooks/use-service-pages'
import { formatRelativeTime, getStatusColor } from '@/lib/builder/utils'
import { CreatePageDialog } from '@/components/service-pages/CreatePageDialog'
import { ImportHtmlDialog } from '@/components/service-pages/ImportHtmlDialog'
import type { PageStatus, PageType, ServicePage } from '@/lib/types/page-builder'

export default function ServicePagesListPage() {
  const router = useRouter()

  // State
  const [search, setSearch] = useState('')
  const [statusFilter, setStatusFilter] = useState<PageStatus | 'all'>('all')
  const [typeFilter, setTypeFilter] = useState<PageType | 'all'>('all')
  const [showCreateDialog, setShowCreateDialog] = useState(false)
  const [showImportDialog, setShowImportDialog] = useState(false)
  const [deleteSlug, setDeleteSlug] = useState<string | null>(null)

  // Queries
  const { data, isLoading, error } = useServicePages({
    search,
    status: statusFilter,
    page_type: typeFilter,
    per_page: 50,
  })

  const deleteMutation = useDeleteServicePage()
  const publishMutation = usePublishServicePage()
  const duplicateMutation = useDuplicateServicePage()

  const pages = data?.data || []
  const totalPages = data?.pagination?.total || 0

  // Handlers
  const handleDelete = async () => {
    if (!deleteSlug) return
    await deleteMutation.mutateAsync(deleteSlug)
    setDeleteSlug(null)
  }

  const handlePublishToggle = async (page: ServicePage) => {
    const action = page.status === 'published' ? 'unpublish' : 'publish'
    await publishMutation.mutateAsync({ slug: page.slug, action })
  }

  const handleDuplicate = async (slug: string) => {
    const result = await duplicateMutation.mutateAsync(slug)
    if (result?.data?.slug) {
      router.push(`/service-pages/builder/${result.data.slug}`)
    }
  }

  const websiteUrl = process.env.NEXT_PUBLIC_WEBSITE_URL || 'https://your-domain.com'

  return (
    <div className="p-4 sm:p-6">
      {/* Header */}
      <div className="mb-6 flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
            Service Pages
          </h1>
          <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
            Manage your service pages with the visual page builder
          </p>
        </div>

        <div className="flex flex-col gap-2 sm:flex-row">
          <Button
            variant="outline"
            onClick={() => setShowImportDialog(true)}
            className="w-full sm:w-auto"
          >
            <Upload className="mr-2 h-4 w-4" />
            Import HTML
          </Button>
          <Button
            onClick={() => setShowCreateDialog(true)}
            className="w-full bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 sm:w-auto"
          >
            <Plus className="mr-2 h-4 w-4" />
            Create Page
          </Button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="mb-6 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-500">Total Pages</p>
                <p className="mt-1 text-2xl font-bold">{totalPages}</p>
              </div>
              <div className="rounded-lg bg-indigo-50 p-3 dark:bg-indigo-900/30">
                <FileText className="h-5 w-5 text-indigo-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-500">Published</p>
                <p className="mt-1 text-2xl font-bold text-green-600">
                  {pages.filter(p => p.status === 'published').length}
                </p>
              </div>
              <div className="rounded-lg bg-green-50 p-3 dark:bg-green-900/30">
                <Globe className="h-5 w-5 text-green-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-500">Drafts</p>
                <p className="mt-1 text-2xl font-bold text-yellow-600">
                  {pages.filter(p => p.status === 'draft').length}
                </p>
              </div>
              <div className="rounded-lg bg-yellow-50 p-3 dark:bg-yellow-900/30">
                <Edit className="h-5 w-5 text-yellow-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-500">Total Views</p>
                <p className="mt-1 text-2xl font-bold">
                  {pages.reduce((sum, p) => sum + (p.view_count || 0), 0).toLocaleString()}
                </p>
              </div>
              <div className="rounded-lg bg-purple-50 p-3 dark:bg-purple-900/30">
                <Eye className="h-5 w-5 text-purple-600" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <Card className="mb-6">
        <CardContent className="p-4">
          <div className="flex flex-col gap-3 md:flex-row md:items-center">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
              <Input
                placeholder="Search by title or slug..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="pl-9"
              />
            </div>

            <Select
              value={statusFilter}
              onValueChange={(v) => setStatusFilter(v as any)}
            >
              <SelectTrigger className="w-full md:w-40">
                <SelectValue placeholder="Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Status</SelectItem>
                <SelectItem value="published">Published</SelectItem>
                <SelectItem value="draft">Draft</SelectItem>
                <SelectItem value="archived">Archived</SelectItem>
                <SelectItem value="scheduled">Scheduled</SelectItem>
              </SelectContent>
            </Select>

            <Select
              value={typeFilter}
              onValueChange={(v) => setTypeFilter(v as any)}
            >
              <SelectTrigger className="w-full md:w-40">
                <SelectValue placeholder="Type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Types</SelectItem>
                <SelectItem value="service">Service</SelectItem>
                <SelectItem value="landing">Landing</SelectItem>
                <SelectItem value="static">Static</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Pages Grid */}
      {isLoading ? (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {[1, 2, 3, 4, 5, 6].map((i) => (
            <Card key={i} className="animate-pulse">
              <CardContent className="p-6">
                <div className="h-4 w-3/4 rounded bg-gray-200 dark:bg-gray-700" />
                <div className="mt-3 h-3 w-1/2 rounded bg-gray-200 dark:bg-gray-700" />
                <div className="mt-4 h-8 w-full rounded bg-gray-200 dark:bg-gray-700" />
              </CardContent>
            </Card>
          ))}
        </div>
      ) : error ? (
        <Card>
          <CardContent className="p-12 text-center">
            <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-red-100 dark:bg-red-900/30">
              <FileText className="h-6 w-6 text-red-600" />
            </div>
            <h3 className="mb-2 text-lg font-semibold">Failed to load pages</h3>
            <p className="text-sm text-gray-500">
              {(error as any)?.message || 'Something went wrong. Please try again.'}
            </p>
          </CardContent>
        </Card>
      ) : pages.length === 0 ? (
        <Card>
          <CardContent className="p-12 text-center">
            <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-indigo-100 dark:bg-indigo-900/30">
              <Layers className="h-8 w-8 text-indigo-600" />
            </div>
            <h3 className="mb-2 text-xl font-semibold">No pages yet</h3>
            <p className="mb-6 text-sm text-gray-500">
              Get started by creating your first service page or importing existing HTML
            </p>
            <div className="flex flex-col justify-center gap-3 sm:flex-row">
              <Button onClick={() => setShowCreateDialog(true)}>
                <Plus className="mr-2 h-4 w-4" />
                Create First Page
              </Button>
              <Button variant="outline" onClick={() => setShowImportDialog(true)}>
                <Upload className="mr-2 h-4 w-4" />
                Import HTML
              </Button>
            </div>
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {pages.map((page) => (
            <Card key={page.id} className="group transition-shadow hover:shadow-lg">
              <CardHeader className="pb-3">
                <div className="flex items-start justify-between">
                  <div className="flex-1 min-w-0">
                    <CardTitle className="truncate text-lg">
                      {page.title}
                    </CardTitle>
                    <p className="mt-1 truncate text-xs text-gray-500">
                      /services/{page.slug}
                    </p>
                  </div>

                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" size="icon" className="h-8 w-8">
                        <MoreVertical className="h-4 w-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuItem asChild>
                        <Link href={`/service-pages/builder/${page.slug}`}>
                          <Edit className="mr-2 h-4 w-4" />
                          Edit in Builder
                        </Link>
                      </DropdownMenuItem>
                      {page.status === 'published' && (
                        <DropdownMenuItem asChild>
                          <a
                            href={`${websiteUrl}/services/${page.slug}`}
                            target="_blank"
                            rel="noopener noreferrer"
                          >
                            <ExternalLink className="mr-2 h-4 w-4" />
                            View Live
                          </a>
                        </DropdownMenuItem>
                      )}
                      <DropdownMenuItem onClick={() => handlePublishToggle(page)}>
                        <Globe className="mr-2 h-4 w-4" />
                        {page.status === 'published' ? 'Unpublish' : 'Publish'}
                      </DropdownMenuItem>
                      <DropdownMenuItem onClick={() => handleDuplicate(page.slug)}>
                        <Copy className="mr-2 h-4 w-4" />
                        Duplicate
                      </DropdownMenuItem>
                      <DropdownMenuSeparator />
                      <DropdownMenuItem
                        className="text-red-600"
                        onClick={() => setDeleteSlug(page.slug)}
                      >
                        <Trash2 className="mr-2 h-4 w-4" />
                        Delete
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>
              </CardHeader>

              <CardContent>
                {page.excerpt && (
                  <p className="mb-3 line-clamp-2 text-sm text-gray-600 dark:text-gray-400">
                    {page.excerpt}
                  </p>
                )}

                <div className="mb-3 flex flex-wrap items-center gap-2">
                  <Badge variant="outline" className={getStatusColor(page.status)}>
                    {page.status}
                  </Badge>
                  <Badge variant="outline">
                    {page.page_type}
                  </Badge>
                  {page.service_meta?.seo_score && (
                    <Badge variant="outline" className="bg-blue-50 text-blue-700 border-blue-200">
                      SEO: {page.service_meta.seo_score}
                    </Badge>
                  )}
                </div>

                <div className="flex items-center justify-between text-xs text-gray-500">
                  <div className="flex items-center gap-3">
                    <span className="flex items-center gap-1">
                      <Eye className="h-3 w-3" />
                      {page.view_count?.toLocaleString() || 0}
                    </span>
                  </div>
                  <span>{formatRelativeTime(page.updated_at)}</span>
                </div>

                <div className="mt-4 flex gap-2">
                  <Button
                    asChild
                    size="sm"
                    variant="outline"
                    className="flex-1"
                  >
                    <Link href={`/service-pages/builder/${page.slug}`}>
                      <Edit className="mr-1 h-3 w-3" />
                      Edit
                    </Link>
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Dialogs */}
      <CreatePageDialog
        open={showCreateDialog}
        onOpenChange={setShowCreateDialog}
      />

      <ImportHtmlDialog
        open={showImportDialog}
        onOpenChange={setShowImportDialog}
      />

      <AlertDialog open={!!deleteSlug} onOpenChange={() => setDeleteSlug(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete this page?</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. The page will be moved to trash and can be restored within 30 days.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDelete}
              className="bg-red-600 hover:bg-red-700"
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}
