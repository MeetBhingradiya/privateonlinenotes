import { NextRequest, NextResponse } from 'next/server'
import jwt from 'jsonwebtoken'
import dbConnect from '@/lib/mongodb'
import { User } from '@/models/User'

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    await dbConnect()
    
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
    
    if (!adminUser || adminUser.email !== 'admin@notta.in') {
      return NextResponse.json(
        { message: 'Access denied' },
        { status: 403 }
      )
    }

    await User.findByIdAndUpdate(id, { isBlocked: false })

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Unblock user error:', error)
    return NextResponse.json(
      { message: 'Internal server error' },
      { status: 500 }
    )
  }
}
