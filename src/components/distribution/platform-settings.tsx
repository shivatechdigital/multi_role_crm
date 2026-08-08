// src/components/distribution/platform-settings.tsx

'use client'

import { Card, CardContent } from '@/components/ui/card'
import { Switch } from '@/components/ui/switch'
import { Badge } from '@/components/ui/badge'
import { 
  Settings, 
  TrendingUp, 
  CheckCircle2, 
  XCircle,
  Clock,
} from 'lucide-react'
import { PLATFORM_INFO, type Platform } from '@/lib/types/distribution'
import { usePlatforms, useTogglePlatform } from '@/hooks/use-distribution'
import { formatRelativeTime } from '@/lib/utils/seo-helpers'

export function PlatformSettings() {
  const { data, isLoading } = usePlatforms()
  const toggleMutation = useTogglePlatform()
  
  if (isLoading) {
    return (
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {[...Array(8)].map((_, i) => (
          <Card key={i}>
            <CardContent className="p-4 h-32 animate-pulse bg-muted/30" />
          </Card>
        ))}
      </div>
    )
  }
  
  const platforms = data?.platforms || []
  
  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
      {platforms.map((platform) => {
        const info = PLATFORM_INFO[platform.platform as Platform]
        if (!info) return null
        
        const successRate = platform.totalPosts > 0
          ? (platform.successfulPosts / platform.totalPosts) * 100
          : 0
        
        return (
          <Card 
            key={platform.id}
            className={`relative ${!platform.isEnabled ? 'opacity-60' : ''} hover:border-primary/40 transition-all`}
          >
            <CardContent className="p-4">
              {/* Header */}
              <div className="flex items-start justify-between mb-3">
                <div className="flex items-center gap-2">
                  <span className="text-2xl">{info.icon}</span>
                  <div>
                    <h4 className="font-semibold text-sm">{info.name}</h4>
                    <p className="text-xs text-muted-foreground">
                      {platform.postDelay}s delay
                    </p>
                  </div>
                </div>
                <Switch
                  checked={platform.isEnabled}
                  onCheckedChange={(checked) => 
                    toggleMutation.mutate({ 
                      platform: platform.platform, 
                      isEnabled: checked 
                    })
                  }
                  disabled={toggleMutation.isPending}
                />
              </div>
              
              {/* Stats */}
              <div className="space-y-2 mb-3">
                <div className="grid grid-cols-2 gap-2 text-center">
                  <div className="p-2 bg-green-500/5 rounded-md border border-green-500/20">
                    <div className="text-[10px] uppercase text-muted-foreground font-semibold">Success</div>
                    <div className="text-sm font-bold text-green-400">
                      {platform.successfulPosts}
                    </div>
                  </div>
                  <div className="p-2 bg-red-500/5 rounded-md border border-red-500/20">
                    <div className="text-[10px] uppercase text-muted-foreground font-semibold">Failed</div>
                    <div className="text-sm font-bold text-red-400">
                      {platform.failedPosts}
                    </div>
                  </div>
                </div>
                
                {/* Success Rate Bar */}
                {platform.totalPosts > 0 && (
                  <div>
                    <div className="flex items-center justify-between text-[10px] text-muted-foreground mb-1">
                      <span>Success Rate</span>
                      <span className="font-mono">{successRate.toFixed(0)}%</span>
                    </div>
                    <div className="h-1 bg-muted rounded-full overflow-hidden">
                      <div 
                        className={`h-full transition-all ${
                          successRate >= 90 ? 'bg-green-400' :
                          successRate >= 70 ? 'bg-yellow-400' :
                          'bg-red-400'
                        }`}
                        style={{ width: `${successRate}%` }}
                      />
                    </div>
                  </div>
                )}
              </div>
              
              {/* Footer */}
              <div className="flex items-center justify-between text-[10px] text-muted-foreground pt-2 border-t border-border/40">
                <span>Total: {platform.totalPosts}</span>
                {platform.lastUsedAt ? (
                  <span title={new Date(platform.lastUsedAt).toLocaleString()}>
                    <Clock className="h-2.5 w-2.5 inline mr-1" />
                    {formatRelativeTime(platform.lastUsedAt)}
                  </span>
                ) : (
                  <span className="italic">Never used</span>
                )}
              </div>
            </CardContent>
          </Card>
        )
      })}
    </div>
  )
}
