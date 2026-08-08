'use client'

import { useSession } from 'next-auth/react'
import { useTheme } from 'next-themes'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Badge } from '@/components/ui/badge'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Switch } from '@/components/ui/switch'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import {
  User,
  Bell,
  Palette,
  Plug,
  Shield,
  Database,
  Mail,
  Smartphone,
  CheckCircle2,
  XCircle,
  Webhook,
  Copy,
  ExternalLink,
} from 'lucide-react'
import { toast } from 'sonner'
import { signOut } from 'next-auth/react'

export default function SettingsPage() {
  const { data: session } = useSession()
  const { theme, setTheme } = useTheme()

  const webhookUrl = typeof window !== 'undefined' 
    ? `${window.location.origin}/api/webhooks/lead`
    : ''

  const copyWebhook = () => {
    navigator.clipboard.writeText(webhookUrl)
    toast.success('Webhook URL copied!')
  }

  const userInitials = session?.user?.name
    ?.split(' ')
    .map((n) => n[0])
    .join('')
    .toUpperCase()
    .slice(0, 2) || 'U'

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold tracking-tight sm:text-3xl">Settings ⚙️</h1>
        <p className="text-muted-foreground mt-1">
          Manage your account and platform preferences
        </p>
      </div>

      <Tabs defaultValue="profile" className="space-y-6">
        <TabsList className="grid h-auto w-full grid-cols-2 gap-1 sm:grid-cols-3 lg:w-[600px] lg:grid-cols-5">
          <TabsTrigger value="profile" className="text-xs sm:text-sm">
            <User className="w-4 h-4 mr-2" />
            Profile
          </TabsTrigger>
          <TabsTrigger value="appearance" className="text-xs sm:text-sm">
            <Palette className="w-4 h-4 mr-2" />
            Theme
          </TabsTrigger>
          <TabsTrigger value="integrations" className="text-xs sm:text-sm">
            <Plug className="w-4 h-4 mr-2" />
            Integrations
          </TabsTrigger>
          <TabsTrigger value="notifications" className="text-xs sm:text-sm">
            <Bell className="w-4 h-4 mr-2" />
            Alerts
          </TabsTrigger>
          <TabsTrigger value="security" className="text-xs sm:text-sm">
            <Shield className="w-4 h-4 mr-2" />
            Security
          </TabsTrigger>
        </TabsList>

        {/* Profile Tab */}
        <TabsContent value="profile" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Profile Information</CardTitle>
              <CardDescription>Your account details from Google</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex flex-col items-start gap-4 sm:flex-row sm:items-center">
                <Avatar className="h-20 w-20">
                  <AvatarImage src={session?.user?.image || ''} />
                  <AvatarFallback className="bg-primary text-primary-foreground text-xl">
                    {userInitials}
                  </AvatarFallback>
                </Avatar>
                <div>
                  <h3 className="text-xl font-bold">{session?.user?.name}</h3>
                  <p className="text-sm text-muted-foreground">{session?.user?.email}</p>
                  <Badge variant="secondary" className="mt-2">
                    {session?.user?.role || 'USER'}
                  </Badge>
                </div>
              </div>

              <div className="space-y-3 pt-4 border-t">
                <div className="grid gap-2">
                  <Label>Display Name</Label>
                  <Input value={session?.user?.name || ''} readOnly />
                </div>
                <div className="grid gap-2">
                  <Label>Email Address</Label>
                  <Input value={session?.user?.email || ''} readOnly />
                </div>
                <p className="text-xs text-muted-foreground">
                  Profile info is synced from Google. To change, update your Google account.
                </p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Appearance Tab */}
        <TabsContent value="appearance" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Theme Preferences</CardTitle>
              <CardDescription>Customize how the app looks</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label>Color Theme</Label>
                <Select value={theme} onValueChange={setTheme}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="light">☀️ Light</SelectItem>
                    <SelectItem value="dark">🌙 Dark</SelectItem>
                    <SelectItem value="system">💻 System</SelectItem>
                  </SelectContent>
                </Select>
                <p className="text-xs text-muted-foreground">
                  System theme follows your device preference
                </p>
              </div>

              <div className="grid grid-cols-1 gap-3 pt-4 sm:grid-cols-3">
                <ThemePreview
                  theme="light"
                  selected={theme === 'light'}
                  onClick={() => setTheme('light')}
                />
                <ThemePreview
                  theme="dark"
                  selected={theme === 'dark'}
                  onClick={() => setTheme('dark')}
                />
                <ThemePreview
                  theme="system"
                  selected={theme === 'system'}
                  onClick={() => setTheme('system')}
                />
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Integrations Tab */}
        <TabsContent value="integrations" className="space-y-6">
          {/* Connected Services */}
          <Card>
            <CardHeader>
              <CardTitle>Connected Services</CardTitle>
              <CardDescription>Status of all integrated services</CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
              <IntegrationItem
                icon={<Database className="w-5 h-5" />}
                name="PostgreSQL Database"
                status="connected"
                description="Primary database for storing all data"
              />
              <IntegrationItem
                icon={<svg className="w-5 h-5" viewBox="0 0 24 24"><path fill="currentColor" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/><path fill="currentColor" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/></svg>}
                name="Google Search Console"
                status="connected"
                description="SEO data and keyword tracking"
              />
              <IntegrationItem
                icon={<svg className="w-5 h-5" viewBox="0 0 24 24"><path fill="currentColor" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/></svg>}
                name="Google Analytics 4"
                status="connected"
                description="Website traffic and user behavior"
              />
              <IntegrationItem
                icon={<Smartphone className="w-5 h-5" />}
                name="PageSpeed Insights"
                status="connected"
                description="Performance monitoring"
              />
              <IntegrationItem
                icon={<Brain className="w-5 h-5" />}
                name="FreeLLM API"
                status="connected"
                description="AI-powered insights"
              />
              <IntegrationItem
                icon={<Mail className="w-5 h-5" />}
                name="Telegram Bot"
                status="pending"
                description="Daily notifications (Coming soon)"
              />
            </CardContent>
          </Card>

          {/* Webhook URL */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Webhook className="w-5 h-5" />
                Lead Webhook URL
              </CardTitle>
              <CardDescription>
                Use this URL in your website's contact form
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex flex-col gap-2 sm:flex-row">
                <Input value={webhookUrl} readOnly className="font-mono text-sm" />
                <Button onClick={copyWebhook}>
                  <Copy className="w-4 h-4 mr-2" />
                  Copy
                </Button>
              </div>
              <div className="p-4 rounded-lg bg-muted/50 space-y-2 text-sm">
                <p className="font-semibold">Required Fields:</p>
                <code className="block text-xs bg-background p-2 rounded">
                  {`{
  "name": "Customer Name",     // required
  "email": "email@example.com", // required
  "phone": "+91 9876543210",   // optional
  "company": "Company Name",    // optional
  "service": "seo",             // optional
  "budget": "50k-1L",           // optional
  "message": "Their message",   // optional
  "source": "website"           // optional
}`}
                </code>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Notifications Tab */}
        <TabsContent value="notifications" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Notification Preferences</CardTitle>
              <CardDescription>
                Choose when you want to be notified
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <NotificationSetting
                title="New Leads"
                description="Get notified when someone submits a form"
                defaultChecked
              />
              <NotificationSetting
                title="SEO Issues"
                description="Alerts for ranking drops and technical issues"
                defaultChecked
              />
              <NotificationSetting
                title="Daily Reports"
                description="Receive daily SEO summary"
                defaultChecked
              />
              <NotificationSetting
                title="Weekly Insights"
                description="Get weekly AI-powered insights"
              />
              <NotificationSetting
                title="Uptime Alerts"
                description="Notify when website is down"
                defaultChecked
              />
            </CardContent>
          </Card>
        </TabsContent>

        {/* Security Tab */}
        <TabsContent value="security" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Security & Privacy</CardTitle>
              <CardDescription>Manage your account security</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="p-4 rounded-lg bg-green-500/10 border border-green-500/20">
                <div className="flex items-center gap-3">
                  <CheckCircle2 className="w-5 h-5 text-green-500" />
                  <div>
                    <p className="font-semibold text-sm">Account Secured with Google OAuth</p>
                    <p className="text-xs text-muted-foreground">
                      Your account is protected by Google's authentication
                    </p>
                  </div>
                </div>
              </div>

              <div className="pt-4 border-t">
                <Button
                  variant="destructive"
                  onClick={() => signOut({ callbackUrl: '/auth/login' })}
                >
                  Sign Out
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}

