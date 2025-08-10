import { NextRequest, NextResponse } from 'next/server'
import jwt from 'jsonwebtoken'
import { initializeModels } from '@/models'

export async function PUT(request: NextRequest) {
  try {
    const { User } = await initializeModels()
    
    const token = request.cookies.get('token')?.value
    if (!token) {
      return NextResponse.json({ message: 'Not authenticated' }, { status: 401 })
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET!) as { userId: string }
    const { name, email } = await request.json()

    if (!name || !email) {
      return NextResponse.json(
        { message: 'Name and email are required' },
        { status: 400 }
      )
    }

    // Check if email is already taken by another user
    const existingUser = await User.findOne({ 
      email, 
      _id: { $ne: decoded.userId } 
    })

    if (existingUser) {
      return NextResponse.json(
        { message: 'Email is already taken' },
        { status: 409 }
      )
    }

    const user = await User.findByIdAndUpdate(
      decoded.userId,
      { name, email },
      { new: true }
    ).select('-password')

    if (!user) {
      return NextResponse.json({ message: 'User not found' }, { status: 404 })
    }

    return NextResponse.json({
      id: user._id,
      email: user.email,
      name: user.name,
      plan: user.plan,
      avatar: user.avatar,
    })
  } catch (error) {
    console.error('Profile update error:', error)
    return NextResponse.json({ message: 'Internal server error' }, { status: 500 })
  }
}
