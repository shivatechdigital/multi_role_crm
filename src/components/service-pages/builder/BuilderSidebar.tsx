'use client'

import {
  Type,
  Heading,
  Image as ImageIcon,
  MousePointerClick,
  Video,
  Code,
  Minus,
  Space,
  Star,
  List,
  Layers,
  LayoutGrid,
  Columns,
  Columns2,
  Columns3,
} from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { usePageBuilderStore } from '@/store/page-builder-store'
import { cn } from '@/lib/utils'
import type { BlockType, SectionLayout } from '@/lib/types/page-builder'

const BLOCKS: Array<{
  type: BlockType
  label: string
  icon: React.ElementType
  color: string
}> = [
  { type: 'heading', label: 'Heading', icon: Heading, color: 'text-blue-600 bg-blue-50' },
  { type: 'text', label: 'Text', icon: Type, color: 'text-purple-600 bg-purple-50' },
  { type: 'image', label: 'Image', icon: ImageIcon, color: 'text-green-600 bg-green-50' },
  { type: 'button', label: 'Button', icon: MousePointerClick, color: 'text-orange-600 bg-orange-50' },
  { type: 'video', label: 'Video', icon: Video, color: 'text-red-600 bg-red-50' },
  { type: 'html', label: 'HTML', icon: Code, color: 'text-gray-600 bg-gray-100' },
  { type: 'icon-box', label: 'Icon Box', icon: Star, color: 'text-yellow-600 bg-yellow-50' },
  { type: 'list', label: 'List', icon: List, color: 'text-indigo-600 bg-indigo-50' },
  { type: 'divider', label: 'Divider', icon: Minus, color: 'text-gray-600 bg-gray-100' },
  { type: 'spacer', label: 'Spacer', icon: Space, color: 'text-gray-600 bg-gray-100' },
]

const LAYOUTS: Array<{
  layout: SectionLayout
  label: string
  icon: React.ElementType
}> = [
  { layout: 'single', label: '1 Column', icon: Columns },
  { layout: 'double', label: '2 Columns', icon: Columns2 },
  { layout: 'triple', label: '3 Columns', icon: Columns3 },
]

export function BuilderSidebar() {
  const { addSection, layout, selectedColumnId, addBlock } = usePageBuilderStore()

  const handleAddSection = (sectionLayout: SectionLayout) => {
    addSection(sectionLayout)
  }

  const handleAddBlock = (blockType: BlockType) => {
    // If a column is selected, add to that column
    if (selectedColumnId) {
      const section = layout.sections.find(s =>
        s.columns.some(c => c.id === selectedColumnId)
      )
      if (section) {
        addBlock(section.id, selectedColumnId, blockType)
        return
      }
    }

    // Otherwise, add to first column of last section (or create new section)
    if (layout.sections.length === 0) {
      addSection('single')
      // Wait for section to be added, then add block
      setTimeout(() => {
        const state = usePageBuilderStore.getState()
        const lastSection = state.layout.sections[state.layout.sections.length - 1]
        if (lastSection && lastSection.columns[0]) {
          addBlock(lastSection.id, lastSection.columns[0].id, blockType)
        }
      }, 50)
    } else {
      const lastSection = layout.sections[layout.sections.length - 1]
      if (lastSection.columns[0]) {
        addBlock(lastSection.id, lastSection.columns[0].id, blockType)
      }
    }
  }

  return (
    <aside className="flex w-72 flex-col border-r bg-white overflow-hidden dark:bg-gray-800 dark:border-gray-700">
      <div className="border-b p-4 dark:border-gray-700">
        <h2 className="flex items-center gap-2 text-sm font-semibold">
          <LayoutGrid className="h-4 w-4" />
          Add Elements
        </h2>
        <p className="mt-1 text-xs text-gray-500">
          Click to add blocks or sections
        </p>
      </div>

      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {/* Section Layouts */}
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center gap-2 text-xs uppercase tracking-wider text-gray-500">
              <Layers className="h-3 w-3" />
              Sections
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            {LAYOUTS.map((item) => {
              const Icon = item.icon
              return (
                <button
                  key={item.layout}
                  onClick={() => handleAddSection(item.layout)}
                  className="flex w-full items-center gap-3 rounded-lg border p-3 text-left transition-all hover:border-indigo-300 hover:bg-indigo-50 dark:border-gray-700 dark:hover:bg-indigo-900/20"
                >
                  <Icon className="h-4 w-4 text-gray-500" />
                  <span className="text-sm font-medium">{item.label}</span>
                </button>
              )
            })}
          </CardContent>
        </Card>

        {/* Blocks */}
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center gap-2 text-xs uppercase tracking-wider text-gray-500">
              <Type className="h-3 w-3" />
              Content Blocks
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 gap-2">
              {BLOCKS.map((block) => {
                const Icon = block.icon
                return (
                  <button
                    key={block.type}
                    onClick={() => handleAddBlock(block.type)}
                    className={cn(
                      "flex flex-col items-center gap-2 rounded-lg border p-3 text-center transition-all",
                      "hover:border-indigo-300 hover:shadow-sm",
                      "dark:border-gray-700"
                    )}
                  >
                    <div className={cn("rounded-lg p-2", block.color)}>
                      <Icon className="h-4 w-4" />
                    </div>
                    <span className="text-xs font-medium">{block.label}</span>
                  </button>
                )
              })}
            </div>
          </CardContent>
        </Card>

        {/* Tips */}
        <Card className="bg-blue-50 border-blue-200 dark:bg-blue-900/20 dark:border-blue-800">
          <CardContent className="p-3">
            <p className="text-xs text-blue-700 dark:text-blue-300">
              💡 <strong>Tip:</strong> Select a column first to add blocks to that specific column.
            </p>
          </CardContent>
        </Card>
      </div>
    </aside>
  )
}
