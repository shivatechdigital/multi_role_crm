'use client'

import { signIn } from 'next-auth/react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Sparkles, BarChart3, Search, TrendingUp, Users, Zap } from 'lucide-react'
import { useState } from 'react'
import { toast } from 'sonner'

export default function LoginPage() {
  const [isLoading, setIsLoading] = useState(false)

  const handleGoogleSignIn = async () => {
    setIsLoading(true)
    try {
      await signIn('google', { callbackUrl: '/dashboard' })
    } catch (error) {
      toast.error('Sign in failed. Please try again.')
      setIsLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex flex-col lg:flex-row bg-background">
      {/* Left Side - Branding & Features */}
      <div className="hidden lg:flex lg:w-1/2 bg-gradient-to-br from-primary/10 via-primary/5 to-background relative overflow-hidden">
        <div className="absolute inset-0 bg-grid-pattern opacity-5"></div>
        <div className="relative z-10 flex flex-col justify-center px-12 xl:px-20">
          {/* Logo */}
          <div className="flex items-center gap-3 mb-12">
            <div className="w-12 h-12 bg-primary rounded-xl flex items-center justify-center">
              <Sparkles className="w-7 h-7 text-primary-foreground" />
            </div>
            <div>
              <h1 className="text-2xl font-bold">ShivaTech CRM</h1>
              <p className="text-sm text-muted-foreground">AI-Powered Platform</p>
            </div>
          </div>

          {/* Heading */}
          <h2 className="text-4xl xl:text-5xl font-bold mb-6 leading-tight">
            Your Complete{' '}
            <span className="bg-gradient-to-r from-primary to-primary/60 bg-clip-text text-transparent">
              SEO & Business
            </span>{' '}
            Intelligence Platform
          </h2>
          
          <p className="text-lg text-muted-foreground mb-12">
            Track 100+ metrics, get AI-powered insights, and grow your business with data-driven decisions.
          </p>

          {/* Features Grid */}
          <div className="grid grid-cols-2 gap-6">
            <FeatureCard
              icon={<Search className="w-5 h-5" />}
              title="SEO Tracking"
              description="Monitor keywords & rankings"
            />
            <FeatureCard
              icon={<BarChart3 className="w-5 h-5" />}
              title="Analytics"
              description="Real-time traffic data"
            />
            <FeatureCard
              icon={<TrendingUp className="w-5 h-5" />}
              title="Growth Insights"
              description="AI-powered recommendations"
            />
            <FeatureCard
              icon={<Users className="w-5 h-5" />}
              title="Lead Management"
              description="Convert visitors to customers"
            />
          </div>

          {/* Stats */}
          <div className="mt-12 grid grid-cols-3 gap-6 pt-8 border-t border-border/50">
            <div>
              <div className="text-2xl font-bold text-primary">100+</div>
              <div className="text-sm text-muted-foreground">Metrics</div>
            </div>
            <div>
              <div className="text-2xl font-bold text-primary">24/7</div>
              <div className="text-sm text-muted-foreground">Monitoring</div>
            </div>
            <div>
              <div className="text-2xl font-bold text-primary">AI</div>
              <div className="text-sm text-muted-foreground">Powered</div>
            </div>
          </div>
        </div>
      </div>

      {/* Right Side - Login Form */}
      <div className="flex flex-1 items-center justify-center p-4 sm:p-8">
        <div className="w-full max-w-md">
          {/* Mobile Logo */}
          <div className="lg:hidden flex items-center justify-center gap-3 mb-8">
            <div className="w-10 h-10 bg-primary rounded-lg flex items-center justify-center">
              <Sparkles className="w-6 h-6 text-primary-foreground" />
            </div>
            <h1 className="text-xl font-bold">ShivaTech CRM</h1>
          </div>

          <Card className="border-0 shadow-xl">
            <CardHeader className="space-y-2 text-center pb-8">
              <div className="mx-auto w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mb-2">
                <Zap className="w-8 h-8 text-primary" />
              </div>
              <CardTitle className="text-2xl font-bold sm:text-3xl">Welcome Back</CardTitle>
              <CardDescription className="text-base">
                Sign in to access your dashboard
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Google Sign In Button */}
              <Button
                onClick={handleGoogleSignIn}
                disabled={isLoading}
                className="w-full h-12 text-base font-medium"
                size="lg"
              >
                {isLoading ? (
                  <>
                    <div className="w-5 h-5 border-2 border-primary-foreground/30 border-t-primary-foreground rounded-full animate-spin mr-2"></div>
                    Signing in...
                  </>
                ) : (
                  <>
                    <GoogleIcon />
                    Continue with Google
                  </>
                )}
              </Button>

              {/* Divider */}
              <div className="relative">
                <div className="absolute inset-0 flex items-center">
                  <span className="w-full border-t" />
                </div>
                <div className="relative flex justify-center text-xs uppercase">
                  <span className="bg-card px-2 text-muted-foreground">
                    Secure Authentication
                  </span>
                </div>
              </div>

              {/* Security Info */}
              <div className="bg-muted/50 rounded-lg p-4 space-y-2">
                <div className="flex items-start gap-3">
                  <div className="w-5 h-5 rounded-full bg-green-500/20 flex items-center justify-center flex-shrink-0 mt-0.5">
                    <div className="w-2 h-2 rounded-full bg-green-500"></div>
                  </div>
                  <div className="text-sm">
                    <p className="font-medium">Enterprise-Grade Security</p>
                    <p className="text-muted-foreground text-xs">
                      Your data is encrypted and secure
                    </p>
                  </div>
                </div>
              </div>

              {/* Terms */}
              <p className="text-xs text-center text-muted-foreground">
                By signing in, you agree to our{' '}
                <a href="#" className="underline hover:text-primary">
                  Terms of Service
                </a>{' '}
                and{' '}
                <a href="#" className="underline hover:text-primary">
                  Privacy Policy
                </a>
              </p>
            </CardContent>
          </Card>

          {/* Footer */}
          <p className="text-center text-sm text-muted-foreground mt-8">
            © 2024 ShivaTech Digital. All rights reserved.
          </p>
        </div>
      </div>
    </div>
  )
}

function FeatureCard({
  icon,
  title,
  description,
}: {
  icon: React.ReactNode
  title: string
  description: string
}) {
  return (
    <div className="bg-card/50 backdrop-blur-sm border border-border/50 rounded-xl p-4 hover:border-primary/30 transition-colors">
      <div className="w-10 h-10 bg-primary/10 rounded-lg flex items-center justify-center text-primary mb-3">
        {icon}
      </div>
      <h3 className="font-semibold mb-1">{title}</h3>
      <p className="text-sm text-muted-foreground">{description}</p>
    </div>
  )
}

function GoogleIcon() {
  return (
    <svg className="w-5 h-5 mr-2" viewBox="0 0 24 24">
      <path
        fill="currentColor"
        d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
      />
      <path
        fill="currentColor"
        d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
      />
      <path
        fill="currentColor"
        d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
      />
      <path
        fill="currentColor"
        d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
      />
    </svg>
  )
}
