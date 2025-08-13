'use client'

import { useState, useEffect, Suspense } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import Link from 'next/link'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import toast from 'react-hot-toast'
import { IconButton } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { PageLayout } from '@/components/page-layout'
import { ArrowLeft, CheckCircle } from 'lucide-react'

const resetPasswordSchema = z.object({
    password: z.string().min(6, 'Password must be at least 6 characters'),
    confirmPassword: z.string(),
}).refine((data) => data.password === data.confirmPassword, {
    message: "Passwords don't match",
    path: ["confirmPassword"],
})

type ResetPasswordFormData = z.infer<typeof resetPasswordSchema>

function ResetPasswordForm() {
    const [loading, setLoading] = useState(false)
    const [success, setSuccess] = useState(false)
    const [tokenValid, setTokenValid] = useState<boolean | null>(null)
    const router = useRouter()
    const searchParams = useSearchParams()
    const token = searchParams.get('token')

    const {
        register,
        handleSubmit,
        formState: { errors },
    } = useForm<ResetPasswordFormData>({
        resolver: zodResolver(resetPasswordSchema),
    })

    useEffect(() => {
        if (!token) {
            setTokenValid(false)
            return
        }

        // Verify token validity
        const verifyToken = async () => {
            try {
                const response = await fetch('/api/auth/verify-reset-token', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ token }),
                })

                setTokenValid(response.ok)
            } catch {
                setTokenValid(false)
            }
        }

        verifyToken()
    }, [token])

    const onSubmit = async (data: ResetPasswordFormData) => {
        if (!token) return

        setLoading(true)
        try {
            const response = await fetch('/api/auth/reset-password', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    token,
                    password: data.password,
                }),
            })

            const result = await response.json()
            
            if (response.ok) {
                setSuccess(true)
                toast.success('Password reset successfully!')
                setTimeout(() => router.push('/auth/login'), 3000)
            } else {
                toast.error(result.message || 'Failed to reset password')
            }
        } catch {
            toast.error('Failed to reset password')
        } finally {
            setLoading(false)
        }
    }

    if (tokenValid === null) {
        return (
            <PageLayout>
                <div className="min-h-screen flex items-center justify-center px-4">
                    <Card className="w-full max-w-md">
                        <CardContent className="flex items-center justify-center p-8">
                            <p className="text-muted-foreground">Verifying reset token...</p>
                        </CardContent>
                    </Card>
                </div>
            </PageLayout>
        )
    }

    if (tokenValid === false) {
        return (
            <PageLayout>
                <div className="min-h-screen flex items-center justify-center px-4">
                    <Card className="w-full max-w-md">
                        <CardHeader className="space-y-1">
                            <CardTitle className="text-2xl font-bold text-center text-red-600">
                                Invalid Reset Link
                            </CardTitle>
                            <CardDescription className="text-center text-foreground/70">
                                This password reset link is invalid or has expired
                            </CardDescription>
                        </CardHeader>
                        <CardContent className="text-center space-y-4">
                            <p className="text-sm text-muted-foreground">
                                The link may have expired or already been used.
                            </p>
                            <div className="space-y-2">
                                <Link
                                    href="/auth/forgot-password"
                                    className="inline-block w-full"
                                >
                                    <IconButton className="w-full" icon="mail">
                                        Request New Reset Link
                                    </IconButton>
                                </Link>
                                <Link
                                    href="/auth/login"
                                    className="text-blue-600 hover:text-blue-500 dark:text-blue-400 font-medium text-sm transition-colors"
                                >
                                    Back to login
                                </Link>
                            </div>
                        </CardContent>
                    </Card>
                </div>
            </PageLayout>
        )
    }

    if (success) {
        return (
            <PageLayout>
                <div className="min-h-screen flex items-center justify-center px-4">
                    <Card className="w-full max-w-md">
                        <CardHeader className="space-y-1">
                            <CardTitle className="text-2xl font-bold text-center text-green-600">
                                Password Reset Successfully
                            </CardTitle>
                            <CardDescription className="text-center text-foreground/70">
                                Your password has been updated
                            </CardDescription>
                        </CardHeader>
                        <CardContent className="text-center space-y-4">
                            <div className="flex items-center justify-center p-4 bg-green-50 dark:bg-green-900/20 rounded-lg">
                                <CheckCircle className="h-6 w-6 text-green-600 dark:text-green-400 mr-2" />
                                <p className="text-sm text-green-700 dark:text-green-300">
                                    You can now sign in with your new password
                                </p>
                            </div>
                            <p className="text-sm text-muted-foreground">
                                Redirecting to login page...
                            </p>
                            <Link
                                href="/auth/login"
                                className="text-blue-600 hover:text-blue-500 dark:text-blue-400 font-medium text-sm transition-colors"
                            >
                                Continue to login
                            </Link>
                        </CardContent>
                    </Card>
                </div>
            </PageLayout>
        )
    }

    return (
        <PageLayout>
            <div className="min-h-screen flex items-center justify-center px-4">
                <Card className="w-full max-w-md">
                    <CardHeader className="space-y-1">
                        <div className="flex items-center space-x-2 mb-4">
                            <Link href="/auth/login">
                                <IconButton
                                    variant="ghost"
                                    size="sm"
                                    icon="back"
                                    tooltip="Back to login"
                                >
                                    <ArrowLeft className="h-4 w-4" />
                                </IconButton>
                            </Link>
                            <span className="text-sm text-muted-foreground">Back to login</span>
                        </div>
                        <CardTitle className="text-2xl font-bold text-center">
                            Reset Password
                        </CardTitle>
                        <CardDescription className="text-center text-foreground/70">
                            Enter your new password
                        </CardDescription>
                    </CardHeader>

                    <CardContent>
                        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
                            <div>
                                <Input
                                    {...register('password')}
                                    type="password"
                                    placeholder="New password"
                                    className={errors.password ? 'border-red-500' : ''}
                                />
                                {errors.password && (
                                    <p className="text-red-500 text-sm mt-1">{errors.password.message}</p>
                                )}
                            </div>

                            <div>
                                <Input
                                    {...register('confirmPassword')}
                                    type="password"
                                    placeholder="Confirm new password"
                                    className={errors.confirmPassword ? 'border-red-500' : ''}
                                />
                                {errors.confirmPassword && (
                                    <p className="text-red-500 text-sm mt-1">{errors.confirmPassword.message}</p>
                                )}
                            </div>

                            <IconButton
                                type="submit"
                                className="w-full"
                                disabled={loading}
                                icon="check"
                                tooltip="Update password"
                            >
                                {loading ? 'Updating...' : 'Update Password'}
                            </IconButton>
                        </form>

                        <div className="mt-6 text-center">
                            <p className="text-sm text-foreground/60">
                                Remember your password?{' '}
                                <Link
                                    href="/auth/login"
                                    className="text-blue-600 hover:text-blue-500 dark:text-blue-400 font-medium transition-colors"
                                >
                                    Sign in
                                </Link>
                            </p>
                        </div>
                    </CardContent>
                </Card>
            </div>
        </PageLayout>
    )
}

export default function ResetPasswordPage() {
    return (
        <Suspense fallback={
            <PageLayout>
                <div className="min-h-screen flex items-center justify-center px-4">
                    <Card className="w-full max-w-md">
                        <CardContent className="flex items-center justify-center p-8">
                            <p className="text-muted-foreground">Loading...</p>
                        </CardContent>
                    </Card>
                </div>
            </PageLayout>
        }>
            <ResetPasswordForm />
        </Suspense>
    )
}
