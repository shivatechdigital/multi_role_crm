'use client'

import { ColumnDef } from '@tanstack/react-table'
import { Badge } from '@/components/ui/badge'
import { ExternalLink } from 'lucide-react'
import Link from 'next/link'

export type Page = {
  page: string
  clicks: number
  impressions: number
  ctr: number
  position: number
}

export const pagesColumns: ColumnDef<Page>[] = [
  {
    accessorKey: 'page',
    header: 'Page URL',
    cell: ({ row }) => {
      const url = row.original.page
      const path = url.replace(/^https?:\/\/[^\/]+/, '') || '/'
      
      return (
        <div className="flex items-center gap-2 max-w-md">
          <Link
            href={url}
            target="_blank"
            rel="noopener noreferrer"
            className="text-sm hover:text-primary truncate group flex items-center gap-1"
          >
            <span className="truncate">{path}</span>
            <ExternalLink className="w-3 h-3 opacity-0 group-hover:opacity-100 flex-shrink-0" />
          </Link>
        </div>
      )
    },
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
    header: 'Avg Position',
    cell: ({ row }) => {
      const pos = row.original.position
      let variant: 'default' | 'secondary' | 'destructive' = 'destructive'
      
      if (pos <= 3) variant = 'default'
      else if (pos <= 10) variant = 'default'
      else if (pos <= 20) variant = 'secondary'

      return <Badge variant={variant}>{pos.toFixed(1)}</Badge>
    },
  },
]
