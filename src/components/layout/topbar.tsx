'use client'

import { Button } from '@/components/ui/button'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Badge } from '@/components/ui/badge'
import { Bell, LogOut, Moon, Settings, Sun, User } from 'lucide-react'
import { Menu } from 'lucide-react'
import { useTheme } from 'next-themes'
import { signOut, useSession } from 'next-auth/react'
import { useEffect, useState } from 'react'
import { usePathname } from 'next/navigation'

function getPageTitle(pathname: string): string {
  const titles: Record<string, string> = {
    '/dashboard': 'Dashboard',
    '/dashboard/realtime': 'Real-time Analytics',
    '/seo': 'SEO Overview',
    '/seo/keywords': 'Keywords',
    '/seo/pages': 'Pages',
    '/analytics': 'Analytics',
    '/analytics/users': 'Users',
    '/analytics/sources': 'Traffic Sources',
    '/leads': 'Leads',
    '/reports': 'Reports',
    '/insights': 'AI Insights',
    '/alerts': 'Alerts',
    '/settings': 'Settings',
  }
  return titles[pathname] || 'Dashboard'
}

export function Topbar({ onMenuToggle }: { onMenuToggle: () => void }) {
  const { theme, setTheme } = useTheme()
  const { data: session } = useSession()
  const [mounted, setMounted] = useState(false)
  const pathname = usePathname()
  const pageTitle = getPageTitle(pathname)

  useEffect(() => {
    setMounted(true)
  }, [])

  const userInitials = session?.user?.name
    ?.split(' ')
    .map((n) => n[0])
    .join('')
    .toUpperCase()
    .slice(0, 2) || 'U'

  return (
    <header className="sticky top-0 z-20 h-16 border-b bg-card/95 backdrop-blur supports-[backdrop-filter]:bg-card/80">
      <div className="flex h-full items-center justify-between gap-3 px-4 sm:px-6">
        {/* Left - Page Title */}
        <div className="flex min-w-0 items-center gap-3">
          <Button
            type="button"
            variant="ghost"
            size="icon"
            className="lg:hidden"
            onClick={onMenuToggle}
            aria-label="Open navigation menu"
          >
            <Menu className="h-5 w-5" />
          </Button>
          <div className="min-w-0">
            <h2 className="truncate text-base font-semibold sm:text-lg">{pageTitle}</h2>
          </div>
        </div>

        {/* Right - Actions */}
        <div className="flex items-center gap-1 sm:gap-2">
          {/* Theme Toggle */}
          {mounted && (
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
            >
              {theme === 'dark' ? (
                <Sun className="w-5 h-5" />
              ) : (
                <Moon className="w-5 h-5" />
              )}
            </Button>
          )}

          {/* Notifications */}
          <Button variant="ghost" size="icon" className="relative hidden sm:inline-flex">
            <Bell className="w-5 h-5" />
            <Badge
              variant="destructive"
              className="absolute -top-1 -right-1 h-5 w-5 p-0 flex items-center justify-center text-xs"
            >
              3
            </Badge>
          </Button>

          {/* User Menu */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" className="relative h-9 w-9 rounded-full sm:h-10 sm:w-10">
                <Avatar className="h-9 w-9">
                  <AvatarImage src={session?.user?.image || ''} />
                  <AvatarFallback className="bg-primary text-primary-foreground">
                    {userInitials}
                  </AvatarFallback>
                </Avatar>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent className="w-56" align="end" forceMount>
              <DropdownMenuLabel className="font-normal">
                <div className="flex flex-col space-y-1">
                  <p className="text-sm font-medium leading-none">
                    {session?.user?.name}
                  </p>
                  <p className="text-xs leading-none text-muted-foreground">
                    {session?.user?.email}
                  </p>
                  <Badge variant="secondary" className="w-fit mt-2 text-xs">
                    {session?.user?.role}
                  </Badge>
                </div>
              </DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuItem>
                <User className="mr-2 h-4 w-4" />
                Profile
              </DropdownMenuItem>
              <DropdownMenuItem>
                <Settings className="mr-2 h-4 w-4" />
                Settings
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem
                className="text-destructive focus:text-destructive"
                onClick={() => signOut({ callbackUrl: '/auth/login' })}
              >
                <LogOut className="mr-2 h-4 w-4" />
                Sign out
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
    </header>
  )
}
