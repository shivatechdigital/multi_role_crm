import NextAuth from 'next-auth'
import Google from 'next-auth/providers/google'
import { PrismaAdapter } from '@auth/prisma-adapter'
import { prisma } from '@/lib/db/prisma'

export const { handlers, signIn, signOut, auth } = NextAuth({
  adapter: PrismaAdapter(prisma),
  providers: [
    Google({
      clientId: process.env.GOOGLE_CLIENT_ID!,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
      authorization: {
        params: {
          prompt: 'consent',
          access_type: 'offline',
          response_type: 'code',
          scope: 'openid email profile https://www.googleapis.com/auth/webmasters.readonly https://www.googleapis.com/auth/analytics.readonly https://www.googleapis.com/auth/business.manage',
        },
      },
    }),
  ],
  session: {
    strategy: 'jwt',
    maxAge: 30 * 24 * 60 * 60,
  },
  cookies: {
    sessionToken: {
      name: 'authjs.session-token',
      options: {
        httpOnly: true,
        sameSite: 'lax',
        path: '/',
        secure: false,
      },
    },
    pkceCodeVerifier: {
      name: 'authjs.pkce.code_verifier',
      options: {
        httpOnly: true,
        sameSite: 'lax',
        path: '/',
        secure: false,
      },
    },
  },
  pages: {
    signIn: '/auth/login',
    error: '/auth/error',
  },
  callbacks: {
    async jwt({ token, user, account }) {
      if (user) {
        token.id = user.id
        token.role = (user as any).role || 'USER'
      }

      if (!user && token.id) {
        try {
          const currentUser = await prisma.user.findUnique({
            where: { id: token.id as string },
            select: { role: true },
          })

          if (currentUser?.role) {
            token.role = currentUser.role
          }
        } catch {
          // Keep existing token role when DB read fails.
        }
      }

      if (account) {
        token.accessToken = account.access_token
        token.refreshToken = account.refresh_token
      }
      return token
    },
    async session({ session, token }) {
      if (session?.user) {
        session.user.id = token.id as string
        session.user.role = token.role as string
        (session as any).accessToken = token.accessToken 
      }
      return session
    },
    authorized({ auth, request: { nextUrl } }) {
      const isLoggedIn = !!auth?.user
      const isOnDashboard =
        nextUrl.pathname.startsWith('/dashboard') ||
        nextUrl.pathname.startsWith('/seo') ||
        nextUrl.pathname.startsWith('/analytics') ||
        nextUrl.pathname.startsWith('/leads') ||
        nextUrl.pathname.startsWith('/reports') ||
        nextUrl.pathname.startsWith('/insights') ||
        nextUrl.pathname.startsWith('/alerts') ||
        nextUrl.pathname.startsWith('/settings')

      if (isOnDashboard) {
        if (isLoggedIn) return true
        return false
      }
      return true
    },
  },
  events: {
    async createUser({ user }) {
      const userCount = await prisma.user.count()
      if (userCount === 1) {
        await prisma.user.update({
          where: { id: user.id },
          data: { role: 'ADMIN' },
        })
      }
    },
  },
  debug: process.env.NODE_ENV === 'development',
})
