'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import toast from 'react-hot-toast'
import { IconButton } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { ThemeToggle } from '@/components/theme-toggle'
import { useAuth } from '@/components/providers/auth-provider'

const loginSchema = z.object({
    username: z.string().min(1, 'Username is required'),
    password: z.string().min(1, 'Password is required'),
})

type LoginFormData = z.infer<typeof loginSchema>

export default function LoginPage() {
    const [loading, setLoading] = useState(false)
    const router = useRouter()
    const { login } = useAuth()

    const {
        register,
        handleSubmit,
        formState: { errors },
    } = useForm<LoginFormData>({
        resolver: zodResolver(loginSchema),
    })

    const onSubmit = async (data: LoginFormData) => {
        setLoading(true)
        try {
            await login(data.username, data.password)
            toast.success('Login successful!')
            router.push('/dashboard')
        } catch (error: any) {
            toast.error(error.message || 'Login failed')
        } finally {
            setLoading(false)
        }
    }

    return (
        <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 via-white to-purple-50 dark:from-gray-900 dark:via-blue-900 dark:to-purple-900 p-4">
            <div className="absolute top-4 right-4">
                <ThemeToggle />
            </div>

            <Card className="glass-card w-full max-w-md bg-white/20 dark:bg-white/10 border-white/30 dark:border-white/20 backdrop-blur-xl shadow-2xl">
                <CardHeader className="text-center">
                    <CardTitle className="text-3xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                        Notta.in
                    </CardTitle>
                    <CardDescription className="text-foreground/70">
                        Sign in to your account to continue
                    </CardDescription>
                </CardHeader>

                <CardContent>
                    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
                        <div>
                            <Input
                                {...register('username')}
                                type="text"
                                placeholder="Username"
                                className={errors.username ? 'border-red-500' : ''}
                            />
                            {errors.username && (
                                <p className="text-red-500 text-sm mt-1">{errors.username.message}</p>
                            )}
                        </div>

                        <div>
                            <Input
                                {...register('password')}
                                type="password"
                                placeholder="Password"
                                className={errors.password ? 'border-red-500' : ''}
                            />
                            {errors.password && (
                                <p className="text-red-500 text-sm mt-1">{errors.password.message}</p>
                            )}
                        </div>

                        <IconButton
                            type="submit"
                            className="w-full"
                            disabled={loading}
                            icon="login"
                            tooltip="Sign in to your account"
                        >
                            {loading ? 'Signing in...' : 'Sign In'}
                        </IconButton>
                    </form>

                    <div className="mt-6 text-center space-y-2">
                        <p className="text-sm text-foreground/60">
                            <Link
                                href="/auth/recover-username"
                                className="text-blue-600 hover:text-blue-500 dark:text-blue-400 font-medium transition-colors"
                            >
                                Forgot your username?
                            </Link>
                        </p>
                        <p className="text-sm text-foreground/60">
                            Don&apos;t have an account?{' '}
                            <Link
                                href="/auth/register"
                                className="text-blue-600 hover:text-blue-500 dark:text-blue-400 font-medium transition-colors"
                            >
                                Sign up
                            </Link>
                        </p>
                    </div>
                </CardContent>
            </Card>
        </div>
    )
}
