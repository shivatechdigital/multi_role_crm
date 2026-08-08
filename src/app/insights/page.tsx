'use client'

import { useState } from 'react'
import { useInsights, useGenerateInsight, useUpdateInsight, useDeleteInsight } from '@/hooks/use-insights'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Skeleton } from '@/components/ui/skeleton'
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog'
import {
  Sparkles,
  RefreshCw,
  CheckCircle2,
  Eye,
  Trash2,
  TrendingUp,
  Lightbulb,
  Target,
  Brain,
  Wand2,
} from 'lucide-react'
import { toast } from 'sonner'
import { formatDistanceToNow } from 'date-fns'
import ReactMarkdown from 'react-markdown'
import { useSession } from 'next-auth/react'
import { canManageOperations, getUserRole } from '@/lib/auth/permissions'

export default function InsightsPage() {
  const { data: session } = useSession()
  const [selectedType, setSelectedType] = useState<string | undefined>()
  const canManage = canManageOperations(getUserRole(session?.user?.role))
  
  const { data, isLoading } = useInsights(selectedType)
  const generateInsight = useGenerateInsight()
  const updateInsight = useUpdateInsight()
  const deleteInsight = useDeleteInsight()

  const handleGenerate = async (type: string) => {
    toast.info('🤖 AI is analyzing your data... This may take 10-30 seconds')
    try {
      await generateInsight.mutateAsync({ type })
      toast.success('✨ Insight generated successfully!')
    } catch (error: any) {
      toast.error(error.response?.data?.error || 'Failed to generate insight')
    }
  }

  const handleMarkAsActioned = async (id: string) => {
    try {
      await updateInsight.mutateAsync({ id, data: { status: 'actioned' } })
      toast.success('Marked as actioned')
    } catch (error) {
      toast.error('Failed to update')
    }
  }

  const handleDelete = async (id: string) => {
    try {
      await deleteInsight.mutateAsync(id)
      toast.success('Insight deleted')
    } catch (error) {
      toast.error('Failed to delete')
    }
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight flex items-center gap-2">
            AI Insights
            <Brain className="w-8 h-8 text-primary" />
          </h1>
          <p className="text-muted-foreground mt-1">
            AI-powered analysis and smart recommendations
          </p>
        </div>
      </div>

      {/* Generate New Insights */}
      <Card className="border-primary/20 bg-gradient-to-br from-primary/5 to-transparent">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Wand2 className="w-5 h-5 text-primary" />
            Generate New Insights
          </CardTitle>
          <CardDescription>
            {canManage
              ? 'Choose what you want AI to analyze for you'
              : 'Only managers and admins can generate new insights'}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid gap-3 md:grid-cols-3">
            <Button
              variant="outline"
              size="lg"
              className="h-auto py-4 flex-col items-start gap-2"
              onClick={() => handleGenerate('overview')}
              disabled={generateInsight.isPending || !canManage}
            >
              <div className="flex items-center gap-2 w-full">
                <TrendingUp className="w-5 h-5 text-blue-500" />
                <span className="font-semibold">SEO Analysis</span>
              </div>
              <span className="text-xs text-muted-foreground text-left">
                Get complete SEO performance analysis
              </span>
            </Button>

            <Button
              variant="outline"
              size="lg"
              className="h-auto py-4 flex-col items-start gap-2"
              onClick={() => handleGenerate('opportunities')}
              disabled={generateInsight.isPending || !canManage}
            >
              <div className="flex items-center gap-2 w-full">
                <Target className="w-5 h-5 text-green-500" />
                <span className="font-semibold">Find Opportunities</span>
              </div>
              <span className="text-xs text-muted-foreground text-left">
                Discover quick wins and growth areas
              </span>
            </Button>

            <Button
              variant="outline"
              size="lg"
              className="h-auto py-4 flex-col items-start gap-2"
              onClick={() => handleGenerate('content_ideas')}
              disabled={generateInsight.isPending || !canManage}
            >
              <div className="flex items-center gap-2 w-full">
                <Lightbulb className="w-5 h-5 text-orange-500" />
                <span className="font-semibold">Content Ideas</span>
              </div>
              <span className="text-xs text-muted-foreground text-left">
                Get SEO-friendly content suggestions
              </span>
            </Button>
          </div>

          {generateInsight.isPending && (
            <div className="mt-4 p-4 rounded-lg bg-primary/10 border border-primary/20">
              <div className="flex items-center gap-3">
                <RefreshCw className="w-5 h-5 text-primary animate-spin" />
                <div>
                  <p className="font-medium text-sm">AI is thinking...</p>
                  <p className="text-xs text-muted-foreground">This may take 10-30 seconds</p>
                </div>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Stats */}
      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Total Insights</p>
                <p className="text-3xl font-bold mt-1">{data?.stats?.total || 0}</p>
              </div>
              <Sparkles className="w-8 h-8 text-primary opacity-50" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">New</p>
                <p className="text-3xl font-bold mt-1 text-blue-500">{data?.stats?.new || 0}</p>
              </div>
              <Eye className="w-8 h-8 text-blue-500 opacity-50" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Actioned</p>
                <p className="text-3xl font-bold mt-1 text-green-500">{data?.stats?.actioned || 0}</p>
              </div>
              <CheckCircle2 className="w-8 h-8 text-green-500 opacity-50" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filter Tabs */}
      <div className="flex flex-wrap gap-2">
        <Button
          variant={!selectedType ? 'default' : 'outline'}
          size="sm"
          onClick={() => setSelectedType(undefined)}
        >
          All
        </Button>
        <Button
          variant={selectedType === 'overview' ? 'default' : 'outline'}
          size="sm"
          onClick={() => setSelectedType('overview')}
        >
          📊 SEO Analysis
        </Button>
        <Button
          variant={selectedType === 'opportunities' ? 'default' : 'outline'}
          size="sm"
          onClick={() => setSelectedType('opportunities')}
        >
          🎯 Opportunities
        </Button>
        <Button
          variant={selectedType === 'content_ideas' ? 'default' : 'outline'}
          size="sm"
          onClick={() => setSelectedType('content_ideas')}
        >
          💡 Content Ideas
        </Button>
      </div>

      {/* Insights List */}
      {isLoading ? (
        <div className="space-y-4">
          {[...Array(3)].map((_, i) => (
            <Skeleton key={i} className="h-48 w-full" />
          ))}
        </div>
      ) : !data?.insights || data.insights.length === 0 ? (
        <Card>
          <CardContent className="p-12 text-center">
            <Brain className="w-16 h-16 mx-auto text-muted-foreground mb-4 opacity-50" />
            <h3 className="font-semibold text-lg mb-2">No Insights Yet</h3>
            <p className="text-sm text-muted-foreground mb-4">
              Click any "Generate" button above to get AI-powered insights
            </p>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-4">
          {data.insights.map((insight: any) => (
            <InsightCard
              key={insight.id}
              insight={insight}
              canDelete={canManage}
              onMarkActioned={() => handleMarkAsActioned(insight.id)}
              onDelete={() => handleDelete(insight.id)}
            />
          ))}
        </div>
      )}
    </div>
  )
}

