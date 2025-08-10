import { NextRequest, NextResponse } from 'next/server'
import { initializeModels } from '@/models'

export async function GET(
  request: NextRequest,
  context: { params: Promise<{ folderId: string }> }
) {
  try {
    const { File } = await initializeModels()
    const { searchParams } = new URL(request.url)
    const path = searchParams.get('path') || '/'
    const { folderId } = await context.params

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

    // Find items in this path within the shared folder
    const targetPath = sharedFolder.path === '/' ? path : `${sharedFolder.path}${path === '/' ? '' : path}`
    
    const items = await File.find({
      owner: sharedFolder.owner,
      path: { $regex: `^${targetPath.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}` },
      $expr: {
        $eq: [
          { $size: { $split: [{ $substr: ['$path', targetPath.length] }, '/'] } },
          path === '/' ? 2 : 3
        ]
      }
    })
    .select('name type size createdAt updatedAt path')
    .sort({ type: -1, name: 1 }) // Folders first, then files
    .lean()

    const formattedItems = items.map((item: any) => ({
      _id: item._id.toString(),
      name: item.name,
      type: item.type,
      size: item.size,
      createdAt: item.createdAt.toISOString(),
      updatedAt: item.updatedAt.toISOString(),
      path: item.path
    }))

    return NextResponse.json(formattedItems)
  } catch (error) {
    console.error('Shared folder contents error:', error)
    return NextResponse.json({ message: 'Internal server error' }, { status: 500 })
  }
}
