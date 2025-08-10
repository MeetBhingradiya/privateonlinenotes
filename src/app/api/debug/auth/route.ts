import { NextRequest, NextResponse } from 'next/server'
import jwt from 'jsonwebtoken'

export async function GET(request: NextRequest) {
  const token = request.cookies.get('token')?.value
  
  if (!token) {
    return NextResponse.json({ 
      authenticated: false, 
      message: 'No token found' 
    })
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET!) as { userId: string, email: string }
    return NextResponse.json({ 
      authenticated: true, 
      userId: decoded.userId,
      email: decoded.email || 'Not available'
    })
  } catch (error) {
    return NextResponse.json({ 
      authenticated: false, 
      message: 'Invalid token',
      error: error instanceof Error ? error.message : 'Unknown error'
    })
  }
}
