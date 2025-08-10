import { NextRequest, NextResponse } from 'next/server'
import { initializeModels } from '@/models'

export async function GET(
  request: NextRequest,
  context: { params: Promise<{ folderId: string; fileId: string }> }
) {
  try {
    const { File } = await initializeModels()
    const { folderId, fileId } = await context.params

    // First, verify the folder is publicly shared
    const sharedFolder = await File.findOne({
      _id: folderId,
      type: 'folder',
      isPublic: true,
      isBlocked: false,
      shareCode: { $exists: true, $ne: null }
    })

    if (!sharedFolder) {
      return NextResponse.json({ message: 'Folder not found or not shared' }, { status: 404 })
    }

    // Find the specific file within the shared folder's hierarchy
    const file = await File.findOne({
      _id: fileId,
      owner: sharedFolder.owner,
      type: 'file',
      path: { $regex: `^${sharedFolder.path}` } // Must be within the shared folder
    })

    if (!file) {
      return NextResponse.json({ message: 'File not found' }, { status: 404 })
    }

    // Increment access count for the parent folder
    await File.findByIdAndUpdate(folderId, { $inc: { accessCount: 1 } })

    const fileData = {
      _id: file._id.toString(),
      name: file.name,
      content: file.content,
      language: file.language,
      size: file.size,
      createdAt: file.createdAt.toISOString(),
      updatedAt: file.updatedAt.toISOString()
    }

    return NextResponse.json(fileData)
  } catch (error) {
    console.error('Shared folder file error:', error)
    return NextResponse.json({ message: 'Internal server error' }, { status: 500 })
  }
}
