'use client'

import { cn } from '@/lib/utils'

export function ScoreCard({
  label,
  score,
  size = 'md',
}: {
  label: string
  score: number
  size?: 'sm' | 'md' | 'lg'
}) {
  const getColor = (s: number) => {
    if (s >= 90) return { ring: '#10b981', bg: 'bg-green-500/10', text: 'text-green-500', label: 'Excellent' }
    if (s >= 50) return { ring: '#f59e0b', bg: 'bg-orange-500/10', text: 'text-orange-500', label: 'Needs Work' }
    return { ring: '#ef4444', bg: 'bg-red-500/10', text: 'text-red-500', label: 'Poor' }
  }

  const colors = getColor(score)
  
  const sizeClasses = {
    sm: { container: 'w-20 h-20', text: 'text-xl', label: 'text-xs' },
    md: { container: 'w-32 h-32', text: 'text-4xl', label: 'text-sm' },
    lg: { container: 'w-40 h-40', text: 'text-5xl', label: 'text-base' },
  }

  const sizes = sizeClasses[size]
  const circumference = 2 * Math.PI * 45
  const offset = circumference - (score / 100) * circumference

  return (
    <div className="flex flex-col items-center gap-2">
      <div className={cn('relative flex items-center justify-center', sizes.container)}>
        <svg className="absolute inset-0 w-full h-full -rotate-90">
          {/* Background circle */}
          <circle
            cx="50%"
            cy="50%"
            r="45%"
            fill="none"
            stroke="currentColor"
            strokeWidth="8"
            className="text-muted/30"
          />
          {/* Progress circle */}
          <circle
            cx="50%"
            cy="50%"
            r="45%"
            fill="none"
            stroke={colors.ring}
            strokeWidth="8"
            strokeLinecap="round"
            strokeDasharray={circumference}
            strokeDashoffset={offset}
            className="transition-all duration-1000 ease-out"
            style={{
              strokeDasharray: `${(score / 100) * 283} 283`,
            }}
          />
        </svg>
        <div className="text-center z-10">
          <p className={cn('font-bold', sizes.text, colors.text)}>{score}</p>
        </div>
      </div>
      <div className="text-center">
        <p className={cn('font-medium', sizes.label)}>{label}</p>
        <p className={cn('text-xs', colors.text)}>{colors.label}</p>
      </div>
    </div>
  )
}
