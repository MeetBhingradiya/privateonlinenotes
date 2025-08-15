'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import toast from 'react-hot-toast'
import { IconButton } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { PageLayout } from '@/components/page-layout'
import { useAuth } from '@/components/providers/auth-provider'

const registerSchema = z.object({
    username: z.string()
        .min(3, 'Username must be at least 3 characters')
        .max(30, 'Username must be less than 30 characters')
        .regex(/^[a-zA-Z0-9_]+$/, 'Username can only contain letters, numbers, and underscores'),
    email: z.string().email('Please enter a valid email').optional().or(z.literal('')),
    password: z.string().min(6, 'Password must be at least 6 characters'),
    confirmPassword: z.string(),
    terms: z.boolean().refine(val => val === true, 'You must accept the terms and conditions'),
}).refine((data) => data.password === data.confirmPassword, {
    message: "Passwords don't match",
    path: ["confirmPassword"],
})

type RegisterFormData = z.infer<typeof registerSchema>

export default function RegisterPage() {
    const [loading, setLoading] = useState(false)
    const router = useRouter()
    const { register: registerUser, user, loading: authLoading } = useAuth()

    // Redirect if already authenticated
    useEffect(() => {
        if (!authLoading && user) {
            router.push('/dashboard')
        }
    }, [user, authLoading, router])

    const {
        register,
        handleSubmit,
        formState: { errors },
    } = useForm<RegisterFormData>({
        resolver: zodResolver(registerSchema),
    })

    const onSubmit = async (data: RegisterFormData) => {
        setLoading(true)
        try {
            const registerData = {
                username: data.username,
                password: data.password,
                email: data.email && data.email.trim() !== '' ? data.email : undefined,
            }
            
            await registerUser('', registerData.username, registerData.email || '', registerData.password)
            toast.success('Registration successful!')
            router.push('/dashboard')
        } catch (error: any) {
            toast.error(error.message || 'Registration failed')
        } finally {
            setLoading(false)
        }
    }

    // Don't render the form if user is already authenticated or auth is still loading
    if (authLoading || user) {
        return (
            <PageLayout showBackButton={true} backTo="/" title="Create Account" showFooter={false}>
                <div className="flex items-center justify-center min-h-[60vh]">
                    <div className="text-center">
                        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
                        <p className="text-foreground/70">
                            {user ? 'Redirecting to dashboard...' : 'Loading...'}
                        </p>
                    </div>
                </div>
            </PageLayout>
        )
    }

    return (
        <PageLayout showBackButton={true} backTo="/" title="Create Account" showFooter={false}>
            <div className="flex items-center justify-center min-h-[60vh] p-4">
                <div className="w-full max-w-md">
                    <Card className="glass-card bg-white/10 dark:bg-white/5 border-white/20 dark:border-white/10 backdrop-blur-2xl shadow-2xl shadow-black/10 dark:shadow-black/20">
                        <CardHeader className="text-center pb-6">
                            <div className="mx-auto mb-4 h-12 w-12 rounded-2xl bg-gradient-to-br from-blue-600 to-purple-600 flex items-center justify-center shadow-lg shadow-blue-500/25">
                                <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18 9v3m0 0v3m0-3h3m-3 0h-3m-2-5a4 4 0 11-8 0 4 4 0 018 0zM3 20a6 6 0 0112 0v1H3v-1z" />
                                </svg>
                            </div>
                            <CardTitle className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                                Join Notta
                            </CardTitle>
                            <CardDescription className="text-foreground/60 mt-2">
                                Create your account to start sharing files
                            </CardDescription>
                        </CardHeader>

                        <CardContent className="px-6 pb-6">
                            <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
                                <div className="space-y-4">
                                    <div>
                                        <Input
                                            {...register('username')}
                                            type="text"
                                            placeholder="Username"
                                            className={`h-12 bg-white/5 border-white/20 focus:border-blue-400 focus:bg-white/10 transition-all duration-200 ${errors.username ? 'border-red-400 focus:border-red-400' : ''}`}
                                        />
                                        {errors.username && (
                                            <p className="text-red-400 text-sm mt-2 flex items-center">
                                                <svg className="w-4 h-4 mr-1" fill="currentColor" viewBox="0 0 20 20">
                                                    <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                                                </svg>
                                                {errors.username.message}
                                            </p>
                                        )}
                                    </div>

                                    <div>
                                        <Input
                                            {...register('email')}
                                            type="email"
                                            placeholder="Email (optional - for account recovery)"
                                            className={`h-12 bg-white/5 border-white/20 focus:border-blue-400 focus:bg-white/10 transition-all duration-200 ${errors.email ? 'border-red-400 focus:border-red-400' : ''}`}
                                        />
                                        {errors.email && (
                                            <p className="text-red-400 text-sm mt-2 flex items-center">
                                                <svg className="w-4 h-4 mr-1" fill="currentColor" viewBox="0 0 20 20">
                                                    <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                                                </svg>
                                                {errors.email.message}
                                            </p>
                                        )}
                                    </div>

                                    <div>
                                        <Input
                                            {...register('password')}
                                            type="password"
                                            placeholder="Password"
                                            className={`h-12 bg-white/5 border-white/20 focus:border-blue-400 focus:bg-white/10 transition-all duration-200 ${errors.password ? 'border-red-400 focus:border-red-400' : ''}`}
                                        />
                                        {errors.password && (
                                            <p className="text-red-400 text-sm mt-2 flex items-center">
                                                <svg className="w-4 h-4 mr-1" fill="currentColor" viewBox="0 0 20 20">
                                                    <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                                                </svg>
                                                {errors.password.message}
                                            </p>
                                        )}
                                    </div>

                                    <div>
                                        <Input
                                            {...register('confirmPassword')}
                                            type="password"
                                            placeholder="Confirm Password"
                                            className={`h-12 bg-white/5 border-white/20 focus:border-blue-400 focus:bg-white/10 transition-all duration-200 ${errors.confirmPassword ? 'border-red-400 focus:border-red-400' : ''}`}
                                        />
                                        {errors.confirmPassword && (
                                            <p className="text-red-400 text-sm mt-2 flex items-center">
                                                <svg className="w-4 h-4 mr-1" fill="currentColor" viewBox="0 0 20 20">
                                                    <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                                                </svg>
                                                {errors.confirmPassword.message}
                                            </p>
                                        )}
                                    </div>
                                </div>

                                {/* Terms checkbox */}
                                <div className="flex items-start space-x-3 p-4 rounded-lg bg-white/5 border border-white/10">
                                    <input
                                        {...register('terms')}
                                        type="checkbox"
                                        id="terms"
                                        className="mt-1 h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                                    />
                                    <div className="text-sm">
                                        <label htmlFor="terms" className="text-foreground/80">
                                            I agree to the{' '}
                                            <Link href="/terms" className="text-blue-600 hover:text-blue-500 font-medium underline">
                                                Terms and Conditions
                                            </Link>
                                            {' '}and{' '}
                                            <Link href="/privacy" className="text-blue-600 hover:text-blue-500 font-medium underline">
                                                Privacy Policy
                                            </Link>
                                        </label>
                                        {errors.terms && (
                                            <p className="text-red-400 text-xs mt-1 flex items-center">
                                                <svg className="w-3 h-3 mr-1" fill="currentColor" viewBox="0 0 20 20">
                                                    <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                                                </svg>
                                                {errors.terms.message}
                                            </p>
                                        )}
                                    </div>
                                </div>

                                <IconButton
                                    type="submit"
                                    className="w-full h-12 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white border-0 shadow-lg hover:shadow-blue-500/25 hover:scale-[1.02] transition-all duration-200"
                                    disabled={loading}
                                    icon="user-plus"
                                    tooltip="Create your new account"
                                >
                                    {loading ? (
                                        <div className="flex items-center">
                                            <svg className="animate-spin -ml-1 mr-3 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                            </svg>
                                            Creating Account...
                                        </div>
                                    ) : (
                                        'Create Account'
                                    )}
                                </IconButton>
                            </form>

                            {/* Sign in section */}
                            <div className="mt-8 text-center">
                                <div className="relative">
                                    <div className="absolute inset-0 bg-gradient-to-r from-blue-600/10 to-purple-600/10 rounded-lg blur-xl"></div>
                                    <div className="relative px-6 py-4 rounded-lg bg-white/5 border border-white/10 backdrop-blur-sm">
                                        <p className="text-sm text-foreground/60 mb-2">
                                            Already have an account?
                                        </p>
                                        <Link
                                            href="/auth/login"
                                            className="inline-flex items-center px-4 py-2 rounded-md bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white font-medium text-sm transition-all duration-200 hover:scale-105 shadow-lg hover:shadow-blue-500/25"
                                        >
                                            <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 16l-4-4m0 0l4-4m-4 4h14m-5 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h7a3 3 0 013 3v1" />
                                            </svg>
                                            Sign In
                                        </Link>
                                    </div>
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                </div>
            </div>
        </PageLayout>
    )
}
