'use client'

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import axios from 'axios'

export function useLeads(filters?: { status?: string; source?: string; search?: string }) {
  const params = new URLSearchParams()
  if (filters?.status) params.append('status', filters.status)
  if (filters?.source) params.append('source', filters.source)
  if (filters?.search) params.append('search', filters.search)

  return useQuery({
    queryKey: ['leads', filters],
    queryFn: async () => {
      const { data } = await axios.get(`/api/leads?${params.toString()}`)
      return data
    },
    refetchOnWindowFocus: false,
  })
}

export function useLead(id: string) {
  return useQuery({
    queryKey: ['lead', id],
    queryFn: async () => {
      const { data } = await axios.get(`/api/leads/${id}`)
      return data
    },
    enabled: !!id,
  })
}

export function useCreateLead() {
  const queryClient = useQueryClient()
  
  return useMutation({
    mutationFn: async (data: any) => {
      const response = await axios.post('/api/leads', data)
      return response.data
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['leads'] })
    },
  })
}

export function useUpdateLead() {
  const queryClient = useQueryClient()
  
  return useMutation({
    mutationFn: async ({ id, data }: { id: string; data: any }) => {
      const response = await axios.patch(`/api/leads/${id}`, data)
      return response.data
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['leads'] })
      queryClient.invalidateQueries({ queryKey: ['lead', variables.id] })
    },
  })
}

export function useDeleteLead() {
  const queryClient = useQueryClient()
  
  return useMutation({
    mutationFn: async (id: string) => {
      const response = await axios.delete(`/api/leads/${id}`)
      return response.data
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['leads'] })
    },
  })
}

export function useAddActivity() {
  const queryClient = useQueryClient()
  
  return useMutation({
    mutationFn: async ({ leadId, data }: { leadId: string; data: any }) => {
      const response = await axios.post(`/api/leads/${leadId}/activities`, data)
      return response.data
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['lead', variables.leadId] })
    },
  })
}

export function useSendLeadActivitiesEmail() {
  return useMutation({
    mutationFn: async (leadId: string) => {
      const response = await axios.post(`/api/leads/${leadId}/activities/email`)
      return response.data
    },
  })
}
