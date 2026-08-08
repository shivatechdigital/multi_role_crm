'use client'

import { Trash2, Copy, Settings } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { usePageBuilderStore } from '@/store/page-builder-store'
import { cn } from '@/lib/utils'
import type { Block } from '@/lib/types/page-builder'

interface Props {
  block: Block
  sectionId: string
  columnId: string
}

export function BlockRenderer({ block, sectionId, columnId }: Props) {
  const {
    selectedBlockId,
    selectBlock,
    deleteBlock,
    duplicateBlock,
    isPreviewMode,
  } = usePageBuilderStore()

  const isSelected = selectedBlockId === block.id

  const renderBlockContent = () => {
    const content = block.content as any
    const styles = block.styles || {}
    
    const inlineStyle: React.CSSProperties = {
      color: styles.color,
      backgroundColor: styles.background,
      fontSize: styles.fontSize,
      fontWeight: styles.fontWeight as any,
      textAlign: styles.textAlign as any,
      padding: styles.padding,
      margin: styles.margin,
      borderRadius: styles.borderRadius,
      border: styles.border,
    }

    switch (block.type) {
      case 'heading': {
        const Tag = content.level || 'h2'
        return (
          <Tag style={inlineStyle} className="font-bold">
            {content.text || 'Heading'}
          </Tag>
        )
      }
      
      case 'text':
      case 'paragraph':
        return (
          <div 
            style={inlineStyle} 
            className="prose max-w-none"
            dangerouslySetInnerHTML={{ __html: content.html || '<p>Empty text</p>' }}
          />
        )
      
      case 'image':
        return (
          <img
            src={content.src}
            alt={content.alt || ''}
            style={inlineStyle}
            className="max-w-full h-auto rounded"
          />
        )
      
      case 'button':
        const variantClass = {
          primary: 'bg-indigo-600 text-white hover:bg-indigo-700',
          secondary: 'bg-gray-600 text-white hover:bg-gray-700',
          success: 'bg-green-600 text-white hover:bg-green-700',
          danger: 'bg-red-600 text-white hover:bg-red-700',
          warning: 'bg-yellow-500 text-white hover:bg-yellow-600',
          outline: 'border-2 border-indigo-600 text-indigo-600 hover:bg-indigo-50',
        }[content.variant] || 'bg-indigo-600 text-white'
        
        const sizeClass = {
          sm: 'px-4 py-2 text-sm',
          md: 'px-6 py-3 text-base',
          lg: 'px-8 py-4 text-lg',
        }[content.size] || 'px-6 py-3'
        
        return (
          <div style={inlineStyle}>
            <button
              type="button"
              className={cn("rounded-md font-medium transition-colors", variantClass, sizeClass)}
              onClick={(e) => e.preventDefault()}
            >
              {content.text || 'Button'}
            </button>
          </div>
        )
      
      case 'video':
        if (content.type === 'youtube') {
          const videoId = extractYoutubeId(content.url)
          return (
            <div className="aspect-video">
              <iframe
                src={`https://www.youtube.com/embed/${videoId}`}
                className="w-full h-full rounded"
                allowFullScreen
              />
            </div>
          )
        }
        return (
          <div className="bg-gray-100 p-8 text-center rounded">
            <p className="text-sm text-gray-500">Video: {content.url}</p>
          </div>
        )
      
      case 'html':
        return (
          <div 
            style={inlineStyle}
            dangerouslySetInnerHTML={{ __html: content.html || '<div>HTML content</div>' }}
          />
        )
      
      case 'spacer':
        return (
          <div 
            style={{ height: `${content.height || 40}px` }}
            className="bg-transparent"
          />
        )
      
      case 'divider':
        return (
          <hr 
            style={{ 
              borderTop: `1px ${content.style || 'solid'} ${content.color || '#e0e0e0'}`,
              margin: '20px 0',
            }} 
          />
        )
      
      case 'icon-box':
        return (
          <div style={inlineStyle} className="text-center p-6 rounded-lg bg-gray-50">
            <div className="text-4xl mb-3">⭐</div>
            <h4 className="font-semibold text-lg mb-2">{content.title || 'Title'}</h4>
            <p className="text-gray-600 text-sm">{content.description || 'Description'}</p>
          </div>
        )
      
      case 'list': {
        const Tag = content.type === 'ol' ? 'ol' : 'ul'
        return (
          <Tag 
            style={inlineStyle}
            className={cn(
              "pl-6",
              content.type === 'ol' ? 'list-decimal' : 'list-disc'
            )}
          >
            {(content.items || []).map((item: string, i: number) => (
              <li key={i} className="mb-1">{item}</li>
            ))}
          </Tag>
        )
      }
      
      default:
        return <div className="p-3 bg-gray-100 rounded">Unknown block: {block.type}</div>
    }
  }

  return (
    <div
      onClick={(e) => {
        e.stopPropagation()
        selectBlock(block.id)
      }}
      className={cn(
        "relative group transition-all",
        !isPreviewMode && "cursor-pointer",
        !isPreviewMode && "hover:outline hover:outline-2 hover:outline-indigo-300 hover:outline-offset-2",
        isSelected && !isPreviewMode && "outline outline-2 outline-indigo-500 outline-offset-2"
      )}
    >
      {/* Block Toolbar */}
      {isSelected && !isPreviewMode && (
        <div className="absolute -top-8 right-0 z-10 flex items-center gap-1 rounded-t-md bg-indigo-500 px-2 py-1 text-white">
          <span className="mr-2 text-xs font-medium capitalize">
            {block.type}
          </span>
          <Button
            size="sm"
            variant="ghost"
            className="h-6 w-6 p-0 text-white hover:bg-indigo-600"
            onClick={(e) => {
              e.stopPropagation()
              duplicateBlock(block.id)
            }}
          >
            <Copy className="h-3 w-3" />
          </Button>
          <Button
            size="sm"
            variant="ghost"
            className="h-6 w-6 p-0 text-white hover:bg-red-500"
            onClick={(e) => {
              e.stopPropagation()
              deleteBlock(block.id)
            }}
          >
            <Trash2 className="h-3 w-3" />
          </Button>
        </div>
      )}

      {renderBlockContent()}
    </div>
  )
}

function extractYoutubeId(url: string): string {
  const match = url.match(/(?:youtube\.com\/(?:[^\/]+\/.+\/|(?:v|e(?:mbed)?)\/|.*[?&]v=)|youtu\.be\/)([^"&?\/\s]{11})/)
  return match ? match[1] : ''
}
