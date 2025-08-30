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
    const searchQuery: any = {
      $and: [
        { shareCode: { $exists: true, $ne: null } },
        { $or: [{ isPublic: true }, { shareCode: { $exists: true } }] }
      ]
    }

    if (search) {
      searchQuery.$and.push({
        $or: [
          { name: { $regex: search, $options: 'i' } },
          { shareCode: { $regex: search, $options: 'i' } }
        ]
      })
    }

    // Get total count for pagination
    const totalCount = await File.countDocuments(searchQuery)
    const totalPages = Math.ceil(totalCount / limit)

    const shares = await File.find(searchQuery)
      .populate('owner', 'name username email')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit)

    return NextResponse.json({
      shares: shares.map(file => {
        try {
          return {
            _id: file._id.toString(),
            fileName: file.name,
            shareCode: file.shareCode,
            accessCount: file.accessCount || 0,
            reportCount: file.reportCount || 0,
            isBlocked: file.isBlocked || false,
            createdAt: file.createdAt.toISOString(),
            owner: file.owner ? {
              _id: file.owner._id.toString(),
              name: file.owner.name,
              username: file.owner.username,
              email: file.owner.email
            } : null,
            expiresAt: file.expiresAt?.toISOString() || null
          }
        } catch (error) {
          console.error('Error processing share file:', file._id, error)
          return null
        }
      }).filter(Boolean),
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
    console.error('Admin shares error:', error)
    return NextResponse.json(
      { message: 'Internal server error' },
      { status: 500 }
    )
  }
}
