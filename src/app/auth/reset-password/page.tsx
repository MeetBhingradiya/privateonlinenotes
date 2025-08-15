'use client'

import { useState, useEffect, Suspense } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import Link from 'next/link'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import toast from 'react-hot-toast'
import { Input } from '@/components/ui/input'
import { ArrowLeft, Lock, CheckCircle, AlertCircle, Mail } from 'lucide-react'

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
            <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 dark:from-gray-950 dark:via-blue-950 dark:to-indigo-950 flex items-center justify-center p-4">
                <div className="w-full max-w-md">
                    <div className="backdrop-blur-xl bg-white/70 dark:bg-gray-900/70 border border-white/20 dark:border-gray-700/30 rounded-2xl shadow-2xl p-8">
                        <div className="text-center">
                            <div className="animate-spin rounded-full h-12 w-12 border-4 border-blue-500 border-t-transparent mx-auto mb-4"></div>
                            <p className="text-gray-600 dark:text-gray-400">Verifying reset token...</p>
                        </div>
                    </div>
                </div>
            </div>
        )
    }

    if (tokenValid === false) {
        return (
            <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 dark:from-gray-950 dark:via-blue-950 dark:to-indigo-950 flex items-center justify-center p-4">
                <div className="w-full max-w-md">
                    <div className="backdrop-blur-xl bg-white/70 dark:bg-gray-900/70 border border-white/20 dark:border-gray-700/30 rounded-2xl shadow-2xl p-8">
                        {/* Title and Description */}
                        <div className="text-center mb-8">
                            <div className="mx-auto w-16 h-16 bg-gradient-to-r from-red-500 to-pink-600 rounded-full flex items-center justify-center mb-4">
                                <AlertCircle className="h-8 w-8 text-white" />
                            </div>
                            <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
                                Invalid Reset Link
                            </h1>
                            <p className="text-gray-600 dark:text-gray-400">
                                This password reset link is invalid or has expired
                            </p>
                        </div>

                        <div className="space-y-4">
                            <div className="p-4 bg-red-50 dark:bg-red-900/20 rounded-xl border border-red-200 dark:border-red-800">
                                <p className="text-red-800 dark:text-red-200 text-sm">
                                    The link may have expired or already been used.
                                </p>
                            </div>

                            <Link
                                href="/auth/forgot-password"
                                className="block w-full"
                            >
                                <button className="w-full bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white font-semibold py-3 px-6 rounded-xl transition-all duration-200 shadow-lg hover:shadow-xl flex items-center justify-center space-x-2">
                                    <Mail className="h-5 w-5" />
                                    <span>Request New Reset Link</span>
                                </button>
                            </Link>

                            <div className="text-center">
                                <Link
                                    href="/auth/login"
                                    className="text-blue-600 hover:text-blue-500 dark:text-blue-400 font-medium text-sm transition-colors"
                                >
                                    Back to login
                                </Link>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        )
    }

    if (success) {
        return (
            <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 dark:from-gray-950 dark:via-blue-950 dark:to-indigo-950 flex items-center justify-center p-4">
                <div className="w-full max-w-md">
                    <div className="backdrop-blur-xl bg-white/70 dark:bg-gray-900/70 border border-white/20 dark:border-gray-700/30 rounded-2xl shadow-2xl p-8">
                        {/* Title and Description */}
                        <div className="text-center mb-8">
                            <div className="mx-auto w-16 h-16 bg-gradient-to-r from-green-500 to-emerald-600 rounded-full flex items-center justify-center mb-4">
                                <CheckCircle className="h-8 w-8 text-white" />
                            </div>
                            <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
                                Password Reset Successfully!
                            </h1>
                            <p className="text-gray-600 dark:text-gray-400">
                                Your password has been updated
                            </p>
                        </div>

                        <div className="space-y-6">
                            <div className="text-center p-6 bg-green-50 dark:bg-green-900/20 rounded-xl border border-green-200 dark:border-green-800">
                                <CheckCircle className="h-12 w-12 text-green-600 dark:text-green-400 mx-auto mb-4" />
                                <p className="text-green-800 dark:text-green-200 font-medium">
                                    You can now sign in with your new password
                                </p>
                            </div>
                            
                            <div className="text-center space-y-2">
                                <p className="text-gray-600 dark:text-gray-400 text-sm">
                                    Redirecting to login page in 3 seconds...
                                </p>
                                <Link
                                    href="/auth/login"
                                    className="text-blue-600 hover:text-blue-500 dark:text-blue-400 font-medium text-sm transition-colors"
                                >
                                    Continue to login now
                                </Link>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        )
    }

    return (
        <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 dark:from-gray-950 dark:via-blue-950 dark:to-indigo-950 flex items-center justify-center p-4">
            <div className="w-full max-w-md">
                {/* Modern Glassmorphic Card */}
                <div className="backdrop-blur-xl bg-white/70 dark:bg-gray-900/70 border border-white/20 dark:border-gray-700/30 rounded-2xl shadow-2xl p-8">
                    {/* Header with Back Button */}
                    <div className="mb-6">
                        <Link 
                            href="/auth/login"
                            className="inline-flex items-center text-sm text-gray-600 dark:text-gray-400 hover:text-blue-600 dark:hover:text-blue-400 transition-colors group"
                        >
                            <ArrowLeft className="h-4 w-4 mr-2 transition-transform group-hover:-translate-x-1" />
                            Back to login
                        </Link>
                    </div>

                    {/* Title and Description */}
                    <div className="text-center mb-8">
                        <div className="mx-auto w-16 h-16 bg-gradient-to-r from-purple-500 to-indigo-600 rounded-full flex items-center justify-center mb-4">
                            <Lock className="h-8 w-8 text-white" />
                        </div>
                        <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
                            Reset Password
                        </h1>
                        <p className="text-gray-600 dark:text-gray-400">
                            Enter your new password below
                        </p>
                    </div>

                    {/* Form */}
                    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
                        <div>
                            <Input
                                {...register('password')}
                                type="password"
                                placeholder="Enter new password"
                                className={`w-full px-4 py-3 bg-white/50 dark:bg-gray-800/50 border rounded-xl transition-all duration-200 focus:ring-2 focus:ring-purple-500 focus:border-transparent ${
                                    errors.password 
                                        ? 'border-red-500 focus:ring-red-500' 
                                        : 'border-gray-200 dark:border-gray-700'
                                }`}
                            />
                            {errors.password && (
                                <p className="text-red-500 text-sm mt-2 flex items-center">
                                    <span className="inline-block w-1 h-1 bg-red-500 rounded-full mr-2"></span>
                                    {errors.password.message}
                                </p>
                            )}
                        </div>

                        <div>
                            <Input
                                {...register('confirmPassword')}
                                type="password"
                                placeholder="Confirm new password"
                                className={`w-full px-4 py-3 bg-white/50 dark:bg-gray-800/50 border rounded-xl transition-all duration-200 focus:ring-2 focus:ring-purple-500 focus:border-transparent ${
                                    errors.confirmPassword 
                                        ? 'border-red-500 focus:ring-red-500' 
                                        : 'border-gray-200 dark:border-gray-700'
                                }`}
                            />
                            {errors.confirmPassword && (
                                <p className="text-red-500 text-sm mt-2 flex items-center">
                                    <span className="inline-block w-1 h-1 bg-red-500 rounded-full mr-2"></span>
                                    {errors.confirmPassword.message}
                                </p>
                            )}
                        </div>

                        <button
                            type="submit"
                            disabled={loading}
                            className="w-full bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700 disabled:from-gray-400 disabled:to-gray-500 text-white font-semibold py-3 px-6 rounded-xl transition-all duration-200 shadow-lg hover:shadow-xl disabled:cursor-not-allowed flex items-center justify-center space-x-2"
                        >
                            {loading ? (
                                <>
                                    <div className="animate-spin rounded-full h-5 w-5 border-2 border-white border-t-transparent"></div>
                                    <span>Updating...</span>
                                </>
                            ) : (
                                <>
                                    <Lock className="h-5 w-5" />
                                    <span>Update Password</span>
                                </>
                            )}
                        </button>
                    </form>

                    {/* Footer */}
                    <div className="mt-8 text-center">
                        <p className="text-gray-600 dark:text-gray-400 text-sm">
                            Remember your password?{' '}
                            <Link
                                href="/auth/login"
                                className="text-blue-600 hover:text-blue-500 dark:text-blue-400 font-medium transition-colors"
                            >
                                Sign in
                            </Link>
                        </p>
                    </div>
                </div>
            </div>
        </div>
    )
}

export default function ResetPasswordPage() {
    return (
        <Suspense fallback={
            <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 dark:from-gray-950 dark:via-blue-950 dark:to-indigo-950 flex items-center justify-center p-4">
                <div className="w-full max-w-md">
                    <div className="backdrop-blur-xl bg-white/70 dark:bg-gray-900/70 border border-white/20 dark:border-gray-700/30 rounded-2xl shadow-2xl p-8">
                        <div className="text-center">
                            <div className="animate-spin rounded-full h-12 w-12 border-4 border-blue-500 border-t-transparent mx-auto mb-4"></div>
                            <p className="text-gray-600 dark:text-gray-400">Loading...</p>
                        </div>
                    </div>
                </div>
            </div>
        }>
            <ResetPasswordForm />
        </Suspense>
    )
}
