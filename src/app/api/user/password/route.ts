import { NextRequest, NextResponse } from 'next/server'
import jwt from 'jsonwebtoken'
import bcrypt from 'bcryptjs'
import { initializeModels } from '@/models'
import { z } from 'zod'

const passwordChangeSchema = z.object({
    currentPassword: z.string().min(1, 'Current password is required'),
    newPassword: z.string().min(6, 'New password must be at least 6 characters long'),
})

export async function PUT(request: NextRequest) {
    try {
        const { User } = await initializeModels()
        
        // Check authentication
        const token = request.cookies.get('token')?.value
        if (!token) {
            return NextResponse.json({ message: 'Not authenticated' }, { status: 401 })
        }

        let decoded: { userId: string }
        try {
            decoded = jwt.verify(token, process.env.JWT_SECRET!) as { userId: string }
        } catch (jwtError) {
            console.error('JWT verification failed:', jwtError)
            return NextResponse.json({ message: 'Invalid authentication token' }, { status: 401 })
        }

        // Parse and validate request body
        const body = await request.json()
        const { currentPassword, newPassword } = passwordChangeSchema.parse(body)

        // Find user
        const user = await User.findById(decoded.userId)
        if (!user) {
            return NextResponse.json({ message: 'User not found' }, { status: 404 })
        }

        // Verify current password
        const isValidPassword = await bcrypt.compare(currentPassword, user.password)
        if (!isValidPassword) {
            return NextResponse.json(
                { message: 'Current password is incorrect' },
                { status: 400 }
            )
        }

        // Check if new password is different from current password
        const isSamePassword = await bcrypt.compare(newPassword, user.password)
        if (isSamePassword) {
            return NextResponse.json(
                { message: 'New password must be different from current password' },
                { status: 400 }
            )
        }

        // Hash and update new password
        const hashedNewPassword = await bcrypt.hash(newPassword, 12)
        await User.findByIdAndUpdate(decoded.userId, {
            password: hashedNewPassword,
            updatedAt: new Date(),
        })

        console.log(`Password updated successfully for user: ${user.username}`)
        
        return NextResponse.json({ 
            message: 'Password updated successfully',
            success: true
        })

    } catch (error) {
        console.error('Password update error:', error)
        
        if (error instanceof z.ZodError) {
            return NextResponse.json(
                { message: error.issues[0].message },
                { status: 400 }
            )
        }

        if (error instanceof jwt.JsonWebTokenError) {
            return NextResponse.json(
                { message: 'Invalid authentication token' },
                { status: 401 }
            )
        }

        return NextResponse.json(
            { message: 'Internal server error' },
            { status: 500 }
        )
    }
}
