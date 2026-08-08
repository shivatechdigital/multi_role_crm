'use client'

import { Trash2, Copy, MoveUp, MoveDown, Settings } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { usePageBuilderStore } from '@/store/page-builder-store'
import { BlockRenderer } from './BlockRenderer'
import { cn } from '@/lib/utils'
import type { Section } from '@/lib/types/page-builder'

interface Props {
  section: Section
  index: number
}

export function SectionRenderer({ section, index }: Props) {
  const {
    layout,
    selectedSectionId,
    selectSection,
    selectColumn,
    selectedColumnId,
    deleteSection,
    duplicateSection,
    moveSection,
    isPreviewMode,
    addBlock,
  } = usePageBuilderStore()

  const isSelected = selectedSectionId === section.id
  const isFirst = index === 0
  const isLast = index === layout.sections.length - 1

  const gridClass = {
    single: 'grid-cols-1',
    double: 'grid-cols-1 md:grid-cols-2',
    triple: 'grid-cols-1 md:grid-cols-3',
    custom: 'grid-cols-1 md:grid-cols-2',
  }[section.layout]

  return (
    <div
      onClick={(e) => {
        e.stopPropagation()
        selectSection(section.id)
      }}
      className={cn(
        "group relative border-2 border-dashed transition-all",
        !isPreviewMode && "cursor-pointer hover:border-indigo-300",
        isSelected && !isPreviewMode && "border-indigo-500",
        !isSelected && !isPreviewMode && "border-transparent"
      )}
      style={{
        paddingTop: `${section.settings?.padding?.top ?? 40}px`,
        paddingBottom: `${section.settings?.padding?.bottom ?? 40}px`,
        paddingLeft: `${section.settings?.padding?.left ?? 15}px`,
        paddingRight: `${section.settings?.padding?.right ?? 15}px`,
        backgroundColor: section.settings?.background?.type === 'color' 
          ? section.settings.background.value 
          : undefined,
      }}
    >
      {/* Section Toolbar (visible when selected) */}
      {isSelected && !isPreviewMode && (
        <div className="absolute -top-9 left-0 z-10 flex items-center gap-1 rounded-t-md bg-indigo-500 px-2 py-1 text-white">
          <span className="mr-2 text-xs font-medium">
            Section ({section.layout})
          </span>
          <Button
            size="sm"
            variant="ghost"
            className="h-6 w-6 p-0 text-white hover:bg-indigo-600"
            onClick={(e) => {
              e.stopPropagation()
              if (!isFirst) moveSection(index, index - 1)
            }}
            disabled={isFirst}
            title="Move Up"
          >
            <MoveUp className="h-3 w-3" />
          </Button>
          <Button
            size="sm"
            variant="ghost"
            className="h-6 w-6 p-0 text-white hover:bg-indigo-600"
            onClick={(e) => {
              e.stopPropagation()
              if (!isLast) moveSection(index, index + 1)
            }}
            disabled={isLast}
            title="Move Down"
          >
            <MoveDown className="h-3 w-3" />
          </Button>
          <Button
            size="sm"
            variant="ghost"
            className="h-6 w-6 p-0 text-white hover:bg-indigo-600"
            onClick={(e) => {
              e.stopPropagation()
              duplicateSection(section.id)
            }}
            title="Duplicate"
          >
            <Copy className="h-3 w-3" />
          </Button>
          <Button
            size="sm"
            variant="ghost"
            className="h-6 w-6 p-0 text-white hover:bg-red-500"
            onClick={(e) => {
              e.stopPropagation()
              if (confirm('Delete this section?')) {
                deleteSection(section.id)
              }
            }}
            title="Delete"
          >
            <Trash2 className="h-3 w-3" />
          </Button>
        </div>
      )}

      {/* Columns Grid */}
      <div className={cn("grid gap-4", gridClass)}>
        {section.columns.map((column) => {
          const isColumnSelected = selectedColumnId === column.id
          
          return (
            <div
              key={column.id}
              onClick={(e) => {
                e.stopPropagation()
                selectColumn(column.id)
              }}
              className={cn(
                "min-h-[100px] p-4 rounded-md transition-all",
                !isPreviewMode && "cursor-pointer border-2 border-dashed border-transparent hover:border-purple-300",
                isColumnSelected && !isPreviewMode && "border-purple-500 bg-purple-50/30 dark:bg-purple-900/10"
              )}
            >
              {column.blocks.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-8 text-center">
                  <p className="mb-3 text-xs text-gray-400">
                    Empty column
                  </p>
                  {!isPreviewMode && (
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={(e) => {
                        e.stopPropagation()
                        addBlock(section.id, column.id, 'text')
                      }}
                    >
                      + Add Block
                    </Button>
                  )}
                </div>
              ) : (
                <div className="space-y-3">
                  {column.blocks.map((block) => (
                    <BlockRenderer
                      key={block.id}
                      block={block}
                      sectionId={section.id}
                      columnId={column.id}
                    />
                  ))}
                </div>
              )}
            </div>
          )
        })}
      </div>
    </div>
  )
}
