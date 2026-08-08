'use client'

import { use, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { Loader2, AlertCircle } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { useServicePage } from '@/hooks/use-service-pages'
import { usePageBuilderStore } from '@/store/page-builder-store'
import { PageBuilder } from '@/components/service-pages/builder/PageBuilder'

interface Props {
  params: Promise<{ slug: string }>
}

export default function BuilderPage({ params }: Props) {
  const { slug } = use(params)
  const router = useRouter()
  const { data, isLoading, error } = useServicePage(slug)
  const setPage = usePageBuilderStore((s) => s.setPage)
  const reset = usePageBuilderStore((s) => s.reset)

  // Load page data into store
  useEffect(() => {
    if (data?.data) {
      setPage(data.data)
    }
    return () => {
      reset()
    }
  }, [data, setPage, reset])

  if (isLoading) {
    return (
      <div className="flex h-screen items-center justify-center">
        <div className="text-center">
          <Loader2 className="mx-auto mb-4 h-8 w-8 animate-spin text-indigo-600" />
          <p className="text-gray-500">Loading builder...</p>
        </div>
      </div>
    )
  }

  if (error || !data?.data) {
    return (
      <div className="flex h-screen items-center justify-center">
        <div className="max-w-md text-center">
          <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-red-100">
            <AlertCircle className="h-8 w-8 text-red-600" />
          </div>
          <h2 className="mb-2 text-xl font-semibold">Failed to load page</h2>
          <p className="mb-6 text-sm text-gray-500">
            {(error as any)?.message || 'Page not found or unable to load.'}
          </p>
          <Button onClick={() => router.push('/service-pages')}>
            Back to Pages
          </Button>
        </div>
      </div>
    )
  }

  return <PageBuilder />
}
