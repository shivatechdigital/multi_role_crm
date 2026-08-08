'use client'

import { Badge } from '@/components/ui/badge'
import { Flame, Star, Zap } from 'lucide-react'

export function ScoreBadge({ score }: { score: number }) {
  if (score >= 80) {
    return (
      <Badge className="bg-red-500/10 text-red-500 border-red-500/20 border">
        <Flame className="w-3 h-3 mr-1" />
        Hot ({score})
      </Badge>
    )
  }
  if (score >= 60) {
    return (
      <Badge className="bg-orange-500/10 text-orange-500 border-orange-500/20 border">
        <Star className="w-3 h-3 mr-1" />
        Warm ({score})
      </Badge>
    )
  }
  return (
    <Badge className="bg-blue-500/10 text-blue-500 border-blue-500/20 border">
      <Zap className="w-3 h-3 mr-1" />
      Cold ({score})
    </Badge>
  )
}
