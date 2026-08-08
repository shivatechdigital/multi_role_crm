'use client'

import { useState } from 'react'
import { useLeads } from '@/hooks/use-leads'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Badge } from '@/components/ui/badge'
import { Skeleton } from '@/components/ui/skeleton'
import {
  Avatar,
  AvatarFallback,
} from '@/components/ui/avatar'
import { StatusBadge, LEAD_STATUSES } from '@/components/leads/status-badge'
import { ScoreBadge } from '@/components/leads/score-badge'
import { StatsCard } from '@/components/dashboard/stats-card'
import {
  Search,
  Users,
  UserPlus,
  Trophy,
  TrendingUp,
  Mail,
  Phone,
  Building2,
  Plus,
  Filter,
  Eye,
  MessageSquare,
} from 'lucide-react'
import Link from 'next/link'
import { formatDistanceToNow } from 'date-fns'

export default function LeadsPage() {
  const [search, setSearch] = useState('')
  const [statusFilter, setStatusFilter] = useState<string>('all')
  
  const { data, isLoading, error } = useLeads({
    search: search || undefined,
    status: statusFilter === 'all' ? undefined : statusFilter,
  })

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Leads 💼</h1>
          <p className="text-muted-foreground mt-1">
            Manage and track all your business leads
          </p>
        </div>
        <Link href="/leads/new">
          <Button>
            <Plus className="w-4 h-4 mr-2" />
            Add Lead
          </Button>
        </Link>
      </div>

      {/* Stats */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-5">
        <StatsCard
          title="Total Leads"
          value={data?.stats?.total || 0}
          icon={Users}
          isLoading={isLoading}
          color="blue"
        />
        <StatsCard
          title="New Leads"
          value={data?.stats?.new || 0}
          icon={UserPlus}
          isLoading={isLoading}
          color="purple"
        />
        <StatsCard
          title="Qualified"
          value={data?.stats?.qualified || 0}
          icon={TrendingUp}
          isLoading={isLoading}
          color="green"
        />
        <StatsCard
          title="Won"
          value={data?.stats?.won || 0}
          icon={Trophy}
          isLoading={isLoading}
          color="orange"
          highlight
        />
        <StatsCard
          title="Last 7 Days"
          value={data?.stats?.recent || 0}
          icon={TrendingUp}
          isLoading={isLoading}
          color="blue"
        />
      </div>

      {/* Filters */}
      <Card>
        <CardContent className="p-4">
          <div className="flex flex-col sm:flex-row gap-3">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input
                placeholder="Search by name, email, phone..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="pl-9"
              />
            </div>
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-full sm:w-[200px]">
                <Filter className="w-4 h-4 mr-2" />
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Status</SelectItem>
                {LEAD_STATUSES.map((status) => (
                  <SelectItem key={status} value={status}>
                    {status.replace('_', ' ')}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Leads List */}
      {isLoading ? (
        <div className="space-y-2">
          {[...Array(5)].map((_, i) => (
            <Skeleton key={i} className="h-24 w-full" />
          ))}
        </div>
      ) : error ? (
        <Card>
          <CardContent className="p-12 text-center">
            <p className="text-destructive">Failed to load leads</p>
          </CardContent>
        </Card>
      ) : data?.leads?.length === 0 ? (
        <Card>
          <CardContent className="p-12 text-center">
            <Users className="w-12 h-12 mx-auto text-muted-foreground mb-4" />
            <h3 className="font-semibold text-lg mb-1">No leads yet</h3>
            <p className="text-sm text-muted-foreground mb-4">
              Start capturing leads from your website or add manually
            </p>
            <Link href="/leads/new">
              <Button>
                <Plus className="w-4 h-4 mr-2" />
                Add Your First Lead
              </Button>
            </Link>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-3">
          {data?.leads?.map((lead: any) => (
            <LeadCard key={lead.id} lead={lead} />
          ))}
        </div>
      )}
    </div>
  )
}

function LeadCard({ lead }: { lead: any }) {
  const initials = lead.name
    .split(' ')
    .map((n: string) => n[0])
    .join('')
    .toUpperCase()
    .slice(0, 2)

  return (
    <Link href={`/leads/${lead.id}`}>
      <Card className="hover:border-primary transition-colors cursor-pointer">
        <CardContent className="p-4">
          <div className="flex items-start gap-4">
            {/* Avatar */}
            <Avatar className="h-12 w-12">
              <AvatarFallback className="bg-primary/10 text-primary font-semibold">
                {initials}
              </AvatarFallback>
            </Avatar>

            {/* Content */}
            <div className="flex-1 min-w-0">
              <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-2">
                <div className="min-w-0">
                  <h3 className="font-semibold truncate">{lead.name}</h3>
                  {lead.company && (
                    <p className="text-sm text-muted-foreground flex items-center gap-1 truncate">
                      <Building2 className="w-3 h-3" />
                      {lead.company}
                    </p>
                  )}
                </div>
                <div className="flex flex-wrap items-center gap-2">
                  <StatusBadge status={lead.status} />
                  <ScoreBadge score={lead.score} />
                </div>
              </div>

              {/* Contact info */}
              <div className="flex flex-wrap items-center gap-3 mt-3 text-sm text-muted-foreground">
                <span className="flex items-center gap-1">
                  <Mail className="w-3 h-3" />
                  {lead.email}
                </span>
                {lead.phone && (
                  <span className="flex items-center gap-1">
                    <Phone className="w-3 h-3" />
                    {lead.phone}
                  </span>
                )}
                <span className="flex items-center gap-1">
                  <MessageSquare className="w-3 h-3" />
                  {lead._count?.activities || 0} activities
                </span>
              </div>

              {/* Bottom info */}
              <div className="flex flex-wrap items-center justify-between gap-2 mt-3 pt-3 border-t">
                <div className="flex items-center gap-2 text-xs text-muted-foreground">
                  <Badge variant="outline" className="text-xs">
                    {lead.source}
                  </Badge>
                  {lead.service && (
                    <Badge variant="outline" className="text-xs">
                      {lead.service}
                    </Badge>
                  )}
                  {lead.budget && (
                    <Badge variant="outline" className="text-xs">
                      💰 {lead.budget}
                    </Badge>
                  )}
                </div>
                <span className="text-xs text-muted-foreground">
                  {formatDistanceToNow(new Date(lead.createdAt), { addSuffix: true })}
                </span>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </Link>
  )
}
