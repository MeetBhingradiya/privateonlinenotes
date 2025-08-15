'use client'

import { useState } from 'react'
import Link from 'next/link'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import toast from 'react-hot-toast'
import { Input } from '@/components/ui/input'
import { ArrowLeft, Mail, CheckCircle, RotateCcw } from 'lucide-react'

const forgotPasswordSchema = z.object({
    email: z.string().email('Please enter a valid email'),
})

type ForgotPasswordFormData = z.infer<typeof forgotPasswordSchema>

export default function ForgotPasswordPage() {
    const [loading, setLoading] = useState(false)
    const [emailSent, setEmailSent] = useState(false)
    const [devResetLink, setDevResetLink] = useState<string | null>(null)

    const {
        register,
        handleSubmit,
        formState: { errors },
        getValues,
    } = useForm<ForgotPasswordFormData>({
        resolver: zodResolver(forgotPasswordSchema),
    })

    const onSubmit = async (data: ForgotPasswordFormData) => {
        setLoading(true)
        try {
            const response = await fetch('/api/auth/forgot-password', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(data),
            })

            const result = await response.json()
            
            if (response.ok) {
                setEmailSent(true)
                toast.success('Password reset email sent!')
                
                // In development, show the reset link if provided
                if (result.resetLink && process.env.NODE_ENV === 'development') {
                    setDevResetLink(result.resetLink)
                    toast.success('Development: Reset link copied to state!')
                }
            } else {
                toast.error(result.message || 'Failed to send reset email')
            }
        } catch {
            toast.error('Failed to send reset email')
        } finally {
            setLoading(false)
        }
    }

    const resendEmail = async () => {
        const email = getValues('email')
        if (email) {
            await onSubmit({ email })
        }
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
                        <div className="mx-auto w-16 h-16 bg-gradient-to-r from-blue-500 to-indigo-600 rounded-full flex items-center justify-center mb-4">
                            <Mail className="h-8 w-8 text-white" />
                        </div>
                        <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
                            Forgot Password?
                        </h1>
                        <p className="text-gray-600 dark:text-gray-400">
                            {!emailSent 
                                ? "Enter your email address and we&apos;ll send you a link to reset your password"
                                : "We&apos;ve sent a password reset link to your email address"
                            }
                        </p>
                    </div>

                    {!emailSent ? (
                        /* Form */
                        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
                            <div>
                                <Input
                                    {...register('email')}
                                    type="email"
                                    placeholder="Enter your email address"
                                    className={`w-full px-4 py-3 bg-white/50 dark:bg-gray-800/50 border rounded-xl transition-all duration-200 focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                                        errors.email 
                                            ? 'border-red-500 focus:ring-red-500' 
                                            : 'border-gray-200 dark:border-gray-700'
                                    }`}
                                />
                                {errors.email && (
                                    <p className="text-red-500 text-sm mt-2 flex items-center">
                                        <span className="inline-block w-1 h-1 bg-red-500 rounded-full mr-2"></span>
                                        {errors.email.message}
                                    </p>
                                )}
                            </div>

                            <button
                                type="submit"
                                disabled={loading}
                                className="w-full bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 disabled:from-gray-400 disabled:to-gray-500 text-white font-semibold py-3 px-6 rounded-xl transition-all duration-200 shadow-lg hover:shadow-xl disabled:cursor-not-allowed flex items-center justify-center space-x-2"
                            >
                                {loading ? (
                                    <>
                                        <div className="animate-spin rounded-full h-5 w-5 border-2 border-white border-t-transparent"></div>
                                        <span>Sending...</span>
                                    </>
                                ) : (
                                    <>
                                        <Mail className="h-5 w-5" />
                                        <span>Send Reset Link</span>
                                    </>
                                )}
                            </button>
                        </form>
                    ) : (
                        /* Success State */
                        <div className="space-y-6">
                            <div className="text-center p-6 bg-green-50 dark:bg-green-900/20 rounded-xl border border-green-200 dark:border-green-800">
                                <CheckCircle className="h-12 w-12 text-green-600 dark:text-green-400 mx-auto mb-4" />
                                <p className="text-green-800 dark:text-green-200 font-medium">
                                    Reset link sent successfully!
                                </p>
                                <p className="text-green-700 dark:text-green-300 text-sm mt-2">
                                    Check your email for the password reset link
                                </p>
                            </div>
                            
                            {/* Development: Show direct reset link */}
                            {devResetLink && process.env.NODE_ENV === 'development' && (
                                <div className="p-4 bg-blue-50 dark:bg-blue-900/20 rounded-xl border border-blue-200 dark:border-blue-800">
                                    <p className="text-blue-800 dark:text-blue-200 font-medium mb-2 text-sm">
                                        🔧 Development Mode: Direct Reset Link
                                    </p>
                                    <a
                                        href={devResetLink}
                                        className="text-blue-600 hover:text-blue-500 dark:text-blue-400 text-sm break-all underline"
                                        target="_blank"
                                        rel="noopener noreferrer"
                                    >
                                        {devResetLink}
                                    </a>
                                </div>
                            )}
                            
                            <div className="text-center space-y-4">
                                <p className="text-gray-600 dark:text-gray-400 text-sm">
                                    Didn&apos;t receive the email?
                                </p>
                                <button
                                    onClick={resendEmail}
                                    disabled={loading}
                                    className="inline-flex items-center space-x-2 text-blue-600 hover:text-blue-500 dark:text-blue-400 font-medium text-sm transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                                >
                                    <RotateCcw className="h-4 w-4" />
                                    <span>{loading ? 'Sending...' : 'Resend email'}</span>
                                </button>
                            </div>
                        </div>
                    )}

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
