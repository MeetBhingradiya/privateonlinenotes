import { NextRequest, NextResponse } from 'next/server'
import jwt from 'jsonwebtoken'
import { initializeModels } from '@/models'

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { User, File } = await initializeModels()
    
    const { id } = await params
    
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

    // Check if target user exists
    const targetUser = await User.findById(id)
    if (!targetUser) {
      return NextResponse.json(
        { message: 'User not found' },
        { status: 404 }
      )
    }

    // Prevent admin from deleting their own files accidentally
    if (targetUser.username === 'admin') {
      return NextResponse.json(
        { message: 'Cannot delete admin user files' },
        { status: 403 }
      )
    }

    // Delete all files belonging to this user
    const deleteResult = await File.deleteMany({ owner: id })

    return NextResponse.json({
      success: true,
      deletedCount: deleteResult.deletedCount,
      user: {
        id: targetUser._id,
        name: targetUser.name,
        username: targetUser.username,
        email: targetUser.email
      }
    })
  } catch (error) {
    console.error('Delete user files error:', error)
    return NextResponse.json(
      { message: 'Internal server error' },
      { status: 500 }
    )
  }
}
