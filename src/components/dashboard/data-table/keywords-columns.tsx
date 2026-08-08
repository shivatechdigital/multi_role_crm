'use client'

import { ColumnDef } from '@tanstack/react-table'
import { Badge } from '@/components/ui/badge'
import { ExternalLink, TrendingUp, TrendingDown, Minus } from 'lucide-react'

export type Keyword = {
  keyword: string
  clicks: number
  impressions: number
  ctr: number
  position: number
}

export const keywordsColumns: ColumnDef<Keyword>[] = [
  {
    accessorKey: 'keyword',
    header: 'Keyword',
    cell: ({ row }) => (
      <div className="font-medium max-w-md">
        <p className="truncate" title={row.original.keyword}>
          {row.original.keyword}
        </p>
      </div>
    ),
  },
  {
    accessorKey: 'clicks',
    header: 'Clicks',
    cell: ({ row }) => (
      <span className="font-semibold">{row.original.clicks.toLocaleString()}</span>
    ),
  },
  {
    accessorKey: 'impressions',
    header: 'Impressions',
    cell: ({ row }) => (
      <span className="text-muted-foreground">
        {row.original.impressions.toLocaleString()}
      </span>
    ),
  },
  {
    accessorKey: 'ctr',
    header: 'CTR',
    cell: ({ row }) => {
      const ctr = row.original.ctr
      const color = ctr > 5 ? 'text-green-500' : ctr > 2 ? 'text-yellow-500' : 'text-red-500'
      return (
        <span className={`font-medium ${color}`}>
          {ctr.toFixed(2)}%
        </span>
      )
    },
  },
  {
    accessorKey: 'position',
    header: 'Position',
    cell: ({ row }) => {
      const pos = row.original.position
      let variant: 'default' | 'secondary' | 'destructive' = 'destructive'
      let label = `${pos.toFixed(1)}`
      
      if (pos <= 3) {
        variant = 'default'
        label = `🏆 ${pos.toFixed(1)}`
      } else if (pos <= 10) {
        variant = 'default'
        label = `${pos.toFixed(1)}`
      } else if (pos <= 20) {
        variant = 'secondary'
        label = `${pos.toFixed(1)}`
      }

      return <Badge variant={variant}>{label}</Badge>
    },
  },
  {
    id: 'opportunity',
    header: 'Opportunity',
    cell: ({ row }) => {
      const { position, impressions, ctr } = row.original
      
      // Identify opportunities
      if (position > 10 && position <= 20 && impressions > 100) {
        return (
          <Badge variant="outline" className="border-orange-500/50 text-orange-500">
            🎯 Easy Win
          </Badge>
        )
      }
      if (position <= 10 && ctr < 2) {
        return (
          <Badge variant="outline" className="border-blue-500/50 text-blue-500">
            💡 Optimize CTR
          </Badge>
        )
      }
      if (position <= 3) {
        return (
          <Badge variant="outline" className="border-green-500/50 text-green-500">
            ⭐ Top Rank
          </Badge>
        )
      }
      return <span className="text-xs text-muted-foreground">-</span>
    },
  },
]
