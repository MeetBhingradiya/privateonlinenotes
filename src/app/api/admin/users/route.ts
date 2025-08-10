import { NextRequest, NextResponse } from 'next/server'
import jwt from 'jsonwebtoken'
import { initializeModels } from '@/models'

export async function GET(request: NextRequest) {
  try {
    const { User } = await initializeModels()
    
    const token = request.cookies.get('token')?.value
    if (!token) {
      return NextResponse.json(
        { message: 'Not authenticated' },
        { status: 401 }
      )
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET!) as { userId: string }
    const adminUser = await User.findById(decoded.userId)
    
    // Check if user is admin
    if (!adminUser || adminUser.email !== 'admin@notta.in') {
      return NextResponse.json(
        { message: 'Access denied' },
        { status: 403 }
      )
    }

    // Get all users with file counts
    const users = await User.aggregate([
      {
        $lookup: {
          from: 'files',
          localField: '_id',
          foreignField: 'owner',
          as: 'files'
        }
      },
      {
        $project: {
          name: 1,
          email: 1,
          plan: 1,
          createdAt: 1,
          isBlocked: 1,
          filesCount: { $size: '$files' }
        }
      },
      { $sort: { createdAt: -1 } }
    ])

    return NextResponse.json(users)
  } catch (error) {
    console.error('Admin users fetch error:', error)
    return NextResponse.json(
      { message: 'Internal server error' },
      { status: 500 }
    )
  }
}
