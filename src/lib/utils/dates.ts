import { format, subDays } from 'date-fns'

export function getDateRange(days: number = 7) {
  const endDate = format(new Date(), 'yyyy-MM-dd')
  const startDate = format(subDays(new Date(), days), 'yyyy-MM-dd')
  return { startDate, endDate }
}

export function formatDate(date: string | Date) {
  return format(new Date(date), 'yyyy-MM-dd')
}
