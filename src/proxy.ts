import { auth } from '@/lib/auth/auth'
import { NextResponse } from 'next/server'

export default auth((req) => {
  const isLoggedIn = !!req.auth
  const { nextUrl } = req

  console.log('🔒 Middleware:', {
    path: nextUrl.pathname,
    isLoggedIn,
    user: req.auth?.user?.email,
  })

  const isAuthPage = nextUrl.pathname.startsWith('/auth')
  const isApiAuthRoute = nextUrl.pathname.startsWith('/api/auth')
  
  // Don't run middleware on API auth routes
  if (isApiAuthRoute) {
    return NextResponse.next()
  }

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
    console.log('❌ Not logged in, redirecting to login')
    return NextResponse.redirect(new URL('/auth/login', nextUrl))
  }

  if (isAuthPage && isLoggedIn) {
    console.log('✅ Already logged in, redirecting to dashboard')
    return NextResponse.redirect(new URL('/dashboard', nextUrl))
  }

  return NextResponse.next()
})

export const config = {
  matcher: [
    '/((?!api/auth|_next/static|_next/image|favicon.ico|.*\\..*).*)',
  ],
}
