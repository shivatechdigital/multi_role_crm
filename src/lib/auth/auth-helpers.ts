import { auth } from '@/lib/auth/auth'
import { type AppRole, hasMinimumRole } from '@/lib/auth/permissions'
import { redirect } from 'next/navigation'

export async function getCurrentUser() {
  const session = await auth()
  return session?.user
}

export async function requireAuth() {
  const user = await getCurrentUser()
  if (!user) {
    redirect('/auth/login')
  }
  return user
}

export async function requireRole(role: AppRole) {
  const user = await requireAuth()
  if (!hasMinimumRole(user.role, role)) {
    redirect('/dashboard')
  }
  return user
}

export async function requireAdmin() {
  return requireRole('ADMIN')
}
