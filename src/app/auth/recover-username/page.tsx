'use client'

import { useState } from 'react'
import Link from 'next/link'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import toast from 'react-hot-toast'
import { Input } from '@/components/ui/input'
import { ArrowLeft, User, CheckCircle, RotateCcw } from 'lucide-react'

const recoverSchema = z.object({
    email: z.string().email('Please enter a valid email'),
})

type RecoverFormData = z.infer<typeof recoverSchema>

export default function RecoverUsernamePage() {
    const [loading, setLoading] = useState(false)
    const [recovered, setRecovered] = useState(false)

    const {
        register,
        handleSubmit,
        formState: { errors },
    } = useForm<RecoverFormData>({
        resolver: zodResolver(recoverSchema),
    })

    const onSubmit = async (data: RecoverFormData) => {
        setLoading(true)
        try {
            const response = await fetch('/api/auth/recover-username', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(data),
            })

            const result = await response.json()
            
            if (response.ok) {
                setRecovered(true)
                toast.success('Username recovery email sent!')
                // For development - show the username
                if (result.username) {
                    toast.success(`Your username is: ${result.username}`)
                }
            } else {
                toast.error(result.message || 'Recovery failed')
            }
        } catch {
            toast.error('Recovery failed')
        } finally {
            setLoading(false)
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
                        <div className="mx-auto w-16 h-16 bg-gradient-to-r from-indigo-500 to-purple-600 rounded-full flex items-center justify-center mb-4">
                            <User className="h-8 w-8 text-white" />
                        </div>
                        <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
                            Recover Username
                        </h1>
                        <p className="text-gray-600 dark:text-gray-400">
                            Enter your email address to recover your username
                        </p>
                    </div>

                    {!recovered ? (
                        /* Form */
                        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
                            <div>
                                <Input
                                    {...register('email')}
                                    type="email"
                                    placeholder="Enter your email address"
                                    className={`w-full px-4 py-3 bg-white/50 dark:bg-gray-800/50 border rounded-xl transition-all duration-200 focus:ring-2 focus:ring-indigo-500 focus:border-transparent ${
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
                                className="w-full bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 disabled:from-gray-400 disabled:to-gray-500 text-white font-semibold py-3 px-6 rounded-xl transition-all duration-200 shadow-lg hover:shadow-xl disabled:cursor-not-allowed flex items-center justify-center space-x-2"
                            >
                                {loading ? (
                                    <>
                                        <div className="animate-spin rounded-full h-5 w-5 border-2 border-white border-t-transparent"></div>
                                        <span>Sending...</span>
                                    </>
                                ) : (
                                    <>
                                        <User className="h-5 w-5" />
                                        <span>Recover Username</span>
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
                                    Recovery email sent!
                                </p>
                                <p className="text-green-700 dark:text-green-300 text-sm mt-2">
                                    If an account exists with this email, the username has been sent to your inbox
                                </p>
                            </div>
                            
                            <div className="text-center">
                                <button
                                    onClick={() => setRecovered(false)}
                                    className="inline-flex items-center space-x-2 px-4 py-2 bg-white/50 dark:bg-gray-800/50 border border-gray-200 dark:border-gray-700 rounded-xl text-gray-700 dark:text-gray-300 hover:bg-white dark:hover:bg-gray-800 transition-colors"
                                >
                                    <RotateCcw className="h-4 w-4" />
                                    <span>Try Another Email</span>
                                </button>
                            </div>
                        </div>
                    )}

                    {/* Footer */}
                    <div className="mt-8 text-center">
                        <p className="text-gray-600 dark:text-gray-400 text-sm">
                            Remember your username?{' '}
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
