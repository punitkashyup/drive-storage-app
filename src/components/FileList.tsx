"use client"

import { useState, useEffect } from "react"
import { DriveFile } from "@/lib/google-drive"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import {
  Grid,
  List,
  Search,
  MoreVertical,
  Download,
  Edit,
  Trash,
  File,
  Image,
  FileText,
  Video,
  Music,
  Archive
} from "lucide-react"

interface FileListProps {
  files: DriveFile[]
  loading?: boolean
  refreshing?: boolean
  onDownload: (file: DriveFile) => void
  onRename: (file: DriveFile) => void
  onDelete: (file: DriveFile) => void
  onRefresh: () => void
}

export default function FileList({
  files,
  loading = false,
  refreshing = false,
  onDownload,
  onRename,
  onDelete,
  onRefresh
}: FileListProps) {
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid')
  const [searchTerm, setSearchTerm] = useState('')

  const getFileIcon = (mimeType: string) => {
    if (mimeType.startsWith('image/')) return <Image className="h-5 w-5 text-blue-500" />
    if (mimeType.startsWith('video/')) return <Video className="h-5 w-5 text-purple-500" />
    if (mimeType.startsWith('audio/')) return <Music className="h-5 w-5 text-green-500" />
    if (mimeType.includes('text') || mimeType.includes('document')) return <FileText className="h-5 w-5 text-orange-500" />
    if (mimeType.includes('zip') || mimeType.includes('archive')) return <Archive className="h-5 w-5 text-gray-500" />
    return <File className="h-5 w-5 text-gray-400" />
  }

  const getThumbnail = (file: DriveFile) => {
    const isImage = file.mimeType.startsWith('image/')

    if (isImage) {
      return (
        <div className="w-full h-32 bg-gray-100 rounded-lg overflow-hidden relative">
          {/* Try to load image through our API endpoint which handles authentication */}
          <img
            src={`/api/files/${file.id}/thumbnail`}
            alt={file.name}
            className="absolute inset-0 w-full h-full object-cover"
            onError={(e) => {
              // Fallback to file icon if thumbnail fails to load
              const target = e.currentTarget as HTMLImageElement
              target.style.display = 'none'
              const fallback = target.parentElement?.querySelector('.fallback-icon') as HTMLElement
              if (fallback) {
                fallback.style.display = 'flex'
              }
            }}
          />
          <div className="fallback-icon absolute inset-0 hidden items-center justify-center bg-gray-100 rounded-lg">
            <Image className="h-12 w-12 text-blue-500" />
          </div>
        </div>
      )
    }

    return (
      <div className="w-full h-32 bg-gray-100 rounded-lg flex items-center justify-center">
        {file.mimeType.startsWith('video/') ? (
          <Video className="h-12 w-12 text-purple-500" />
        ) : file.mimeType.startsWith('audio/') ? (
          <Music className="h-12 w-12 text-green-500" />
        ) : file.mimeType.includes('text') || file.mimeType.includes('document') ? (
          <FileText className="h-12 w-12 text-orange-500" />
        ) : file.mimeType.includes('zip') || file.mimeType.includes('archive') ? (
          <Archive className="h-12 w-12 text-gray-500" />
        ) : (
          <File className="h-12 w-12 text-gray-400" />
        )}
      </div>
    )
  }

  const formatFileSize = (sizeString?: string) => {
    if (!sizeString) return 'Unknown size'
    const bytes = parseInt(sizeString)
    if (bytes === 0) return '0 Bytes'
    const k = 1024
    const sizes = ['Bytes', 'KB', 'MB', 'GB']
    const i = Math.floor(Math.log(bytes) / Math.log(k))
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i]
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    })
  }

  const filteredFiles = files.filter(file =>
    file.name.toLowerCase().includes(searchTerm.toLowerCase())
  )

  // Keyboard shortcuts
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Ctrl+F or Cmd+F to focus search
      if ((e.ctrlKey || e.metaKey) && e.key === 'f') {
        e.preventDefault()
        document.querySelector<HTMLInputElement>('input[placeholder*="Search"]')?.focus()
      }
      // F5 to refresh
      if (e.key === 'F5') {
        e.preventDefault()
        onRefresh()
      }
    }

    document.addEventListener('keydown', handleKeyDown)
    return () => document.removeEventListener('keydown', handleKeyDown)
  }, [onRefresh])

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    )
  }

  return (
    <div className="space-y-4 relative">
      {/* Search and View Controls */}
      <div className="flex flex-col sm:flex-row gap-4 items-center justify-between">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
          <Input
            placeholder="Search files..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10"
          />
        </div>
        <div className="flex items-center space-x-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => setViewMode('grid')}
            className={viewMode === 'grid' ? 'bg-gray-100' : ''}
          >
            <Grid className="h-4 w-4" />
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => setViewMode('list')}
            className={viewMode === 'list' ? 'bg-gray-100' : ''}
          >
            <List className="h-4 w-4" />
          </Button>
        </div>
      </div>

      {/* File Grid/List */}
      {filteredFiles.length === 0 ? (
        <div className="text-center py-12">
          <File className="mx-auto h-12 w-12 text-gray-400 mb-4" />
          <p className="text-lg font-medium text-gray-900">No files found</p>
          <p className="text-gray-500">
            {searchTerm ? 'Try adjusting your search' : 'Upload some files to get started'}
          </p>
        </div>
      ) : viewMode === 'grid' ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 pb-20 md:pb-4">
          {filteredFiles.map((file) => (
            <Card key={file.id} className="hover:shadow-md transition-shadow">
              <CardContent className="p-4">
                {/* Thumbnail */}
                <div className="mb-3 relative w-full h-40 rounded-lg overflow-hidden" style={{ backgroundColor: '#f3f4f6', minHeight: '160px' }}>
                  {file.mimeType.startsWith('image/') ? (
                    <>
                      <img
                        src={`/api/files/${file.id}/thumbnail`}
                        alt={file.name}
                        style={{
                          position: 'absolute',
                          top: '0',
                          left: '0',
                          width: '100%',
                          height: '100%',
                          objectFit: 'cover',
                          display: 'block'
                        }}
                        onLoad={(e) => {
                          console.log('Image loaded successfully for:', file.name)
                          // Remove debug border on successful load
                          const target = e.currentTarget as HTMLImageElement
                          target.style.border = 'none'
                        }}
                        onError={(e) => {
                          console.log('Image failed to load for:', file.name)
                          const target = e.currentTarget as HTMLImageElement
                          target.style.display = 'none'
                          const fallback = target.nextElementSibling as HTMLElement
                          if (fallback) {
                            fallback.style.display = 'flex'
                          }
                        }}
                      />
                      <div
                        className="absolute inset-0 hidden items-center justify-center"
                        style={{ backgroundColor: '#f3f4f6' }}
                      >
                        <Image className="h-12 w-12 text-blue-500" />
                      </div>
                    </>
                  ) : (
                    <div className="w-full h-full flex items-center justify-center">
                      {file.mimeType.startsWith('video/') ? (
                        <Video className="h-12 w-12 text-purple-500" />
                      ) : file.mimeType.startsWith('audio/') ? (
                        <Music className="h-12 w-12 text-green-500" />
                      ) : file.mimeType.includes('text') || file.mimeType.includes('document') ? (
                        <FileText className="h-12 w-12 text-orange-500" />
                      ) : file.mimeType.includes('zip') || file.mimeType.includes('archive') ? (
                        <Archive className="h-12 w-12 text-gray-500" />
                      ) : (
                        <File className="h-12 w-12 text-gray-400" />
                      )}
                    </div>
                  )}
                  {/* Dropdown positioned absolutely on thumbnail */}
                  <div className="absolute top-2 right-2">
                    <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button
                        variant="ghost"
                        size="sm"
                        className="h-8 w-8 p-0 bg-white/80 hover:bg-white/90 backdrop-blur-sm"
                        onClick={(e) => e.stopPropagation()}
                      >
                        <MoreVertical className="h-4 w-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuItem onClick={() => onDownload(file)}>
                        <Download className="mr-2 h-4 w-4" />
                        Download
                      </DropdownMenuItem>
                      <DropdownMenuItem onClick={() => onRename(file)}>
                        <Edit className="mr-2 h-4 w-4" />
                        Rename
                      </DropdownMenuItem>
                      <DropdownMenuItem
                        onClick={() => onDelete(file)}
                        className="text-red-600"
                      >
                        <Trash className="mr-2 h-4 w-4" />
                        Delete
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                    </DropdownMenu>
                  </div>
                </div>
                <div className="space-y-1">
                  <p className="font-medium text-sm text-gray-900 truncate" title={file.name}>
                    {file.name}
                  </p>
                  <p className="text-xs text-gray-500">
                    {formatFileSize(file.size)}
                  </p>
                  <p className="text-xs text-gray-400">
                    {formatDate(file.modifiedTime)}
                  </p>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      ) : (
        <div className="space-y-2 pb-20 md:pb-4">
          {filteredFiles.map((file) => (
            <Card key={file.id} className="hover:shadow-sm transition-shadow">
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-3 flex-1 min-w-0">
                    <div className="flex-shrink-0 w-12 h-12">
                      {file.mimeType.startsWith('image/') ? (
                        <div className="w-12 h-12 bg-gray-100 rounded border overflow-hidden relative">
                          <img
                            src={`/api/files/${file.id}/thumbnail`}
                            alt={file.name}
                            className="w-full h-full object-cover"
                            onError={(e) => {
                              const target = e.currentTarget as HTMLImageElement
                              target.style.display = 'none'
                              const fallback = target.nextElementSibling as HTMLElement
                              if (fallback) {
                                fallback.style.display = 'flex'
                              }
                            }}
                          />
                          <div className="absolute inset-0 hidden items-center justify-center">
                            {getFileIcon(file.mimeType)}
                          </div>
                        </div>
                      ) : (
                        <div className="w-12 h-12 bg-gray-100 rounded flex items-center justify-center">
                          {getFileIcon(file.mimeType)}
                        </div>
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-medium text-sm text-gray-900 truncate">
                        {file.name}
                      </p>
                      <div className="flex items-center space-x-4 text-xs text-gray-500 mt-1">
                        <span>{formatFileSize(file.size)}</span>
                        <span>{formatDate(file.modifiedTime)}</span>
                      </div>
                    </div>
                  </div>
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button
                        variant="ghost"
                        size="sm"
                        className="h-8 w-8 p-0"
                        onClick={(e) => e.stopPropagation()}
                      >
                        <MoreVertical className="h-4 w-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuItem onClick={() => onDownload(file)}>
                        <Download className="mr-2 h-4 w-4" />
                        Download
                      </DropdownMenuItem>
                      <DropdownMenuItem onClick={() => onRename(file)}>
                        <Edit className="mr-2 h-4 w-4" />
                        Rename
                      </DropdownMenuItem>
                      <DropdownMenuItem
                        onClick={() => onDelete(file)}
                        className="text-red-600"
                      >
                        <Trash className="mr-2 h-4 w-4" />
                        Delete
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Refreshing Overlay */}
      {refreshing && (
        <div className="absolute inset-0 bg-white/50 backdrop-blur-sm flex items-center justify-center z-10 rounded-lg">
          <div className="bg-white p-4 rounded-lg shadow-lg flex items-center gap-3">
            <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-blue-600"></div>
            <span className="text-sm text-gray-700">Refreshing files...</span>
          </div>
        </div>
      )}

    </div>
  )
}