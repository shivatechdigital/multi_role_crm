// src/store/page-builder-store.ts

import { create } from 'zustand'
import { v4 as uuidv4 } from 'uuid'
import type {
  ServicePage,
  PageLayout,
  Section,
  Column,
  Block,
  BlockType,
  SectionLayout,
} from '@/lib/types/page-builder'

interface PageBuilderStore {
  // State
  page: ServicePage | null
  layout: PageLayout
  selectedSectionId: string | null
  selectedColumnId: string | null
  selectedBlockId: string | null
  device: 'desktop' | 'tablet' | 'mobile'
  isDirty: boolean
  isSaving: boolean
  isPreviewMode: boolean
  history: PageLayout[]
  historyIndex: number

  // Actions - Page
  setPage: (page: ServicePage) => void
  setLayout: (layout: PageLayout) => void
  markClean: () => void
  markDirty: () => void
  setSaving: (saving: boolean) => void
  setPreviewMode: (mode: boolean) => void
  setDevice: (device: 'desktop' | 'tablet' | 'mobile') => void
  reset: () => void

  // Actions - Selection
  selectSection: (id: string | null) => void
  selectColumn: (id: string | null) => void
  selectBlock: (id: string | null) => void

  // Actions - Sections
  addSection: (layout: SectionLayout, index?: number) => void
  updateSection: (id: string, updates: Partial<Section>) => void
  deleteSection: (id: string) => void
  duplicateSection: (id: string) => void
  moveSection: (fromIndex: number, toIndex: number) => void

  // Actions - Columns
  updateColumn: (sectionId: string, columnId: string, updates: Partial<Column>) => void

  // Actions - Blocks
  addBlock: (sectionId: string, columnId: string, type: BlockType, index?: number) => void
  updateBlock: (blockId: string, updates: Partial<Block>) => void
  deleteBlock: (blockId: string) => void
  duplicateBlock: (blockId: string) => void
  moveBlock: (
    sourceSectionId: string,
    sourceColumnId: string,
    targetSectionId: string,
    targetColumnId: string,
    blockId: string,
    targetIndex: number
  ) => void

  // History
  saveToHistory: () => void
  undo: () => void
  redo: () => void
  canUndo: () => boolean
  canRedo: () => boolean
}

const emptyLayout: PageLayout = { sections: [] }

/**
 * Create default block based on type
 */
function createDefaultBlock(type: BlockType): Block {
  const id = `blk_${uuidv4().slice(0, 8)}`
  
  const defaults: Record<BlockType, Block> = {
    heading: {
      id,
      type: 'heading',
      content: { text: 'New Heading', level: 'h2' },
      styles: {},
    },
    text: {
      id,
      type: 'text',
      content: { html: '<p>Start typing your content here...</p>' },
      styles: {},
    },
    paragraph: {
      id,
      type: 'paragraph',
      content: { html: '<p>New paragraph</p>' },
      styles: {},
    },
    image: {
      id,
      type: 'image',
      content: {
        src: 'https://via.placeholder.com/600x400?text=Click+to+add+image',
        alt: 'Image',
      },
      styles: {},
    },
    button: {
      id,
      type: 'button',
      content: {
        text: 'Click Me',
        url: '#',
        variant: 'primary',
        size: 'md',
      },
      styles: {},
    },
    video: {
      id,
      type: 'video',
      content: {
        type: 'youtube',
        url: 'https://www.youtube.com/watch?v=dQw4w9WgXcQ',
      },
      styles: {},
    },
    html: {
      id,
      type: 'html',
      content: { html: '<div>Custom HTML</div>' },
      styles: {},
    },
    spacer: {
      id,
      type: 'spacer',
      content: { height: 40 },
      styles: {},
    },
    divider: {
      id,
      type: 'divider',
      content: { style: 'solid', color: '#e0e0e0' },
      styles: {},
    },
    'icon-box': {
      id,
      type: 'icon-box',
      content: {
        icon: 'fas fa-star',
        title: 'Feature Title',
        description: 'Feature description goes here.',
      },
      styles: {},
    },
    list: {
      id,
      type: 'list',
      content: {
        type: 'ul',
        items: ['First item', 'Second item', 'Third item'],
      },
      styles: {},
    },
  }
  
  return defaults[type]
}

/**
 * Create columns based on section layout
 */
