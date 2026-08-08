'use client'

import { Plus, Layers } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { usePageBuilderStore } from '@/store/page-builder-store'
import { SectionRenderer } from './SectionRenderer'
import { cn } from '@/lib/utils'

export function BuilderCanvas() {
  const { layout, addSection, device, isPreviewMode } = usePageBuilderStore()

  const deviceWidths = {
    desktop: 'max-w-full',
    tablet: 'max-w-3xl',
    mobile: 'max-w-sm',
  }

  return (
    <div className="min-h-full py-8 px-4">
      <div className={cn(
        "mx-auto bg-white shadow-lg transition-all rounded-lg dark:bg-gray-900",
        deviceWidths[device]
      )}>
        {/* Empty State */}
        {layout.sections.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-24 px-6 text-center">
            <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-indigo-100 dark:bg-indigo-900/30">
              <Layers className="h-8 w-8 text-indigo-600" />
            </div>
            <h3 className="mb-2 text-xl font-semibold">Start Building Your Page</h3>
            <p className="mb-6 max-w-md text-sm text-gray-500">
              Add sections and blocks from the left sidebar, or start with a preset layout
            </p>
            <div className="flex gap-2">
              <Button 
                onClick={() => addSection('single')}
                variant="outline"
              >
                <Plus className="mr-2 h-4 w-4" />
                1 Column
              </Button>
              <Button 
                onClick={() => addSection('double')}
                variant="outline"
              >
                <Plus className="mr-2 h-4 w-4" />
                2 Columns
              </Button>
              <Button 
                onClick={() => addSection('triple')}
                variant="outline"
              >
                <Plus className="mr-2 h-4 w-4" />
                3 Columns
              </Button>
            </div>
          </div>
        ) : (
          <>
            {layout.sections.map((section, index) => (
              <SectionRenderer
                key={section.id}
                section={section}
                index={index}
              />
            ))}
            
            {/* Add Section Button at End */}
            {!isPreviewMode && (
              <div className="border-t-2 border-dashed border-gray-200 p-6 text-center dark:border-gray-700">
                <div className="flex justify-center gap-2">
                  <Button 
                    variant="outline"
                    size="sm"
                    onClick={() => addSection('single')}
                  >
                    <Plus className="mr-2 h-3 w-3" />
                    Add Section
                  </Button>
                </div>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  )
}
