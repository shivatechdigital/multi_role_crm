// src/lib/types/seo-pages.ts

export interface ServiceMeta {
  id: number
  page_slug: string
  page_type: 'service' | 'static' | 'landing'
  page_url: string | null
  
  // Basic SEO
  meta_title: string | null
  meta_description: string | null
  meta_keywords: string | null
  focus_keyword: string | null
  canonical_url: string | null
  
  // Open Graph
  og_title: string | null
  og_description: string | null
  og_image: string | null
  og_type: string
  
  // Twitter
  twitter_card: string
  twitter_title: string | null
  twitter_description: string | null
  twitter_image: string | null
  
  // Schemas (JSON strings)
  schema_markup: string | null
  breadcrumb_schema: string | null
  faq_schema: string | null
  
  // Content meta
  h1_tag: string | null
  page_description: string | null
  target_keywords: string[] | null
  
  // Settings
  is_indexable: boolean
  is_followable: boolean
  robots_meta: string
  
  // Tracking
  last_updated_by: 'manual' | 'ai' | 'n8n' | string
  seo_score: number | null
  last_optimized_at: string | null
  
  // Performance
  current_clicks: number
  current_impressions: number
  current_ctr: number
  current_position: number
  stats_updated_at: string | null
  
  // Timestamps
  created_at: string
  updated_at: string
}

export interface PageListItem {
  id: number
  slug: string
  type: string
  url: string | null
  meta_title: string | null
  meta_description: string | null
  focus_keyword: string | null
  seo_score: number | null
  last_updated_by: string
  last_optimized_at: string | null
  current_clicks: number
  current_impressions: number
  current_position: number
  updated_at: string
}

export interface PagesListResponse {
  success: boolean
  count: number
  data: PageListItem[]
}

export interface PageDetailResponse {
  success: boolean
  data: ServiceMeta
}

export interface UpdatePageRequest {
  meta_title?: string
  meta_description?: string
  meta_keywords?: string
  focus_keyword?: string
  og_title?: string
  og_description?: string
  og_image?: string
  schema_markup?: string
  breadcrumb_schema?: string
  faq_schema?: string
  h1_tag?: string
  target_keywords?: string[]
  last_updated_by?: string
}

export interface FaqItem {
  question: string
  answer: string
}

export interface FaqSchema {
  '@context': string
  '@type': string
  mainEntity: Array<{
    '@type': string
    name: string
    acceptedAnswer: {
      '@type': string
      text: string
    }
  }>
}

export interface SeoStats {
  pages: {
    total: number
    optimized: number
    with_schema: number
    avg_seo_score: number
  }
  blogs: {
    total: number
    published: number
    drafts: number
    this_month: number
  }
  last_updated: string
}

export interface StatsResponse {
  success: boolean
  data: SeoStats
}≈
