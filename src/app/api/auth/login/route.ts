import { NextRequest, NextResponse } from 'next/server'
import bcrypt from 'bcryptjs'
import jwt from 'jsonwebtoken'
import { initializeModels } from '@/models'

export async function POST(request: NextRequest) {
    try {
        const { User } = await initializeModels()

        const { username, password } = await request.json()

        if (!username || !password) {
            return NextResponse.json(
                { message: 'Username and password are required' },
                { status: 400 }
            )
        }

        const user = await User.findOne({ username: username.toLowerCase() })
        if (!user) {
            return NextResponse.json(
                { message: 'Invalid credentials' },
                { status: 401 }
            )
        }

        const isValidPassword = await bcrypt.compare(password, user.password)
        if (!isValidPassword) {
            return NextResponse.json(
                { message: 'Invalid credentials' },
                { status: 401 }
            )
        }

        const token = jwt.sign(
            { userId: user._id },
            process.env.JWT_SECRET!,
            { expiresIn: '1h' }
        )

        const response = NextResponse.json({
            id: user._id,
            email: user.email,
            username: user.username,
            name: user.name,
            plan: user.plan,
            avatar: user.avatar,
        })

        response.cookies.set('token', token, {
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production',
            sameSite: 'lax',
            maxAge: 60 * 60, // 1 hour
        })

        return response
    } catch (error) {
        console.error('Login error:', error)
        return NextResponse.json(
            { message: 'Internal server error' },
            { status: 500 }
        )
    }
}
