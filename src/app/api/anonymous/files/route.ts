import { NextRequest, NextResponse } from 'next/server'
import dbConnect from '@/lib/mongodb'
import { File } from '@/models/File'
import { randomBytes } from 'crypto'

export async function POST(request: NextRequest) {
  try {
    await dbConnect()
    
    const { name, content, language, expiryHours } = await request.json()

    if (!name || !content) {
      return NextResponse.json(
        { message: 'Name and content are required' },
        { status: 400 }
      )
    }

    const shareCode = randomBytes(16).toString('hex')
    let expiresAt = null
    
    if (expiryHours > 0) {
      expiresAt = new Date()
      expiresAt.setHours(expiresAt.getHours() + expiryHours)
    }

    const file = new File({
      name,
      content,
      type: 'file',
      language: language || 'plaintext',
      size: Buffer.byteLength(content, 'utf8'),
      owner: null, // Anonymous file
      path: '/anonymous',
      isPublic: true,
      shareCode,
      expiresAt,
    })

    await file.save()

    return NextResponse.json({
      _id: file._id,
      name: file.name,
      content: file.content,
      language: file.language,
      shareCode: file.shareCode,
      expiresAt: file.expiresAt,
      createdAt: file.createdAt,
    })
  } catch (error) {
    console.error('Anonymous file creation error:', error)
    return NextResponse.json(
      { message: 'Internal server error' },
      { status: 500 }
    )
  }
}
