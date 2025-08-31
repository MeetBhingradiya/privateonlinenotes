import { NextRequest, NextResponse } from 'next/server'
import jwt from 'jsonwebtoken'
import { initializeModels } from '@/models'

export async function PATCH(
    request: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const { User, File } = await initializeModels()

        const { id } = await params
        const updates = await request.json()

        const token = request.cookies.get('token')?.value
        if (!token) {
            return NextResponse.json(
                { message: 'Not authenticated' },
                { status: 401 }
            )
        }

        const decoded = jwt.verify(token, process.env.JWT_SECRET!) as { userId: string }
        const adminUser = await User.findById(decoded.userId)

        if (!adminUser || adminUser.username !== 'admin') {
            return NextResponse.json(
                { message: 'Access denied' },
                { status: 403 }
            )
        }

        // Validate and sanitize updates
        const allowedUpdates = ['name', 'language']
        const filteredUpdates: any = {}

        for (const key of allowedUpdates) {
            if (updates[key] !== undefined) {
                filteredUpdates[key] = updates[key]
            }
        }

        if (Object.keys(filteredUpdates).length === 0) {
            return NextResponse.json(
                { message: 'No valid updates provided' },
                { status: 400 }
            )
        }

        // Add update timestamp
        filteredUpdates.updatedAt = new Date()

        const updatedFile = await File.findByIdAndUpdate(
            id,
            filteredUpdates,
            { new: true }
        )

        if (!updatedFile) {
            return NextResponse.json(
                { message: 'File not found' },
                { status: 404 }
            )
        }

        return NextResponse.json({
            success: true,
            file: updatedFile
        })
    } catch (error) {
        console.error('Update file error:', error)
        return NextResponse.json(
            { message: 'Internal server error' },
            { status: 500 }
        )
    }
}
