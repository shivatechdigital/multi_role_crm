'use client'

import { useState } from 'react'
import Link from 'next/link'
import {
  ArrowLeft, Save, Eye, EyeOff, Undo2, Redo2,
  Rocket, Loader2, Monitor, Tablet, Smartphone,
  ExternalLink, Circle, Search,
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { usePageBuilderStore } from '@/store/page-builder-store'
import { cn } from '@/lib/utils'
import { SEOPanel } from './SEOPanel'
import { useSession } from 'next-auth/react'
import { canManageOperations, getUserRole } from '@/lib/auth/permissions'

interface Props {
  onSave: () => void
  onPublish: () => void
}

export function BuilderToolbar({ onSave, onPublish }: Props) {
  const { data: session } = useSession()
  const {
    page, isDirty, isSaving, isPreviewMode, device,
    setDevice, setPreviewMode, undo, redo, canUndo, canRedo,
  } = usePageBuilderStore()

  const [seoPanelOpen, setSeoPanelOpen] = useState(false)
  const websiteUrl = process.env.NEXT_PUBLIC_WEBSITE_URL || 'https://your-domain.com'
  const canManage = canManageOperations(getUserRole(session?.user?.role))

  if (!page) return null

  return (
    <>
      <div className="flex h-14 items-center justify-between border-b bg-white px-4 dark:bg-gray-800 dark:border-gray-700">
        {/* Left */}
        <div className="flex items-center gap-3">
          <Button asChild variant="ghost" size="sm">
            <Link href="/service-pages">
              <ArrowLeft className="h-4 w-4" />
            </Link>
          </Button>

          <div className="h-6 w-px bg-gray-200 dark:bg-gray-700" />

          <div className="min-w-0">
            <div className="flex items-center gap-2">
              <h1 className="truncate text-sm font-semibold">{page.title}</h1>
              {isDirty && <Circle className="h-2 w-2 fill-orange-500 text-orange-500" />}
            </div>
            <p className="truncate text-xs text-gray-500">/services/{page.slug}</p>
          </div>

          <Badge variant="outline" className={cn(
            page.status === 'published' 
              ? 'bg-green-50 text-green-700 border-green-200' 
              : 'bg-gray-50 text-gray-700 border-gray-200'
          )}>
            {page.status}
          </Badge>
        </div>

        {/* Center */}
        <div className="flex items-center gap-1 rounded-lg border p-1 dark:border-gray-700">
          <Button
            variant={device === 'desktop' ? 'secondary' : 'ghost'}
            size="sm"
            onClick={() => setDevice('desktop')}
            className="h-8 w-8 p-0"
          >
            <Monitor className="h-4 w-4" />
          </Button>
          <Button
            variant={device === 'tablet' ? 'secondary' : 'ghost'}
            size="sm"
            onClick={() => setDevice('tablet')}
            className="h-8 w-8 p-0"
          >
            <Tablet className="h-4 w-4" />
          </Button>
          <Button
            variant={device === 'mobile' ? 'secondary' : 'ghost'}
            size="sm"
            onClick={() => setDevice('mobile')}
            className="h-8 w-8 p-0"
          >
            <Smartphone className="h-4 w-4" />
          </Button>
        </div>

        {/* Right */}
        <div className="flex items-center gap-2">
          <div className="flex items-center gap-1">
            <Button
              variant="ghost"
              size="sm"
              onClick={undo}
              disabled={!canUndo()}
              className="h-8 w-8 p-0"
              title="Undo (Ctrl+Z)"
            >
              <Undo2 className="h-4 w-4" />
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={redo}
              disabled={!canRedo()}
              className="h-8 w-8 p-0"
              title="Redo (Ctrl+Shift+Z)"
            >
              <Redo2 className="h-4 w-4" />
            </Button>
          </div>

          <div className="h-6 w-px bg-gray-200 dark:bg-gray-700" />

          <Button
            variant="ghost"
            size="sm"
            onClick={() => setSeoPanelOpen(true)}
            title="SEO Settings"
          >
            <Search className="mr-2 h-4 w-4" />
            SEO
          </Button>

          <Button
            variant="ghost"
            size="sm"
            onClick={() => setPreviewMode(!isPreviewMode)}
          >
            {isPreviewMode ? (
              <><EyeOff className="mr-2 h-4 w-4" />Exit</>
            ) : (
              <><Eye className="mr-2 h-4 w-4" />Preview</>
            )}
          </Button>

          {page.status === 'published' && (
            <Button asChild variant="ghost" size="sm">
              <a
                href={`${websiteUrl}/services/${page.slug}`}
                target="_blank"
                rel="noopener noreferrer"
              >
                <ExternalLink className="h-4 w-4" />
              </a>
            </Button>
          )}

          <div className="h-6 w-px bg-gray-200 dark:bg-gray-700" />

          <Button
            variant="outline"
            size="sm"
            onClick={onSave}
            disabled={isSaving || !isDirty || !canManage}
          >
            {isSaving ? (
              <><Loader2 className="mr-2 h-4 w-4 animate-spin" />Saving...</>
            ) : (
              <><Save className="mr-2 h-4 w-4" />Save</>
            )}
          </Button>

          <Button
            size="sm"
            onClick={onPublish}
            disabled={isSaving || !canManage}
            className="bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700"
          >
            <Rocket className="mr-2 h-4 w-4" />
            {page.status === 'published' ? 'Update' : 'Publish'}
          </Button>
        </div>
      </div>

      <SEOPanel open={seoPanelOpen} onOpenChange={setSeoPanelOpen} />
    </>
  )
}
