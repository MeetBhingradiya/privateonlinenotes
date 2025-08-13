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
                { message: 'Invalid or expired reset token' },
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
        })

        return NextResponse.json({ 
            message: 'Password reset successfully' 
        })

    } catch (error) {
        console.error('Reset password error:', error)
        
        if (error instanceof z.ZodError) {
            return NextResponse.json(
                { message: 'Invalid request data' },
                { status: 400 }
            )
        }

        return NextResponse.json(
            { message: 'Internal server error' },
            { status: 500 }
        )
    }
}
