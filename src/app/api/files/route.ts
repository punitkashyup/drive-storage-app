import { NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { GoogleDriveService } from "@/lib/google-drive"

export async function GET() {
  try {
    const session = await getServerSession(authOptions)

    if (!session?.accessToken) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const driveService = new GoogleDriveService(session.accessToken)
    const files = await driveService.listFiles(process.env.GOOGLE_DRIVE_FOLDER_ID)

    return NextResponse.json({ files })
  } catch (error) {
    console.error("Error fetching files:", error)
    return NextResponse.json(
      { error: "Failed to fetch files" },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)

    console.log('Session:', {
      exists: !!session,
      hasAccessToken: !!session?.accessToken,
      tokenLength: session?.accessToken?.length,
      user: session?.user?.email,
      error: session?.error
    })

    if (!session?.accessToken || session.error === "RefreshAccessTokenError") {
      return NextResponse.json({
        error: "Authentication failed. Please sign out and sign in again."
      }, { status: 401 })
    }

    const formData = await request.formData()
    const file = formData.get("file") as File

    if (!file) {
      return NextResponse.json({ error: "No file provided" }, { status: 400 })
    }

    console.log('Using access token (first 20 chars):', session.accessToken.substring(0, 20) + '...')
    const driveService = new GoogleDriveService(session.accessToken)
    const uploadedFile = await driveService.uploadFile(file, process.env.GOOGLE_DRIVE_FOLDER_ID)

    return NextResponse.json({ file: uploadedFile })
  } catch (error) {
    console.error("Error uploading file:", error)
    return NextResponse.json(
      { error: "Failed to upload file" },
      { status: 500 }
    )
  }
}