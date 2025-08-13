import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'
import { initializeModels } from '@/models'

const verifyTokenSchema = z.object({
    token: z.string().min(1, 'Token is required'),
})

export async function POST(request: NextRequest) {
    try {
        const body = await request.json()
        const { token } = verifyTokenSchema.parse(body)

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

        return NextResponse.json({ valid: true })

    } catch (error) {
        console.error('Verify reset token error:', error)
        
        if (error instanceof z.ZodError) {
            return NextResponse.json(
                { message: 'Invalid token format' },
                { status: 400 }
            )
        }

        return NextResponse.json(
            { message: 'Internal server error' },
            { status: 500 }
        )
    }
}
