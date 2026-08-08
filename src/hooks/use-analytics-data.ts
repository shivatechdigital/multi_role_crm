'use client'

import { useQuery } from '@tanstack/react-query'
import axios from 'axios'
import { useDateRangeStore } from '@/store/date-range-store'

export function useUsersData() {
  const days = useDateRangeStore((state) => state.days)
  
  return useQuery({
    queryKey: ['analytics-users', days],
    queryFn: async () => {
      const { data } = await axios.get(`/api/analytics/users?days=${days}`)
      return data
    },
    refetchOnWindowFocus: false,
    staleTime: 5 * 60 * 1000,
  })
}

export function useSourcesData() {
  const days = useDateRangeStore((state) => state.days)
  
  return useQuery({
    queryKey: ['analytics-sources', days],
    queryFn: async () => {
      const { data } = await axios.get(`/api/analytics/sources?days=${days}`)
      return data
    },
    refetchOnWindowFocus: false,
    staleTime: 5 * 60 * 1000,
  })
}

export function useRealtimeData() {
  return useQuery({
    queryKey: ['analytics-realtime'],
    queryFn: async () => {
      const { data } = await axios.get('/api/analytics/realtime')
      return data
    },
    refetchInterval: 10000, // Refresh every 10 seconds
    refetchOnWindowFocus: true,
  })
}
