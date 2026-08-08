// src/lib/api/service-pages.ts
import { laravelClient } from './laravel-client'
import type {
  ServicePagesListResponse,
  ServicePageResponse,
  CreateServicePagePayload,
  UpdateServicePagePayload,
  ImportHtmlPayload,
  ServicePagesFilters,
  PageRevision,
} from '@/lib/types/page-builder'

export const servicePagesApi = {
  async getAll(filters: ServicePagesFilters = {}): Promise<ServicePagesListResponse> {
    const params = new URLSearchParams()
    Object.entries(filters).forEach(([key, value]) => {
      if (value !== undefined && value !== null && value !== '' && value !== 'all') {
        params.append(key, String(value))
      }
    })
    const { data } = await laravelClient.get(`/service-pages?${params.toString()}`)
    return data
  },
  async get(slug: string): Promise<ServicePageResponse> {
    const { data } = await laravelClient.get(`/service-pages/${slug}`)
    return data
  },
  async create(payload: CreateServicePagePayload): Promise<ServicePageResponse> {
    const { data } = await laravelClient.post('/service-pages', {
      ...payload,
      created_by: payload.created_by || 'crm',
    })
    return data
  },
  async update(slug: string, payload: UpdateServicePagePayload): Promise<ServicePageResponse> {
    const { data } = await laravelClient.put(`/service-pages/${slug}`, {
      ...payload,
      updated_by: payload.updated_by || 'crm',
    })
    return data
  },
  async delete(slug: string): Promise<{ success: boolean; message: string }> {
    const { data } = await laravelClient.delete(`/service-pages/${slug}`)
    return data
  },
  async publish(slug: string, action: 'publish' | 'unpublish' = 'publish'): Promise<ServicePageResponse> {
    const { data } = await laravelClient.post(`/service-pages/${slug}/publish`, { action })
    return data
  },
  async duplicate(slug: string): Promise<ServicePageResponse> {
    const { data } = await laravelClient.post(`/service-pages/${slug}/duplicate`)
    return data
  },
  async importHtml(payload: ImportHtmlPayload): Promise<ServicePageResponse> {
    const { data } = await laravelClient.post('/service-pages/import', {
      ...payload,
      created_by: payload.created_by || 'crm-import',
    })
    return data
  },
  async preview(layout_json: any, page_settings?: any): Promise<{ success: boolean; data: { html: string } }> {
    const { data } = await laravelClient.post('/service-pages/preview', {
      layout_json,
      page_settings,
    })
    return data
  },
  async getRevisions(slug: string): Promise<{ success: boolean; data: { data: PageRevision[] } }> {
    const { data } = await laravelClient.get(`/service-pages/${slug}/revisions`)
    return data
  },
  async restoreRevision(slug: string, revisionId: number): Promise<ServicePageResponse> {
    const { data } = await laravelClient.post(`/service-pages/${slug}/restore/${revisionId}`)
    return data
  },
}
