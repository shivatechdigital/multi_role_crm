'use client'

import { use, useState } from 'react'
import { useRouter } from 'next/navigation'
import { useLead, useUpdateLead, useDeleteLead, useAddActivity, useSendLeadActivitiesEmail } from '@/hooks/use-leads'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import { Badge } from '@/components/ui/badge'
import { Skeleton } from '@/components/ui/skeleton'
import { Textarea } from '@/components/ui/textarea'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
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
import { StatusBadge, LEAD_STATUSES } from '@/components/leads/status-badge'
import { ScoreBadge } from '@/components/leads/score-badge'
import {
  ArrowLeft,
  Mail,
  Phone,
  Building2,
  Calendar,
  MessageSquare,
  Plus,
  Trash2,
  Edit,
  Activity,
  StickyNote,
  PhoneCall,
  Send,
} from 'lucide-react'
import Link from 'next/link'
import { toast } from 'sonner'
import { formatDistanceToNow, format } from 'date-fns'
import { useSession } from 'next-auth/react'
import { canManageLeads, getUserRole } from '@/lib/auth/permissions'

export default function LeadDetailPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = use(params)
  const router = useRouter()
  const { data: session } = useSession()
  
  const { data, isLoading, error } = useLead(id)
  const updateLead = useUpdateLead()
  const deleteLead = useDeleteLead()
  const addActivity = useAddActivity()
  const sendLeadActivitiesEmail = useSendLeadActivitiesEmail()

  const [activityNote, setActivityNote] = useState('')
  const [activityType, setActivityType] = useState('note')
  const canDeleteLead = canManageLeads(getUserRole(session?.user?.role))

  const lead = data?.lead

  if (isLoading) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-12 w-64" />
        <div className="grid gap-4 lg:grid-cols-3">
          <Skeleton className="h-96 lg:col-span-2" />
          <Skeleton className="h-96" />
        </div>
      </div>
    )
  }

  if (error || !lead) {
    return (
      <Card>
        <CardContent className="p-12 text-center">
          <p className="text-destructive">Lead not found</p>
          <Link href="/leads">
            <Button variant="outline" className="mt-4">
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back to Leads
            </Button>
          </Link>
        </CardContent>
      </Card>
    )
  }

  const initials = lead.name
    .split(' ')
    .map((n: string) => n[0])
    .join('')
    .toUpperCase()
    .slice(0, 2)

  const handleStatusChange = async (newStatus: string) => {
    try {
      await updateLead.mutateAsync({
        id: lead.id,
        data: { status: newStatus },
      })
      toast.success('Status updated!')
    } catch (error) {
      toast.error('Failed to update status')
    }
  }

  const handleAddActivity = async () => {
    if (!activityNote.trim()) {
      toast.error('Please enter a note')
      return
    }

    try {
      await addActivity.mutateAsync({
        leadId: lead.id,
        data: {
          type: activityType,
          description: activityNote,
        },
      })
      setActivityNote('')
      toast.success('Activity added!')
    } catch (error) {
      toast.error('Failed to add activity')
    }
  }

  const handleDelete = async () => {
    try {
      await deleteLead.mutateAsync(lead.id)
      toast.success('Lead deleted')
      router.push('/leads')
    } catch (error) {
      toast.error('Failed to delete lead')
    }
  }

  const handleSendActivitiesEmail = async () => {
    try {
      const result = await sendLeadActivitiesEmail.mutateAsync(lead.id)
      toast.success(result.message || 'Activity email sent successfully')
    } catch (error: any) {
      toast.error(error.response?.data?.error || 'Failed to send activity email')
    }
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <Link href="/leads">
          <Button variant="ghost" size="sm" className="mb-4">
            <ArrowLeft className="w-4 h-4 mr-1" />
            Back to leads
          </Button>
        </Link>
        
        <div className="flex flex-col lg:flex-row lg:items-start lg:justify-between gap-4">
          <div className="flex items-start gap-4">
            <Avatar className="h-16 w-16">
              <AvatarFallback className="bg-primary/10 text-primary text-xl font-semibold">
                {initials}
              </AvatarFallback>
            </Avatar>
            <div>
              <h1 className="text-3xl font-bold">{lead.name}</h1>
              {lead.company && (
                <p className="text-muted-foreground flex items-center gap-1 mt-1">
                  <Building2 className="w-4 h-4" />
                  {lead.company}
                </p>
              )}
              <div className="flex flex-wrap items-center gap-2 mt-3">
                <StatusBadge status={lead.status} />
                <ScoreBadge score={lead.score} />
                <Badge variant="outline">
                  Source: {lead.source}
                </Badge>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <Select value={lead.status} onValueChange={handleStatusChange}>
              <SelectTrigger className="w-[180px]">
                <SelectValue />
              </SelectTrigger>
              <SelectContent className="z-[100]">
                {LEAD_STATUSES.map((status) => (
                  <SelectItem key={status} value={status}>
                    {status.replace('_', ' ')}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            {canDeleteLead && (
              <AlertDialog>
                <AlertDialogTrigger asChild>
                  <Button variant="outline" size="icon">
                    <Trash2 className="w-4 h-4 text-destructive" />
                  </Button>
                </AlertDialogTrigger>
                <AlertDialogContent>
                  <AlertDialogHeader>
                    <AlertDialogTitle>Delete this lead?</AlertDialogTitle>
                    <AlertDialogDescription>
                      This action cannot be undone. All activity history will be permanently deleted.
                    </AlertDialogDescription>
                  </AlertDialogHeader>
                  <AlertDialogFooter>
                    <AlertDialogCancel>Cancel</AlertDialogCancel>
                    <AlertDialogAction onClick={handleDelete} className="bg-destructive">
                      Delete
                    </AlertDialogAction>
                  </AlertDialogFooter>
                </AlertDialogContent>
              </AlertDialog>
            )}
          </div>
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        {/* Main Content */}
        <div className="lg:col-span-2 space-y-6">
          {/* Add Activity */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg flex items-center gap-2">
                <Plus className="w-5 h-5" />
                Add Activity
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <Select value={activityType} onValueChange={setActivityType}>
                <SelectTrigger className="w-full">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent className="z-[100]">
                  <SelectItem value="note">📝 Note</SelectItem>
                  <SelectItem value="call">📞 Call</SelectItem>
                  <SelectItem value="email">✉️ Email</SelectItem>
                  <SelectItem value="meeting">🤝 Meeting</SelectItem>
                  <SelectItem value="whatsapp">💬 WhatsApp</SelectItem>
                </SelectContent>
              </Select>
              <Textarea
                placeholder="Write your note here..."
                value={activityNote}
                onChange={(e) => setActivityNote(e.target.value)}
                rows={3}
              />
              <Button 
                onClick={handleAddActivity}
                disabled={addActivity.isPending}
                className="w-full"
              >
                <Send className="w-4 h-4 mr-2" />
                {addActivity.isPending ? 'Adding...' : 'Add Activity'}
              </Button>
            </CardContent>
          </Card>

          {/* Activity Timeline */}
          <Card>
            <CardHeader>
              <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                <div>
                  <CardTitle className="text-lg flex items-center gap-2">
                    <Activity className="w-5 h-5" />
                    Activity Timeline
                  </CardTitle>
                  <CardDescription>
                    {lead.activities?.length || 0} activities recorded
                  </CardDescription>
                </div>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={handleSendActivitiesEmail}
                  disabled={!lead.activities?.length || sendLeadActivitiesEmail.isPending}
                >
                  <Mail className="w-4 h-4 mr-2" />
                  {sendLeadActivitiesEmail.isPending ? 'Sending...' : 'Send Email'}
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              {!lead.activities || lead.activities.length === 0 ? (
                <p className="text-sm text-muted-foreground text-center py-8">
                  No activities yet. Add one above!
                </p>
              ) : (
                <div className="space-y-4">
                  {lead.activities.map((activity: any) => (
                    <ActivityItem key={activity.id} activity={activity} />
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Contact Info */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Contact Info</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <a 
                href={`mailto:${lead.email}`}
                className="flex items-center gap-3 p-3 rounded-lg bg-muted/50 hover:bg-muted transition-colors"
              >
                <Mail className="w-4 h-4 text-muted-foreground" />
                <div className="flex-1 min-w-0">
                  <p className="text-xs text-muted-foreground">Email</p>
                  <p className="text-sm font-medium truncate">{lead.email}</p>
                </div>
              </a>
              
              {lead.phone && (
                <a 
                  href={`tel:${lead.phone}`}
                  className="flex items-center gap-3 p-3 rounded-lg bg-muted/50 hover:bg-muted transition-colors"
                >
                  <Phone className="w-4 h-4 text-muted-foreground" />
                  <div className="flex-1">
                    <p className="text-xs text-muted-foreground">Phone</p>
                    <p className="text-sm font-medium">{lead.phone}</p>
                  </div>
                </a>
              )}

              {lead.company && (
                <div className="flex items-center gap-3 p-3 rounded-lg bg-muted/50">
                  <Building2 className="w-4 h-4 text-muted-foreground" />
                  <div className="flex-1">
                    <p className="text-xs text-muted-foreground">Company</p>
                    <p className="text-sm font-medium">{lead.company}</p>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Lead Details */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Lead Details</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3 text-sm">
              {lead.service && (
                <div>
                  <p className="text-xs text-muted-foreground mb-1">Service</p>
                  <Badge variant="outline">{lead.service}</Badge>
                </div>
              )}
              
              {lead.budget && (
                <div>
                  <p className="text-xs text-muted-foreground mb-1">Budget</p>
                  <Badge variant="outline">💰 {lead.budget}</Badge>
                </div>
              )}

              {lead.message && (
                <div>
                  <p className="text-xs text-muted-foreground mb-1">Message</p>
                  <p className="text-sm bg-muted/50 p-3 rounded-lg">
                    {lead.message}
                  </p>
                </div>
              )}

              <div>
                <p className="text-xs text-muted-foreground mb-1">Created</p>
                <p className="text-sm flex items-center gap-1">
                  <Calendar className="w-3 h-3" />
                  {format(new Date(lead.createdAt), 'PPp')}
                </p>
              </div>
            </CardContent>
          </Card>

          {/* UTM Info */}
          {(lead.utmSource || lead.utmMedium || lead.utmCampaign) && (
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Marketing</CardTitle>
              </CardHeader>
              <CardContent className="space-y-2 text-sm">
                {lead.utmSource && (
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Source:</span>
                    <span className="font-medium">{lead.utmSource}</span>
                  </div>
                )}
                {lead.utmMedium && (
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Medium:</span>
                    <span className="font-medium">{lead.utmMedium}</span>
                  </div>
                )}
                {lead.utmCampaign && (
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Campaign:</span>
                    <span className="font-medium">{lead.utmCampaign}</span>
                  </div>
                )}
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  )
}

function ActivityItem({ activity }: { activity: any }) {
  const iconMap: Record<string, any> = {
    note: StickyNote,
    call: PhoneCall,
    email: Mail,
    meeting: Calendar,
    whatsapp: MessageSquare,
    status_change: Activity,
  }
  
  const Icon = iconMap[activity.type] || Activity
  const userInitials = activity.user?.name
    ?.split(' ')
    .map((n: string) => n[0])
    .join('')
    .toUpperCase()
    .slice(0, 2) || 'U'

  return (
    <div className="flex gap-3 pb-4 border-b last:border-0 last:pb-0">
      <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
        <Icon className="w-4 h-4 text-primary" />
      </div>
      <div className="flex-1 min-w-0">
        <div className="flex items-center justify-between gap-2 mb-1">
          <div className="flex items-center gap-2">
            <Avatar className="h-5 w-5">
              <AvatarFallback className="text-xs">{userInitials}</AvatarFallback>
            </Avatar>
            <span className="text-sm font-medium">{activity.user?.name || 'User'}</span>
            <Badge variant="outline" className="text-xs capitalize">
              {activity.type.replace('_', ' ')}
            </Badge>
          </div>
          <span className="text-xs text-muted-foreground whitespace-nowrap">
            {formatDistanceToNow(new Date(activity.createdAt), { addSuffix: true })}
          </span>
        </div>
        <p className="text-sm text-muted-foreground">{activity.description}</p>
      </div>
    </div>
  )
}
