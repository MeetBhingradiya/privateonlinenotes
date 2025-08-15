import { NextRequest, NextResponse } from 'next/server'
import jwt from 'jsonwebtoken'
import { initializeModels } from '@/models'

export async function GET(request: NextRequest) {
    try {
        const { User } = await initializeModels()

        const token = request.cookies.get('token')?.value

        if (!token) {
            return NextResponse.json({
                error: 'No token found',
                cookies: Object.fromEntries(request.cookies.getAll().map(c => [c.name, c.value]))
            })
        }

        try {
            const decoded = jwt.verify(token, process.env.JWT_SECRET!) as { userId: string }
            const user = await User.findById(decoded.userId)

            if (!user) {
                return NextResponse.json({
                    error: 'User not found',
                    decodedToken: decoded
                })
            }

            return NextResponse.json({
                success: true,
                user: {
                    id: user._id,
                    name: user.name,
                    username: user.username,
                    email: user.email,
                    plan: user.plan,
                    isBlocked: user.isBlocked
                },
                isAdmin: user.username === 'admin',
                token: token.substring(0, 20) + '...'
            })
        } catch (jwtError) {
            return NextResponse.json({
                error: 'Invalid token',
                jwtError: jwtError instanceof Error ? jwtError.message : 'Unknown JWT error',
                token: token.substring(0, 20) + '...'
            })
        }
    } catch (error) {
        return NextResponse.json({
            error: 'Server error',
            message: error instanceof Error ? error.message : 'Unknown error'
        })
    }
}
