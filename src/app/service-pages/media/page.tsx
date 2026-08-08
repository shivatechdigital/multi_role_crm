'use client'

import { useState } from 'react'
import { useDropzone } from 'react-dropzone'
import {
  Upload, Image as ImageIcon, Video, Trash2,
  Search, Loader2, FolderOpen, Copy,
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent } from '@/components/ui/card'
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from '@/components/ui/select'
import { useMedia, useUploadMedia, useDeleteMedia } from '@/hooks/use-media'
import { formatFileSize, formatRelativeTime } from '@/lib/builder/utils'
import { toast } from 'sonner'
import { cn } from '@/lib/utils'

export default function MediaLibraryPage() {
  const [search, setSearch] = useState('')
  const [type, setType] = useState<'image' | 'video' | 'all'>('all')
  const [uploadCount, setUploadCount] = useState(0)

  const { data, isLoading } = useMedia({ type, search, per_page: 100 })
  const uploadMutation = useUploadMedia()
  const deleteMutation = useDeleteMedia()

  const media = data?.data || []

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    accept: {
      'image/*': ['.png', '.jpg', '.jpeg', '.gif', '.webp', '.svg'],
      'video/*': ['.mp4', '.webm'],
    },
    maxSize: 10485760,
    onDrop: async (files) => {
      setUploadCount(files.length)
      for (const file of files) {
        try {
          await uploadMutation.mutateAsync({ file })
        } catch (error) {
          console.error(error)
        }
      }
      setUploadCount(0)
    },
  })

  const handleDelete = async (id: number) => {
    if (confirm('Delete this file?')) {
      await deleteMutation.mutateAsync(id)
    }
  }

  const copyUrl = (url: string) => {
    navigator.clipboard.writeText(url)
    toast.success('URL copied to clipboard!')
  }

  return (
    <div className="p-6">
      {/* Header */}
      <div className="mb-6">
        <h1 className="text-3xl font-bold">Media Library</h1>
        <p className="mt-1 text-sm text-gray-500">
          Manage all your uploaded images and videos
        </p>
      </div>

      {/* Upload Zone */}
      <div
        {...getRootProps()}
        className={cn(
          "mb-6 border-2 border-dashed rounded-lg p-8 text-center cursor-pointer transition-all",
          isDragActive
            ? "border-indigo-500 bg-indigo-50 dark:bg-indigo-900/20"
            : "border-gray-300 hover:border-gray-400 dark:border-gray-700"
        )}
      >
        <input {...getInputProps()} />
        <Upload className="mx-auto mb-3 h-10 w-10 text-gray-400" />
        <p className="text-base font-medium">
          {isDragActive ? 'Drop files here...' : 'Drag & drop or click to upload'}
        </p>
        <p className="mt-1 text-sm text-gray-500">
          PNG, JPG, GIF, WEBP, SVG, MP4, WEBM • Max 10MB per file
        </p>
        {uploadCount > 0 && (
          <div className="mt-3 flex items-center justify-center gap-2 text-sm text-indigo-600">
            <Loader2 className="h-4 w-4 animate-spin" />
            Uploading {uploadCount} file(s)...
          </div>
        )}
      </div>

      {/* Filters */}
      <Card className="mb-6">
        <CardContent className="p-4">
          <div className="flex gap-3">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
              <Input
                placeholder="Search media..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="pl-9"
              />
            </div>
            <Select value={type} onValueChange={(v: any) => setType(v)}>
              <SelectTrigger className="w-40">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Types</SelectItem>
                <SelectItem value="image">Images</SelectItem>
                <SelectItem value="video">Videos</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Grid */}
      {isLoading ? (
        <div className="flex items-center justify-center py-24">
          <Loader2 className="h-8 w-8 animate-spin text-gray-400" />
        </div>
      ) : media.length === 0 ? (
        <Card>
          <CardContent className="p-16 text-center">
            <FolderOpen className="mx-auto mb-4 h-16 w-16 text-gray-300" />
            <h3 className="mb-2 text-lg font-semibold">No media yet</h3>
            <p className="text-sm text-gray-500">
              Upload some files using the area above
            </p>
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6">
          {media.map((item) => {
            const isImage = item.mime_type.startsWith('image/')
            return (
              <Card key={item.id} className="group overflow-hidden">
                <div className="relative aspect-square bg-gray-100 dark:bg-gray-800">
                  {isImage ? (
                    <img
                      src={item.file_url}
                      alt={item.alt_text || item.original_name}
                      className="h-full w-full object-cover"
                      loading="lazy"
                    />
                  ) : (
                    <div className="flex h-full items-center justify-center">
                      <Video className="h-10 w-10 text-gray-400" />
                    </div>
                  )}

                  <div className="absolute inset-0 flex items-center justify-center gap-2 bg-black/60 opacity-0 transition-opacity group-hover:opacity-100">
                    <Button
                      size="sm"
                      variant="secondary"
                      onClick={() => copyUrl(item.file_url)}
                    >
                      <Copy className="h-3 w-3" />
                    </Button>
                    <Button
                      size="sm"
                      variant="destructive"
                      onClick={() => handleDelete(item.id)}
                    >
                      <Trash2 className="h-3 w-3" />
                    </Button>
                  </div>
                </div>
                <CardContent className="p-2">
                  <p className="truncate text-xs font-medium">{item.original_name}</p>
                  <p className="text-[10px] text-gray-500">
                    {formatFileSize(item.file_size)}
                    {item.width && ` • ${item.width}×${item.height}`}
                  </p>
                </CardContent>
              </Card>
            )
          })}
        </div>
      )}
    </div>
  )
}
