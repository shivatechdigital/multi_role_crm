// src/lib/api/media.ts

import { laravelClient } from './laravel-client'
import type { MediaListResponse, MediaAsset } from '@/lib/types/page-builder'

export const mediaApi = {
  /**
   * Get all media
   */
  async getAll(filters: {
    type?: 'image' | 'video' | 'all'
    folder?: string
    search?: string
    per_page?: number
    page?: number
  } = {}): Promise<MediaListResponse> {
    const params = new URLSearchParams()
    
    Object.entries(filters).forEach(([key, value]) => {
      if (value !== undefined && value !== null && value !== '' && value !== 'all') {
        params.append(key, String(value))
      }
    })
    
    const { data } = await laravelClient.get(`/media?${params.toString()}`)
    return data
  },

  /**
   * Upload file
   */
  async upload(file: File, options: {
    folder?: string
    alt_text?: string
    caption?: string
    uploaded_by?: string
  } = {}): Promise<{ success: boolean; data: MediaAsset; message: string }> {
    const formData = new FormData()
    formData.append('file', file)
    
    if (options.folder) formData.append('folder', options.folder)
    if (options.alt_text) formData.append('alt_text', options.alt_text)
    if (options.caption) formData.append('caption', options.caption)
    formData.append('uploaded_by', options.uploaded_by || 'crm')

    const { data } = await laravelClient.post('/media/upload', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    })
    return data
  },

  /**
   * Update media meta
   */
  async update(id: number, payload: {
    alt_text?: string
    caption?: string
    description?: string
    tags?: string[]
  }): Promise<{ success: boolean; data: MediaAsset }> {
    const { data } = await laravelClient.put(`/media/${id}`, payload)
    return data
  },

  /**
   * Delete media
   */
  async delete(id: number): Promise<{ success: boolean; message: string }> {
    const { data } = await laravelClient.delete(`/media/${id}`)
    return data
  },
}
