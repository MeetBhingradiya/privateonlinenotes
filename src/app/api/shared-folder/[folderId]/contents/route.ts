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

        // Normalize target path (ensure it ends with / for proper matching)
        const normalizedTargetPath = targetPath.endsWith('/') ? targetPath : `${targetPath}/`

        // Find all files within the owner's files
        const allFiles = await File.find({
            owner: sharedFolder.owner,
            path: { $regex: `^${normalizedTargetPath.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}` }
        })
            .select('name type size createdAt updatedAt path')
            .lean()

        // Filter to get only direct children (not nested subdirectories)
        const items = allFiles.filter((item: any) => {
            const relativePath = item.path.substring(normalizedTargetPath.length)
            const pathSegments = relativePath.split('/').filter((segment: string) => segment.length > 0)

            // For direct children, we should have exactly 0 path segments (files in current dir)
            // or 1 path segment (subdirectories)
            return pathSegments.length <= 1
        })

        // Sort: folders first, then files alphabetically
        const sortedItems = items.sort((a: any, b: any) => {
            if (a.type !== b.type) {
                return a.type === 'folder' ? -1 : 1
            }
            return a.name.localeCompare(b.name)
        })

        const formattedItems = sortedItems.map((item: any) => ({
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
