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
    const fileStream = await driveService.downloadFile(resolvedParams.id)

    return new NextResponse(fileStream as BodyInit, {
      headers: {
        "Content-Type": "application/octet-stream",
        "Content-Disposition": "attachment"
      }
    })
  } catch (error) {
    console.error("Error downloading file:", error)
    return NextResponse.json(
      { error: "Failed to download file" },
      { status: 500 }
    )
  }
}

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession(authOptions)

    if (!session?.accessToken) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { name } = await request.json()

    if (!name) {
      return NextResponse.json({ error: "Name is required" }, { status: 400 })
    }

    const resolvedParams = await params
    const driveService = new GoogleDriveService(session.accessToken)
    const updatedFile = await driveService.renameFile(resolvedParams.id, name)

    return NextResponse.json({ file: updatedFile })
  } catch (error: unknown) {
    console.error("Error renaming file:", error)
    return NextResponse.json(
      { error: `Failed to rename file: ${error instanceof Error ? error.message : 'Unknown error'}` },
      { status: 500 }
    )
  }
}

export async function DELETE(
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
    await driveService.deleteFile(resolvedParams.id)

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("Error deleting file:", error)
    return NextResponse.json(
      { error: "Failed to delete file" },
      { status: 500 }
    )
  }
}