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
    const user = await User.findById(decoded.userId).select('-password')

    if (!user) {
      return NextResponse.json(
        { message: 'User not found' },
        { status: 404 }
      )
    }

    return NextResponse.json({
      id: user._id,
      email: user.email,
      name: user.name,
      plan: user.plan,
      avatar: user.avatar,
    })
  } catch (error) {
    console.error('Auth check error:', error)
    return NextResponse.json(
      { message: 'Invalid token' },
      { status: 401 }
    )
  }
}
