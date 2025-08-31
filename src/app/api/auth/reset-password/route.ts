import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'
import { initializeModels } from '@/models'
import bcrypt from 'bcryptjs'

const resetPasswordSchema = z.object({
    token: z.string().min(1, 'Token is required'),
    password: z.string().min(6, 'Password must be at least 6 characters'),
})

export async function POST(request: NextRequest) {
    try {
        const body = await request.json()
        const { token, password } = resetPasswordSchema.parse(body)

        const { User } = await initializeModels()

        // Find user by reset token and check if it's not expired
        const user = await User.findOne({
            resetToken: token,
            resetTokenExpiry: { $gt: new Date() },
        })

        if (!user) {
            return NextResponse.json(
                { message: 'Invalid or expired reset token. Please request a new password reset.' },
                { status: 400 }
            )
        }

        // Check if the new password is different from the current one
        const isSamePassword = await bcrypt.compare(password, user.password)
        if (isSamePassword) {
            return NextResponse.json(
                { message: 'New password must be different from your current password' },
                { status: 400 }
            )
        }

        // Hash the new password
        const hashedPassword = await bcrypt.hash(password, 12)

        // Update user password and clear reset token
        await User.findByIdAndUpdate(user._id, {
            password: hashedPassword,
            resetToken: undefined,
            resetTokenExpiry: undefined,
            updatedAt: new Date(),
        })

        console.log(`Password reset successfully for user: ${user.username}`)

        return NextResponse.json({ 
            message: 'Password reset successfully',
            success: true
        })

    } catch (error) {
        console.error('Reset password error:', error)
        
        if (error instanceof z.ZodError) {
            return NextResponse.json(
                { message: error.issues[0].message },
                { status: 400 }
            )
        }

        return NextResponse.json(
            { message: 'Internal server error' },
            { status: 500 }
        )
    }
}

// Add a GET endpoint to verify token validity
export async function GET(request: NextRequest) {
    try {
        const { searchParams } = new URL(request.url)
        const token = searchParams.get('token')

        if (!token) {
            return NextResponse.json(
                { message: 'Token is required', valid: false },
                { status: 400 }
            )
        }

        const { User } = await initializeModels()

        // Check if token exists and is not expired
        const user = await User.findOne({
            resetToken: token,
            resetTokenExpiry: { $gt: new Date() },
        })

        if (!user) {
            return NextResponse.json({
                message: 'Invalid or expired reset token',
                valid: false
            })
        }

        return NextResponse.json({
            message: 'Token is valid',
            valid: true
        })

    } catch (error) {
        console.error('Token verification error:', error)
        return NextResponse.json(
            { message: 'Internal server error', valid: false },
            { status: 500 }
        )
    }
}
