import { NextRequest, NextResponse } from 'next/server'
import jwt from 'jsonwebtoken'
import { initializeModels } from '@/models'

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { User } = await initializeModels()
    
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

    const { plan } = await request.json()
    
    if (!plan || !['free', 'premium', 'enterprise'].includes(plan)) {
      return NextResponse.json(
        { message: 'Invalid plan. Must be free, premium, or enterprise' },
        { status: 400 }
      )
    }

    const updatedUser = await User.findByIdAndUpdate(
      id,
      { plan, updatedAt: new Date() },
      { new: true }
    )

    if (!updatedUser) {
      return NextResponse.json(
        { message: 'User not found' },
        { status: 404 }
      )
    }

    return NextResponse.json({
      success: true,
      user: {
        id: updatedUser._id,
        name: updatedUser.name,
        username: updatedUser.username,
        email: updatedUser.email,
        plan: updatedUser.plan
      }
    })
  } catch (error) {
    console.error('Update user plan error:', error)
    return NextResponse.json(
      { message: 'Internal server error' },
      { status: 500 }
    )
  }
}
