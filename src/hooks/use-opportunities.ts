// src/hooks/use-opportunities.ts

import { useQuery } from '@tanstack/react-query'
import axios from 'axios'
import { useDateRangeStore } from '@/store/date-range-store'
import type { OpportunitiesResponse } from '@/lib/types/opportunities'

export function useOpportunities() {
  const days = useDateRangeStore((state) => state.days)
  
  return useQuery({
    queryKey: ['seo-opportunities', days],
    queryFn: async () => {
      const { data } = await axios.get<OpportunitiesResponse>(
        `/api/seo/opportunities?days=${days}`
      )
      return data
    },
    staleTime: 5 * 60 * 1000, // 5 minutes
    refetchOnWindowFocus: false,
  })
}
