'use client'

import { useState } from 'react'
import { useDropzone } from 'react-dropzone'
import {
  Upload, Image as ImageIcon, Video, Trash2,
  Check, Loader2, Search,
} from 'lucide-react'
import {
  Dialog, DialogContent, DialogHeader, DialogTitle,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { useMedia, useUploadMedia, useDeleteMedia } from '@/hooks/use-media'
import { formatFileSize } from '@/lib/builder/utils'
import { cn } from '@/lib/utils'
import type { MediaAsset } from '@/lib/types/page-builder'

interface Props {
  open: boolean
  onOpenChange: (open: boolean) => void
  onSelect: (media: MediaAsset) => void
  type?: 'image' | 'video' | 'all'
}

export function MediaLibrary({ open, onOpenChange, onSelect, type = 'image' }: Props) {
  const [search, setSearch] = useState('')
  const [selected, setSelected] = useState<MediaAsset | null>(null)
  const [uploadingFiles, setUploadingFiles] = useState<File[]>([])

  const { data, isLoading } = useMedia({ type, search, per_page: 50 })
  const uploadMutation = useUploadMedia()
  const deleteMutation = useDeleteMedia()

  const media = data?.data || []

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    accept: type === 'image' 
      ? { 'image/*': ['.png', '.jpg', '.jpeg', '.gif', '.webp', '.svg'] }
      : type === 'video'
      ? { 'video/*': ['.mp4', '.webm'] }
      : undefined,
    maxSize: 10485760,
    onDrop: async (files) => {
      setUploadingFiles(files)
      for (const file of files) {
        try {
          await uploadMutation.mutateAsync({ file })
        } catch (error) {
          console.error('Upload failed:', error)
        }
      }
      setUploadingFiles([])
    },
  })

  const handleSelect = () => {
    if (selected) {
      onSelect(selected)
      onOpenChange(false)
      setSelected(null)
    }
  }

  const handleDelete = async (id: number, e: React.MouseEvent) => {
    e.stopPropagation()
    if (confirm('Delete this media file?')) {
      await deleteMutation.mutateAsync(id)
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-5xl max-h-[90vh] overflow-hidden flex flex-col">
        <DialogHeader>
          <DialogTitle>Media Library</DialogTitle>
        </DialogHeader>

        <div
          {...getRootProps()}
          className={cn(
            "border-2 border-dashed rounded-lg p-6 text-center cursor-pointer transition-all",
            isDragActive
              ? "border-indigo-500 bg-indigo-50 dark:bg-indigo-900/20"
              : "border-gray-300 hover:border-gray-400 dark:border-gray-700"
          )}
        >
          <input {...getInputProps()} />
          <Upload className="mx-auto mb-2 h-8 w-8 text-gray-400" />
          <p className="text-sm font-medium">
            {isDragActive ? 'Drop files here...' : 'Drag & drop files, or click to browse'}
          </p>
          <p className="mt-1 text-xs text-gray-500">
            Max 10MB
          </p>
        </div>

        {uploadingFiles.length > 0 && (
          <div className="flex items-center gap-2 rounded-md bg-blue-50 p-3 text-sm text-blue-700 dark:bg-blue-900/20 dark:text-blue-300">
            <Loader2 className="h-4 w-4 animate-spin" />
            Uploading {uploadingFiles.length} file(s)...
          </div>
        )}

        <div className="relative">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
          <Input
            placeholder="Search media..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-9"
          />
        </div>

        <div className="flex-1 overflow-y-auto">
          {isLoading ? (
            <div className="flex items-center justify-center py-12">
              <Loader2 className="h-6 w-6 animate-spin text-gray-400" />
            </div>
          ) : media.length === 0 ? (
            <div className="py-12 text-center">
              <ImageIcon className="mx-auto mb-3 h-12 w-12 text-gray-300" />
              <p className="text-sm text-gray-500">
                {search ? 'No media found' : 'No media uploaded yet'}
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-3 gap-3 sm:grid-cols-4 md:grid-cols-6">
              {media.map((item) => {
                const isSelected = selected?.id === item.id
                const isImage = item.mime_type.startsWith('image/')
                
                return (
                  <div
                    key={item.id}
                    onClick={() => setSelected(item)}
                    className={cn(
                      "group relative aspect-square rounded-lg border-2 overflow-hidden cursor-pointer transition-all",
                      isSelected 
                        ? "border-indigo-500 ring-2 ring-indigo-200 dark:ring-indigo-800" 
                        : "border-gray-200 hover:border-gray-300 dark:border-gray-700"
                    )}
                  >
                    {isImage ? (
                      <img
                        src={item.file_url}
                        alt={item.alt_text || item.original_name}
                        className="h-full w-full object-cover"
                        loading="lazy"
                      />
                    ) : (
                      <div className="flex h-full w-full items-center justify-center bg-gray-100 dark:bg-gray-800">
                        <Video className="h-8 w-8 text-gray-400" />
                      </div>
                    )}

                    {isSelected && (
                      <div className="absolute top-1 right-1 flex h-6 w-6 items-center justify-center rounded-full bg-indigo-500 text-white">
                        <Check className="h-3 w-3" />
                      </div>
                    )}

                    <button
                      onClick={(e) => handleDelete(item.id, e)}
                      className="absolute top-1 left-1 flex h-6 w-6 items-center justify-center rounded-full bg-red-500 text-white opacity-0 transition-opacity group-hover:opacity-100"
                    >
                      <Trash2 className="h-3 w-3" />
                    </button>

                    <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/70 to-transparent p-2 text-white opacity-0 transition-opacity group-hover:opacity-100">
                      <p className="truncate text-[10px] font-medium">
                        {item.original_name}
                      </p>
                      <p className="text-[9px] opacity-80">
                        {formatFileSize(item.file_size)}
                      </p>
                    </div>
                  </div>
                )
              })}
            </div>
          )}
        </div>

        {selected && (
          <div className="rounded-lg border p-3 dark:border-gray-700">
            <div className="flex items-start gap-3">
              {selected.mime_type.startsWith('image/') && (
                <img
                  src={selected.file_url}
                  alt=""
                  className="h-16 w-16 rounded object-cover"
                />
              )}
              <div className="flex-1 min-w-0">
                <p className="truncate text-sm font-medium">{selected.original_name}</p>
                <p className="text-xs text-gray-500">
                  {formatFileSize(selected.file_size)}
                  {selected.width && ` • ${selected.width}×${selected.height}`}
                </p>
              </div>
            </div>
          </div>
        )}

        <div className="flex justify-end gap-2">
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button onClick={handleSelect} disabled={!selected}>
            Select Media
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  )
}
