import { NextRequest, NextResponse } from 'next/server'
import { initializeModels } from '@/models'

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

        // In a real application, you would send an email here
        // For now, we'll just return the username in the response
        // TODO: Implement email sending service
        console.log(`Username recovery for ${email}: ${user.username}`)

        return NextResponse.json({
            message: 'If an account with this email exists, the username has been sent to your email.',
            // In production, remove this line and send via email instead
            username: user.username
        })
    } catch (error) {
        console.error('Username recovery error:', error)
        return NextResponse.json(
            { message: 'Internal server error' },
            { status: 500 }
        )
    }
}