function InsightCard({
  insight,
  canDelete,
  onMarkActioned,
  onDelete,
}: {
  insight: any
  canDelete: boolean
  onMarkActioned: () => void
  onDelete: () => void
}) {
  const typeColors: Record<string, string> = {
    overview: 'bg-blue-500/10 text-blue-500 border-blue-500/20',
    opportunities: 'bg-green-500/10 text-green-500 border-green-500/20',
    content_ideas: 'bg-orange-500/10 text-orange-500 border-orange-500/20',
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex items-start justify-between gap-4">
          <div className="flex-1 min-w-0">
            <CardTitle className="text-lg">{insight.title}</CardTitle>
            <div className="flex flex-wrap items-center gap-2 mt-2">
              <Badge variant="outline" className={typeColors[insight.type] || ''}>
                {insight.type.replace('_', ' ')}
              </Badge>
              <Badge variant={insight.status === 'actioned' ? 'default' : 'secondary'}>
                {insight.status}
              </Badge>
              <span className="text-xs text-muted-foreground">
                {formatDistanceToNow(new Date(insight.createdAt), { addSuffix: true })}
              </span>
            </div>
          </div>
          <div className="flex items-center gap-2">
            {insight.status !== 'actioned' && (
              <Button variant="outline" size="sm" onClick={onMarkActioned}>
                <CheckCircle2 className="w-4 h-4 mr-1" />
                Mark Done
              </Button>
            )}
            {canDelete && (
              <AlertDialog>
                <AlertDialogTrigger asChild>
                  <Button variant="outline" size="icon">
                    <Trash2 className="w-4 h-4 text-destructive" />
                  </Button>
                </AlertDialogTrigger>
                <AlertDialogContent>
                  <AlertDialogHeader>
                    <AlertDialogTitle>Delete this insight?</AlertDialogTitle>
                    <AlertDialogDescription>
                      This action cannot be undone.
                    </AlertDialogDescription>
                  </AlertDialogHeader>
                  <AlertDialogFooter>
                    <AlertDialogCancel>Cancel</AlertDialogCancel>
                    <AlertDialogAction onClick={onDelete} className="bg-destructive">
                      Delete
                    </AlertDialogAction>
                  </AlertDialogFooter>
                </AlertDialogContent>
              </AlertDialog>
            )}
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <div className="prose prose-sm dark:prose-invert max-w-none">
          <ReactMarkdown
            components={{
              h2: ({ children }) => <h2 className="text-base font-semibold mt-4 mb-2 text-primary">{children}</h2>,
              h3: ({ children }) => <h3 className="text-sm font-semibold mt-3 mb-2">{children}</h3>,
              ul: ({ children }) => <ul className="space-y-1 my-2">{children}</ul>,
              ol: ({ children }) => <ol className="space-y-1 my-2 list-decimal pl-4">{children}</ol>,
              li: ({ children }) => <li className="text-sm">{children}</li>,
              p: ({ children }) => <p className="text-sm my-2">{children}</p>,
              strong: ({ children }) => <strong className="font-semibold text-primary">{children}</strong>,
            }}
          >
            {insight.description}
          </ReactMarkdown>
        </div>
      </CardContent>
    </Card>
  )
}
