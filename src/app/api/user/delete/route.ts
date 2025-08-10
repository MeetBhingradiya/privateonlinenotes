import { NextRequest, NextResponse } from 'next/server'
import jwt from 'jsonwebtoken'
import dbConnect from '@/lib/mongodb'
import { User } from '@/models/User'
import { File } from '@/models/File'

export async function DELETE(request: NextRequest) {
  try {
    await dbConnect()
    
    const token = request.cookies.get('token')?.value
    if (!token) {
      return NextResponse.json({ message: 'Not authenticated' }, { status: 401 })
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET!) as { userId: string }

    // Delete all files owned by the user
    await File.deleteMany({ owner: decoded.userId })

    // Delete the user account
    await User.findByIdAndDelete(decoded.userId)

    const response = NextResponse.json({ message: 'Account deleted successfully' })
    
    // Clear the authentication cookie
    response.cookies.set('token', '', {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 0,
    })

    return response
  } catch (error) {
    console.error('Account deletion error:', error)
    return NextResponse.json({ message: 'Internal server error' }, { status: 500 })
  }
}
