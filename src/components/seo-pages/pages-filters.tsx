// src/components/seo-pages/pages-filters.tsx

'use client'

import { Input } from '@/components/ui/input'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Button } from '@/components/ui/button'
import { Search, X } from 'lucide-react'

export interface FilterState {
  search: string
  type: 'all' | 'service' | 'static' | 'landing'
  scoreRange: 'all' | 'high' | 'medium' | 'low'
  sortBy: 'name' | 'score' | 'updated' | 'clicks'
}

interface PagesFiltersProps {
  filters: FilterState
  onChange: (filters: FilterState) => void
  totalCount: number
  filteredCount: number
}

export function PagesFilters({
  filters,
  onChange,
  totalCount,
  filteredCount,
}: PagesFiltersProps) {
  const hasActiveFilters = 
    filters.search !== '' ||
    filters.type !== 'all' ||
    filters.scoreRange !== 'all'
  
  const resetFilters = () => {
    onChange({
      search: '',
      type: 'all',
      scoreRange: 'all',
      sortBy: 'name',
    })
  }
  
  return (
    <div className="space-y-3">
      <div className="flex flex-col lg:flex-row gap-3">
        {/* Search */}
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search by name, slug, or keyword..."
            value={filters.search}
            onChange={(e) => onChange({ ...filters, search: e.target.value })}
            className="pl-9"
          />
          {filters.search && (
            <button
              onClick={() => onChange({ ...filters, search: '' })}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
            >
              <X className="h-4 w-4" />
            </button>
          )}
        </div>
        
        {/* Type Filter */}
        <Select
          value={filters.type}
          onValueChange={(value) => 
            onChange({ ...filters, type: value as FilterState['type'] })
          }
        >
          <SelectTrigger className="w-full lg:w-[160px]">
            <SelectValue placeholder="Page Type" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Types</SelectItem>
            <SelectItem value="service">Service</SelectItem>
            <SelectItem value="static">Static</SelectItem>
            <SelectItem value="landing">Landing</SelectItem>
          </SelectContent>
        </Select>
        
        {/* Score Filter */}
        <Select
          value={filters.scoreRange}
          onValueChange={(value) => 
            onChange({ ...filters, scoreRange: value as FilterState['scoreRange'] })
          }
        >
          <SelectTrigger className="w-full lg:w-[160px]">
            <SelectValue placeholder="SEO Score" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Scores</SelectItem>
            <SelectItem value="high">High (80+)</SelectItem>
            <SelectItem value="medium">Medium (60-79)</SelectItem>
            <SelectItem value="low">Low ({'<'}60)</SelectItem>
          </SelectContent>
        </Select>
        
        {/* Sort */}
        <Select
          value={filters.sortBy}
          onValueChange={(value) => 
            onChange({ ...filters, sortBy: value as FilterState['sortBy'] })
          }
        >
          <SelectTrigger className="w-full lg:w-[160px]">
            <SelectValue placeholder="Sort by" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="name">Name</SelectItem>
            <SelectItem value="score">SEO Score</SelectItem>
            <SelectItem value="updated">Last Updated</SelectItem>
            <SelectItem value="clicks">Clicks</SelectItem>
          </SelectContent>
        </Select>
      </div>
      
      {/* Filter Status */}
      <div className="flex flex-col gap-2 text-xs sm:flex-row sm:items-center sm:justify-between">
        <p className="text-muted-foreground">
          Showing <span className="font-semibold text-foreground">{filteredCount}</span> of{' '}
          <span className="font-semibold text-foreground">{totalCount}</span> pages
        </p>
        {hasActiveFilters && (
          <Button
            variant="ghost"
            size="sm"
            onClick={resetFilters}
            className="h-7 self-start text-xs"
          >
            <X className="h-3 w-3 mr-1" />
            Clear filters
          </Button>
        )}
      </div>
    </div>
  )
}
