import { google } from 'googleapis'
import { Readable } from 'stream'

export interface DriveFile {
  id: string
  name: string
  mimeType: string
  size?: string
  modifiedTime: string
  thumbnailLink?: string
  webViewLink?: string
}

export class GoogleDriveService {
  private drive

  constructor(accessToken: string) {
    const auth = new google.auth.OAuth2()
    auth.setCredentials({ access_token: accessToken })
    this.drive = google.drive({ version: 'v3', auth })
  }

  async listFiles(folderId?: string): Promise<DriveFile[]> {
    try {
      const query = folderId
        ? `'${folderId}' in parents and trashed=false`
        : "trashed=false"

      const response = await this.drive.files.list({
        q: query,
        fields: 'files(id,name,mimeType,size,modifiedTime,thumbnailLink,webViewLink)',
        orderBy: 'modifiedTime desc',
        pageSize: 100
      })

      return response.data.files?.map(file => ({
        id: file.id!,
        name: file.name!,
        mimeType: file.mimeType!,
        size: file.size || undefined,
        modifiedTime: file.modifiedTime!,
        thumbnailLink: file.thumbnailLink || undefined,
        webViewLink: file.webViewLink || undefined
      })) || []
    } catch (error) {
      console.error('Error listing files:', error)
      throw new Error('Failed to list files')
    }
  }

  async uploadFile(file: File, folderId?: string): Promise<DriveFile> {
    try {
      console.log('Starting file upload:', file.name, 'Size:', file.size, 'Type:', file.type)

      // Convert File to base64 for simple upload
      const arrayBuffer = await file.arrayBuffer()
      const base64 = Buffer.from(arrayBuffer).toString('base64')

      console.log('File converted to base64, length:', base64.length)

      // Prepare multipart request manually
      const boundary = '-------314159265358979323846'
      const delimiter = `\r\n--${boundary}\r\n`
      const close_delim = `\r\n--${boundary}--`

      const metadata = {
        name: file.name,
        parents: folderId ? [folderId] : undefined
      }

      const multipartRequestBody =
        delimiter +
        'Content-Type: application/json\r\n\r\n' +
        JSON.stringify(metadata) +
        delimiter +
        `Content-Type: ${file.type || 'application/octet-stream'}\r\n` +
        'Content-Transfer-Encoding: base64\r\n\r\n' +
        base64 +
        close_delim

      // Make the API call with custom fetch
      const response = await fetch('https://www.googleapis.com/upload/drive/v3/files?uploadType=multipart&fields=id,name,mimeType,size,modifiedTime,thumbnailLink,webViewLink', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${this.drive.context._options.auth.credentials.access_token}`,
          'Content-Type': `multipart/related; boundary="${boundary}"`
        },
        body: multipartRequestBody
      })

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`)
      }

      const result = await response.json()
      console.log('Upload successful:', result.id)

      return {
        id: response.data.id!,
        name: response.data.name!,
        mimeType: response.data.mimeType!,
        size: response.data.size || undefined,
        modifiedTime: response.data.modifiedTime!,
        thumbnailLink: response.data.thumbnailLink || undefined,
        webViewLink: response.data.webViewLink || undefined
      }
    } catch (error: any) {
      console.error('Detailed upload error:', {
        message: error.message,
        status: error.status,
        code: error.code,
        response: error.response?.data,
        config: error.config
      })

      // Provide more specific error messages
      if (error.status === 401 || error.code === 401) {
        throw new Error('Authentication failed. Please sign out and sign in again.')
      } else if (error.status === 403 || error.code === 403) {
        throw new Error('Insufficient permissions. Please check your Google Drive permissions.')
      } else if (error.status === 429 || error.code === 429) {
        throw new Error('Rate limit exceeded. Please try again later.')
      } else {
        throw new Error(`Upload failed: ${error.message || 'Unknown error'}`)
      }
    }
  }

  async deleteFile(fileId: string): Promise<void> {
    try {
      await this.drive.files.delete({ fileId })
    } catch (error) {
      console.error('Error deleting file:', error)
      throw new Error('Failed to delete file')
    }
  }

  async renameFile(fileId: string, newName: string): Promise<DriveFile> {
    try {
      const response = await this.drive.files.update({
        fileId,
        requestBody: { name: newName },
        fields: 'id,name,mimeType,size,modifiedTime,thumbnailLink,webViewLink'
      })

      return {
        id: response.data.id!,
        name: response.data.name!,
        mimeType: response.data.mimeType!,
        size: response.data.size || undefined,
        modifiedTime: response.data.modifiedTime!,
        thumbnailLink: response.data.thumbnailLink || undefined,
        webViewLink: response.data.webViewLink || undefined
      }
    } catch (error) {
      console.error('Error renaming file:', error)
      throw new Error('Failed to rename file')
    }
  }

  async downloadFile(fileId: string): Promise<unknown> {
    try {
      const response = await this.drive.files.get({
        fileId,
        alt: 'media'
      }, { responseType: 'stream' })

      return response.data
    } catch (error) {
      console.error('Error downloading file:', error)
      throw new Error('Failed to download file')
    }
  }
}