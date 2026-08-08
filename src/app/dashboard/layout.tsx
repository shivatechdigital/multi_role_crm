import { auth } from '@/lib/auth/auth'
import { redirect } from 'next/navigation'
import { AppLayout } from '@/components/layout/app-layout'

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const session = await auth()
  
  if (!session?.user) {
    redirect('/auth/login')
  }

  return <AppLayout>{children}</AppLayout>
}
