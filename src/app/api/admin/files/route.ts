import { NextRequest, NextResponse } from 'next/server'
import jwt from 'jsonwebtoken'
import { initializeModels } from '@/models'

export async function GET(request: NextRequest) {
    try {
        const { User, File } = await initializeModels()

        const token = request.cookies.get('token')?.value
        if (!token) {
            return NextResponse.json(
                { message: 'Not authenticated' },
                { status: 401 }
            )
        }

        const decoded = jwt.verify(token, process.env.JWT_SECRET!) as { userId: string }
        const adminUser = await User.findById(decoded.userId)

        if (!adminUser || adminUser.username !== 'admin') {
            return NextResponse.json(
                { message: 'Access denied' },
                { status: 403 }
            )
        }

        // Pagination parameters
        const url = new URL(request.url)
        const page = parseInt(url.searchParams.get('page') || '1')
        const limit = parseInt(url.searchParams.get('limit') || '20')
        const search = url.searchParams.get('search') || ''
        const skip = (page - 1) * limit

        // Build search query
        let searchQuery = {}
        if (search) {
            searchQuery = {
                $or: [
                    { name: { $regex: search, $options: 'i' } },
                    { path: { $regex: search, $options: 'i' } },
                    { language: { $regex: search, $options: 'i' } }
                ]
            }
        }

        // Get total count for pagination
        const totalCount = await File.countDocuments(searchQuery)
        const totalPages = Math.ceil(totalCount / limit)

        // Get files WITHOUT content to improve performance
        const files = await File.find(searchQuery)
            .select('-content') // Exclude content field for metadata listing
            .populate('owner', 'name username email')
            .sort({ createdAt: -1 })
            .skip(skip)
            .limit(limit)

        return NextResponse.json({
            files: files.map(file => ({
                _id: file._id.toString(),
                name: file.name,
                type: file.type,
                size: file.size,
                isPublic: file.isPublic,
                isBlocked: file.isBlocked,
                accessCount: file.accessCount || 0,
                reportCount: file.reportCount || 0,
                shareCode: file.shareCode,
                slug: file.slug,
                language: file.language,
                path: file.path,
                // Content is excluded for performance - use separate endpoint to get content
                createdAt: file.createdAt.toISOString(),
                updatedAt: file.updatedAt?.toISOString() || file.createdAt.toISOString(),
                owner: file.owner ? {
                    _id: file.owner._id.toString(),
                    name: file.owner.name,
                    username: file.owner.username,
                    email: file.owner.email
                } : null,
                expiresAt: file.expiresAt?.toISOString() || null
            })),
            pagination: {
                currentPage: page,
                totalPages,
                totalCount,
                hasNextPage: page < totalPages,
                hasPrevPage: page > 1,
                limit
            }
        })
    } catch (error) {
        console.error('Admin files error:', error)
        return NextResponse.json(
            { message: 'Internal server error' },
            { status: 500 }
        )
    }
}
