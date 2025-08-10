import { NextRequest, NextResponse } from 'next/server'
import jwt from 'jsonwebtoken'
import { initializeModels } from '@/models'

export async function POST(
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

        // Remove sharing attributes
        file.shareCode = undefined
        file.slug = undefined
        file.isPublic = false
        await file.save()

        return NextResponse.json({ message: 'File unshared successfully' })
    } catch (error) {
        console.error('Unshare file error:', error)
        return NextResponse.json({ message: 'Internal server error' }, { status: 500 })
    }
}
