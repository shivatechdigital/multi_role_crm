'use client'

import { useEffect, useState } from 'react'
import { Sidebar } from '@/components/layout/sidebar'
import { Topbar } from '@/components/layout/topbar'

export function AppLayout({ children }: { children: React.ReactNode }) {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false)

  useEffect(() => {
    const closeSidebar = () => setIsSidebarOpen(false)

    window.addEventListener('resize', closeSidebar)
    return () => window.removeEventListener('resize', closeSidebar)
  }, [])

  return (
    <div className="min-h-screen bg-background">
      <Sidebar isOpen={isSidebarOpen} onClose={() => setIsSidebarOpen(false)} />

      {isSidebarOpen && (
        <button
          type="button"
          aria-label="Close navigation menu"
          className="fixed inset-0 z-30 bg-background/80 backdrop-blur-sm lg:hidden"
          onClick={() => setIsSidebarOpen(false)}
        />
      )}

      <div className="min-h-screen lg:pl-64">
        <Topbar onMenuToggle={() => setIsSidebarOpen((open) => !open)} />
        <main className="px-4 py-4 sm:px-6 sm:py-6">{children}</main>
      </div>
    </div>
  )
}
