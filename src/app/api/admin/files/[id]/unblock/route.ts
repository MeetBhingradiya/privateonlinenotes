import { NextRequest, NextResponse } from 'next/server'
import jwt from 'jsonwebtoken'
import { initializeModels } from '@/models'

export async function POST(
  request: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
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

    const { id } = await context.params
    const file = await File.findByIdAndUpdate(
      id,
      { isBlocked: false },
      { new: true }
    )

    if (!file) {
      return NextResponse.json(
        { message: 'File not found' },
        { status: 404 }
      )
    }

    return NextResponse.json({
      message: 'File unblocked successfully',
      file: {
        _id: file._id.toString(),
        name: file.name,
        isBlocked: file.isBlocked
      }
    })
  } catch (error) {
    console.error('Admin unblock file error:', error)
    return NextResponse.json(
      { message: 'Internal server error' },
      { status: 500 }
    )
  }
}
