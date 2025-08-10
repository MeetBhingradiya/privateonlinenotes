import { NextRequest, NextResponse } from 'next/server'
import jwt from 'jsonwebtoken'
import dbConnect from '@/lib/mongodb'
import { User } from '@/models/User'
import { File } from '@/models/File'

export async function GET(request: NextRequest) {
  try {
    await dbConnect()
    
    const token = request.cookies.get('token')?.value
    if (!token) {
      return NextResponse.json(
        { message: 'Not authenticated' },
        { status: 401 }
      )
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET!) as { userId: string }
    const adminUser = await User.findById(decoded.userId)
    
    if (!adminUser || adminUser.email !== 'admin@notta.in') {
      return NextResponse.json(
        { message: 'Access denied' },
        { status: 403 }
      )
    }

    const shares = await File.find({ isPublic: true })
      .populate('owner', 'name email')
      .sort({ createdAt: -1 })
      .limit(100)

    return NextResponse.json(shares.map(file => ({
      _id: file._id.toString(),
      name: file.name,
      shareCode: file.shareCode,
      accessCount: file.accessCount || 0,
      reportCount: file.reportCount || 0,
      isBlocked: file.isBlocked,
      createdAt: file.createdAt.toISOString(),
      owner: file.owner ? {
        _id: file.owner._id.toString(),
        name: file.owner.name,
        email: file.owner.email
      } : null,
      expiresAt: file.expiresAt?.toISOString() || null
    })))
  } catch (error) {
    console.error('Admin shares error:', error)
    return NextResponse.json(
      { message: 'Internal server error' },
      { status: 500 }
    )
  }
}
