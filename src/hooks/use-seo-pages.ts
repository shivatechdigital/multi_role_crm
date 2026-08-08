// src/hooks/use-seo-pages.ts

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import axios from 'axios'
import { toast } from 'sonner'
import type {
  PagesListResponse,
  PageDetailResponse,
  UpdatePageRequest,
  StatsResponse,
} from '@/lib/types/seo-pages'

const QUERY_KEYS = {
  pages: ['seo-pages'] as const,
  page: (slug: string) => ['seo-page', slug] as const,
  stats: ['seo-pages-stats'] as const,
}

/**
 * Hook: Get all pages
 */
export function useSeoPages() {
  return useQuery({
    queryKey: QUERY_KEYS.pages,
    queryFn: async () => {
      const { data } = await axios.get<PagesListResponse>('/api/seo-pages')
      return data
    },
    staleTime: 60 * 1000, // 1 minute
    refetchOnWindowFocus: false,
  })
}

/**
 * Hook: Get single page
 */
export function useSeoPage(slug: string) {
  return useQuery({
    queryKey: QUERY_KEYS.page(slug),
    queryFn: async () => {
      const { data } = await axios.get<PageDetailResponse>(`/api/seo-pages/${slug}`)
      return data
    },
    enabled: !!slug,
    staleTime: 30 * 1000,
  })
}

/**
 * Hook: Get SEO stats
 */
export function useSeoPagesStats() {
  return useQuery({
    queryKey: QUERY_KEYS.stats,
    queryFn: async () => {
      const { data } = await axios.get<StatsResponse>('/api/seo-pages/stats')
      return data
    },
    staleTime: 5 * 60 * 1000, // 5 minutes
  })
}

/**
 * Hook: Update page mutation
 */
export function useUpdateSeoPage() {
  const queryClient = useQueryClient()
  
  return useMutation({
    mutationFn: async ({ slug, payload }: { slug: string; payload: UpdatePageRequest }) => {
      const { data } = await axios.put<PageDetailResponse>(
        `/api/seo-pages/${slug}`,
        payload
      )
      return data
    },
    onSuccess: (data, variables) => {
      // Invalidate queries to refetch
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.pages })
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.page(variables.slug) })
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.stats })
      
      toast.success('Page updated successfully!', {
        description: 'Changes are now live on your website.',
      })
    },
    onError: (error: any) => {
      const message = error.response?.data?.message || 'Failed to update page'
      toast.error('Update failed', {
        description: message,
      })
    },
  })
}
