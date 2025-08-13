'use client'

import { useState } from 'react'
import Link from 'next/link'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import toast from 'react-hot-toast'
import { IconButton } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { PageLayout } from '@/components/page-layout'
import { ArrowLeft, Mail } from 'lucide-react'

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
                            Forgot Password
                        </CardTitle>
                        {!emailSent ? (
                            <CardDescription className="text-center text-foreground/70">
                                Enter your email address and we&apos;ll send you a link to reset your password
                            </CardDescription>
                        ) : (
                            <CardDescription className="text-center text-foreground/70">
                                We&apos;ve sent a password reset link to your email address
                            </CardDescription>
                        )}
                    </CardHeader>

                    <CardContent>
                        {!emailSent ? (
                            <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
                                <div>
                                    <Input
                                        {...register('email')}
                                        type="email"
                                        placeholder="Enter your email address"
                                        className={errors.email ? 'border-red-500' : ''}
                                    />
                                    {errors.email && (
                                        <p className="text-red-500 text-sm mt-1">{errors.email.message}</p>
                                    )}
                                </div>

                                <IconButton
                                    type="submit"
                                    className="w-full"
                                    disabled={loading}
                                    icon="mail"
                                    tooltip="Send password reset email"
                                >
                                    {loading ? 'Sending...' : 'Send Reset Link'}
                                </IconButton>
                            </form>
                        ) : (
                            <div className="space-y-4">
                                <div className="flex items-center justify-center p-4 bg-green-50 dark:bg-green-900/20 rounded-lg">
                                    <Mail className="h-6 w-6 text-green-600 dark:text-green-400 mr-2" />
                                    <p className="text-sm text-green-700 dark:text-green-300 text-center">
                                        Check your email for a password reset link
                                    </p>
                                </div>
                                
                                {/* Development: Show direct reset link */}
                                {devResetLink && process.env.NODE_ENV === 'development' && (
                                    <div className="p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg border border-blue-200 dark:border-blue-800">
                                        <p className="text-sm text-blue-800 dark:text-blue-200 font-medium mb-2">
                                            Development Mode: Direct Reset Link
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
                                
                                <div className="text-center space-y-2">
                                    <p className="text-sm text-muted-foreground">
                                        Didn&apos;t receive the email?
                                    </p>
                                    <button
                                        onClick={resendEmail}
                                        disabled={loading}
                                        className="text-blue-600 hover:text-blue-500 dark:text-blue-400 font-medium text-sm transition-colors disabled:opacity-50"
                                    >
                                        {loading ? 'Sending...' : 'Resend email'}
                                    </button>
                                </div>
                            </div>
                        )}

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
