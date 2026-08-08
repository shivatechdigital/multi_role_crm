// src/app/service-pages/layout.tsx

import { AppLayout } from '@/components/layout/app-layout'

export default function ServicePagesLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return <AppLayout>{children}</AppLayout>
}
