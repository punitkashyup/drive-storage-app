"use client"

import { useState } from "react"
import { DriveFile } from "@/lib/google-drive"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import {
  X,
  Download,
  File,
  Image as ImageIcon,
  FileText,
  Video,
  Music,
  Archive,
  Eye,
  ExternalLink
} from "lucide-react"

interface FilePreviewProps {
  file: DriveFile | null
  isOpen: boolean
  onClose: () => void
  onDownload: (file: DriveFile) => void
}

export default function FilePreview({
  file,
  isOpen,
  onClose,
  onDownload
}: FilePreviewProps) {
  const [imageLoading, setImageLoading] = useState(true)
  const [imageError, setImageError] = useState(false)

  if (!file) return null

  const isImage = file.mimeType.startsWith('image/')
  const isVideo = file.mimeType.startsWith('video/')
  const isAudio = file.mimeType.startsWith('audio/')
  const isText = file.mimeType.includes('text') || file.mimeType.includes('document')
  const isPDF = file.mimeType.includes('pdf')

  const getFileIcon = () => {
    if (isImage) return <ImageIcon className="h-16 w-16 text-blue-500" />
    if (isVideo) return <Video className="h-16 w-16 text-purple-500" />
    if (isAudio) return <Music className="h-16 w-16 text-green-500" />
    if (isText) return <FileText className="h-16 w-16 text-orange-500" />
    if (file.mimeType.includes('zip') || file.mimeType.includes('archive'))
      return <Archive className="h-16 w-16 text-gray-500" />
    return <File className="h-16 w-16 text-gray-400" />
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
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    })
  }

  const renderPreview = () => {
    if (isImage) {
      return (
        <div className="relative">
          {imageLoading && !imageError && (
            <div className="flex items-center justify-center h-64 bg-gray-100 rounded-lg">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
            </div>
          )}
          {!imageError ? (
            <img
              src={file.thumbnailLink || `/api/files/${file.id}`}
              alt={file.name}
              className={`w-full max-h-96 object-contain rounded-lg ${imageLoading ? 'hidden' : ''}`}
              onLoad={() => setImageLoading(false)}
              onError={() => {
                setImageError(true)
                setImageLoading(false)
              }}
            />
          ) : (
            <div className="flex flex-col items-center justify-center h-64 bg-gray-100 rounded-lg">
              <ImageIcon className="h-12 w-12 text-gray-400 mb-2" />
              <p className="text-gray-500">Preview not available</p>
              <p className="text-sm text-gray-400">Click download to view the image</p>
            </div>
          )}
        </div>
      )
    }

    if (isVideo) {
      return (
        <div className="flex flex-col items-center justify-center h-64 bg-gray-100 rounded-lg">
          <Video className="h-12 w-12 text-purple-500 mb-2" />
          <p className="text-gray-700 font-medium">Video File</p>
          <p className="text-sm text-gray-500">Click download to view the video</p>
        </div>
      )
    }

    if (isAudio) {
      return (
        <div className="flex flex-col items-center justify-center h-64 bg-gray-100 rounded-lg">
          <Music className="h-12 w-12 text-green-500 mb-2" />
          <p className="text-gray-700 font-medium">Audio File</p>
          <p className="text-sm text-gray-500">Click download to play the audio</p>
        </div>
      )
    }

    if (isPDF) {
      return (
        <div className="flex flex-col items-center justify-center h-64 bg-gray-100 rounded-lg">
          <FileText className="h-12 w-12 text-red-500 mb-2" />
          <p className="text-gray-700 font-medium">PDF Document</p>
          <p className="text-sm text-gray-500 mb-4">Click the button below to view in browser</p>
          {file.webViewLink && (
            <Button
              variant="outline"
              onClick={() => window.open(file.webViewLink, '_blank')}
              className="flex items-center gap-2"
            >
              <ExternalLink className="h-4 w-4" />
              Open in Google Drive
            </Button>
          )}
        </div>
      )
    }

    // Default preview for other file types
    return (
      <div className="flex flex-col items-center justify-center h-64 bg-gray-100 rounded-lg">
        {getFileIcon()}
        <p className="text-gray-700 font-medium mt-4">File Preview</p>
        <p className="text-sm text-gray-500">Preview not available for this file type</p>
        <p className="text-sm text-gray-400">Click download to view the file</p>
      </div>
    )
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <div className="flex items-center justify-between">
            <DialogTitle className="flex items-center gap-2 text-lg">
              <Eye className="h-5 w-5" />
              File Preview
            </DialogTitle>
            <Button
              variant="ghost"
              size="sm"
              onClick={onClose}
              className="h-8 w-8 p-0"
            >
              <X className="h-4 w-4" />
            </Button>
          </div>
        </DialogHeader>

        <div className="space-y-6">
          {/* File Info */}
          <div className="border rounded-lg p-4 bg-gray-50">
            <div className="flex items-start gap-3">
              <div className="flex-shrink-0">
                {getFileIcon()}
              </div>
              <div className="flex-1 min-w-0">
                <h3 className="text-lg font-semibold text-gray-900 truncate">
                  {file.name}
                </h3>
                <div className="mt-2 space-y-1 text-sm text-gray-600">
                  <p><span className="font-medium">Size:</span> {formatFileSize(file.size)}</p>
                  <p><span className="font-medium">Type:</span> {file.mimeType}</p>
                  <p><span className="font-medium">Modified:</span> {formatDate(file.modifiedTime)}</p>
                </div>
              </div>
            </div>
          </div>

          {/* Preview */}
          <div>
            {renderPreview()}
          </div>

          {/* Actions */}
          <div className="flex justify-center gap-3 pt-4 border-t">
            <Button
              onClick={() => onDownload(file)}
              className="flex items-center gap-2"
            >
              <Download className="h-4 w-4" />
              Download
            </Button>
            {file.webViewLink && (
              <Button
                variant="outline"
                onClick={() => window.open(file.webViewLink, '_blank')}
                className="flex items-center gap-2"
              >
                <ExternalLink className="h-4 w-4" />
                Open in Google Drive
              </Button>
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}