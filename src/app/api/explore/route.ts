import { NextRequest, NextResponse } from 'next/server'
import { initializeModels } from '@/models'

export async function GET(request: NextRequest) {
    try {
        const { File } = await initializeModels()
        const { searchParams } = new URL(request.url)
        const sort = searchParams.get('sort') || 'recent'
        const limit = parseInt(searchParams.get('limit') || '50')

        // Only return public files that are not blocked and have slugs
        const query = {
            isPublic: true,
            isBlocked: false,
            slug: { $exists: true, $ne: null }
        }

        let sortOptions: any = { createdAt: -1 } // Default: recent

        switch (sort) {
            case 'popular':
                sortOptions = { accessCount: -1, createdAt: -1 }
                break
            case 'name':
                sortOptions = { name: 1 }
                break
            case 'recent':
            default:
                sortOptions = { createdAt: -1 }
                break
        }

        const files = await File.find(query)
            .populate('owner', 'name')
            .select('name type slug language size accessCount createdAt updatedAt owner')
            .sort(sortOptions)
            .limit(limit)
            .lean()

        // Filter out files where owner is null (orphaned files)
        const validFiles = files.filter((file: any) => file.owner)

        const formattedFiles = validFiles.map((file: any) => ({
            _id: file._id.toString(),
            name: file.name,
            type: file.type,
            slug: file.slug,
            language: file.language || 'plaintext',
            size: file.size,
            accessCount: file.accessCount || 0,
            createdAt: file.createdAt.toISOString(),
            updatedAt: file.updatedAt.toISOString(),
            owner: {
                name: file.owner.name
            }
        }))

        return NextResponse.json(formattedFiles)
    } catch (error) {
        console.error('Explore API error:', error)
        return NextResponse.json({ message: 'Internal server error' }, { status: 500 })
    }
}
