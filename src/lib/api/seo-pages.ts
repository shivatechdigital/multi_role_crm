// src/lib/api/seo-pages.ts

import { laravelClient } from './laravel-client'
import type {
  PagesListResponse,
  PageDetailResponse,
  UpdatePageRequest,
  StatsResponse,
  ServiceMeta,
} from '@/lib/types/seo-pages'

export const seoPagesApi = {
  /**
   * Get all pages list
   */
  async getAllPages(): Promise<PagesListResponse> {
    const { data } = await laravelClient.get('/pages')
    return data
  },

  /**
   * Get single page by slug
   */
  async getPage(slug: string): Promise<PageDetailResponse> {
    // URL encode the slug (handles "services/web-development")
    const encodedSlug = encodeURIComponent(slug)
    const { data } = await laravelClient.get(`/page/${slug}`)
    return data
  },

  /**
   * Update page meta
   */
  async updatePage(slug: string, payload: UpdatePageRequest): Promise<PageDetailResponse> {
    const { data } = await laravelClient.put(`/page/${slug}`, {
      ...payload,
      last_updated_by: payload.last_updated_by || 'crm',
    })
    return data
  },

  /**
   * Update only schema
   */
  async updateSchema(
    slug: string,
    schemaType: 'main' | 'breadcrumb' | 'faq',
    schemaMarkup: string
  ): Promise<{ success: boolean; message: string }> {
    const { data } = await laravelClient.post(`/page/${slug}/schema`, {
      schema_type: schemaType,
      schema_markup: schemaMarkup,
      last_updated_by: 'crm',
    })
    return data
  },

  /**
   * Get overall stats
   */
  async getStats(): Promise<StatsResponse> {
    const { data } = await laravelClient.get('/stats')
    return data
  },

  /**
   * Clear cache for a page
   */
  async clearCache(slug?: string): Promise<{ success: boolean; message: string }> {
    const { data } = await laravelClient.post('/cache/clear', { slug })
    return data
  },

  /**
   * Health check
   */
  async health(): Promise<{ success: boolean; message: string }> {
    const { data } = await laravelClient.get('/health')
    return data
  },
}
