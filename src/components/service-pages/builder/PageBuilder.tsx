'use client'

import { useEffect } from 'react'
import { usePageBuilderStore } from '@/store/page-builder-store'
import { useUpdateServicePage } from '@/hooks/use-service-pages'
import { BuilderToolbar } from './BuilderToolbar'
import { BuilderSidebar } from './BuilderSidebar'
import { BuilderCanvas } from './BuilderCanvas'
import { PropertiesPanel } from './PropertiesPanel'
import { toast } from 'sonner'

export function PageBuilder() {
  const {
    page,
    layout,
    isDirty,
    isSaving,
    isPreviewMode,
    setSaving,
    markClean,
    undo,
    redo,
  } = usePageBuilderStore()

  const updateMutation = useUpdateServicePage()

  // Auto-save every 30 seconds when dirty
  useEffect(() => {
    if (!isDirty || !page) return

    const timer = setTimeout(() => {
      handleSave(true)
    }, 30000)

    return () => clearTimeout(timer)
  }, [isDirty, layout])

  // Keyboard shortcuts
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Cmd/Ctrl + S = Save
      if ((e.metaKey || e.ctrlKey) && e.key === 's') {
        e.preventDefault()
        handleSave()
      }
      // Cmd/Ctrl + Z = Undo
      if ((e.metaKey || e.ctrlKey) && e.key === 'z' && !e.shiftKey) {
        e.preventDefault()
        undo()
      }
      // Cmd/Ctrl + Shift + Z = Redo
      if ((e.metaKey || e.ctrlKey) && e.shiftKey && e.key === 'z') {
        e.preventDefault()
        redo()
      }
    }

    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [undo, redo])

  const handleSave = async (isAutoSave = false) => {
    if (!page) return

    try {
      setSaving(true)
      await updateMutation.mutateAsync({
        slug: page.slug,
        payload: {
          layout_json: layout,
          revision_note: isAutoSave ? 'Auto-saved' : 'Manual save',
        },
      })
      markClean()
      
      if (!isAutoSave) {
        toast.success('Page saved successfully!')
      }
    } catch (error) {
      // Error handled by mutation
    } finally {
      setSaving(false)
    }
  }

  const handlePublish = async () => {
    if (!page) return

    try {
      setSaving(true)
      
      // First save
      await updateMutation.mutateAsync({
        slug: page.slug,
        payload: {
          layout_json: layout,
          status: 'published',
          revision_note: 'Published',
        },
      })
      
      markClean()
      toast.success('Page published! 🎉', {
        description: 'Your changes are now live.',
      })
    } catch (error) {
      // Handled
    } finally {
      setSaving(false)
    }
  }

  if (!page) return null

  return (
    <div className="flex h-screen flex-col overflow-hidden bg-gray-100 dark:bg-gray-900">
      {/* Top Toolbar */}
      <BuilderToolbar 
        onSave={() => handleSave()} 
        onPublish={handlePublish}
      />

      {/* Main Layout */}
      <div className="flex flex-1 overflow-hidden">
        {/* Left Sidebar */}
        {!isPreviewMode && <BuilderSidebar />}

        {/* Canvas */}
        <div className="flex-1 overflow-auto">
          <BuilderCanvas />
        </div>

        {/* Right Properties Panel */}
        {!isPreviewMode && <PropertiesPanel />}
      </div>
    </div>
  )
}
