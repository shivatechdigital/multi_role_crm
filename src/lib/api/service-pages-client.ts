// src/lib/api/service-pages-client.ts
// Browser-side only: hits our own Next.js API routes (which hold the Laravel token server-side)
import axios from 'axios'
import type {
  ServicePagesListResponse,
  ServicePageResponse,
  CreateServicePagePayload,
  UpdateServicePagePayload,
  ImportHtmlPayload,
  ServicePagesFilters,
  PageRevision,
} from '@/lib/types/page-builder'

const localClient = axios.create({
  baseURL: '/api/service-pages',
  headers: { 'Content-Type': 'application/json' },
})

export const servicePagesApi = {
  async getAll(filters: ServicePagesFilters = {}): Promise<ServicePagesListResponse> {
    const params = new URLSearchParams()
    Object.entries(filters).forEach(([key, value]) => {
      if (value !== undefined && value !== null && value !== '' && value !== 'all') {
        params.append(key, String(value))
      }
    })
    const { data } = await localClient.get(`?${params.toString()}`)
    return data
  },
  async get(slug: string): Promise<ServicePageResponse> {
    const { data } = await localClient.get(`/${slug}`)
    return data
  },
  async create(payload: CreateServicePagePayload): Promise<ServicePageResponse> {
    const { data } = await localClient.post('', payload)
    return data
  },
  async update(slug: string, payload: UpdateServicePagePayload): Promise<ServicePageResponse> {
    const { data } = await localClient.put(`/${slug}`, payload)
    return data
  },
  async delete(slug: string): Promise<{ success: boolean; message: string }> {
    const { data } = await localClient.delete(`/${slug}`)
    return data
  },
  async publish(slug: string, action: 'publish' | 'unpublish' = 'publish'): Promise<ServicePageResponse> {
    const { data } = await localClient.post(`/${slug}/publish`, { action })
    return data
  },
  async duplicate(slug: string): Promise<ServicePageResponse> {
    const { data } = await localClient.post(`/${slug}/duplicate`)
    return data
  },
  async importHtml(payload: ImportHtmlPayload): Promise<ServicePageResponse> {
    const { data } = await localClient.post('/import', payload)
    return data
  },
  async preview(layout_json: any, page_settings?: any): Promise<{ success: boolean; data: { html: string } }> {
    const { data } = await localClient.post('/preview', { layout_json, page_settings })
    return data
  },
  async getRevisions(slug: string): Promise<{ success: boolean; data: { data: PageRevision[] } }> {
    const { data } = await localClient.get(`/${slug}/revisions`)
    return data
  },
  async restoreRevision(slug: string, revisionId: number): Promise<ServicePageResponse> {
    const { data } = await localClient.post(`/${slug}/restore/${revisionId}`)
    return data
  },
}
