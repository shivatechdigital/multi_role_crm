'use client'

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import axios from 'axios'

export function useInsights(type?: string) {
  return useQuery({
    queryKey: ['insights', type],
    queryFn: async () => {
      const params = type ? `?type=${type}` : ''
      const { data } = await axios.get(`/api/insights${params}`)
      return data
    },
  })
}

export function useGenerateInsight() {
  const queryClient = useQueryClient()
  
  return useMutation({
    mutationFn: async ({ type, days = 7 }: { type: string; days?: number }) => {
      const { data } = await axios.post('/api/insights/generate', { type, days })
      return data
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['insights'] })
    },
  })
}

export function useUpdateInsight() {
  const queryClient = useQueryClient()
  
  return useMutation({
    mutationFn: async ({ id, data }: { id: string; data: any }) => {
      const response = await axios.patch(`/api/insights/${id}`, data)
      return response.data
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['insights'] })
    },
  })
}

export function useDeleteInsight() {
  const queryClient = useQueryClient()
  
  return useMutation({
    mutationFn: async (id: string) => {
      const response = await axios.delete(`/api/insights/${id}`)
      return response.data
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['insights'] })
    },
  })
}
