import { NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { GoogleDriveService } from "@/lib/google-drive"

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession(authOptions)

    if (!session?.accessToken) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const resolvedParams = await params
    const driveService = new GoogleDriveService(session.accessToken)

    // First get the file metadata to check if it has a thumbnail
    const response = await fetch(`https://www.googleapis.com/drive/v3/files/${resolvedParams.id}?fields=thumbnailLink,mimeType`, {
      headers: {
        'Authorization': `Bearer ${session.accessToken}`,
      }
    })

    if (!response.ok) {
      return NextResponse.json({ error: "File not found" }, { status: 404 })
    }

    const fileData = await response.json()

    let thumbnailBuffer: ArrayBuffer
    let contentType = 'image/jpeg'

    if (fileData.thumbnailLink) {
      try {
        // Try to fetch the thumbnail with authentication
        const thumbnailResponse = await fetch(fileData.thumbnailLink, {
          headers: {
            'Authorization': `Bearer ${session.accessToken}`,
          }
        })

        if (thumbnailResponse.ok) {
          thumbnailBuffer = await thumbnailResponse.arrayBuffer()
          contentType = thumbnailResponse.headers.get('Content-Type') || 'image/jpeg'
        } else {
          throw new Error('Thumbnail fetch failed')
        }
      } catch (error) {
        console.log('Thumbnail fetch failed, trying to use original file for small images')
        // If thumbnail fails and it's an image, try to use the original file (for small images)
        if (fileData.mimeType?.startsWith('image/')) {
          const fileResponse = await fetch(`https://www.googleapis.com/drive/v3/files/${resolvedParams.id}?alt=media`, {
            headers: {
              'Authorization': `Bearer ${session.accessToken}`,
            }
          })

          if (fileResponse.ok) {
            thumbnailBuffer = await fileResponse.arrayBuffer()
            contentType = fileData.mimeType
          } else {
            return NextResponse.json({ error: "Thumbnail not accessible" }, { status: 404 })
          }
        } else {
          return NextResponse.json({ error: "Thumbnail not accessible" }, { status: 404 })
        }
      }
    } else {
      // No thumbnail link available, try to use original file for images
      if (fileData.mimeType?.startsWith('image/')) {
        const fileResponse = await fetch(`https://www.googleapis.com/drive/v3/files/${resolvedParams.id}?alt=media`, {
          headers: {
            'Authorization': `Bearer ${session.accessToken}`,
          }
        })

        if (fileResponse.ok) {
          thumbnailBuffer = await fileResponse.arrayBuffer()
          contentType = fileData.mimeType
        } else {
          return NextResponse.json({ error: "No thumbnail available" }, { status: 404 })
        }
      } else {
        return NextResponse.json({ error: "No thumbnail available" }, { status: 404 })
      }
    }

    // Return the thumbnail with appropriate headers
    return new NextResponse(thumbnailBuffer, {
      headers: {
        'Content-Type': contentType,
        'Cache-Control': 'public, max-age=3600', // Cache for 1 hour
      }
    })

  } catch (error) {
    console.error("Error fetching thumbnail:", error)
    return NextResponse.json({ error: "Failed to fetch thumbnail" }, { status: 500 })
  }
}