import { NextRequest, NextResponse } from 'next/server'
import jwt from 'jsonwebtoken'
import { initializeModels } from '@/models'

export async function GET(
  request: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const { File } = await initializeModels()
    
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

    return NextResponse.json(file)
  } catch (error) {
    console.error('File fetch error:', error)
    return NextResponse.json({ message: 'Internal server error' }, { status: 500 })
  }
}

export async function PUT(
  request: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const { File } = await initializeModels()
    
    const token = request.cookies.get('token')?.value
    if (!token) {
      return NextResponse.json({ message: 'Not authenticated' }, { status: 401 })
    }

    const { id } = await context.params
    const decoded = jwt.verify(token, process.env.JWT_SECRET!) as { userId: string }
    const body = await request.json()
    const { content, language } = body

    const file = await File.findOne({
      _id: id,
      owner: decoded.userId,
    })

    if (!file) {
      return NextResponse.json({ message: 'File not found' }, { status: 404 })
    }

    // Handle content updates
    if (content !== undefined) {
      // Save current version before updating
      if (file.content !== content) {
        file.versions.push({
          content: file.content,
          createdAt: new Date(),
          createdBy: decoded.userId,
        })

        // Keep only last 5 versions
        if (file.versions.length > 5) {
          file.versions = file.versions.slice(-5)
        }
      }

      file.content = content
      file.updatedAt = new Date()
    }

    // Handle language updates
    if (language !== undefined) {
      file.language = language
    }

    await file.save()

    return NextResponse.json(file)
  } catch (error) {
    console.error('File update error:', error)
    return NextResponse.json({ message: 'Internal server error' }, { status: 500 })
  }
}

export async function DELETE(
  request: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const { File } = await initializeModels()
    
    const token = request.cookies.get('token')?.value
    if (!token) {
      return NextResponse.json({ message: 'Not authenticated' }, { status: 401 })
    }

    const { id } = await context.params
    const decoded = jwt.verify(token, process.env.JWT_SECRET!) as { userId: string }
    const file = await File.findOneAndDelete({
      _id: id,
      owner: decoded.userId,
    })

    if (!file) {
      return NextResponse.json({ message: 'File not found' }, { status: 404 })
    }

    // If it's a folder, delete all files inside it
    if (file.type === 'folder') {
      await File.deleteMany({
        owner: decoded.userId,
        path: new RegExp(`^${file.path.replace(/\//g, '\\/')}/`)
      })
    }

    return NextResponse.json({ message: 'File deleted successfully' })
  } catch (error) {
    console.error('File deletion error:', error)
    return NextResponse.json({ message: 'Internal server error' }, { status: 500 })
  }
}
