import { NextRequest, NextResponse } from 'next/server'
import { emailService } from '@/lib/email'

export async function POST(request: NextRequest) {
    try {
        // Only allow in development
        if (process.env.NODE_ENV !== 'development') {
            return NextResponse.json(
                { message: 'This endpoint is only available in development' },
                { status: 403 }
            )
        }

        const { type, email, username } = await request.json()

        if (!email) {
            return NextResponse.json(
                { message: 'Email is required' },
                { status: 400 }
            )
        }

        let result
        
        switch (type) {
            case 'password-reset':
                const resetLink = `${request.nextUrl.origin}/auth/reset-password?token=test-token-123`
                result = await emailService.sendPasswordResetEmail(
                    email, 
                    resetLink, 
                    username || 'testuser'
                )
                break
                
            case 'username-recovery':
                result = await emailService.sendUsernameRecoveryEmail(
                    email, 
                    username || 'testuser'
                )
                break
                
            case 'connection-test':
                const isConnected = await emailService.verifyConnection()
                return NextResponse.json({ 
                    connected: isConnected,
                    message: isConnected ? 'SMTP connection successful' : 'SMTP connection failed'
                })
                
            default:
                return NextResponse.json(
                    { message: 'Invalid email type. Use: password-reset, username-recovery, or connection-test' },
                    { status: 400 }
                )
        }

        if (result.success) {
            return NextResponse.json({ 
                message: 'Email sent successfully',
                messageId: result.messageId
            })
        } else {
            return NextResponse.json(
                { message: 'Failed to send email', error: result.error },
                { status: 500 }
            )
        }

    } catch (error) {
        console.error('Email test error:', error)
        return NextResponse.json(
            { message: 'Internal server error' },
            { status: 500 }
        )
    }
}
