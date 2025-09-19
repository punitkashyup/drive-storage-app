"use client"

import { useState, useEffect } from "react"
import { useSession } from "next-auth/react"
import { DriveFile } from "@/lib/google-drive"
import FileUpload from "@/components/FileUpload"
import FileList from "@/components/FileList"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Upload } from "lucide-react"

export default function DashboardPage() {
  const { data: session } = useSession()
  const [files, setFiles] = useState<DriveFile[]>([])
  const [loading, setLoading] = useState(true)
  const [uploading, setUploading] = useState(false)
  const [showUpload, setShowUpload] = useState(false)

  const fetchFiles = async () => {
    try {
      setLoading(true)
      const response = await fetch("/api/files")
      if (response.ok) {
        const data = await response.json()
        setFiles(data.files)
      }
    } catch (error) {
      console.error("Error fetching files:", error)
    } finally {
      setLoading(false)
    }
  }

  const uploadFiles = async (selectedFiles: File[]) => {
    setUploading(true)
    try {
      for (const file of selectedFiles) {
        const formData = new FormData()
        formData.append("file", file)

        const response = await fetch("/api/files", {
          method: "POST",
          body: formData
        })

        if (response.ok) {
          const data = await response.json()
          setFiles(prev => [data.file, ...prev])
        }
      }
      setShowUpload(false)
    } catch (error) {
      console.error("Error uploading files:", error)
    } finally {
      setUploading(false)
    }
  }

  const downloadFile = async (file: DriveFile) => {
    try {
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
      }
    } catch (error) {
      console.error("Error downloading file:", error)
    }
  }

  const renameFile = async (file: DriveFile) => {
    const newName = prompt("Enter new file name:", file.name)
    if (newName && newName !== file.name) {
      try {
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
        }
      } catch (error) {
        console.error("Error renaming file:", error)
      }
    }
  }

  const deleteFile = async (file: DriveFile) => {
    if (confirm(`Are you sure you want to delete "${file.name}"?`)) {
      try {
        const response = await fetch(`/api/files/${file.id}`, {
          method: "DELETE"
        })

        if (response.ok) {
          setFiles(prev => prev.filter(f => f.id !== file.id))
        }
      } catch (error) {
        console.error("Error deleting file:", error)
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
        <Button
          onClick={() => setShowUpload(!showUpload)}
          className="self-start md:self-auto"
          disabled={uploading}
        >
          <Upload className="h-4 w-4 mr-2" />
          {uploading ? "Uploading..." : "Upload Files"}
        </Button>
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
            onDownload={downloadFile}
            onRename={renameFile}
            onDelete={deleteFile}
            onRefresh={fetchFiles}
          />
        </CardContent>
      </Card>
    </div>
  )
}