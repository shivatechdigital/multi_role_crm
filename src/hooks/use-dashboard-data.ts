'use client'

import { useQuery } from '@tanstack/react-query'
import axios from 'axios'
import { useDateRangeStore } from '@/store/date-range-store'

export function useSeoOverview() {
  const days = useDateRangeStore((state) => state.days)
  
  return useQuery({
    queryKey: ['seo-overview', days],
    queryFn: async () => {
      const { data } = await axios.get(`/api/seo/overview?days=${days}`)
      return data
    },
    refetchOnWindowFocus: false,
    staleTime: 5 * 60 * 1000, // 5 minutes
  })
}

export function useAnalyticsOverview() {
  const days = useDateRangeStore((state) => state.days)
  
  return useQuery({
    queryKey: ['analytics-overview', days],
    queryFn: async () => {
      const { data } = await axios.get(`/api/analytics/overview?days=${days}`)
      return data
    },
    refetchOnWindowFocus: false,
    staleTime: 5 * 60 * 1000,
  })
}
