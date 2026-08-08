'use client'

import type { ElementType } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { cn } from '@/lib/utils'
import {
  LayoutDashboard,
  Activity,
  Search,
  KeyRound,
  FileText,
  Sparkles,
  Share2,
  BarChart3,
  Users,
  Globe,
  Briefcase,
  Settings,
  Bell,
  Zap,
  FileEdit,
  ImageIcon,
} from 'lucide-react'

interface MenuItem {
  label: string
  href: string
  icon: ElementType
  badge?: string
}

interface MenuSection {
  title: string
  items: MenuItem[]
}

const menuSections: MenuSection[] = [
  {
    title: 'Overview',
    items: [
      { label: 'Dashboard', href: '/dashboard', icon: LayoutDashboard },
      { label: 'Real-time', href: '/dashboard/realtime', icon: Activity },
    ],
  },
  {
    title: 'SEO',
    items: [
      { label: 'SEO Overview', href: '/seo', icon: Search },
      { label: 'Keywords', href: '/seo/keywords', icon: KeyRound },
      { label: 'Pages', href: '/seo/pages', icon: FileText },
      { label: 'Opportunities', href: '/seo/opportunities', icon: Sparkles },
      { label: 'Distribution', href: '/seo/distribution', icon: Share2 },
    ],
  },
  {
    title: 'Content',
    items: [
      { label: 'Service Pages', href: '/service-pages', icon: FileEdit, badge: 'NEW' },
      { label: 'Media Library', href: '/service-pages/media', icon: ImageIcon },
    ],
  },
  {
    title: 'Analytics',
    items: [
      { label: 'Traffic', href: '/analytics', icon: BarChart3 },
      { label: 'Users', href: '/analytics/users', icon: Users },
      { label: 'Sources', href: '/analytics/sources', icon: Globe },
    ],
  },
  {
    title: 'Business',
    items: [
      { label: 'Leads', href: '/leads', icon: Briefcase },
      { label: 'Reports', href: '/reports', icon: FileText },
      { label: 'AI Insights', href: '/insights', icon: Sparkles },
    ],
  },
  {
    title: 'Monitoring',
    items: [
      { label: 'Health Overview', href: '/health', icon: Activity },
      { label: 'PageSpeed', href: '/health/pagespeed', icon: Zap },
      { label: 'Uptime', href: '/health/uptime', icon: Globe },
    ],
  },
  {
    title: 'System',
    items: [
      { label: 'Alerts', href: '/alerts', icon: Bell },
      { label: 'Automation', href: '/settings/automation', icon: Zap },
      { label: 'Settings', href: '/settings', icon: Settings },
    ],
  },
]

export function Sidebar() {
  const pathname = usePathname()

  return (
    <aside className="fixed left-0 top-0 z-40 h-screen w-64 border-r bg-white dark:bg-gray-900 dark:border-gray-800">
      <div className="flex h-full flex-col">
        {/* Logo */}
        <div className="flex h-16 items-center gap-3 border-b px-6 dark:border-gray-800">
          <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-gradient-to-br from-indigo-500 to-purple-600 text-white">
            <Sparkles className="h-5 w-5" />
          </div>
          <div>
            <h1 className="font-bold text-gray-900 dark:text-white">ShivaTech</h1>
            <p className="text-xs text-gray-500 dark:text-gray-400">CRM Platform</p>
          </div>
        </div>

        {/* Navigation */}
        <nav className="flex-1 space-y-6 overflow-y-auto p-4">
          {menuSections.map((section) => (
            <div key={section.title}>
              <h3 className="mb-2 px-3 text-xs font-semibold uppercase tracking-wider text-gray-500 dark:text-gray-400">
                {section.title}
              </h3>
              <div className="space-y-1">
                {section.items.map((item) => {
                  const Icon = item.icon
                  const isActive =
                    pathname === item.href ||
                    (item.href !== '/dashboard' && pathname.startsWith(item.href))

                  return (
                    <Link
                      key={item.href}
                      href={item.href}
                      className={cn(
                        'group flex items-center justify-between rounded-lg px-3 py-2 text-sm font-medium transition-colors',
                        isActive
                          ? 'bg-indigo-50 text-indigo-700 dark:bg-indigo-900/30 dark:text-indigo-300'
                          : 'text-gray-700 hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-gray-800'
                      )}
                    >
                      <div className="flex items-center gap-3">
                        <Icon
                          className={cn(
                            'h-4 w-4',
                            isActive ? 'text-indigo-600 dark:text-indigo-400' : 'text-gray-500'
                          )}
                        />
                        <span>{item.label}</span>
                      </div>
                      {item.badge && (
                        <span className="rounded-full bg-gradient-to-r from-indigo-500 to-purple-600 px-2 py-0.5 text-[10px] font-bold text-white">
                          {item.badge}
                        </span>
                      )}
                    </Link>
                  )
                })}
              </div>
            </div>
          ))}
        </nav>

        {/* Footer */}
        <div className="border-t p-4 dark:border-gray-800">
          <div className="text-xs text-gray-500 dark:text-gray-400">
            <p className="font-medium">ShivaTech CRM</p>
            <p>v1.0.0 • Beta</p>
          </div>
        </div>
      </div>
    </aside>
  )
}
