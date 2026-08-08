// src/hooks/use-media.ts

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { toast } from 'sonner'
import { mediaApi } from '@/lib/api/media'

const QUERY_KEYS = {
  all: ['media'] as const,
  list: (filters: any) => [...QUERY_KEYS.all, 'list', filters] as const,
}

export function useMedia(filters: {
  type?: 'image' | 'video' | 'all'
  folder?: string
  search?: string
  per_page?: number
  page?: number
} = {}) {
  return useQuery({
    queryKey: QUERY_KEYS.list(filters),
    queryFn: () => mediaApi.getAll(filters),
    staleTime: 30 * 1000,
  })
}

export function useUploadMedia() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({ file, options }: { file: File; options?: any }) =>
      mediaApi.upload(file, options),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.all })
      toast.success('File uploaded successfully!')
    },
    onError: (error: any) => {
      const message = error.response?.data?.message || 'Upload failed'
      toast.error('Upload failed', { description: message })
    },
  })
}

export function useDeleteMedia() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (id: number) => mediaApi.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.all })
      toast.success('Media deleted')
    },
    onError: (error: any) => {
      toast.error('Delete failed', {
        description: error.response?.data?.message || 'Failed to delete media',
      })
    },
  })
}
