import { NextRequest, NextResponse } from 'next/server'
import jwt from 'jsonwebtoken'
import { initializeModels } from '@/models'

export async function GET(request: NextRequest) {
    try {
        const { File } = await initializeModels()

        const token = request.cookies.get('token')?.value
        if (!token) {
            return NextResponse.json({ message: 'Not authenticated' }, { status: 401 })
        }

        const decoded = jwt.verify(token, process.env.JWT_SECRET!) as { userId: string }

        // Find all files owned by the user that have been shared (have shareCode)
        const sharedFiles = await File.find({
            owner: decoded.userId,
            shareCode: { $exists: true, $ne: null },
            isBlocked: false
        })
            .select('name type slug shareCode isPublic accessCount createdAt updatedAt size language')
            .sort({ updatedAt: -1 })
            .lean()

        const formattedFiles = sharedFiles.map((file: any) => ({
            _id: file._id.toString(),
            name: file.name,
            type: file.type,
            slug: file.slug,
            shareCode: file.shareCode,
            isPublic: file.isPublic,
            accessCount: file.accessCount || 0,
            createdAt: file.createdAt.toISOString(),
            updatedAt: file.updatedAt.toISOString(),
            size: file.size,
            language: file.language
        }))

        return NextResponse.json(formattedFiles)
    } catch (error) {
        console.error('Shared files API error:', error)
        return NextResponse.json({ message: 'Internal server error' }, { status: 500 })
    }
}
