'use client'

import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { Calendar as CalendarIcon } from 'lucide-react'
import { useDateRangeStore, type DateRangePreset } from '@/store/date-range-store'
import { cn } from '@/lib/utils'

const presets: { value: DateRangePreset; label: string }[] = [
  { value: '7d', label: 'Last 7 days' },
  { value: '30d', label: 'Last 30 days' },
  { value: '90d', label: 'Last 90 days' },
]

export function DateRangePicker() {
  const { preset, setPreset } = useDateRangeStore()

  return (
    <Card className="p-1 inline-flex gap-1">
      {presets.map((item) => (
        <Button
          key={item.value}
          variant={preset === item.value ? 'default' : 'ghost'}
          size="sm"
          onClick={() => setPreset(item.value)}
          className={cn(
            'transition-all',
            preset === item.value && 'shadow-sm'
          )}
        >
          <CalendarIcon className="w-3.5 h-3.5 mr-1.5" />
          {item.label}
        </Button>
      ))}
    </Card>
  )
}
