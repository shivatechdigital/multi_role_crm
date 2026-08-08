'use client'

import { useState } from 'react'
import { Search, Info, ExternalLink } from 'lucide-react'
import {
  Sheet, SheetContent, SheetDescription,
  SheetHeader, SheetTitle,
} from '@/components/ui/sheet'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Button } from '@/components/ui/button'
import { usePageBuilderStore } from '@/store/page-builder-store'
import { useUpdateServicePage } from '@/hooks/use-service-pages'
import { toast } from 'sonner'

interface Props {
  open: boolean
  onOpenChange: (open: boolean) => void
}

export function SEOPanel({ open, onOpenChange }: Props) {
  const { page } = usePageBuilderStore()
  const updateMutation = useUpdateServicePage()

  const [metaTitle, setMetaTitle] = useState(page?.title || '')
  const [metaDescription, setMetaDescription] = useState(page?.excerpt || '')
  const [customHead, setCustomHead] = useState(page?.custom_head_html || '')
  const [customCss, setCustomCss] = useState(page?.custom_css || '')
  const [customJs, setCustomJs] = useState(page?.custom_js || '')

  if (!page) return null

  const handleSave = async () => {
    try {
      await updateMutation.mutateAsync({
        slug: page.slug,
        payload: {
          title: metaTitle,
          excerpt: metaDescription,
          custom_head_html: customHead,
          custom_css: customCss,
          custom_js: customJs,
          revision_note: 'Updated SEO/Custom Code',
        },
      })
      toast.success('SEO settings saved!')
      onOpenChange(false)
    } catch (error) {
      // Handled by mutation
    }
  }

  const titleLength = metaTitle.length
  const descLength = metaDescription.length
  
  const seoIssues = []
  if (titleLength < 30) seoIssues.push('Title too short (min 30 chars)')
  if (titleLength > 60) seoIssues.push('Title too long (max 60 chars)')
  if (descLength < 120) seoIssues.push('Description too short (min 120 chars)')
  if (descLength > 160) seoIssues.push('Description too long (max 160 chars)')

  const seoScore = Math.max(0, 100 - (seoIssues.length * 25))

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent side="right" className="w-full sm:max-w-lg overflow-y-auto">
        <SheetHeader>
          <SheetTitle className="flex items-center gap-2">
            <Search className="h-4 w-4" />
            SEO & Custom Code
          </SheetTitle>
          <SheetDescription>
            Optimize your page for search engines
          </SheetDescription>
        </SheetHeader>

        <div className="mt-6 space-y-4">
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium">SEO Score</p>
                  <p className="text-xs text-gray-500">Based on best practices</p>
                </div>
                <div className={`text-3xl font-bold ${
                  seoScore >= 80 ? 'text-green-600' : seoScore >= 50 ? 'text-yellow-600' : 'text-red-600'
                }`}>
                  {seoScore}
                </div>
              </div>
              
              {seoIssues.length > 0 && (
                <div className="mt-3 space-y-1">
                  {seoIssues.map((issue, i) => (
                    <div key={i} className="flex items-start gap-2 text-xs text-red-600">
                      <Info className="mt-0.5 h-3 w-3 flex-shrink-0" />
                      <span>{issue}</span>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm">Meta Tags</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div>
                <div className="mb-1 flex items-center justify-between">
                  <Label htmlFor="meta-title" className="text-xs">
                    Meta Title
                  </Label>
                  <span className={`text-xs ${
                    titleLength >= 30 && titleLength <= 60 ? 'text-green-600' : 'text-red-500'
                  }`}>
                    {titleLength}/60
                  </span>
                </div>
                <Input
                  id="meta-title"
                  value={metaTitle}
                  onChange={(e) => setMetaTitle(e.target.value)}
                  placeholder="Page title for search engines"
                />
              </div>

              <div>
                <div className="mb-1 flex items-center justify-between">
                  <Label htmlFor="meta-desc" className="text-xs">
                    Meta Description
                  </Label>
                  <span className={`text-xs ${
                    descLength >= 120 && descLength <= 160 ? 'text-green-600' : 'text-red-500'
                  }`}>
                    {descLength}/160
                  </span>
                </div>
                <Textarea
                  id="meta-desc"
                  value={metaDescription}
                  onChange={(e) => setMetaDescription(e.target.value)}
                  placeholder="Brief description for search results"
                  rows={3}
                />
              </div>

              <div className="mt-4 rounded-lg border p-3 bg-white dark:bg-gray-800 dark:border-gray-700">
                <p className="mb-1 text-xs text-gray-500">Google Search Preview:</p>
                <p className="text-lg text-blue-700 hover:underline cursor-pointer line-clamp-1">
                  {metaTitle || 'Your page title'}
                </p>
                <p className="text-xs text-green-700 mt-0.5">
                  {process.env.NEXT_PUBLIC_WEBSITE_URL || 'https://shivatechdigital.com'}/services/{page.slug}
                </p>
                <p className="mt-1 text-sm text-gray-600 dark:text-gray-400 line-clamp-2">
                  {metaDescription || 'Your meta description will appear here...'}
                </p>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm">URL</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center gap-2 text-sm">
                <code className="rounded bg-gray-100 px-2 py-1 dark:bg-gray-800">
                  /services/{page.slug}
                </code>
                {page.status === 'published' && (
                  <a
                    href={`${process.env.NEXT_PUBLIC_WEBSITE_URL}/services/${page.slug}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-indigo-600 hover:underline"
                  >
                    <ExternalLink className="h-3 w-3" />
                  </a>
                )}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm">Custom Code</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div>
                <Label className="text-xs">Head HTML</Label>
                <Textarea
                  value={customHead}
                  onChange={(e) => setCustomHead(e.target.value)}
                  placeholder="<meta name='...' content='...'>"
                  rows={3}
                  className="mt-1 font-mono text-xs"
                />
              </div>

              <div>
                <Label className="text-xs">Custom CSS</Label>
                <Textarea
                  value={customCss}
                  onChange={(e) => setCustomCss(e.target.value)}
                  placeholder=".my-class { color: red; }"
                  rows={4}
                  className="mt-1 font-mono text-xs"
                />
              </div>

              <div>
                <Label className="text-xs">Custom JavaScript</Label>
                <Textarea
                  value={customJs}
                  onChange={(e) => setCustomJs(e.target.value)}
                  placeholder="console.log('Page loaded');"
                  rows={4}
                  className="mt-1 font-mono text-xs"
                />
              </div>
            </CardContent>
          </Card>

          <div className="flex justify-end gap-2 sticky bottom-0 bg-white dark:bg-gray-950 pt-4 border-t dark:border-gray-800">
            <Button variant="outline" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            <Button onClick={handleSave} disabled={updateMutation.isPending}>
              {updateMutation.isPending ? 'Saving...' : 'Save SEO Settings'}
            </Button>
          </div>
        </div>
      </SheetContent>
    </Sheet>
  )
}
