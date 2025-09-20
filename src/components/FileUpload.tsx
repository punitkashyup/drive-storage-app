"use client"

import { useState, useRef, useCallback } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Progress } from "@/components/ui/progress"
import { Upload, X, File, Image, FileText, Video, CheckCircle } from "lucide-react"
import { toast } from "sonner"

interface FileUploadProps {
  onFileSelect: (files: File[]) => void
  multiple?: boolean
  accept?: string
  maxSize?: number // in MB
  className?: string
  uploading?: boolean
  uploadProgress?: {[key: string]: number}
}

export default function FileUpload({
  onFileSelect,
  multiple = true,
  accept = "*/*",
  maxSize = 100,
  className = "",
  uploading = false,
  uploadProgress = {}
}: FileUploadProps) {
  const [isDragOver, setIsDragOver] = useState(false)
  const [selectedFiles, setSelectedFiles] = useState<File[]>([])
  const fileInputRef = useRef<HTMLInputElement>(null)

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    setIsDragOver(true)
  }, [])

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    setIsDragOver(false)
  }, [])

  const validateFile = (file: File): string | null => {
    if (file.size > maxSize * 1024 * 1024) {
      return `File ${file.name} is too large. Maximum size is ${maxSize}MB.`
    }
    return null
  }

  const handleFiles = (files: File[]) => {
    const validFiles: File[] = []
    const errors: string[] = []

    files.forEach(file => {
      const error = validateFile(file)
      if (error) {
        errors.push(error)
      } else {
        validFiles.push(file)
      }
    })

    if (errors.length > 0) {
      errors.forEach(error => toast.error(error))
    }

    if (validFiles.length > 0) {
      setSelectedFiles(validFiles)
      onFileSelect(validFiles)
    }
  }

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    setIsDragOver(false)

    const files = Array.from(e.dataTransfer.files)
    handleFiles(files)
  }, [onFileSelect, maxSize])

  const handleFileInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || [])
    handleFiles(files)
  }

  const removeFile = (index: number) => {
    if (uploading) return // Don't allow removal during upload
    const newFiles = selectedFiles.filter((_, i) => i !== index)
    setSelectedFiles(newFiles)
    onFileSelect(newFiles)
  }

  const getFileIcon = (mimeType: string) => {
    if (mimeType.startsWith('image/')) return <Image className="h-4 w-4" />
    if (mimeType.startsWith('video/')) return <Video className="h-4 w-4" />
    if (mimeType.includes('text') || mimeType.includes('document')) return <FileText className="h-4 w-4" />
    return <File className="h-4 w-4" />
  }

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes'
    const k = 1024
    const sizes = ['Bytes', 'KB', 'MB', 'GB']
    const i = Math.floor(Math.log(bytes) / Math.log(k))
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i]
  }

  return (
    <div className={className}>
      <Card
        className={`border-2 border-dashed transition-colors ${
          isDragOver
            ? 'border-blue-500 bg-blue-50'
            : uploading
            ? 'border-green-300 bg-green-50'
            : 'border-gray-300 hover:border-gray-400'
        } ${uploading ? 'pointer-events-none' : ''}`}
        onDragOver={uploading ? undefined : handleDragOver}
        onDragLeave={uploading ? undefined : handleDragLeave}
        onDrop={uploading ? undefined : handleDrop}
      >
        <CardContent className="p-8 text-center">
          {uploading ? (
            <CheckCircle className="mx-auto h-12 w-12 text-green-500 mb-4" />
          ) : (
            <Upload className="mx-auto h-12 w-12 text-gray-400 mb-4" />
          )}
          <div className="space-y-2">
            <p className="text-lg font-medium text-gray-900">
              {uploading ? 'Uploading files...' : 'Drop files here or click to browse'}
            </p>
            <p className="text-sm text-gray-500">
              {uploading ? 'Please wait while your files are being uploaded' : `Supports all file types up to ${maxSize}MB each`}
            </p>
          </div>
          {!uploading && (
            <Button
              variant="outline"
              className="mt-4"
              onClick={() => fileInputRef.current?.click()}
            >
              Choose Files
            </Button>
          )}
          <input
            ref={fileInputRef}
            type="file"
            multiple={multiple}
            accept={accept}
            onChange={handleFileInput}
            className="hidden"
          />
        </CardContent>
      </Card>

      {/* Selected Files List */}
      {selectedFiles.length > 0 && (
        <div className="mt-4 space-y-2">
          <p className="text-sm font-medium text-gray-700">
            {uploading ? 'Uploading Files' : 'Selected Files'} ({selectedFiles.length})
          </p>
          <div className="space-y-2 max-h-40 overflow-y-auto">
            {selectedFiles.map((file, index) => {
              const fileKey = `${file.name}-${file.size}`
              const progress = uploadProgress[fileKey] || 0
              const isComplete = progress === 100
              const isUploading = progress > 0 && progress < 100

              return (
                <div
                  key={index}
                  className={`p-3 rounded-md border ${
                    isComplete
                      ? 'bg-green-50 border-green-200'
                      : isUploading
                      ? 'bg-blue-50 border-blue-200'
                      : 'bg-gray-50 border-gray-200'
                  }`}
                >
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center space-x-2 flex-1 min-w-0">
                      {getFileIcon(file.type)}
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-gray-900 truncate">
                          {file.name}
                        </p>
                        <p className="text-xs text-gray-500">
                          {formatFileSize(file.size)}
                        </p>
                      </div>
                    </div>
                    {isComplete ? (
                      <CheckCircle className="h-5 w-5 text-green-500" />
                    ) : (
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => removeFile(index)}
                        className="h-8 w-8 p-0"
                        disabled={uploading}
                      >
                        <X className="h-4 w-4" />
                      </Button>
                    )}
                  </div>
                  {(isUploading || isComplete) && (
                    <div className="space-y-1">
                      <div className="flex justify-between text-xs">
                        <span className={isComplete ? 'text-green-600' : 'text-blue-600'}>
                          {isComplete ? 'Upload complete' : 'Uploading...'}
                        </span>
                        <span className={isComplete ? 'text-green-600' : 'text-blue-600'}>
                          {progress}%
                        </span>
                      </div>
                      <Progress
                        value={progress}
                        className={`h-2 ${isComplete ? 'bg-green-100' : 'bg-blue-100'}`}
                      />
                    </div>
                  )}
                </div>
              )
            })}
          </div>
        </div>
      )}
    </div>
  )
}