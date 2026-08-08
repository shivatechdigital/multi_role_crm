'use client'

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import {
  Clock,
  CheckCircle2,
  Activity,
  Database,
  Brain,
  Globe,
  Copy,
  ExternalLink,
} from 'lucide-react'
import { toast } from 'sonner'

export default function AutomationPage() {
  const baseUrl = typeof window !== 'undefined' ? window.location.origin : ''

  const workflows = [
    {
      name: 'Daily GSC Sync',
      icon: Database,
      schedule: '9:00 AM daily',
      cron: '0 9 * * *',
      endpoint: `${baseUrl}/api/sync/gsc`,
      description: 'Fetches yesterday SEO data from Google Search Console',
      color: 'blue',
    },
    {
      name: 'Daily GA4 Sync',
      icon: Activity,
      schedule: '9:15 AM daily',
      cron: '15 9 * * *',
      endpoint: `${baseUrl}/api/sync/ga4`,
      description: 'Fetches Analytics data and traffic sources',
      color: 'purple',
    },
    {
      name: 'Hourly Uptime Check',
      icon: Globe,
      schedule: 'Every hour',
      cron: '0 * * * *',
      endpoint: `${baseUrl}/api/sync/uptime`,
      description: 'Monitors website availability',
      color: 'green',
    },
    {
      name: 'Daily AI Insights',
      icon: Brain,
      schedule: '10:00 AM daily',
      cron: '0 10 * * *',
      endpoint: `${baseUrl}/api/sync/insights`,
      description: 'Auto-generates AI-powered insights',
      color: 'orange',
    },
  ]

  const colorClasses = {
    blue: 'bg-blue-500/10 text-blue-500 border-blue-500/20',
    purple: 'bg-purple-500/10 text-purple-500 border-purple-500/20',
    green: 'bg-green-500/10 text-green-500 border-green-500/20',
    orange: 'bg-orange-500/10 text-orange-500 border-orange-500/20',
  }

  const copyEndpoint = (endpoint: string) => {
    navigator.clipboard.writeText(endpoint)
    toast.success('Endpoint copied!')
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Automation ⚡</h1>
        <p className="text-muted-foreground mt-1">
          n8n workflow endpoints and schedule
        </p>
      </div>

      {/* n8n Info */}
      <Card className="border-primary/20 bg-gradient-to-br from-primary/5 to-transparent">
        <CardContent className="p-6">
          <div className="flex items-start justify-between">
            <div>
              <h3 className="font-semibold text-lg mb-1">n8n Automation Server</h3>
              <p className="text-sm text-muted-foreground mb-3">
                All workflows run automatically via n8n
              </p>
              <a 
                href="http://34.100.232.200:5678" 
                target="_blank" 
                rel="noopener noreferrer"
              >
                <Button variant="outline" size="sm">
                  <ExternalLink className="w-4 h-4 mr-2" />
                  Open n8n Dashboard
                </Button>
              </a>
            </div>
            <Badge variant="default" className="bg-green-500">
              <CheckCircle2 className="w-3 h-3 mr-1" />
              Active
            </Badge>
          </div>
        </CardContent>
      </Card>

      {/* Workflows */}
      <div className="space-y-3">
        <h2 className="text-lg font-semibold">Automated Workflows</h2>
        
        {workflows.map((wf, i) => {
          const Icon = wf.icon
          const colors = colorClasses[wf.color as keyof typeof colorClasses]
          
          return (
            <Card key={i}>
              <CardContent className="p-4">
                <div className="flex items-start gap-4">
                  <div className={`w-12 h-12 rounded-xl flex items-center justify-center border ${colors}`}>
                    <Icon className="w-6 h-6" />
                  </div>
                  
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-2 mb-2">
                      <div>
                        <h3 className="font-semibold">{wf.name}</h3>
                        <p className="text-sm text-muted-foreground">{wf.description}</p>
                      </div>
                      <Badge variant="outline" className="flex items-center gap-1 whitespace-nowrap">
                        <Clock className="w-3 h-3" />
                        {wf.schedule}
                      </Badge>
                    </div>
                    
                    <div className="space-y-2 mt-3">
                      <div className="flex items-center gap-2">
                        <code className="text-xs bg-muted px-2 py-1 rounded font-mono flex-1 truncate">
                          {wf.endpoint}
                        </code>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => copyEndpoint(wf.endpoint)}
                        >
                          <Copy className="w-3 h-3" />
                        </Button>
                      </div>
                      <div className="flex items-center gap-2 text-xs">
                        <Badge variant="secondary" className="font-mono">
                          {wf.cron}
                        </Badge>
                        <span className="text-muted-foreground">Cron schedule</span>
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          )
        })}
      </div>

      {/* Setup Guide */}
      <Card>
        <CardHeader>
          <CardTitle>📚 n8n Setup Guide</CardTitle>
          <CardDescription>
            How to set up workflows in n8n
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-3 text-sm">
          <div className="p-3 rounded-lg bg-muted/50">
            <p className="font-semibold mb-2">For each workflow:</p>
            <ol className="space-y-1 list-decimal pl-5 text-muted-foreground">
              <li>Add <strong>Schedule Trigger</strong> node with cron expression</li>
              <li>Add <strong>HTTP Request</strong> node with POST method</li>
              <li>Set Authorization header: <code className="text-xs bg-background px-1">Bearer YOUR_SYNC_SECRET</code></li>
              <li>Add Body (JSON) if needed</li>
              <li>Optional: Add Telegram node for notifications</li>
              <li>Activate the workflow</li>
            </ol>
          </div>

          <div className="p-3 rounded-lg bg-orange-500/10 border border-orange-500/20">
            <p className="font-semibold text-orange-500 mb-1">⚠️ Security Note</p>
            <p className="text-xs">
              SYNC_SECRET is stored in .env file. Don't share it publicly.
              Update it regularly for better security.
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
