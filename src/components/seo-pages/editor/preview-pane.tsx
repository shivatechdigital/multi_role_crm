// src/components/seo-pages/editor/preview-pane.tsx

'use client'

import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { ExternalLink, Search, Globe } from 'lucide-react'

interface PreviewPaneProps {
  url: string
  title: string
  description: string
  ogImage?: string
}

export function PreviewPane({ url, title, description, ogImage }: PreviewPaneProps) {
  const displayUrl = url.replace(/^https?:\/\//, '').replace(/\/$/, '')
  
  return (
    <div className="space-y-6">
      {/* Google Search Preview */}
      <Card>
        <CardContent className="p-6">
          <div className="flex items-center gap-2 pb-3 border-b mb-4">
            <Search className="h-5 w-5 text-primary" />
            <h3 className="font-semibold">Google Search Preview</h3>
          </div>
          
          <div className="bg-white dark:bg-gray-950 p-4 rounded-lg border max-w-2xl">
            {/* Breadcrumb */}
            <div className="flex items-center gap-2 mb-1">
              <div className="w-6 h-6 rounded-full bg-blue-500 flex items-center justify-center text-white text-xs">
                S
              </div>
              <div className="text-xs">
                <div className="text-gray-700 dark:text-gray-300">Shiva Tech Digital</div>
                <div className="text-gray-500">{displayUrl}</div>
              </div>
            </div>
            
            {/* Title */}
            <h3 className="text-xl text-blue-700 dark:text-blue-400 hover:underline cursor-pointer mt-1 line-clamp-2">
              {title || 'Untitled Page'}
            </h3>
            
            {/* Description */}
            <p className="text-sm text-gray-700 dark:text-gray-400 mt-1 line-clamp-3">
              {description || 'No description provided.'}
            </p>
          </div>
          
          <p className="text-xs text-muted-foreground mt-3">
            This is how your page will appear in Google search results.
          </p>
        </CardContent>
      </Card>
      
      {/* Social Media Preview (OG Card) */}
      {(ogImage || title) && (
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center gap-2 pb-3 border-b mb-4">
              <Globe className="h-5 w-5 text-primary" />
              <h3 className="font-semibold">Social Media Preview</h3>
            </div>
            
            <div className="bg-white dark:bg-gray-950 rounded-lg border overflow-hidden max-w-md">
              {ogImage && (
                <div className="aspect-[1.91/1] bg-muted overflow-hidden">
                  <img 
                    src={ogImage} 
                    alt="OG Preview"
                    className="w-full h-full object-cover"
                    onError={(e) => {
                      e.currentTarget.src = 'https://via.placeholder.com/1200x630?text=Image+Not+Found'
                    }}
                  />
                </div>
              )}
              <div className="p-3 bg-gray-50 dark:bg-gray-900">
                <p className="text-xs text-gray-500 uppercase mb-1">{displayUrl}</p>
                <p className="font-semibold text-sm text-gray-900 dark:text-gray-100 line-clamp-1">
                  {title}
                </p>
                <p className="text-xs text-gray-600 dark:text-gray-400 mt-1 line-clamp-2">
                  {description}
                </p>
              </div>
            </div>
            
            <p className="text-xs text-muted-foreground mt-3">
              Preview for Facebook, LinkedIn, Twitter, and other platforms.
            </p>
          </CardContent>
        </Card>
      )}
      
      {/* Live Website Preview */}
      <Card>
        <CardContent className="p-6">
          <div className="flex items-center justify-between pb-3 border-b mb-4">
            <div className="flex items-center gap-2">
              <Globe className="h-5 w-5 text-primary" />
              <h3 className="font-semibold">Live Website</h3>
            </div>
            <Button variant="outline" size="sm" asChild>
              <a href={url} target="_blank" rel="noopener noreferrer">
                <ExternalLink className="h-4 w-4 mr-2" />
                Open in New Tab
              </a>
            </Button>
          </div>
          
          <div className="rounded-lg overflow-hidden border bg-background">
            <iframe
              src={url}
              className="w-full h-[600px]"
              title="Live Preview"
              sandbox="allow-same-origin allow-scripts"
            />
          </div>
          
          <p className="text-xs text-muted-foreground mt-3">
            Note: Save changes and refresh to see updates reflect on the live website.
          </p>
        </CardContent>
      </Card>
    </div>
  )
}
