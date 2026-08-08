// src/components/seo-pages/editor/meta-editor.tsx

'use client'

import { Card, CardContent } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Label } from '@/components/ui/label'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Target, Plus, X, Tag } from 'lucide-react'
import { useState } from 'react'

export interface MetaFormData {
  meta_title: string
  meta_description: string
  meta_keywords: string
  focus_keyword: string
  target_keywords: string[]
  og_title: string
  og_description: string
  og_image: string
  h1_tag: string
}

interface MetaEditorProps {
  data: MetaFormData
  onChange: (data: MetaFormData) => void
}

export function MetaEditor({ data, onChange }: MetaEditorProps) {
  const [newKeyword, setNewKeyword] = useState('')
  
  const update = (field: keyof MetaFormData, value: any) => {
    onChange({ ...data, [field]: value })
  }
  
  const addKeyword = () => {
    if (newKeyword.trim() && !data.target_keywords.includes(newKeyword.trim())) {
      update('target_keywords', [...data.target_keywords, newKeyword.trim()])
      setNewKeyword('')
    }
  }
  
  const removeKeyword = (keyword: string) => {
    update('target_keywords', data.target_keywords.filter(k => k !== keyword))
  }
  
  // Character counters with status
  const titleLength = data.meta_title?.length || 0
  const titleStatus = getCharStatus(titleLength, 30, 60)
  
  const descLength = data.meta_description?.length || 0
  const descStatus = getCharStatus(descLength, 120, 160)
  
  return (
    <div className="space-y-6">
      {/* Basic SEO Meta */}
      <Card>
        <CardContent className="p-6 space-y-5">
          <div className="flex items-center gap-2 pb-2 border-b">
            <Tag className="h-5 w-5 text-primary" />
            <h3 className="font-semibold">Basic SEO Meta</h3>
          </div>
          
          {/* Meta Title */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <Label htmlFor="meta_title">
                Meta Title <span className="text-destructive">*</span>
              </Label>
              <span className={`text-xs font-mono ${titleStatus.color}`}>
                {titleLength}/60 • {titleStatus.label}
              </span>
            </div>
            <Input
              id="meta_title"
              placeholder="e.g., Best Web Development Company in Noida | Shiva Tech"
              value={data.meta_title || ''}
              onChange={(e) => update('meta_title', e.target.value)}
              maxLength={200}
            />
            <p className="text-xs text-muted-foreground">
              Appears as clickable headline in Google results. Optimal: 30-60 characters.
            </p>
          </div>
          
          {/* Meta Description */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <Label htmlFor="meta_description">
                Meta Description <span className="text-destructive">*</span>
              </Label>
              <span className={`text-xs font-mono ${descStatus.color}`}>
                {descLength}/160 • {descStatus.label}
              </span>
            </div>
            <Textarea
              id="meta_description"
              placeholder="Write a compelling description that encourages clicks..."
              value={data.meta_description || ''}
              onChange={(e) => update('meta_description', e.target.value)}
              rows={3}
              maxLength={300}
            />
            <p className="text-xs text-muted-foreground">
              Appears below title in search results. Optimal: 120-160 characters.
            </p>
          </div>
          
          {/* Focus Keyword */}
          <div className="space-y-2">
            <Label htmlFor="focus_keyword">
              <span className="flex items-center gap-2">
                <Target className="h-4 w-4 text-primary" />
                Focus Keyword
              </span>
            </Label>
            <Input
              id="focus_keyword"
              placeholder="e.g., web development noida"
              value={data.focus_keyword || ''}
              onChange={(e) => update('focus_keyword', e.target.value)}
            />
            <p className="text-xs text-muted-foreground">
              Primary keyword you want this page to rank for.
            </p>
          </div>
          
          {/* Meta Keywords (Legacy) */}
          <div className="space-y-2">
            <Label htmlFor="meta_keywords">
              Meta Keywords <span className="text-muted-foreground text-xs">(comma-separated)</span>
            </Label>
            <Input
              id="meta_keywords"
              placeholder="keyword1, keyword2, keyword3"
              value={data.meta_keywords || ''}
              onChange={(e) => update('meta_keywords', e.target.value)}
            />
            <p className="text-xs text-muted-foreground">
              Less important for SEO but still used by some search engines.
            </p>
          </div>
          
          {/* Target Keywords (Array) */}
          <div className="space-y-2">
            <Label>Target Keywords</Label>
            <div className="flex gap-2">
              <Input
                placeholder="Add a target keyword..."
                value={newKeyword}
                onChange={(e) => setNewKeyword(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    e.preventDefault()
                    addKeyword()
                  }
                }}
              />
              <Button 
                type="button" 
                variant="outline" 
                size="default"
                onClick={addKeyword}
                disabled={!newKeyword.trim()}
              >
                <Plus className="h-4 w-4" />
              </Button>
            </div>
            {data.target_keywords?.length > 0 && (
              <div className="flex flex-wrap gap-2 mt-2">
                {data.target_keywords.map((keyword) => (
                  <Badge 
                    key={keyword} 
                    variant="secondary"
                    className="gap-1 pr-1"
                  >
                    {keyword}
                    <button
                      onClick={() => removeKeyword(keyword)}
                      className="ml-1 hover:bg-destructive/20 rounded-sm p-0.5"
                    >
                      <X className="h-3 w-3" />
                    </button>
                  </Badge>
                ))}
              </div>
            )}
          </div>
          
          {/* H1 Tag */}
          <div className="space-y-2">
            <Label htmlFor="h1_tag">H1 Tag (Page Heading)</Label>
            <Input
              id="h1_tag"
              placeholder="Main heading visible on the page"
              value={data.h1_tag || ''}
              onChange={(e) => update('h1_tag', e.target.value)}
            />
            <p className="text-xs text-muted-foreground">
              The main heading visible to users on the page.
            </p>
          </div>
        </CardContent>
      </Card>
      
      {/* Open Graph (Social Media) */}
      <Card>
        <CardContent className="p-6 space-y-5">
          <div className="flex items-center gap-2 pb-2 border-b">
            <span className="text-lg">🌐</span>
            <h3 className="font-semibold">Social Media (Open Graph)</h3>
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="og_title">OG Title</Label>
            <Input
              id="og_title"
              placeholder="Title for Facebook, LinkedIn, etc."
              value={data.og_title || ''}
              onChange={(e) => update('og_title', e.target.value)}
            />
            <p className="text-xs text-muted-foreground">
              Leave empty to use Meta Title.
            </p>
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="og_description">OG Description</Label>
            <Textarea
              id="og_description"
              placeholder="Description for social media sharing..."
              value={data.og_description || ''}
              onChange={(e) => update('og_description', e.target.value)}
              rows={2}
            />
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="og_image">OG Image URL</Label>
            <Input
              id="og_image"
              placeholder="https://example.com/image.jpg"
              value={data.og_image || ''}
              onChange={(e) => update('og_image', e.target.value)}
            />
            <p className="text-xs text-muted-foreground">
              Recommended: 1200x630px. Used when page is shared on social media.
            </p>
            {data.og_image && (
              <div className="mt-2 rounded-lg overflow-hidden border bg-muted/30 max-w-md">
                <img 
                  src={data.og_image} 
                  alt="OG Preview"
                  className="w-full h-auto"
                  onError={(e) => {
                    e.currentTarget.style.display = 'none'
                  }}
                />
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

function getCharStatus(length: number, min: number, max: number) {
  if (length === 0) return { color: 'text-muted-foreground', label: 'Empty' }
  if (length < min) return { color: 'text-orange-400', label: 'Too short' }
  if (length > max) return { color: 'text-red-400', label: 'Too long' }
  return { color: 'text-green-400', label: 'Perfect' }
}
