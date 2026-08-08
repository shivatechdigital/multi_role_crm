'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { useForm } from 'react-hook-form'
import { z } from 'zod'
import { zodResolver } from '@hookform/resolvers/zod'
import { Loader2, Upload, Code } from 'lucide-react'
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
import { useImportHtml } from '@/hooks/use-service-pages'
import { slugify } from '@/lib/builder/utils'

const importSchema = z.object({
  title: z.string().min(1, 'Title is required').max(255),
  slug: z.string()
    .min(1, 'Slug is required')
    .regex(/^[a-z0-9\-]+$/, 'Only lowercase letters, numbers, and hyphens'),
  html: z.string().min(1, 'HTML content is required'),
})

type FormData = z.infer<typeof importSchema>

interface Props {
  open: boolean
  onOpenChange: (open: boolean) => void
}

export function ImportHtmlDialog({ open, onOpenChange }: Props) {
  const router = useRouter()
  const importMutation = useImportHtml()

  const {
    register,
    handleSubmit,
    formState: { errors },
    watch,
    setValue,
    reset,
  } = useForm<FormData>({
    resolver: zodResolver(importSchema),
    defaultValues: {
      title: '',
      slug: '',
      html: '',
    },
  })

  const handleTitleChange = (value: string) => {
    setValue('title', value)
    setValue('slug', slugify(value))
  }

  const onSubmit = async (data: FormData) => {
    try {
      const result = await importMutation.mutateAsync(data)
      reset()
      onOpenChange(false)
      
      if (result?.data?.slug) {
        router.push(`/service-pages/builder/${result.data.slug}`)
      }
    } catch (error) {
      // Handled by mutation
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[700px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-gradient-to-br from-blue-500 to-purple-600 text-white">
              <Code className="h-5 w-5" />
            </div>
            <div>
              <DialogTitle>Import from HTML</DialogTitle>
              <DialogDescription>
                Paste your HTML code and we'll convert it to a builder page
              </DialogDescription>
            </div>
          </div>
        </DialogHeader>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          {/* Info Box */}
          <div className="rounded-lg border border-blue-200 bg-blue-50 p-3 dark:bg-blue-900/20 dark:border-blue-800">
            <p className="text-xs text-blue-700 dark:text-blue-300">
              💡 <strong>Tip:</strong> Paste any HTML code (from another website, template, or your own). 
              Our parser will detect headings, images, buttons, and convert them to editable blocks.
            </p>
          </div>

          {/* Title */}
          <div className="space-y-2">
            <Label htmlFor="title">
              Page Title <span className="text-red-500">*</span>
            </Label>
            <Input
              id="title"
              placeholder="e.g., Imported Landing Page"
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
                placeholder="imported-page"
                {...register('slug')}
                className="rounded-l-none"
              />
            </div>
            {errors.slug && (
              <p className="text-xs text-red-500">{errors.slug.message}</p>
            )}
          </div>

          {/* HTML Content */}
          <div className="space-y-2">
            <Label htmlFor="html">
              HTML Code <span className="text-red-500">*</span>
            </Label>
            <Textarea
              id="html"
              placeholder="<div><h1>Welcome</h1><p>Your content here...</p></div>"
              rows={12}
              className="font-mono text-xs"
              {...register('html')}
            />
            {errors.html && (
              <p className="text-xs text-red-500">{errors.html.message}</p>
            )}
            <p className="text-xs text-gray-500">
              Length: {watch('html')?.length || 0} characters
            </p>
          </div>

          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
              disabled={importMutation.isPending}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={importMutation.isPending}
            >
              {importMutation.isPending ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Importing...
                </>
              ) : (
                <>
                  <Upload className="mr-2 h-4 w-4" />
                  Import & Edit
                </>
              )}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
