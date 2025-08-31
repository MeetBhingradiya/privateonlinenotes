import { NextRequest, NextResponse } from 'next/server'
import jwt from 'jsonwebtoken'
import { initializeModels } from '@/models'

export async function PATCH(
    request: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const { User } = await initializeModels()
        const { id } = await params

        // Check authentication
        const token = request.cookies.get('token')?.value
        if (!token) {
            return NextResponse.json(
                { message: 'Not authenticated' },
                { status: 401 }
            )
        }

        const decoded = jwt.verify(token, process.env.JWT_SECRET!) as { userId: string }
        const adminUser = await User.findById(decoded.userId)

        // Check if user is admin
        if (!adminUser || adminUser.username !== 'admin') {
            return NextResponse.json(
                { message: 'Access denied - Admin access required' },
                { status: 403 }
            )
        }

        const { role } = await request.json()

        // Validate role
        if (!role || !['user', 'moderator', 'admin'].includes(role)) {
            return NextResponse.json(
                { message: 'Invalid role. Must be user, moderator, or admin' },
                { status: 400 }
            )
        }

        // Find and update user
        const user = await User.findByIdAndUpdate(
            id,
            { role, updatedAt: new Date() },
            { new: true }
        ).select('-password')

        if (!user) {
            return NextResponse.json(
                { message: 'User not found' },
                { status: 404 }
            )
        }

        return NextResponse.json({
            message: 'User role updated successfully',
            user: {
                _id: user._id,
                name: user.name,
                username: user.username,
                email: user.email,
                plan: user.plan,
                role: user.role,
                isBlocked: user.isBlocked,
                createdAt: user.createdAt,
                updatedAt: user.updatedAt
            }
        })

    } catch (error) {
        console.error('Update user role error:', error)
        return NextResponse.json(
            { message: 'Internal server error' },
            { status: 500 }
        )
    }
}
