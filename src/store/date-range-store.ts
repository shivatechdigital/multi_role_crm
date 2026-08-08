import { create } from 'zustand'
import { persist } from 'zustand/middleware'

export type DateRangePreset = '7d' | '30d' | '90d' | 'custom'

interface DateRangeStore {
  preset: DateRangePreset
  days: number
  setPreset: (preset: DateRangePreset) => void
  setDays: (days: number) => void
}

export const useDateRangeStore = create<DateRangeStore>()(
  persist(
    (set) => ({
      preset: '7d',
      days: 7,
      setPreset: (preset) => {
        const days = preset === '7d' ? 7 : preset === '30d' ? 30 : preset === '90d' ? 90 : 7
        set({ preset, days })
      },
      setDays: (days) => set({ days }),
    }),
    {
      name: 'date-range-storage',
    }
  )
)
