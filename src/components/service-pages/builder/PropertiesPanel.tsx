'use client'

import { useState } from 'react'
import { Settings, Palette, Image as ImageIcon } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Button } from '@/components/ui/button'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { usePageBuilderStore } from '@/store/page-builder-store'
import { RichTextEditor } from './RichTextEditor'
import { MediaLibrary } from './MediaLibrary'
import type { MediaAsset } from '@/lib/types/page-builder'

export function PropertiesPanel() {
  const {
    layout,
    selectedBlockId,
    selectedSectionId,
    updateBlock,
    updateSection,
  } = usePageBuilderStore()

  const selectedBlock = selectedBlockId
    ? layout.sections
        .flatMap(s => s.columns.flatMap(c => c.blocks))
        .find(b => b.id === selectedBlockId)
    : null

  const selectedSection = selectedSectionId
    ? layout.sections.find(s => s.id === selectedSectionId)
    : null

  return (
    <aside className="flex w-80 flex-col border-l bg-white overflow-hidden dark:bg-gray-800 dark:border-gray-700">
      <div className="border-b p-4 dark:border-gray-700">
        <h2 className="flex items-center gap-2 text-sm font-semibold">
          <Settings className="h-4 w-4" />
          Properties
        </h2>
        <p className="mt-1 text-xs text-gray-500">
          {selectedBlock ? `Editing: ${selectedBlock.type}` : selectedSection ? 'Section settings' : 'Select an element'}
        </p>
      </div>

      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {!selectedBlock && !selectedSection && (
          <Card>
            <CardContent className="p-6 text-center">
              <Settings className="mx-auto mb-3 h-8 w-8 text-gray-400" />
              <p className="text-sm text-gray-500">
                Click on any block or section to edit its properties
              </p>
            </CardContent>
          </Card>
        )}

        {selectedBlock && (
          <BlockProperties block={selectedBlock} updateBlock={updateBlock} />
        )}

        {selectedSection && !selectedBlock && (
          <SectionProperties section={selectedSection} updateSection={updateSection} />
        )}
      </div>
    </aside>
  )
}

