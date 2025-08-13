import { NextRequest, NextResponse } from 'next/server'
import { initializeModels } from '@/models'
import { emailService } from '@/lib/email'

export async function POST(request: NextRequest) {
    try {
        const { User } = await initializeModels()

        const { email } = await request.json()

        if (!email) {
            return NextResponse.json(
                { message: 'Email is required' },
                { status: 400 }
            )
        }

        const user = await User.findOne({ email })
        if (!user) {
            // Don't reveal if email exists or not for security
            return NextResponse.json({
                message: 'If an account with this email exists, the username has been sent to your email.'
            })
        }

        // Send username recovery email
        const emailResult = await emailService.sendUsernameRecoveryEmail(email, user.username)

        if (!emailResult.success) {
            console.error('Failed to send username recovery email:', emailResult.error)
            // In production, you might want to still return success to not reveal if email exists
            // For now, we'll return an error to help with debugging
            return NextResponse.json(
                { message: 'Failed to send recovery email. Please try again later.' },
                { status: 500 }
            )
        }

        return NextResponse.json({
            message: 'If an account with this email exists, the username has been sent to your email.',
            // For development only - remove in production
            username: process.env.NODE_ENV === 'development' ? user.username : undefined
        })
    } catch (error) {
        console.error('Username recovery error:', error)
        return NextResponse.json(
            { message: 'Internal server error' },
            { status: 500 }
        )
    }
}
