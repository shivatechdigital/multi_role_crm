'use client'

import { useEffect, useMemo, useState } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { signIn, useSession } from 'next-auth/react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { CheckCircle2, Loader2, LogIn, Mail, Users } from 'lucide-react'
import { toast } from 'sonner'

export default function InviteAcceptPage() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const { data: session, status } = useSession()
  const [isAccepting, setIsAccepting] = useState(false)
  const [acceptedRole, setAcceptedRole] = useState<string | null>(null)
  const [isValidating, setIsValidating] = useState(false)
  const [invitePreview, setInvitePreview] = useState<{
    email: string
    role: string
    expiresAt: string
  } | null>(null)

  const token = useMemo(() => searchParams.get('token') || '', [searchParams])

  useEffect(() => {
    if (!token) return

    const validateInvite = async () => {
      try {
        setIsValidating(true)
        const response = await fetch(`/api/invites/accept?token=${encodeURIComponent(token)}`, {
          cache: 'no-store',
        })
        const data = await response.json()

        if (!response.ok) {
          throw new Error(data.error || 'Invite is invalid')
        }

        setInvitePreview(data.invite)
      } catch (error: any) {
        setInvitePreview(null)
        toast.error(error.message || 'Invite is invalid')
      } finally {
        setIsValidating(false)
      }
    }

    validateInvite()
  }, [token])

  const handleAcceptInvite = async () => {
    if (!token) {
      toast.error('Invite token is missing')
      return
    }

    try {
      setIsAccepting(true)
      const response = await fetch('/api/invites/accept', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ token }),
      })

      const data = await response.json()
      if (!response.ok) {
        throw new Error(data.error || 'Failed to accept invite')
      }

      setAcceptedRole(data.role)
      toast.success('Invite accepted successfully')
    } catch (error: any) {
      toast.error(error.message || 'Failed to accept invite')
    } finally {
      setIsAccepting(false)
    }
  }

  const handleSignIn = async () => {
    await signIn('google', { callbackUrl: window.location.href })
  }

  return (
    <div className="mx-auto flex min-h-screen w-full max-w-2xl items-center justify-center p-4">
      <Card className="w-full">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Users className="h-5 w-5 text-primary" />
            Team Invitation
          </CardTitle>
          <CardDescription>
            Accept your invite to join this CRM workspace.
          </CardDescription>
        </CardHeader>

        <CardContent className="space-y-4">
          {!token && (
            <p className="rounded-md border border-destructive/30 bg-destructive/10 p-3 text-sm text-destructive">
              Invalid invite link. Please ask an admin to send a new invite.
            </p>
          )}

          {isValidating && (
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <Loader2 className="h-4 w-4 animate-spin" />
              Validating invite...
            </div>
          )}

          {invitePreview && (
            <div className="rounded-lg border bg-muted/40 p-3 text-sm">
              <p>
                Invited email: <strong>{invitePreview.email}</strong>
              </p>
              <p>
                Role: <strong>{invitePreview.role}</strong>
              </p>
              <p>
                Expires: <strong>{new Date(invitePreview.expiresAt).toLocaleString()}</strong>
              </p>
            </div>
          )}

          {status === 'loading' && (
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <Loader2 className="h-4 w-4 animate-spin" />
              Checking your session...
            </div>
          )}

          {status !== 'loading' && !session?.user && token && invitePreview && (
            <div className="space-y-3">
              <p className="text-sm text-muted-foreground">
                Sign in with the invited email account to continue.
              </p>
              <Button onClick={handleSignIn}>
                <LogIn className="mr-2 h-4 w-4" />
                Sign In with Google
              </Button>
            </div>
          )}

          {session?.user && token && invitePreview && !acceptedRole && (
            <div className="space-y-3">
              <div className="rounded-lg border bg-muted/40 p-3 text-sm">
                <p className="flex items-center gap-2">
                  <Mail className="h-4 w-4" />
                  Signed in as <strong>{session.user.email}</strong>
                </p>
              </div>
              <Button onClick={handleAcceptInvite} disabled={isAccepting}>
                {isAccepting ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Accepting Invite...
                  </>
                ) : (
                  'Accept Invite'
                )}
              </Button>
            </div>
          )}

          {acceptedRole && (
            <div className="space-y-3 rounded-lg border border-emerald-300/40 bg-emerald-500/10 p-4">
              <p className="flex items-center gap-2 font-medium text-emerald-700 dark:text-emerald-300">
                <CheckCircle2 className="h-4 w-4" />
                Invite accepted successfully.
              </p>
              <p className="text-sm text-muted-foreground">
                Your role has been set to:
              </p>
              <Badge variant="secondary">{acceptedRole}</Badge>
              <div>
                <Button onClick={() => router.push('/dashboard')}>
                  Go to Dashboard
                </Button>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}