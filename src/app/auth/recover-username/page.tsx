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
import { ArrowLeft } from 'lucide-react'

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
                            Recover Username
                        </CardTitle>
                        <CardDescription className="text-center text-foreground/70">
                            Enter your email to recover your username
                        </CardDescription>
                    </CardHeader>

                <CardContent>
                    {!recovered ? (
                        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
                            <div>
                                <Input
                                    {...register('email')}
                                    type="email"
                                    placeholder="Email address"
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
                                tooltip="Send username recovery email"
                            >
                                {loading ? 'Sending...' : 'Recover Username'}
                            </IconButton>
                        </form>
                    ) : (
                        <div className="text-center space-y-4">
                            <div className="p-4 bg-green-50 dark:bg-green-900/20 rounded-lg border border-green-200 dark:border-green-800">
                                <p className="text-green-800 dark:text-green-200">
                                    If an account with this email exists, the username has been sent to your email.
                                </p>
                            </div>
                            <IconButton
                                onClick={() => setRecovered(false)}
                                variant="outline"
                                className="w-full"
                                icon="refresh"
                                tooltip="Try another email"
                            >
                                Try Another Email
                            </IconButton>
                        </div>
                    )}

                    <div className="mt-6 text-center">
                        <p className="text-sm text-foreground/60">
                            Remember your username?{' '}
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