function createColumns(layout: SectionLayout): Column[] {
  const widths: Record<SectionLayout, string[]> = {
    single: ['100%'],
    double: ['50%', '50%'],
    triple: ['33.33%', '33.33%', '33.33%'],
    custom: ['50%', '50%'],
  }
  
  return widths[layout].map(width => ({
    id: `col_${uuidv4().slice(0, 8)}`,
    width,
    blocks: [],
    styles: {},
  }))
}

export const usePageBuilderStore = create<PageBuilderStore>((set, get) => ({
  // Initial state
  page: null,
  layout: emptyLayout,
  selectedSectionId: null,
  selectedColumnId: null,
  selectedBlockId: null,
  device: 'desktop',
  isDirty: false,
  isSaving: false,
  isPreviewMode: false,
  history: [emptyLayout],
  historyIndex: 0,

  // Page actions
  setPage: (page) => set({
    page,
    layout: page.layout_json || emptyLayout,
    isDirty: false,
    history: [page.layout_json || emptyLayout],
    historyIndex: 0,
  }),

  setLayout: (layout) => set({ layout, isDirty: true }),
  
  markClean: () => set({ isDirty: false }),
  markDirty: () => set({ isDirty: true }),
  setSaving: (saving) => set({ isSaving: saving }),
  setPreviewMode: (mode) => set({ isPreviewMode: mode }),
  setDevice: (device) => set({ device }),
  
  reset: () => set({
    page: null,
    layout: emptyLayout,
    selectedSectionId: null,
    selectedColumnId: null,
    selectedBlockId: null,
    isDirty: false,
    history: [emptyLayout],
    historyIndex: 0,
  }),

  // Selection
  selectSection: (id) => set({
    selectedSectionId: id,
    selectedColumnId: null,
    selectedBlockId: null,
  }),
  
  selectColumn: (id) => set({
    selectedColumnId: id,
    selectedBlockId: null,
  }),
  
  selectBlock: (id) => set({ selectedBlockId: id }),

  // Section actions
  addSection: (layout, index) => {
    const state = get()
    const newSection: Section = {
      id: `sec_${uuidv4().slice(0, 8)}`,
      layout,
      columns: createColumns(layout),
      settings: {
        padding: { top: 60, right: 15, bottom: 60, left: 15 },
      },
    }
    
    const sections = [...state.layout.sections]
    if (typeof index === 'number') {
      sections.splice(index, 0, newSection)
    } else {
      sections.push(newSection)
    }
    
    set({ layout: { ...state.layout, sections }, isDirty: true })
    get().saveToHistory()
  },

  updateSection: (id, updates) => {
    const state = get()
    const sections = state.layout.sections.map(s => 
      s.id === id ? { ...s, ...updates } : s
    )
    set({ layout: { ...state.layout, sections }, isDirty: true })
  },

  deleteSection: (id) => {
    const state = get()
    const sections = state.layout.sections.filter(s => s.id !== id)
    set({
      layout: { ...state.layout, sections },
      selectedSectionId: null,
      isDirty: true,
    })
    get().saveToHistory()
  },

  duplicateSection: (id) => {
    const state = get()
    const index = state.layout.sections.findIndex(s => s.id === id)
    if (index === -1) return
    
    const original = state.layout.sections[index]
    const duplicate: Section = {
      ...original,
      id: `sec_${uuidv4().slice(0, 8)}`,
      columns: original.columns.map(col => ({
        ...col,
        id: `col_${uuidv4().slice(0, 8)}`,
        blocks: col.blocks.map(blk => ({
          ...blk,
          id: `blk_${uuidv4().slice(0, 8)}`,
        })),
      })),
    }
    
    const sections = [...state.layout.sections]
    sections.splice(index + 1, 0, duplicate)
    set({ layout: { ...state.layout, sections }, isDirty: true })
    get().saveToHistory()
  },

  moveSection: (fromIndex, toIndex) => {
    const state = get()
    const sections = [...state.layout.sections]
    const [moved] = sections.splice(fromIndex, 1)
    sections.splice(toIndex, 0, moved)
    set({ layout: { ...state.layout, sections }, isDirty: true })
    get().saveToHistory()
  },

  // Column actions
  updateColumn: (sectionId, columnId, updates) => {
    const state = get()
    const sections = state.layout.sections.map(s => {
      if (s.id !== sectionId) return s
      return {
        ...s,
        columns: s.columns.map(c => c.id === columnId ? { ...c, ...updates } : c),
      }
    })
    set({ layout: { ...state.layout, sections }, isDirty: true })
  },

  // Block actions
  addBlock: (sectionId, columnId, type, index) => {
    const state = get()
    const newBlock = createDefaultBlock(type)
    
    const sections = state.layout.sections.map(s => {
      if (s.id !== sectionId) return s
      return {
        ...s,
        columns: s.columns.map(c => {
          if (c.id !== columnId) return c
          const blocks = [...c.blocks]
          if (typeof index === 'number') {
            blocks.splice(index, 0, newBlock)
          } else {
            blocks.push(newBlock)
          }
          return { ...c, blocks }
        }),
      }
    })
    
    set({
      layout: { ...state.layout, sections },
      selectedBlockId: newBlock.id,
      isDirty: true,
    })
    get().saveToHistory()
  },

  updateBlock: (blockId, updates) => {
    const state = get()
    const sections = state.layout.sections.map(s => ({
      ...s,
      columns: s.columns.map(c => ({
        ...c,
        blocks: c.blocks.map(b => b.id === blockId ? { ...b, ...updates } : b),
      })),
    }))
    set({ layout: { ...state.layout, sections }, isDirty: true })
  },

  deleteBlock: (blockId) => {
    const state = get()
    const sections = state.layout.sections.map(s => ({
      ...s,
      columns: s.columns.map(c => ({
        ...c,
        blocks: c.blocks.filter(b => b.id !== blockId),
      })),
    }))
    set({
      layout: { ...state.layout, sections },
      selectedBlockId: null,
      isDirty: true,
    })
    get().saveToHistory()
  },

  duplicateBlock: (blockId) => {
    const state = get()
    let duplicated: Block | null = null
    
    const sections = state.layout.sections.map(s => ({
      ...s,
      columns: s.columns.map(c => {
        const blockIndex = c.blocks.findIndex(b => b.id === blockId)
        if (blockIndex === -1) return c
        
        const original = c.blocks[blockIndex]
        duplicated = {
          ...original,
          id: `blk_${uuidv4().slice(0, 8)}`,
        }
        
        const blocks = [...c.blocks]
        blocks.splice(blockIndex + 1, 0, duplicated)
        return { ...c, blocks }
      }),
    }))
    
    set({ layout: { ...state.layout, sections }, isDirty: true })
    get().saveToHistory()
  },

  moveBlock: (sourceSectionId, sourceColumnId, targetSectionId, targetColumnId, blockId, targetIndex) => {
    const state = get()
    let block: Block | null = null

    // Remove from source
    let sections = state.layout.sections.map(s => {
      if (s.id !== sourceSectionId) return s
      return {
        ...s,
        columns: s.columns.map(c => {
          if (c.id !== sourceColumnId) return c
          const found = c.blocks.find(b => b.id === blockId)
          if (found) block = found
          return { ...c, blocks: c.blocks.filter(b => b.id !== blockId) }
        }),
      }
    })

    if (!block) return

    // Add to target
    sections = sections.map(s => {
      if (s.id !== targetSectionId) return s
      return {
        ...s,
        columns: s.columns.map(c => {
          if (c.id !== targetColumnId) return c
          const blocks = [...c.blocks]
          blocks.splice(targetIndex, 0, block!)
          return { ...c, blocks }
        }),
      }
    })

    set({ layout: { ...state.layout, sections }, isDirty: true })
    get().saveToHistory()
  },

  // History
  saveToHistory: () => {
    const state = get()
    const newHistory = state.history.slice(0, state.historyIndex + 1)
    newHistory.push(JSON.parse(JSON.stringify(state.layout)))
    
    // Limit history size to 50
    if (newHistory.length > 50) newHistory.shift()
    
    set({
      history: newHistory,
      historyIndex: newHistory.length - 1,
    })
  },

  undo: () => {
    const state = get()
    if (state.historyIndex > 0) {
      const newIndex = state.historyIndex - 1
      set({
        layout: JSON.parse(JSON.stringify(state.history[newIndex])),
        historyIndex: newIndex,
        isDirty: true,
      })
    }
  },

  redo: () => {
    const state = get()
    if (state.historyIndex < state.history.length - 1) {
      const newIndex = state.historyIndex + 1
      set({
        layout: JSON.parse(JSON.stringify(state.history[newIndex])),
        historyIndex: newIndex,
        isDirty: true,
      })
    }
  },

  canUndo: () => get().historyIndex > 0,
  canRedo: () => get().historyIndex < get().history.length - 1,
}))
