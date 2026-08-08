import { auth } from '@/lib/auth/auth'
import { canAccessAutomation, getUserRole } from '@/lib/auth/permissions'
import { NextResponse } from 'next/server'

export default auth((req) => {
  const isLoggedIn = !!req.auth?.user
  const userRole = getUserRole(req.auth?.user?.role)
  const { nextUrl } = req

  const isAuthPage = nextUrl.pathname.startsWith('/auth')
  const isProtectedRoute =
    nextUrl.pathname.startsWith('/dashboard') ||
    nextUrl.pathname.startsWith('/seo') ||
    nextUrl.pathname.startsWith('/analytics') ||
    nextUrl.pathname.startsWith('/leads') ||
    nextUrl.pathname.startsWith('/reports') ||
    nextUrl.pathname.startsWith('/insights') ||
    nextUrl.pathname.startsWith('/alerts') ||
    nextUrl.pathname.startsWith('/settings')

  if (isProtectedRoute && !isLoggedIn) {
    return NextResponse.redirect(new URL('/auth/login', nextUrl))
  }

  if (nextUrl.pathname.startsWith('/settings/automation') && !canAccessAutomation(userRole)) {
    return NextResponse.redirect(new URL('/dashboard', nextUrl))
  }

  if (isAuthPage && isLoggedIn) {
    return NextResponse.redirect(new URL('/dashboard', nextUrl))
  }

  return NextResponse.next()
})

export const config = {
  matcher: ['/((?!api|_next/static|_next/image|favicon.ico).*)'],
}
