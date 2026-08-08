// src/lib/utils/seo-helpers.ts

/**
 * Get SEO score color
 */
export function getSeoScoreColor(score: number | null): {
  text: string
  bg: string
  border: string
  label: string
} {
  if (!score) {
    return {
      text: 'text-gray-400',
      bg: 'bg-gray-500/10',
      border: 'border-gray-500/30',
      label: 'Not scored',
    }
  }
  
  if (score >= 80) {
    return {
      text: 'text-green-400',
      bg: 'bg-green-500/10',
      border: 'border-green-500/30',
      label: 'Excellent',
    }
  }
  
  if (score >= 60) {
    return {
      text: 'text-yellow-400',
      bg: 'bg-yellow-500/10',
      border: 'border-yellow-500/30',
      label: 'Good',
    }
  }
  
  if (score >= 40) {
    return {
      text: 'text-orange-400',
      bg: 'bg-orange-500/10',
      border: 'border-orange-500/30',
      label: 'Needs Work',
    }
  }
  
  return {
    text: 'text-red-400',
    bg: 'bg-red-500/10',
    border: 'border-red-500/30',
    label: 'Poor',
  }
}

/**
 * Get page type badge color
 */
export function getPageTypeColor(type: string): {
  bg: string
  text: string
  border: string
} {
  switch (type.toLowerCase()) {
    case 'service':
      return {
        bg: 'bg-blue-500/10',
        text: 'text-blue-400',
        border: 'border-blue-500/30',
      }
    case 'static':
      return {
        bg: 'bg-purple-500/10',
        text: 'text-purple-400',
        border: 'border-purple-500/30',
      }
    case 'landing':
      return {
        bg: 'bg-pink-500/10',
        text: 'text-pink-400',
        border: 'border-pink-500/30',
      }
    default:
      return {
        bg: 'bg-gray-500/10',
        text: 'text-gray-400',
        border: 'border-gray-500/30',
      }
  }
}

/**
 * Get updated by badge color
 */
export function getUpdatedByColor(updatedBy: string): {
  bg: string
  text: string
  icon: string
} {
  switch (updatedBy.toLowerCase()) {
    case 'ai':
      return {
        bg: 'bg-purple-500/10',
        text: 'text-purple-400',
        icon: '🤖',
      }
    case 'n8n':
      return {
        bg: 'bg-blue-500/10',
        text: 'text-blue-400',
        icon: '⚡',
      }
    case 'crm':
      return {
        bg: 'bg-green-500/10',
        text: 'text-green-400',
        icon: '💻',
      }
    case 'manual':
    default:
      return {
        bg: 'bg-gray-500/10',
        text: 'text-gray-400',
        icon: '✋',
      }
  }
}

/**
 * Format relative time
 */
export function formatRelativeTime(dateString: string | null): string {
  if (!dateString) return 'Never'
  
  const date = new Date(dateString)
  const now = new Date()
  const diffMs = now.getTime() - date.getTime()
  const diffMins = Math.floor(diffMs / 60000)
  const diffHours = Math.floor(diffMs / 3600000)
  const diffDays = Math.floor(diffMs / 86400000)
  
  if (diffMins < 1) return 'Just now'
  if (diffMins < 60) return `${diffMins}m ago`
  if (diffHours < 24) return `${diffHours}h ago`
  if (diffDays < 30) return `${diffDays}d ago`
  
  return date.toLocaleDateString('en-IN', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  })
}

/**
 * Get nice page name from slug
 */
export function getNicePageName(slug: string): string {
  const parts = slug.split('/')
  const lastPart = parts[parts.length - 1]
  
  return lastPart
    .split('-')
    .map(word => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ')
}

/**
 * Calculate completion stats
 */
export interface MetaCompletion {
  hasTitle: boolean
  hasDescription: boolean
  hasKeywords: boolean
  hasFocusKeyword: boolean
  hasOgImage: boolean
  total: number
  completed: number
  percentage: number
}

export function getMetaCompletion(page: any): MetaCompletion {
  const checks = {
    hasTitle: !!page.meta_title,
    hasDescription: !!page.meta_description,
    hasKeywords: !!page.meta_keywords,
    hasFocusKeyword: !!page.focus_keyword,
    hasOgImage: !!page.og_image,
  }
  
  const total = Object.keys(checks).length
  const completed = Object.values(checks).filter(Boolean).length
  
  return {
    ...checks,
    total,
    completed,
    percentage: Math.round((completed / total) * 100),
  }
}
