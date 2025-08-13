import { NextRequest, NextResponse } from 'next/server'
import bcrypt from 'bcryptjs'
import jwt from 'jsonwebtoken'
import { initializeModels } from '@/models'

export async function POST(request: NextRequest) {
  try {
    const { User } = await initializeModels()
    
    const { name, username, email, password } = await request.json()

    if (!username || !password) {
      return NextResponse.json(
        { message: 'Username and password are required' },
        { status: 400 }
      )
    }

    if (password.length < 6) {
      return NextResponse.json(
        { message: 'Password must be at least 6 characters long' },
        { status: 400 }
      )
    }

    // Validate username format
    if (!/^[a-zA-Z0-9_]+$/.test(username)) {
      return NextResponse.json(
        { message: 'Username can only contain letters, numbers, and underscores' },
        { status: 400 }
      )
    }

    if (username.length < 3 || username.length > 30) {
      return NextResponse.json(
        { message: 'Username must be between 3 and 30 characters' },
        { status: 400 }
      )
    }

    // Check for existing username
    const existingUsername = await User.findOne({ username: username.toLowerCase() })
    if (existingUsername) {
      return NextResponse.json(
        { message: 'Username is already taken' },
        { status: 409 }
      )
    }

    // Check for existing email only if email is provided
    if (email && email.trim() !== '') {
      const existingUser = await User.findOne({ email })
      if (existingUser) {
        return NextResponse.json(
          { message: 'User already exists with this email' },
          { status: 409 }
        )
      }
    }

    const hashedPassword = await bcrypt.hash(password, 12)

    const user = await User.create({
      name: name && name.trim() !== '' ? name : undefined,
      username: username.toLowerCase(),
      email: email && email.trim() !== '' ? email : undefined,
      password: hashedPassword,
    })

    const token = jwt.sign(
      { userId: user._id },
      process.env.JWT_SECRET!,
      { expiresIn: '1h' }
    )

    const response = NextResponse.json({
      id: user._id,
      email: user.email,
      username: user.username,
      name: user.name,
      plan: user.plan,
      avatar: user.avatar,
    })

    response.cookies.set('token', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 60 * 60, // 1 hour
    })

    return response
  } catch (error) {
    console.error('Registration error:', error)
    return NextResponse.json(
      { message: 'Internal server error' },
      { status: 500 }
    )
  }
}
