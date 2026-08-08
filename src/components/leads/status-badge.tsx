'use client'

import { Badge } from '@/components/ui/badge'

const statusConfig = {
  NEW: { label: 'New', color: 'bg-blue-500/10 text-blue-500 border-blue-500/20' },
  CONTACTED: { label: 'Contacted', color: 'bg-purple-500/10 text-purple-500 border-purple-500/20' },
  QUALIFIED: { label: 'Qualified', color: 'bg-cyan-500/10 text-cyan-500 border-cyan-500/20' },
  PROPOSAL_SENT: { label: 'Proposal Sent', color: 'bg-yellow-500/10 text-yellow-500 border-yellow-500/20' },
  NEGOTIATION: { label: 'Negotiation', color: 'bg-orange-500/10 text-orange-500 border-orange-500/20' },
  WON: { label: 'Won', color: 'bg-green-500/10 text-green-500 border-green-500/20' },
  LOST: { label: 'Lost', color: 'bg-red-500/10 text-red-500 border-red-500/20' },
  ON_HOLD: { label: 'On Hold', color: 'bg-gray-500/10 text-gray-500 border-gray-500/20' },
}

export function StatusBadge({ status }: { status: string }) {
  const config = statusConfig[status as keyof typeof statusConfig] || statusConfig.NEW
  
  return (
    <Badge variant="outline" className={config.color}>
      {config.label}
    </Badge>
  )
}

export const LEAD_STATUSES = Object.keys(statusConfig) as Array<keyof typeof statusConfig>