function ThemePreview({
  theme,
  selected,
  onClick,
}: {
  theme: string
  selected: boolean
  onClick: () => void
}) {
  const styles = {
    light: 'bg-white border-gray-200',
    dark: 'bg-gray-900 border-gray-700',
    system: 'bg-gradient-to-r from-white to-gray-900',
  }

  return (
    <button
      onClick={onClick}
      className={`p-4 rounded-lg border-2 transition-all ${
        selected ? 'border-primary' : 'border-border'
      }`}
    >
      <div className={`w-full h-20 rounded ${styles[theme as keyof typeof styles]}`} />
      <p className="mt-2 text-sm font-medium capitalize">{theme}</p>
    </button>
  )
}

function IntegrationItem({
  icon,
  name,
  status,
  description,
}: {
  icon: React.ReactNode
  name: string
  status: 'connected' | 'pending' | 'error'
  description: string
}) {
  const statusConfig = {
    connected: { badge: 'default', label: 'Connected', icon: CheckCircle2, color: 'text-green-500' },
    pending: { badge: 'secondary', label: 'Pending', icon: XCircle, color: 'text-yellow-500' },
    error: { badge: 'destructive', label: 'Error', icon: XCircle, color: 'text-red-500' },
  }

  const config = statusConfig[status]
  const StatusIcon = config.icon

  return (
    <div className="flex flex-col gap-3 rounded-lg bg-muted/50 p-3 sm:flex-row sm:items-center sm:justify-between">
      <div className="flex items-center gap-3 flex-1">
        <div className="w-10 h-10 rounded-lg bg-background flex items-center justify-center">
          {icon}
        </div>
        <div>
          <p className="font-medium text-sm">{name}</p>
          <p className="text-xs text-muted-foreground">{description}</p>
        </div>
      </div>
      <div className="flex items-center gap-2 self-start sm:self-auto">
        <StatusIcon className={`w-4 h-4 ${config.color}`} />
        <Badge variant={config.badge as any}>{config.label}</Badge>
      </div>
    </div>
  )
}

function NotificationSetting({
  title,
  description,
  defaultChecked = false,
}: {
  title: string
  description: string
  defaultChecked?: boolean
}) {
  return (
    <div className="flex flex-col gap-3 rounded-lg bg-muted/50 p-3 sm:flex-row sm:items-center sm:justify-between">
      <div className="flex-1">
        <p className="font-medium text-sm">{title}</p>
        <p className="text-xs text-muted-foreground">{description}</p>
      </div>
      <Switch defaultChecked={defaultChecked} className="self-start sm:self-auto" />
    </div>
  )
}

// Import Brain icon
import { Brain } from 'lucide-react'
