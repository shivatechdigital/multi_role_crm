'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { useForm } from 'react-hook-form'
import { z } from 'zod'
import { zodResolver } from '@hookform/resolvers/zod'
import { Loader2, Layers, FileText, Rocket } from 'lucide-react'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { useCreateServicePage } from '@/hooks/use-service-pages'
import { slugify } from '@/lib/builder/utils'
import { cn } from '@/lib/utils'
import type { PageType } from '@/lib/types/page-builder'

const createPageSchema = z.object({
  title: z.string().min(1, 'Title is required').max(255),
  slug: z.string()
    .min(1, 'Slug is required')
    .regex(/^[a-z0-9\-]+$/, 'Only lowercase letters, numbers, and hyphens'),
  excerpt: z.string().max(500).optional(),
  page_type: z.enum(['service', 'landing', 'static']),
})

type FormData = z.infer<typeof createPageSchema>

interface Props {
  open: boolean
  onOpenChange: (open: boolean) => void
}

const pageTypes = [
  {
    value: 'service' as PageType,
    label: 'Service Page',
    description: 'A service offering page',
    icon: Layers,
  },
  {
    value: 'landing' as PageType,
    label: 'Landing Page',
    description: 'Marketing landing page',
    icon: Rocket,
  },
  {
    value: 'static' as PageType,
    label: 'Static Page',
    description: 'General content page',
    icon: FileText,
  },
]

export function CreatePageDialog({ open, onOpenChange }: Props) {
  const router = useRouter()
  const [selectedType, setSelectedType] = useState<PageType>('service')
  const createMutation = useCreateServicePage()

  const {
    register,
    handleSubmit,
    formState: { errors },
    watch,
    setValue,
    reset,
  } = useForm<FormData>({
    resolver: zodResolver(createPageSchema),
    defaultValues: {
      title: '',
      slug: '',
      excerpt: '',
      page_type: 'service',
    },
  })

  const title = watch('title')

  // Auto-generate slug from title
  const handleTitleChange = (value: string) => {
    setValue('title', value)
    setValue('slug', slugify(value))
  }

  const onSubmit = async (data: FormData) => {
    try {
      const result = await createMutation.mutateAsync({
        ...data,
        page_type: selectedType,
        status: 'draft',
        layout_json: { sections: [] },
      })
      
      reset()
      onOpenChange(false)
      
      if (result?.data?.slug) {
        router.push(`/service-pages/builder/${result.data.slug}`)
      }
    } catch (error) {
      // Error handled by mutation
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[550px]">
        <DialogHeader>
          <DialogTitle>Create New Page</DialogTitle>
          <DialogDescription>
            Choose a page type and enter basic details. You can customize everything later.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          {/* Page Type Selection */}
          <div className="space-y-2">
            <Label>Page Type</Label>
            <div className="grid grid-cols-3 gap-3">
              {pageTypes.map((type) => {
                const Icon = type.icon
                const isSelected = selectedType === type.value
                
                return (
                  <button
                    key={type.value}
                    type="button"
                    onClick={() => setSelectedType(type.value)}
                    className={cn(
                      'flex flex-col items-center rounded-lg border-2 p-3 text-center transition-all',
                      isSelected
                        ? 'border-indigo-500 bg-indigo-50 dark:bg-indigo-900/30'
                        : 'border-gray-200 hover:border-gray-300 dark:border-gray-700'
                    )}
                  >
                    <Icon className={cn(
                      'mb-2 h-5 w-5',
                      isSelected ? 'text-indigo-600' : 'text-gray-500'
                    )} />
                    <p className="text-sm font-medium">{type.label}</p>
                    <p className="mt-1 text-[10px] text-gray-500">
                      {type.description}
                    </p>
                  </button>
                )
              })}
            </div>
          </div>

          {/* Title */}
          <div className="space-y-2">
            <Label htmlFor="title">
              Page Title <span className="text-red-500">*</span>
            </Label>
            <Input
              id="title"
              placeholder="e.g., WordPress Development Services"
              {...register('title')}
              onChange={(e) => handleTitleChange(e.target.value)}
            />
            {errors.title && (
              <p className="text-xs text-red-500">{errors.title.message}</p>
            )}
          </div>

          {/* Slug */}
          <div className="space-y-2">
            <Label htmlFor="slug">
              URL Slug <span className="text-red-500">*</span>
            </Label>
            <div className="flex items-center gap-2">
              <div className="flex items-center rounded-l-md border border-r-0 bg-gray-50 px-3 py-2 text-sm text-gray-500 dark:bg-gray-800">
                /services/
              </div>
              <Input
                id="slug"
                placeholder="wordpress-development"
                {...register('slug')}
                className="rounded-l-none"
              />
            </div>
            {errors.slug && (
              <p className="text-xs text-red-500">{errors.slug.message}</p>
            )}
            <p className="text-xs text-gray-500">
              This will be your page URL: /services/{watch('slug') || 'your-slug'}
            </p>
          </div>

          {/* Excerpt */}
          <div className="space-y-2">
            <Label htmlFor="excerpt">Short Description (Optional)</Label>
            <Textarea
              id="excerpt"
              placeholder="Brief description of this page..."
              rows={2}
              {...register('excerpt')}
            />
            {errors.excerpt && (
              <p className="text-xs text-red-500">{errors.excerpt.message}</p>
            )}
          </div>

          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
              disabled={createMutation.isPending}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={createMutation.isPending}
              className="bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700"
            >
              {createMutation.isPending ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Creating...
                </>
              ) : (
                'Create & Edit'
              )}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
