"use client"

import { useState, useEffect } from "react"
import { useSession } from "next-auth/react"
import { DriveFile } from "@/lib/google-drive"
import FileUpload from "@/components/FileUpload"
import FileList from "@/components/FileList"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Upload, RefreshCw } from "lucide-react"
import { toast } from "sonner"

export default function DashboardPage() {
  const { data: session } = useSession()
  const [files, setFiles] = useState<DriveFile[]>([])
  const [loading, setLoading] = useState(true)
  const [uploading, setUploading] = useState(false)
  const [showUpload, setShowUpload] = useState(false)
  const [uploadProgress, setUploadProgress] = useState<{[key: string]: number}>({})
  const [refreshing, setRefreshing] = useState(false)
  const [operationLoading, setOperationLoading] = useState<{[key: string]: 'downloading' | 'renaming' | 'deleting'}>({})

  const fetchFiles = async (showRefreshLoader = false) => {
    try {
      if (showRefreshLoader) {
        setRefreshing(true)
      } else {
        setLoading(true)
      }
      const response = await fetch("/api/files")
      if (response.ok) {
        const data = await response.json()
        setFiles(data.files)
      } else {
        throw new Error('Failed to fetch files')
      }
    } catch (error) {
      console.error("Error fetching files:", error)
    } finally {
      setLoading(false)
      setRefreshing(false)
    }
  }

  const uploadFiles = async (selectedFiles: File[]) => {
    setUploading(true)
    const newProgress: {[key: string]: number} = {}

    try {
      for (let i = 0; i < selectedFiles.length; i++) {
        const file = selectedFiles[i]
        const fileKey = `${file.name}-${file.size}`
        newProgress[fileKey] = 0
        setUploadProgress({...newProgress})

        const formData = new FormData()
        formData.append("file", file)

        // Simulate upload progress (since we can't track real progress with fetch easily)
        const progressInterval = setInterval(() => {
          newProgress[fileKey] = Math.min(newProgress[fileKey] + 10, 90)
          setUploadProgress({...newProgress})
        }, 200)

        const response = await fetch("/api/files", {
          method: "POST",
          body: formData
        })

        clearInterval(progressInterval)

        if (response.ok) {
          const data = await response.json()
          setFiles(prev => [data.file, ...prev])
          newProgress[fileKey] = 100
          setUploadProgress({...newProgress})
          toast.success(`${file.name} uploaded successfully`)
        } else {
          delete newProgress[fileKey]
          setUploadProgress({...newProgress})
          throw new Error(`Failed to upload ${file.name}`)
        }

        // Clean up progress after a short delay
        setTimeout(() => {
          setUploadProgress(prev => {
            const updated = {...prev}
            delete updated[fileKey]
            return updated
          })
        }, 1000)
      }
      setShowUpload(false)
    } catch (error) {
      console.error("Error uploading files:", error)
      toast.error("Upload failed. Please try again.")
    } finally {
      setUploading(false)
    }
  }

  const downloadFile = async (file: DriveFile) => {
    try {
      setOperationLoading(prev => ({ ...prev, [file.id]: 'downloading' }))
      const response = await fetch(`/api/files/${file.id}`)
      if (response.ok) {
        const blob = await response.blob()
        const url = window.URL.createObjectURL(blob)
        const a = document.createElement("a")
        a.href = url
        a.download = file.name
        document.body.appendChild(a)
        a.click()
        window.URL.revokeObjectURL(url)
        document.body.removeChild(a)
      } else {
        throw new Error('Download failed')
      }
    } catch (error) {
      console.error("Error downloading file:", error)
      toast.error("Failed to download file. Please try again.")
    } finally {
      setOperationLoading(prev => {
        const updated = { ...prev }
        delete updated[file.id]
        return updated
      })
    }
  }

  const renameFile = async (file: DriveFile) => {
    const newName = prompt("Enter new file name:", file.name)
    if (newName && newName !== file.name) {
      try {
        setOperationLoading(prev => ({ ...prev, [file.id]: 'renaming' }))
        const response = await fetch(`/api/files/${file.id}`, {
          method: "PATCH",
          headers: {
            "Content-Type": "application/json"
          },
          body: JSON.stringify({ name: newName })
        })

        if (response.ok) {
          const data = await response.json()
          setFiles(prev =>
            prev.map(f => f.id === file.id ? data.file : f)
          )
          toast.success(`File renamed to "${data.file.name}"`)
        } else {
          // If rename failed, show error and refresh to get current state
          console.error("Rename failed, refreshing file list")
          toast.error("Rename operation failed. Refreshing file list...")
          await fetchFiles(true)
        }
      } catch (error) {
        console.error("Error renaming file:", error)
        toast.error("Failed to rename file. Please try again.")
        // On error, refresh the file list to show current state
        await fetchFiles(true)
      } finally {
        setOperationLoading(prev => {
          const updated = { ...prev }
          delete updated[file.id]
          return updated
        })
      }
    }
  }

  const deleteFile = async (file: DriveFile) => {
    if (confirm(`Are you sure you want to delete "${file.name}"?`)) {
      try {
        setOperationLoading(prev => ({ ...prev, [file.id]: 'deleting' }))
        const response = await fetch(`/api/files/${file.id}`, {
          method: "DELETE"
        })

        if (response.ok) {
          setFiles(prev => prev.filter(f => f.id !== file.id))
          toast.success(`"${file.name}" deleted successfully`)
        } else {
          throw new Error('Delete failed')
        }
      } catch (error) {
        console.error("Error deleting file:", error)
        toast.error("Failed to delete file. Please try again.")
      } finally {
        setOperationLoading(prev => {
          const updated = { ...prev }
          delete updated[file.id]
          return updated
        })
      }
    }
  }

  useEffect(() => {
    fetchFiles()
  }, [])

  return (
    <div className="container mx-auto px-4 py-6 space-y-6">
      {/* Welcome Section */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">
            Welcome back, {session?.user?.name?.split(' ')[0] || 'User'}!
          </h1>
          <p className="text-gray-600">
            Manage your files stored in Google Drive
          </p>
        </div>
        <div className="flex gap-2">
          <Button
            variant="outline"
            onClick={() => fetchFiles(true)}
            disabled={refreshing || loading}
            style={{ height: '40px', width: '128px' }}
            className="px-4 py-2"
          >
            <RefreshCw className={`h-4 w-4 mr-2 ${refreshing ? 'animate-spin' : ''}`} />
            Refresh
          </Button>
          <Button
            variant="outline"
            onClick={() => setShowUpload(!showUpload)}
            disabled={uploading}
            style={{ height: '40px', width: '128px' }}
            className="px-4 py-2"
          >
            <Upload className="h-4 w-4 mr-2" />
            {uploading ? "Uploading..." : showUpload ? "Hide Upload" : "Upload Files"}
          </Button>
        </div>
      </div>

      {/* Upload Section */}
      {showUpload && (
        <Card>
          <CardHeader>
            <CardTitle>Upload Files</CardTitle>
          </CardHeader>
          <CardContent>
            <FileUpload
              onFileSelect={uploadFiles}
              multiple={true}
              maxSize={100}
              uploading={uploading}
              uploadProgress={uploadProgress}
            />
          </CardContent>
        </Card>
      )}

      {/* Files Section */}
      <Card>
        <CardHeader>
          <CardTitle>Your Files</CardTitle>
        </CardHeader>
        <CardContent>
          <FileList
            files={files}
            loading={loading}
            refreshing={refreshing}
            operationLoading={operationLoading}
            onDownload={downloadFile}
            onRename={renameFile}
            onDelete={deleteFile}
            onRefresh={() => fetchFiles(true)}
          />
        </CardContent>
      </Card>
    </div>
  )
}