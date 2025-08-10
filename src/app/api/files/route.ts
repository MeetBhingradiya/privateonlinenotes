import { NextRequest, NextResponse } from 'next/server'
import jwt from 'jsonwebtoken'
import dbConnect from '@/lib/mongodb'
import { File } from '@/models/File'

export async function GET(request: NextRequest) {
  try {
    await dbConnect()
    
    const token = request.cookies.get('token')?.value
    if (!token) {
      return NextResponse.json({ message: 'Not authenticated' }, { status: 401 })
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET!) as { userId: string }
    const { searchParams } = new URL(request.url)
    const path = searchParams.get('path') || '/'

    const files = await File.find({
      owner: decoded.userId,
      path: new RegExp(`^${path.replace(/\//g, '\\/')}[^/]*$`)
    }).sort({ type: 1, name: 1 })

    return NextResponse.json(files)
  } catch (error) {
    console.error('Files fetch error:', error)
    return NextResponse.json({ message: 'Internal server error' }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    await dbConnect()
    
    const token = request.cookies.get('token')?.value
    if (!token) {
      return NextResponse.json({ message: 'Not authenticated' }, { status: 401 })
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET!) as { userId: string }
    const { name, type, path, content = '' } = await request.json()

    if (!name || !type || !path) {
      return NextResponse.json(
        { message: 'Name, type, and path are required' },
        { status: 400 }
      )
    }

    // Check if file/folder already exists
    const existing = await File.findOne({
      owner: decoded.userId,
      path,
    })

    if (existing) {
      return NextResponse.json(
        { message: 'A file or folder with this name already exists' },
        { status: 409 }
      )
    }

    const file = await File.create({
      name,
      type,
      path,
      content,
      owner: decoded.userId,
      language: type === 'file' ? getLanguageFromName(name) : undefined,
    })

    return NextResponse.json(file)
  } catch (error) {
    console.error('File creation error:', error)
    return NextResponse.json({ message: 'Internal server error' }, { status: 500 })
  }
}

function getLanguageFromName(filename: string): string {
  const ext = filename.split('.').pop()?.toLowerCase()
  const languageMap: Record<string, string> = {
    js: 'javascript',
    jsx: 'javascript',
    ts: 'typescript',
    tsx: 'typescript',
    py: 'python',
    html: 'html',
    css: 'css',
    scss: 'scss',
    json: 'json',
    md: 'markdown',
    xml: 'xml',
    sql: 'sql',
    yaml: 'yaml',
    yml: 'yaml',
    sh: 'shell',
    bash: 'shell',
    php: 'php',
    java: 'java',
    cpp: 'cpp',
    c: 'c',
    cs: 'csharp',
    go: 'go',
    rs: 'rust',
    rb: 'ruby',
    swift: 'swift',
    kt: 'kotlin',
    dart: 'dart',
  }
  return languageMap[ext || ''] || 'plaintext'
}
