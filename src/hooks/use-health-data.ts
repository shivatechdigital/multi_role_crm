'use client'

import { useQuery, useMutation } from '@tanstack/react-query'
import axios from 'axios'

export function useHealthOverview() {
  return useQuery({
    queryKey: ['health-overview'],
    queryFn: async () => {
      const { data } = await axios.get('/api/health/overview')
      return data
    },
    refetchInterval: 60000, // 1 minute
  })
}

export function usePageSpeed(url?: string) {
  return useQuery({
    queryKey: ['pagespeed', url],
    queryFn: async () => {
      const params = url ? `?url=${encodeURIComponent(url)}` : ''
      const { data } = await axios.get(`/api/health/pagespeed${params}`)
      return data
    },
    refetchOnWindowFocus: false,
    staleTime: 60 * 60 * 1000, // 1 hour
    retry: 1,
  })
}

export function useRunPageSpeed() {
  return useMutation({
    mutationFn: async (url?: string) => {
      const params = url ? `?url=${encodeURIComponent(url)}` : ''
      const { data } = await axios.get(`/api/health/pagespeed${params}`)
      return data
    },
  })
}

export function useUptime() {
  return useQuery({
    queryKey: ['uptime'],
    queryFn: async () => {
      const { data } = await axios.get('/api/health/uptime')
      return data
    },
    refetchInterval: 60000, // 1 minute
  })
}
