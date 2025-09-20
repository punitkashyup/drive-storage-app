"use client"

import { useState, useEffect } from "react"
import { DriveFile } from "@/lib/google-drive"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Checkbox } from "@/components/ui/checkbox"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import SkeletonLoader from "@/components/SkeletonLoader"
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
  Archive,
  Check
} from "lucide-react"

interface FileListProps {
  files: DriveFile[]
  loading?: boolean
  refreshing?: boolean
  operationLoading?: {[key: string]: 'downloading' | 'renaming' | 'deleting'}
  selectionMode?: boolean
  onDownload: (file: DriveFile) => void
  onRename: (file: DriveFile) => void
  onDelete: (file: DriveFile) => void
  onBulkDelete?: (files: DriveFile[]) => void
  onRefresh: () => void
}

export default function FileList({
  files,
  loading = false,
  refreshing = false,
  operationLoading = {},
  selectionMode = false,
  onDownload,
  onRename,
  onDelete,
  onBulkDelete,
  onRefresh
}: FileListProps) {
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid')
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedFiles, setSelectedFiles] = useState<Set<string>>(new Set())

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

  // Selection helper functions
  const toggleFileSelection = (fileId: string) => {
    setSelectedFiles(prev => {
      const newSet = new Set(prev)
      if (newSet.has(fileId)) {
        newSet.delete(fileId)
      } else {
        newSet.add(fileId)
      }
      return newSet
    })
  }

  const selectAll = () => {
    setSelectedFiles(new Set(filteredFiles.map(file => file.id)))
  }

  const clearSelection = () => {
    setSelectedFiles(new Set())
  }

  const handleBulkDelete = () => {
    if (onBulkDelete && selectedFiles.size > 0) {
      const selectedFileObjects = files.filter(file => selectedFiles.has(file.id))
      onBulkDelete(selectedFileObjects)
      clearSelection()
    }
  }

  // Clear selections when selection mode is turned off
  useEffect(() => {
    if (!selectionMode) {
      setSelectedFiles(new Set())
    }
  }, [selectionMode])

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
      <div className="space-y-4">
        {/* Search and View Controls */}
        <div className="flex flex-col sm:flex-row gap-4 items-center justify-between">
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
            <Input
              placeholder="Search files..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              disabled
              className="pl-10 bg-gray-50"
            />
          </div>
          <div className="flex items-center space-x-2">
            <Button
              variant="outline"
              size="sm"
              disabled
              className={viewMode === 'grid' ? 'bg-gray-100' : ''}
            >
              <Grid className="h-4 w-4" />
            </Button>
            <Button
              variant="outline"
              size="sm"
              disabled
              className={viewMode === 'list' ? 'bg-gray-100' : ''}
            >
              <List className="h-4 w-4" />
            </Button>
          </div>
        </div>

        <SkeletonLoader viewMode={viewMode} count={8} />
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
          {selectionMode && (
            <>
              <Button
                variant="outline"
                size="sm"
                onClick={selectAll}
                disabled={selectedFiles.size === filteredFiles.length}
              >
                Select All
              </Button>
              {selectedFiles.size > 0 && (
                <Button
                  variant="destructive"
                  size="sm"
                  onClick={handleBulkDelete}
                >
                  <Trash className="h-4 w-4 mr-2" />
                  Delete ({selectedFiles.size})
                </Button>
              )}
            </>
          )}
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
            <Card key={file.id} className="hover:shadow-md transition-shadow relative">
              <CardContent className="p-4">
                {/* Selection checkbox */}
                {selectionMode && (
                  <div className="absolute top-2 right-2 z-10">
                    <Checkbox
                      checked={selectedFiles.has(file.id)}
                      onCheckedChange={() => toggleFileSelection(file.id)}
                      className="bg-white shadow-sm"
                    />
                  </div>
                )}
                {/* Thumbnail */}
                <div className="mb-3 relative w-full h-40 rounded-lg overflow-hidden" style={{ backgroundColor: '#f3f4f6', minHeight: '160px' }}>
                  {file.mimeType.startsWith('image/') ? (
                    <>
                      {/* Loading skeleton while image loads */}
                      <div className="absolute inset-0 bg-gray-200 animate-pulse" id={`skeleton-${file.id}`}></div>

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
                          display: 'block',
                          opacity: '0',
                          transition: 'opacity 0.3s ease-in-out'
                        }}
                        onLoad={(e) => {
                          const target = e.currentTarget as HTMLImageElement
                          const skeleton = document.getElementById(`skeleton-${file.id}`)
                          target.style.opacity = '1'
                          if (skeleton) skeleton.style.display = 'none'
                        }}
                        onError={(e) => {
                          const target = e.currentTarget as HTMLImageElement
                          const skeleton = document.getElementById(`skeleton-${file.id}`)
                          const fallback = target.nextElementSibling as HTMLElement
                          target.style.display = 'none'
                          if (skeleton) skeleton.style.display = 'none'
                          if (fallback) fallback.style.display = 'flex'
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
                  {/* Loading overlay for individual operations */}
                  {operationLoading[file.id] && (
                    <div className="absolute inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center rounded-lg">
                      <div className="bg-white/90 p-3 rounded-lg shadow-lg flex items-center gap-2 backdrop-blur-md">
                        <div className="animate-spin rounded-full h-4 w-4 border-2 border-blue-600/20 border-b-blue-600"></div>
                        <span className="text-xs text-gray-700 font-medium capitalize">
                          {operationLoading[file.id]}...
                        </span>
                      </div>
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
                        disabled={!!operationLoading[file.id]}
                      >
                        <MoreVertical className="h-4 w-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuItem onClick={() => onDownload(file)} disabled={!!operationLoading[file.id]}>
                        <Download className="mr-2 h-4 w-4" />
                        Download
                      </DropdownMenuItem>
                      <DropdownMenuItem onClick={() => onRename(file)} disabled={!!operationLoading[file.id]}>
                        <Edit className="mr-2 h-4 w-4" />
                        Rename
                      </DropdownMenuItem>
                      <DropdownMenuItem
                        onClick={() => onDelete(file)}
                        className="text-red-600"
                        disabled={!!operationLoading[file.id]}
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
            <Card key={file.id} className={`hover:shadow-sm transition-shadow relative ${operationLoading[file.id] ? 'opacity-60' : ''}`}>
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-3 flex-1 min-w-0">
                    {/* Selection checkbox for list view */}
                    {selectionMode && (
                      <Checkbox
                        checked={selectedFiles.has(file.id)}
                        onCheckedChange={() => toggleFileSelection(file.id)}
                      />
                    )}
                    <div className="flex-shrink-0 w-12 h-12">
                      {file.mimeType.startsWith('image/') ? (
                        <div className="w-12 h-12 bg-gray-100 rounded border overflow-hidden relative">
                          {/* Loading skeleton for list view */}
                          <div className="absolute inset-0 bg-gray-200 animate-pulse" id={`list-skeleton-${file.id}`}></div>

                          <img
                            src={`/api/files/${file.id}/thumbnail`}
                            alt={file.name}
                            className="w-full h-full object-cover"
                            style={{
                              opacity: '0',
                              transition: 'opacity 0.3s ease-in-out'
                            }}
                            onLoad={(e) => {
                              const target = e.currentTarget as HTMLImageElement
                              const skeleton = document.getElementById(`list-skeleton-${file.id}`)
                              target.style.opacity = '1'
                              if (skeleton) skeleton.style.display = 'none'
                            }}
                            onError={(e) => {
                              const target = e.currentTarget as HTMLImageElement
                              const skeleton = document.getElementById(`list-skeleton-${file.id}`)
                              const fallback = target.nextElementSibling as HTMLElement
                              target.style.display = 'none'
                              if (skeleton) skeleton.style.display = 'none'
                              if (fallback) fallback.style.display = 'flex'
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
                        {operationLoading[file.id] && (
                          <span className="flex items-center gap-1 text-blue-600">
                            <div className="animate-spin rounded-full h-3 w-3 border border-blue-600/20 border-b-blue-600"></div>
                            <span className="capitalize">{operationLoading[file.id]}...</span>
                          </span>
                        )}
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
                        disabled={!!operationLoading[file.id]}
                      >
                        <MoreVertical className="h-4 w-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuItem onClick={() => onDownload(file)} disabled={!!operationLoading[file.id]}>
                        <Download className="mr-2 h-4 w-4" />
                        Download
                      </DropdownMenuItem>
                      <DropdownMenuItem onClick={() => onRename(file)} disabled={!!operationLoading[file.id]}>
                        <Edit className="mr-2 h-4 w-4" />
                        Rename
                      </DropdownMenuItem>
                      <DropdownMenuItem
                        onClick={() => onDelete(file)}
                        className="text-red-600"
                        disabled={!!operationLoading[file.id]}
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
        <div className="absolute inset-0 bg-white/30 backdrop-blur-sm flex items-center justify-center z-10 rounded-lg transition-all duration-300">
          <div className="bg-white/90 p-4 rounded-lg shadow-lg flex items-center gap-3 border backdrop-blur-md">
            <div className="animate-spin rounded-full h-5 w-5 border-2 border-blue-600/20 border-b-blue-600"></div>
            <span className="text-sm text-gray-700 font-medium">Refreshing files...</span>
          </div>
        </div>
      )}

    </div>
  )
}