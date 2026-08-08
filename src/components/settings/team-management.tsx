'use client'

import { useEffect, useState } from 'react'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { toast } from 'sonner'
import {
  APP_ROLES,
  canManageInvites,
  canManageRoles,
  canManageTeam,
  type AppRole,
} from '@/lib/auth/permissions'

type TeamMember = {
  id: string
  name: string | null
  email: string
  image: string | null
  role: AppRole
  createdAt: string
  _count: {
    leads: number
    activities: number
  }
}

type TeamResponse = {
  users: TeamMember[]
  stats: {
    total: number
    admins: number
    managers: number
    members: number
  }
}

type TeamInvite = {
  id: string
  email: string
  role: AppRole
  token: string
  status: string
  expiresAt: string
  createdAt: string
}

interface TeamManagementProps {
  currentRole: string
  currentUserId: string
}

export function TeamManagement({ currentRole, currentUserId }: TeamManagementProps) {
  const [team, setTeam] = useState<TeamResponse | null>(null)
  const [invites, setInvites] = useState<TeamInvite[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [isInvitesLoading, setIsInvitesLoading] = useState(false)
  const [isUpdatingUserId, setIsUpdatingUserId] = useState<string | null>(null)
  const [inviteEmail, setInviteEmail] = useState('')
  const [inviteRole, setInviteRole] = useState<AppRole>('USER')
  const [isCreatingInvite, setIsCreatingInvite] = useState(false)

  const canViewTeam = canManageTeam(currentRole)
  const canEditRoles = canManageRoles(currentRole)
  const canInviteUsers = canManageInvites(currentRole)

  useEffect(() => {
    if (!canViewTeam) {
      setIsLoading(false)
      return
    }

    const fetchTeam = async () => {
      try {
        setIsLoading(true)
        const response = await fetch('/api/users', { cache: 'no-store' })
        const data = await response.json()

        if (!response.ok) {
          throw new Error(data.error || 'Failed to load team members')
        }

        setTeam(data)
      } catch (error: any) {
        toast.error(error.message || 'Failed to load team members')
      } finally {
        setIsLoading(false)
      }
    }

    fetchTeam()
  }, [canViewTeam])

  useEffect(() => {
    if (!canInviteUsers) {
      return
    }

    const fetchInvites = async () => {
      try {
        setIsInvitesLoading(true)
        const response = await fetch('/api/invites', { cache: 'no-store' })
        const data = await response.json()

        if (!response.ok) {
          throw new Error(data.error || 'Failed to load invites')
        }

        setInvites(data.invites || [])
      } catch (error: any) {
        toast.error(error.message || 'Failed to load invites')
      } finally {
        setIsInvitesLoading(false)
      }
    }

    fetchInvites()
  }, [canInviteUsers])

  const handleRoleChange = async (userId: string, role: AppRole) => {
    try {
      setIsUpdatingUserId(userId)
      const response = await fetch(`/api/users/${userId}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ role }),
      })

      const data = await response.json()
      if (!response.ok) {
        throw new Error(data.error || 'Failed to update role')
      }

      setTeam((currentTeam) => {
        if (!currentTeam) return currentTeam

        const users = currentTeam.users.map((member) =>
          member.id === userId ? data.user : member
        )

        return {
          users,
          stats: {
            total: users.length,
            admins: users.filter((user) => user.role === 'ADMIN').length,
            managers: users.filter((user) => user.role === 'MANAGER').length,
            members: users.filter((user) => user.role === 'USER').length,
          },
        }
      })

      toast.success('Role updated successfully')
    } catch (error: any) {
      toast.error(error.message || 'Failed to update role')
    } finally {
      setIsUpdatingUserId(null)
    }
  }

  const handleCreateInvite = async () => {
    if (!inviteEmail.trim()) {
      toast.error('Please enter an email address')
      return
    }

    try {
      setIsCreatingInvite(true)
      const response = await fetch('/api/invites', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email: inviteEmail,
          role: inviteRole,
        }),
      })

      const data = await response.json()
      if (!response.ok) {
        throw new Error(data.error || 'Failed to create invite')
      }

      setInvites((currentInvites) => [data.invite, ...currentInvites])
      setInviteEmail('')
      toast.success('Invite created successfully')

      if (data.emailSent) {
        toast.success(`Invite email sent to ${data.invite.email}`)
      } else if (data.emailError) {
        toast.info(data.emailError)
      }

      if (data.inviteUrl && typeof navigator !== 'undefined' && navigator.clipboard) {
        try {
          await navigator.clipboard.writeText(data.inviteUrl)
          toast.success('Invite link copied to clipboard')
        } catch {
          // Ignore clipboard failures.
        }
      }
    } catch (error: any) {
      toast.error(error.message || 'Failed to create invite')
    } finally {
      setIsCreatingInvite(false)
    }
  }

  const handleRevokeInvite = async (inviteId: string) => {
    try {
      const response = await fetch(`/api/invites/${inviteId}`, {
        method: 'DELETE',
      })

      const data = await response.json()
      if (!response.ok) {
        throw new Error(data.error || 'Failed to revoke invite')
      }

      setInvites((currentInvites) =>
        currentInvites.map((invite) =>
          invite.id === inviteId ? { ...invite, status: 'revoked' } : invite
        )
      )

      toast.success('Invite revoked')
    } catch (error: any) {
      toast.error(error.message || 'Failed to revoke invite')
    }
  }

  const handleCopyInviteLink = async (token: string) => {
    try {
      if (typeof window === 'undefined' || !navigator.clipboard) {
        toast.error('Clipboard is not available in this browser')
        return
      }

      const inviteUrl = `${window.location.origin}/invite?token=${token}`
      await navigator.clipboard.writeText(inviteUrl)
      toast.success('Invite link copied to clipboard')
    } catch {
      toast.error('Failed to copy invite link')
    }
  }

  if (!canViewTeam) {
    return null
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Team Management</CardTitle>
          <CardDescription>
            Manage members in this business workspace and assign the right level of access.
          </CardDescription>
        </CardHeader>
        <CardContent className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <StatCard label="Total Members" value={team?.stats.total ?? 0} />
          <StatCard label="Admins" value={team?.stats.admins ?? 0} />
          <StatCard label="Managers" value={team?.stats.managers ?? 0} />
          <StatCard label="Users" value={team?.stats.members ?? 0} />
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Workspace Members</CardTitle>
          <CardDescription>
            {canEditRoles
              ? 'Admins can update roles for other members.'
              : 'Managers can review the current team roster.'}
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-3">
          {isLoading ? (
            <p className="text-sm text-muted-foreground">Loading team members...</p>
          ) : team?.users.length ? (
            team.users.map((member) => {
              const initials = member.name
                ?.split(' ')
                .map((part) => part[0])
                .join('')
                .toUpperCase()
                .slice(0, 2) || 'U'

              return (
                <div
                  key={member.id}
                  className="flex flex-col gap-3 rounded-lg border p-4 sm:flex-row sm:items-center sm:justify-between"
                >
                  <div className="flex items-center gap-3">
                    <Avatar className="h-11 w-11">
                      <AvatarImage src={member.image || ''} />
                      <AvatarFallback>{initials}</AvatarFallback>
                    </Avatar>
                    <div>
                      <div className="flex items-center gap-2">
                        <p className="font-medium">{member.name || member.email}</p>
                        {member.id === currentUserId && <Badge variant="outline">You</Badge>}
                      </div>
                      <p className="text-sm text-muted-foreground">{member.email}</p>
                      <p className="text-xs text-muted-foreground">
                        {member._count.leads} assigned leads • {member._count.activities} activities
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-3 sm:min-w-[180px] sm:justify-end">
                    {canEditRoles && member.id !== currentUserId ? (
                      <Select
                        value={member.role}
                        onValueChange={(value) => handleRoleChange(member.id, value as AppRole)}
                        disabled={isUpdatingUserId === member.id}
                      >
                        <SelectTrigger className="w-full sm:w-[150px]">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          {APP_ROLES.map((role) => (
                            <SelectItem key={role} value={role}>
                              {role}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    ) : (
                      <Badge variant="secondary">{member.role}</Badge>
                    )}
                  </div>
                </div>
              )
            })
          ) : (
            <p className="text-sm text-muted-foreground">No workspace members found yet.</p>
          )}
        </CardContent>
      </Card>

      {canInviteUsers && (
        <Card>
          <CardHeader>
            <CardTitle>Invite Team Members</CardTitle>
            <CardDescription>
              Create role-based invites and manage pending invitations.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid gap-3 md:grid-cols-[1fr_180px_auto] md:items-end">
              <div className="space-y-2">
                <Label htmlFor="invite-email">Email</Label>
                <Input
                  id="invite-email"
                  type="email"
                  placeholder="name@company.com"
                  value={inviteEmail}
                  onChange={(event) => setInviteEmail(event.target.value)}
                />
              </div>

              <div className="space-y-2">
                <Label>Role</Label>
                <Select
                  value={inviteRole}
                  onValueChange={(value) => setInviteRole(value as AppRole)}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {APP_ROLES.map((role) => (
                      <SelectItem key={role} value={role}>
                        {role}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <Button onClick={handleCreateInvite} disabled={isCreatingInvite}>
                {isCreatingInvite ? 'Creating...' : 'Create Invite'}
              </Button>
            </div>

            <div className="space-y-2">
              {isInvitesLoading ? (
                <p className="text-sm text-muted-foreground">Loading invites...</p>
              ) : invites.length ? (
                invites.map((invite) => {
                  const isPending = invite.status === 'pending'
                  return (
                    <div
                      key={invite.id}
                      className="flex flex-col gap-3 rounded-lg border p-4 sm:flex-row sm:items-center sm:justify-between"
                    >
                      <div>
                        <p className="font-medium">{invite.email}</p>
                        <p className="text-sm text-muted-foreground">
                          Role: {invite.role} • Expires:{' '}
                          {new Date(invite.expiresAt).toLocaleDateString()}
                        </p>
                      </div>

                      <div className="flex items-center gap-2">
                        <Badge variant={isPending ? 'secondary' : 'outline'}>
                          {invite.status}
                        </Badge>
                        {isPending && (
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleCopyInviteLink(invite.token)}
                          >
                            Copy Link
                          </Button>
                        )}
                        {isPending && (
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleRevokeInvite(invite.id)}
                          >
                            Revoke
                          </Button>
                        )}
                      </div>
                    </div>
                  )
                })
              ) : (
                <p className="text-sm text-muted-foreground">No invites sent yet.</p>
              )}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}

function StatCard({ label, value }: { label: string; value: number }) {
  return (
    <div className="rounded-lg border bg-muted/40 p-4">
      <p className="text-sm text-muted-foreground">{label}</p>
      <p className="mt-1 text-2xl font-semibold">{value}</p>
    </div>
  )
}