function BlockProperties({ block, updateBlock }: any) {
  const content = block.content
  const [showMediaLibrary, setShowMediaLibrary] = useState(false)

  const updateContent = (key: string, value: any) => {
    updateBlock(block.id, {
      content: { ...content, [key]: value },
    })
  }

  const updateStyle = (key: string, value: any) => {
    updateBlock(block.id, {
      styles: { ...(block.styles || {}), [key]: value },
    })
  }

  const handleMediaSelect = (media: MediaAsset) => {
    updateContent('src', media.file_url)
    if (!content.alt) {
      updateContent('alt', media.alt_text || media.original_name)
    }
  }

  return (
    <>
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-xs uppercase tracking-wider text-gray-500">
            Content
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          {block.type === 'heading' && (
            <>
              <div>
                <Label className="text-xs">Text</Label>
                <Input
                  value={content.text || ''}
                  onChange={(e) => updateContent('text', e.target.value)}
                  className="mt-1"
                />
              </div>
              <div>
                <Label className="text-xs">Level</Label>
                <Select
                  value={content.level || 'h2'}
                  onValueChange={(v) => updateContent('level', v)}
                >
                  <SelectTrigger className="mt-1">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {['h1', 'h2', 'h3', 'h4', 'h5', 'h6'].map(l => (
                      <SelectItem key={l} value={l}>{l.toUpperCase()}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </>
          )}

          {(block.type === 'text' || block.type === 'paragraph') && (
            <div>
              <Label className="text-xs mb-2 block">Rich Text Content</Label>
              <RichTextEditor
                value={content.html || ''}
                onChange={(html) => updateContent('html', html)}
                placeholder="Start typing your content..."
              />
              <p className="mt-2 text-xs text-gray-500">
                Full rich text editor with formatting, links, and styling
              </p>
            </div>
          )}

          {block.type === 'image' && (
            <>
              <div>
                <Label className="text-xs">Image</Label>
                {content.src && (
                  <div className="mt-2 mb-2">
                    <img
                      src={content.src}
                      alt=""
                      className="w-full max-h-32 object-cover rounded border"
                    />
                  </div>
                )}
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => setShowMediaLibrary(true)}
                  className="w-full mb-2"
                >
                  <ImageIcon className="mr-2 h-3 w-3" />
                  {content.src ? 'Change Image' : 'Select Image'}
                </Button>
                <Input
                  value={content.src || ''}
                  onChange={(e) => updateContent('src', e.target.value)}
                  placeholder="Or paste image URL..."
                  className="text-xs"
                />
              </div>
              <div>
                <Label className="text-xs">Alt Text</Label>
                <Input
                  value={content.alt || ''}
                  onChange={(e) => updateContent('alt', e.target.value)}
                  className="mt-1"
                  placeholder="Describe the image..."
                />
              </div>
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <Label className="text-xs">Width</Label>
                  <Input
                    value={content.width || ''}
                    onChange={(e) => updateContent('width', e.target.value)}
                    placeholder="auto"
                    className="mt-1"
                  />
                </div>
                <div>
                  <Label className="text-xs">Height</Label>
                  <Input
                    value={content.height || ''}
                    onChange={(e) => updateContent('height', e.target.value)}
                    placeholder="auto"
                    className="mt-1"
                  />
                </div>
              </div>

              <MediaLibrary
                open={showMediaLibrary}
                onOpenChange={setShowMediaLibrary}
                onSelect={handleMediaSelect}
                type="image"
              />
            </>
          )}

          {block.type === 'button' && (
            <>
              <div>
                <Label className="text-xs">Button Text</Label>
                <Input
                  value={content.text || ''}
                  onChange={(e) => updateContent('text', e.target.value)}
                  className="mt-1"
                />
              </div>
              <div>
                <Label className="text-xs">URL</Label>
                <Input
                  value={content.url || ''}
                  onChange={(e) => updateContent('url', e.target.value)}
                  className="mt-1"
                  placeholder="https://..."
                />
              </div>
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <Label className="text-xs">Variant</Label>
                  <Select
                    value={content.variant || 'primary'}
                    onValueChange={(v) => updateContent('variant', v)}
                  >
                    <SelectTrigger className="mt-1">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="primary">Primary</SelectItem>
                      <SelectItem value="secondary">Secondary</SelectItem>
                      <SelectItem value="success">Success</SelectItem>
                      <SelectItem value="danger">Danger</SelectItem>
                      <SelectItem value="warning">Warning</SelectItem>
                      <SelectItem value="outline">Outline</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label className="text-xs">Size</Label>
                  <Select
                    value={content.size || 'md'}
                    onValueChange={(v) => updateContent('size', v)}
                  >
                    <SelectTrigger className="mt-1">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="sm">Small</SelectItem>
                      <SelectItem value="md">Medium</SelectItem>
                      <SelectItem value="lg">Large</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </>
          )}

          {block.type === 'video' && (
            <>
              <div>
                <Label className="text-xs">Video Type</Label>
                <Select
                  value={content.type || 'youtube'}
                  onValueChange={(v) => updateContent('type', v)}
                >
                  <SelectTrigger className="mt-1">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="youtube">YouTube</SelectItem>
                    <SelectItem value="vimeo">Vimeo</SelectItem>
                    <SelectItem value="direct">Direct URL</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label className="text-xs">Video URL</Label>
                <Input
                  value={content.url || ''}
                  onChange={(e) => updateContent('url', e.target.value)}
                  className="mt-1"
                  placeholder="https://youtube.com/watch?v=..."
                />
              </div>
            </>
          )}

          {block.type === 'html' && (
            <div>
              <Label className="text-xs">HTML Code</Label>
              <Textarea
                value={content.html || ''}
                onChange={(e) => updateContent('html', e.target.value)}
                rows={8}
                className="mt-1 font-mono text-xs"
                placeholder="<div>Your custom HTML</div>"
              />
              <p className="mt-1 text-xs text-gray-500">
                Custom HTML will be rendered as-is
              </p>
            </div>
          )}

          {block.type === 'icon-box' && (
            <>
              <div>
                <Label className="text-xs">Icon Class (FontAwesome)</Label>
                <Input
                  value={content.icon || ''}
                  onChange={(e) => updateContent('icon', e.target.value)}
                  className="mt-1"
                  placeholder="fas fa-star"
                />
              </div>
              <div>
                <Label className="text-xs">Title</Label>
                <Input
                  value={content.title || ''}
                  onChange={(e) => updateContent('title', e.target.value)}
                  className="mt-1"
                />
              </div>
              <div>
                <Label className="text-xs">Description</Label>
                <Textarea
                  value={content.description || ''}
                  onChange={(e) => updateContent('description', e.target.value)}
                  rows={3}
                  className="mt-1"
                />
              </div>
            </>
          )}

          {block.type === 'list' && (
            <>
              <div>
                <Label className="text-xs">List Type</Label>
                <Select
                  value={content.type || 'ul'}
                  onValueChange={(v) => updateContent('type', v)}
                >
                  <SelectTrigger className="mt-1">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="ul">Bullet List</SelectItem>
                    <SelectItem value="ol">Numbered List</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label className="text-xs">Items (one per line)</Label>
                <Textarea
                  value={(content.items || []).join('\n')}
                  onChange={(e) => updateContent('items', e.target.value.split('\n').filter(Boolean))}
                  rows={6}
                  className="mt-1"
                />
              </div>
            </>
          )}

          {block.type === 'spacer' && (
            <div>
              <Label className="text-xs">Height (px)</Label>
              <Input
                type="number"
                value={content.height || 40}
                onChange={(e) => updateContent('height', parseInt(e.target.value) || 40)}
                className="mt-1"
              />
            </div>
          )}

          {block.type === 'divider' && (
            <>
              <div>
                <Label className="text-xs">Style</Label>
                <Select
                  value={content.style || 'solid'}
                  onValueChange={(v) => updateContent('style', v)}
                >
                  <SelectTrigger className="mt-1">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="solid">Solid</SelectItem>
                    <SelectItem value="dashed">Dashed</SelectItem>
                    <SelectItem value="dotted">Dotted</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label className="text-xs">Color</Label>
                <Input
                  type="color"
                  value={content.color || '#e0e0e0'}
                  onChange={(e) => updateContent('color', e.target.value)}
                  className="mt-1 h-10"
                />
              </div>
            </>
          )}
        </CardContent>
      </Card>

      {/* Styles */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="flex items-center gap-2 text-xs uppercase tracking-wider text-gray-500">
            <Palette className="h-3 w-3" />
            Styles
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="grid grid-cols-2 gap-2">
            <div>
              <Label className="text-xs">Text Color</Label>
              <Input
                type="color"
                value={block.styles?.color || '#000000'}
                onChange={(e) => updateStyle('color', e.target.value)}
                className="mt-1 h-10"
              />
            </div>
            <div>
              <Label className="text-xs">Background</Label>
              <Input
                type="color"
                value={block.styles?.background || '#ffffff'}
                onChange={(e) => updateStyle('background', e.target.value)}
                className="mt-1 h-10"
              />
            </div>
          </div>

          <div>
            <Label className="text-xs">Text Align</Label>
            <Select
              value={block.styles?.textAlign || 'left'}
              onValueChange={(v) => updateStyle('textAlign', v)}
            >
              <SelectTrigger className="mt-1">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="left">Left</SelectItem>
                <SelectItem value="center">Center</SelectItem>
                <SelectItem value="right">Right</SelectItem>
                <SelectItem value="justify">Justify</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div>
            <Label className="text-xs">Font Size</Label>
            <Input
              value={block.styles?.fontSize || ''}
              onChange={(e) => updateStyle('fontSize', e.target.value)}
              placeholder="e.g., 16px, 1.2rem"
              className="mt-1"
            />
          </div>

          <div>
            <Label className="text-xs">Padding</Label>
            <Input
              value={block.styles?.padding || ''}
              onChange={(e) => updateStyle('padding', e.target.value)}
              placeholder="e.g., 10px or 10px 20px"
              className="mt-1"
            />
          </div>

          <div>
            <Label className="text-xs">Margin</Label>
            <Input
              value={block.styles?.margin || ''}
              onChange={(e) => updateStyle('margin', e.target.value)}
              placeholder="e.g., 10px or 10px 20px"
              className="mt-1"
            />
          </div>

          <div>
            <Label className="text-xs">Border Radius</Label>
            <Input
              value={block.styles?.borderRadius || ''}
              onChange={(e) => updateStyle('borderRadius', e.target.value)}
              placeholder="e.g., 8px"
              className="mt-1"
            />
          </div>
        </CardContent>
      </Card>
    </>
  )
}

function SectionProperties({ section, updateSection }: any) {
  const settings = section.settings || {}
  const [showMediaLibrary, setShowMediaLibrary] = useState(false)

  const updateSettings = (key: string, value: any) => {
    updateSection(section.id, {
      settings: { ...settings, [key]: value },
    })
  }

  const updatePadding = (side: string, value: number) => {
    updateSection(section.id, {
      settings: {
        ...settings,
        padding: { ...(settings.padding || {}), [side]: value },
      },
    })
  }

  const handleBgImageSelect = (media: MediaAsset) => {
    updateSettings('background', {
      type: 'image',
      value: media.file_url,
    })
  }

  return (
    <>
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-xs uppercase tracking-wider text-gray-500">
            Background
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <div>
            <Label className="text-xs">Type</Label>
            <Select
              value={settings.background?.type || 'color'}
              onValueChange={(type) => updateSettings('background', {
                type,
                value: type === 'color' ? '#ffffff' : '',
              })}
            >
              <SelectTrigger className="mt-1">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="color">Color</SelectItem>
                <SelectItem value="image">Image</SelectItem>
                <SelectItem value="gradient">Gradient</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {settings.background?.type === 'color' && (
            <div>
              <Label className="text-xs">Color</Label>
              <Input
                type="color"
                value={settings.background?.value || '#ffffff'}
                onChange={(e) => updateSettings('background', {
                  type: 'color',
                  value: e.target.value,
                })}
                className="mt-1 h-10"
              />
            </div>
          )}

          {settings.background?.type === 'image' && (
            <div>
              {settings.background?.value && (
                <img
                  src={settings.background.value}
                  alt=""
                  className="w-full max-h-32 object-cover rounded mb-2 border"
                />
              )}
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => setShowMediaLibrary(true)}
                className="w-full mb-2"
              >
                <ImageIcon className="mr-2 h-3 w-3" />
                {settings.background?.value ? 'Change Image' : 'Select Image'}
              </Button>
              <Input
                value={settings.background?.value || ''}
                onChange={(e) => updateSettings('background', {
                  type: 'image',
                  value: e.target.value,
                })}
                placeholder="Or paste image URL..."
                className="text-xs"
              />
              <MediaLibrary
                open={showMediaLibrary}
                onOpenChange={setShowMediaLibrary}
                onSelect={handleBgImageSelect}
                type="image"
              />
            </div>
          )}

          {settings.background?.type === 'gradient' && (
            <div>
              <Label className="text-xs">Gradient CSS</Label>
              <Input
                value={settings.background?.value || ''}
                onChange={(e) => updateSettings('background', {
                  type: 'gradient',
                  value: e.target.value,
                })}
                placeholder="linear-gradient(45deg, #667eea, #764ba2)"
                className="mt-1"
              />
            </div>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-xs uppercase tracking-wider text-gray-500">
            Spacing (Padding)
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 gap-2">
            <div>
              <Label className="text-[10px] text-gray-500">Top (px)</Label>
              <Input
                type="number"
                value={settings.padding?.top ?? 40}
                onChange={(e) => updatePadding('top', parseInt(e.target.value) || 0)}
                className="mt-1"
              />
            </div>
            <div>
              <Label className="text-[10px] text-gray-500">Bottom (px)</Label>
              <Input
                type="number"
                value={settings.padding?.bottom ?? 40}
                onChange={(e) => updatePadding('bottom', parseInt(e.target.value) || 0)}
                className="mt-1"
              />
            </div>
            <div>
              <Label className="text-[10px] text-gray-500">Left (px)</Label>
              <Input
                type="number"
                value={settings.padding?.left ?? 15}
                onChange={(e) => updatePadding('left', parseInt(e.target.value) || 0)}
                className="mt-1"
              />
            </div>
            <div>
              <Label className="text-[10px] text-gray-500">Right (px)</Label>
              <Input
                type="number"
                value={settings.padding?.right ?? 15}
                onChange={(e) => updatePadding('right', parseInt(e.target.value) || 0)}
                className="mt-1"
              />
            </div>
          </div>
        </CardContent>
      </Card>
    </>
  )
}
