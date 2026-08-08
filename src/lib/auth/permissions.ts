export const APP_ROLES = ['USER', 'MANAGER', 'ADMIN'] as const

export type AppRole = (typeof APP_ROLES)[number]

const ROLE_RANK: Record<AppRole, number> = {
  USER: 1,
  MANAGER: 2,
  ADMIN: 3,
}

export function isAppRole(role: string | null | undefined): role is AppRole {
  return APP_ROLES.includes((role || '') as AppRole)
}

export function getUserRole(role: string | null | undefined): AppRole {
  return isAppRole(role) ? role : 'USER'
}

export function hasMinimumRole(role: string | null | undefined, requiredRole: AppRole) {
  return ROLE_RANK[getUserRole(role)] >= ROLE_RANK[requiredRole]
}

export function canManageTeam(role: string | null | undefined) {
  return hasMinimumRole(role, 'MANAGER')
}

export function canManageRoles(role: string | null | undefined) {
  return hasMinimumRole(role, 'ADMIN')
}

export function canAccessAutomation(role: string | null | undefined) {
  return hasMinimumRole(role, 'ADMIN')
}

export function canManageLeads(role: string | null | undefined) {
  return hasMinimumRole(role, 'MANAGER')
}

export function canManageOperations(role: string | null | undefined) {
  return hasMinimumRole(role, 'MANAGER')
}

export function canManageInvites(role: string | null | undefined) {
  return hasMinimumRole(role, 'ADMIN')
}