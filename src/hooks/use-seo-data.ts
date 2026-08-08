'use client'

import { useQuery } from '@tanstack/react-query'
import axios from 'axios'
import { useDateRangeStore } from '@/store/date-range-store'

export function useKeywords(limit: number = 100) {
  const days = useDateRangeStore((state) => state.days)
  
  return useQuery({
    queryKey: ['seo-keywords', days, limit],
    queryFn: async () => {
      const { data } = await axios.get(`/api/seo/keywords?days=${days}&limit=${limit}`)
      return data
    },
    refetchOnWindowFocus: false,
    staleTime: 5 * 60 * 1000,
  })
}

export function usePages(limit: number = 100) {
  const days = useDateRangeStore((state) => state.days)
  
  return useQuery({
    queryKey: ['seo-pages', days, limit],
    queryFn: async () => {
      const { data } = await axios.get(`/api/seo/pages?days=${days}&limit=${limit}`)
      return data
    },
    refetchOnWindowFocus: false,
    staleTime: 5 * 60 * 1000,
  })
}
