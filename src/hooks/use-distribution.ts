// src/hooks/use-distribution.ts

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import axios from 'axios'
import { toast } from 'sonner'

interface DistributionListResponse {
  success: boolean
  stats: {
    totalDistributions: number
    successfulPosts: number
    failedPosts: number
    pendingPosts: number
    successRate: number
    topPlatform: string
  }
  platformStats: any[]
  distributions: any[]
}

interface PlatformsResponse {
  success: boolean
  platforms: any[]
}

/**
 * Hook: Get distribution list with stats
 */
export function useDistributions(limit = 50, status?: string) {
  return useQuery({
    queryKey: ['distributions', limit, status],
    queryFn: async () => {
      const params = new URLSearchParams({ limit: String(limit) })
      if (status) params.set('status', status)
      
      const { data } = await axios.get<DistributionListResponse>(
        `/api/distribution/list?${params}`
      )
      return data
    },
    refetchInterval: 30000, // Auto-refresh every 30 seconds
    staleTime: 10 * 1000,
  })
}

/**
 * Hook: Get platforms config
 */
export function usePlatforms() {
  return useQuery({
    queryKey: ['platforms'],
    queryFn: async () => {
      const { data } = await axios.get<PlatformsResponse>('/api/distribution/platforms')
      return data
    },
    staleTime: 60 * 1000,
  })
}

/**
 * Hook: Toggle platform enable/disable
 */
export function useTogglePlatform() {
  const queryClient = useQueryClient()
  
  return useMutation({
    mutationFn: async ({ platform, isEnabled }: { platform: string; isEnabled: boolean }) => {
      const { data } = await axios.patch('/api/distribution/platforms', {
        platform,
        isEnabled,
      })
      return data
    },
    onSuccess: (data, variables) => {
      queryClient.invalidateQueries({ queryKey: ['platforms'] })
      queryClient.invalidateQueries({ queryKey: ['distributions'] })
      toast.success(
        `${variables.platform} ${variables.isEnabled ? 'enabled' : 'disabled'}!`
      )
    },
    onError: (error: any) => {
      toast.error('Failed to update platform', {
        description: error.response?.data?.error || error.message,
      })
    },
  })
}

/**
 * Hook: Update post delay
 */
export function useUpdateDelay() {
  const queryClient = useQueryClient()
  
  return useMutation({
    mutationFn: async ({ platform, postDelay }: { platform: string; postDelay: number }) => {
      const { data } = await axios.patch('/api/distribution/platforms', {
        platform,
        postDelay,
      })
      return data
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['platforms'] })
      toast.success('Delay updated!')
    },
  })
}
