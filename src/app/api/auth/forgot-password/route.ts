import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'
import { initializeModels } from '@/models'
import { emailService } from '@/lib/email'
import crypto from 'crypto'

const forgotPasswordSchema = z.object({
    email: z.string().email('Please enter a valid email'),
})

export async function POST(request: NextRequest) {
    try {
        const body = await request.json()
        const { email } = forgotPasswordSchema.parse(body)

        const { User } = await initializeModels()

        // Find user by email
        const user = await User.findOne({ email: email.toLowerCase() })
        
        if (!user) {
            // Don't reveal whether the email exists or not for security
            return NextResponse.json({ 
                message: 'If an account with that email exists, we\'ve sent a password reset link.' 
            })
        }

        // Generate reset token (expires in 1 hour)
        const resetToken = crypto.randomBytes(32).toString('hex')
        const resetTokenExpiry = new Date(Date.now() + 60 * 60 * 1000) // 1 hour

        // Update user with reset token
        await User.findByIdAndUpdate(user._id, {
            resetToken,
            resetTokenExpiry,
        })

        // Create reset link
        const resetLink = `${request.nextUrl.origin}/auth/reset-password?token=${resetToken}`
        
        // Send password reset email
        const emailResult = await emailService.sendPasswordResetEmail(
            email, 
            resetLink, 
            user.username
        )

        if (!emailResult.success) {
            console.error('Failed to send password reset email:', emailResult.error)
            // In production, you might want to still return success to not reveal if email exists
            // For now, we'll return an error to help with debugging
            return NextResponse.json(
                { message: 'Failed to send reset email. Please try again later.' },
                { status: 500 }
            )
        }

        return NextResponse.json({ 
            message: 'If an account with that email exists, we\'ve sent a password reset link.',
            // For development only - remove in production
            // resetLink: process.env.NODE_ENV === 'development' ? resetLink : undefined
        })

    } catch (error) {
        console.error('Forgot password error:', error)
        
        if (error instanceof z.ZodError) {
            return NextResponse.json(
                { message: 'Invalid email address' },
                { status: 400 }
            )
        }

        return NextResponse.json(
            { message: 'Internal server error' },
            { status: 500 }
        )
    }
}
