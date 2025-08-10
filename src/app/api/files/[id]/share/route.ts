import { NextRequest, NextResponse } from 'next/server'
import jwt from 'jsonwebtoken'
import dbConnect from '@/lib/mongodb'
import { File } from '@/models/File'
import { randomBytes } from 'crypto'

export async function POST(
  request: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    await dbConnect()
    
    const token = request.cookies.get('token')?.value
    if (!token) {
      return NextResponse.json({ message: 'Not authenticated' }, { status: 401 })
    }

    const { id } = await context.params
    const decoded = jwt.verify(token, process.env.JWT_SECRET!) as { userId: string }
    const file = await File.findOne({
      _id: id,
      owner: decoded.userId,
    })

    if (!file) {
      return NextResponse.json({ message: 'File not found' }, { status: 404 })
    }

    if (file.type !== 'file') {
      return NextResponse.json({ message: 'Can only share files' }, { status: 400 })
    }

    // Generate share code if doesn't exist
    if (!file.shareCode) {
      file.shareCode = randomBytes(16).toString('hex')
      file.isPublic = true
      await file.save()
    }

    return NextResponse.json({ shareCode: file.shareCode })
  } catch (error) {
    console.error('File share error:', error)
    return NextResponse.json({ message: 'Internal server error' }, { status: 500 })
  }
}
