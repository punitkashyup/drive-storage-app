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
  private accessToken: string

  constructor(accessToken: string) {
    this.accessToken = accessToken
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

      // Convert File to ArrayBuffer for resumable upload
      const arrayBuffer = await file.arrayBuffer()

      console.log('File converted to buffer, size:', arrayBuffer.byteLength)

      // Use resumable upload instead of multipart for better reliability
      console.log('Starting resumable upload session...')

      const metadata = {
        name: file.name,
        parents: folderId ? [folderId] : undefined
      }

      // Start resumable upload session
      const sessionResponse = await fetch('https://www.googleapis.com/upload/drive/v3/files?uploadType=resumable', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${this.accessToken}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(metadata)
      })

      if (!sessionResponse.ok) {
        const errorText = await sessionResponse.text()
        console.error('Session creation failed:', sessionResponse.status, errorText)
        throw new Error(`Session creation failed: ${sessionResponse.status}`)
      }

      const uploadUrl = sessionResponse.headers.get('location')
      if (!uploadUrl) {
        throw new Error('No upload URL received from Google Drive')
      }

      console.log('Upload session created, uploading file...')

      // Upload the actual file content (reuse the arrayBuffer we already have)
      const uploadUrlWithFields = `${uploadUrl}&fields=id,name,mimeType,size,modifiedTime,thumbnailLink,webViewLink`
      const response = await fetch(uploadUrlWithFields, {
        method: 'PUT',
        headers: {
          'Content-Type': file.type || 'application/octet-stream',
        },
        body: arrayBuffer
      })

      if (!response.ok) {
        const errorText = await response.text()
        console.error('Upload failed with status:', response.status, 'Error:', errorText)
        throw new Error(`HTTP error! status: ${response.status}, message: ${errorText}`)
      }

      const result = await response.json()
      console.log('Upload successful:', result.id)

      return {
        id: result.id!,
        name: result.name!,
        mimeType: result.mimeType!,
        size: result.size || undefined,
        modifiedTime: result.modifiedTime!,
        thumbnailLink: result.thumbnailLink || undefined,
        webViewLink: result.webViewLink || undefined
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
      console.log('Renaming file:', fileId, 'to:', newName)

      // Use direct fetch API instead of googleapis for reliability
      const response = await fetch(`https://www.googleapis.com/drive/v3/files/${fileId}?fields=id,name,mimeType,size,modifiedTime,thumbnailLink,webViewLink`, {
        method: 'PATCH',
        headers: {
          'Authorization': `Bearer ${this.accessToken}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          name: newName
        })
      })

      // Google Drive API sometimes returns 500 even when the operation succeeds
      // Check if we got a valid response body first
      const responseText = await response.text()

      if (!response.ok && response.status !== 500) {
        console.error('Rename failed with status:', response.status, 'Error:', responseText)
        throw new Error(`HTTP error! status: ${response.status}, message: ${responseText}`)
      }

      // Try to parse the response - if it contains valid data, the operation succeeded
      let result
      try {
        result = JSON.parse(responseText)

        // If we have a valid file object with id and name, consider it successful
        if (result.id && result.name) {
          console.log('Rename successful:', result.id)
          return {
            id: result.id!,
            name: result.name!,
            mimeType: result.mimeType!,
            size: result.size || undefined,
            modifiedTime: result.modifiedTime!,
            thumbnailLink: result.thumbnailLink || undefined,
            webViewLink: result.webViewLink || undefined
          }
        }
      } catch (parseError) {
        // If we can't parse the response but status was 500, it might still have worked
        console.log('Parse error for response, but operation might have succeeded')
      }

      // If we got here with a 500 error, the operation likely succeeded but Google returned an error
      // Let's verify by fetching the file to check if the name changed
      if (response.status === 500) {
        console.log('Got 500 error but operation might have succeeded, verifying...')
        try {
          const verifyResponse = await fetch(`https://www.googleapis.com/drive/v3/files/${fileId}?fields=id,name,mimeType,size,modifiedTime,thumbnailLink,webViewLink`, {
            method: 'GET',
            headers: {
              'Authorization': `Bearer ${this.accessToken}`,
            }
          })

          if (verifyResponse.ok) {
            const verifyResult = await verifyResponse.json()
            if (verifyResult.name === newName) {
              console.log('Rename was actually successful, returning updated file info')
              return {
                id: verifyResult.id!,
                name: verifyResult.name!,
                mimeType: verifyResult.mimeType!,
                size: verifyResult.size || undefined,
                modifiedTime: verifyResult.modifiedTime!,
                thumbnailLink: verifyResult.thumbnailLink || undefined,
                webViewLink: verifyResult.webViewLink || undefined
              }
            }
          }
        } catch (verifyError) {
          console.error('Error verifying rename:', verifyError)
        }
      }

      // If we get here, the operation truly failed
      throw new Error(`Rename operation failed with status ${response.status}`)

    } catch (error: any) {
      console.error('Error renaming file:', error)
      throw new Error(`Failed to rename file: ${error.message || 'Unknown error'}`)
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