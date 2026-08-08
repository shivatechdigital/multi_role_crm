// src/hooks/use-service-pages.ts

import { useQuery, useMutation, useQueryClient, keepPreviousData } from '@tanstack/react-query'
import { toast } from 'sonner'
import { servicePagesApi } from '@/lib/api/service-pages-client'
import type {
  ServicePagesFilters,
  CreateServicePagePayload,
  UpdateServicePagePayload,
  ImportHtmlPayload,
} from '@/lib/types/page-builder'

const QUERY_KEYS = {
  all: ['service-pages'] as const,
  lists: () => [...QUERY_KEYS.all, 'list'] as const,
  list: (filters: ServicePagesFilters) => [...QUERY_KEYS.lists(), filters] as const,
  details: () => [...QUERY_KEYS.all, 'detail'] as const,
  detail: (slug: string) => [...QUERY_KEYS.details(), slug] as const,
  revisions: (slug: string) => [...QUERY_KEYS.detail(slug), 'revisions'] as const,
}

/**
 * Hook: Get all service pages
 */
export function useServicePages(filters: ServicePagesFilters = {}) {
  return useQuery({
    queryKey: QUERY_KEYS.list(filters),
    queryFn: () => servicePagesApi.getAll(filters),
    staleTime: 30 * 1000, // 30 seconds
    placeholderData: keepPreviousData,
  })
}

/**
 * Hook: Get single service page
 */
export function useServicePage(slug: string, enabled = true) {
  return useQuery({
    queryKey: QUERY_KEYS.detail(slug),
    queryFn: () => servicePagesApi.get(slug),
    enabled: enabled && !!slug,
    staleTime: 10 * 1000,
  })
}

/**
 * Hook: Create service page
 */
export function useCreateServicePage() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (payload: CreateServicePagePayload) => servicePagesApi.create(payload),
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.lists() })
      toast.success('Page created successfully!', {
        description: `"${data.data.title}" is ready to edit.`,
      })
    },
    onError: (error: any) => {
      const message = error.response?.data?.message || 'Failed to create page'
      toast.error('Create failed', { description: message })
    },
  })
}

/**
 * Hook: Update service page
 */
export function useUpdateServicePage() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({ slug, payload }: { slug: string; payload: UpdateServicePagePayload }) =>
      servicePagesApi.update(slug, payload),
    onSuccess: (data, variables) => {
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.lists() })
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.detail(variables.slug) })
      
      // If slug changed, update cache
      if (data.data.slug !== variables.slug) {
        queryClient.setQueryData(QUERY_KEYS.detail(data.data.slug), data)
      }
      
      toast.success('Page saved successfully!')
    },
    onError: (error: any) => {
      const message = error.response?.data?.message || 'Failed to update page'
      toast.error('Save failed', { description: message })
    },
  })
}

/**
 * Hook: Delete service page
 */
export function useDeleteServicePage() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (slug: string) => servicePagesApi.delete(slug),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.lists() })
      toast.success('Page deleted successfully!')
    },
    onError: (error: any) => {
      const message = error.response?.data?.message || 'Failed to delete page'
      toast.error('Delete failed', { description: message })
    },
  })
}

/**
 * Hook: Publish/Unpublish
 */
export function usePublishServicePage() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({ slug, action }: { slug: string; action: 'publish' | 'unpublish' }) =>
      servicePagesApi.publish(slug, action),
    onSuccess: (data, variables) => {
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.lists() })
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.detail(variables.slug) })
      
      toast.success(
        variables.action === 'publish' ? 'Page published!' : 'Page unpublished',
        {
          description: variables.action === 'publish' 
            ? 'Your page is now live.'
            : 'Page moved to draft.',
        }
      )
    },
    onError: (error: any) => {
      const message = error.response?.data?.message || 'Failed to change status'
      toast.error('Status change failed', { description: message })
    },
  })
}

/**
 * Hook: Duplicate page
 */
export function useDuplicateServicePage() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (slug: string) => servicePagesApi.duplicate(slug),
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.lists() })
      toast.success('Page duplicated!', {
        description: `New copy: "${data.data.title}"`,
      })
    },
    onError: (error: any) => {
      const message = error.response?.data?.message || 'Failed to duplicate page'
      toast.error('Duplicate failed', { description: message })
    },
  })
}

/**
 * Hook: Import HTML
 */
export function useImportHtml() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (payload: ImportHtmlPayload) => servicePagesApi.importHtml(payload),
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.lists() })
      toast.success('HTML imported successfully!', {
        description: `"${data.data.title}" is ready to edit.`,
      })
    },
    onError: (error: any) => {
      const message = error.response?.data?.message || 'Failed to import HTML'
      toast.error('Import failed', { description: message })
    },
  })
}

/**
 * Hook: Get revisions
 */
export function useServicePageRevisions(slug: string) {
  return useQuery({
    queryKey: QUERY_KEYS.revisions(slug),
    queryFn: () => servicePagesApi.getRevisions(slug),
    enabled: !!slug,
  })
}

/**
 * Hook: Restore revision
 */
export function useRestoreRevision() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({ slug, revisionId }: { slug: string; revisionId: number }) =>
      servicePagesApi.restoreRevision(slug, revisionId),
    onSuccess: (data, variables) => {
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.detail(variables.slug) })
      toast.success('Revision restored!')
    },
    onError: (error: any) => {
      const message = error.response?.data?.message || 'Failed to restore revision'
      toast.error('Restore failed', { description: message })
    },
  })
}
