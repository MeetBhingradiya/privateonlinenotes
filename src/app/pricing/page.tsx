'use client'

import { useState } from 'react'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { ArrowLeft, Check, Star } from 'lucide-react'
import { useAuth } from '@/components/providers/auth-provider'
import { Header } from '@/components/header'
import toast from 'react-hot-toast'

declare global {
    interface Window {
        Razorpay: any;
    }
}

const plans = [
    {
        name: 'Free',
        price: '₹0',
        period: '/month',
        description: 'Perfect for getting started',
        features: [
            '10 files maximum',
            '1MB file size limit',
            'Basic sharing',
            'Community support'
        ],
        popular: false,
        planId: 'free'
    },
    {
        name: 'Premium',
        price: '₹299',
        period: '/month',
        description: 'For power users and teams',
        features: [
            'Unlimited files',
            '100MB file size limit',
            'Advanced sharing with expiry',
            'Version history',
            'Priority support',
            'Custom themes',
            'Analytics dashboard'
        ],
        popular: true,
        planId: 'premium'
    },
    {
        name: 'Enterprise',
        price: '₹999',
        period: '/month',
        description: 'For large organizations',
        features: [
            'Everything in Premium',
            '1GB file size limit',
            'Team management',
            'Admin controls',
            'SSO integration',
            'Custom branding',
            'Dedicated support'
        ],
        popular: false,
        planId: 'enterprise'
    }
]

export default function PricingPage() {
    const { user } = useAuth()
    const [loading, setLoading] = useState<string | null>(null)

    const isTestMode = process.env.NODE_ENV === 'development'

    const handleSubscribe = async (planId: string, price: number) => {
        if (!user) {
            toast.error('Please login to subscribe')
            return
        }

        if (planId === 'free') {
            toast('You are already on the free plan')
            return
        }

        setLoading(planId)

        try {
            // Create order on backend
            const response = await fetch('/api/payments/create-order', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ planId, amount: price * 100 }) // Convert to paise
            })

            if (!response.ok) {
                const errorData = await response.json()
                console.error('Order creation failed:', errorData)
                throw new Error(errorData.message || 'Failed to create order')
            }

            const order = await response.json()
            console.log('Order created successfully:', order)

            // Check if Razorpay key is available
            const razorpayKey = process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID
            if (!razorpayKey) {
                throw new Error('Razorpay key not configured')
            }

            console.log('Using Razorpay key:', razorpayKey.substring(0, 10) + '...')

            // Load Razorpay script
            const script = document.createElement('script')
            script.src = 'https://checkout.razorpay.com/v1/checkout.js'
            script.onerror = () => {
                console.error('Failed to load Razorpay script')
                toast.error('Failed to load payment gateway')
                setLoading(null)
            }
            script.onload = () => {
                console.log('Razorpay script loaded successfully')

                if (!window.Razorpay) {
                    console.error('Razorpay object not available')
                    toast.error('Payment gateway not available')
                    setLoading(null)
                    return
                }

                const options = {
                    key: razorpayKey,
                    amount: order.amount,
                    currency: order.currency,
                    name: 'Notta.in',
                    description: `${planId.charAt(0).toUpperCase() + planId.slice(1)} Plan`,
                    order_id: order.id,
                    handler: async (response: any) => {
                        try {
                            // Verify payment on backend
                            const verifyResponse = await fetch('/api/payments/verify', {
                                method: 'POST',
                                headers: { 'Content-Type': 'application/json' },
                                body: JSON.stringify({
                                    orderId: order.id,
                                    paymentId: response.razorpay_payment_id,
                                    signature: response.razorpay_signature,
                                    planId
                                })
                            })

                            if (verifyResponse.ok) {
                                toast.success('Subscription activated successfully!')
                                window.location.reload()
                            } else {
                                throw new Error('Payment verification failed')
                            }
                        } catch (error) {
                            console.error('Payment verification error:', error)
                            toast.error('Payment verification failed')
                        }
                    },
                    prefill: {
                        name: user.name,
                        email: user.email
                    },
                    theme: {
                        color: '#3B82F6'
                    }
                }

                console.log('Opening Razorpay checkout with options:', options)
                const rzp = new window.Razorpay(options)

                rzp.on('payment.failed', function (response: any) {
                    console.error('Payment failed:', response.error)
                    toast.error(`Payment failed: ${response.error.description}`)
                    setLoading(null)
                })

                rzp.open()
            }
            document.head.appendChild(script)
        } catch (error) {
            console.error('Payment initialization error:', error)
            toast.error('Failed to initialize payment')
        } finally {
            setLoading(null)
        }
    }

    return (
        <div className="min-h-screen bg-background">
            <Header />
            <div className="container mx-auto px-4 py-8">
                <div className="max-w-6xl mx-auto">
                    <div className="mb-8">
                        <Link href="/dashboard">
                            <Button variant="ghost" className="mb-4">
                                <ArrowLeft className="h-4 w-4 mr-2" />
                                Back to Dashboard
                            </Button>
                        </Link>
                        <div className="text-center">
                            <h1 className="text-4xl font-bold mb-4">Choose Your Plan</h1>
                            <p className="text-xl text-muted-foreground">
                                Upgrade to unlock powerful features and boost your productivity
                            </p>
                            {isTestMode && (
                                <div className="mt-4 p-3 bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg">
                                    <p className="text-sm text-yellow-800 dark:text-yellow-200">
                                        🧪 <strong>Test Mode:</strong> Use test card 4111 1111 1111 1111 for successful payments
                                    </p>
                                </div>
                            )}
                        </div>
                    </div>

                    <div className="grid md:grid-cols-3 gap-8">
                        {plans.map((plan) => (
                            <Card key={plan.planId} className={`relative ${plan.popular ? 'border-blue-500 shadow-lg' : ''}`}>
                                {plan.popular && (
                                    <div className="absolute -top-3 left-1/2 transform -translate-x-1/2">
                                        <div className="bg-blue-500 text-white px-4 py-1 rounded-full text-sm font-medium flex items-center">
                                            <Star className="h-4 w-4 mr-1" />
                                            Most Popular
                                        </div>
                                    </div>
                                )}

                                <CardHeader className="text-center">
                                    <CardTitle className="text-2xl">{plan.name}</CardTitle>
                                    <CardDescription>{plan.description}</CardDescription>
                                    <div className="mt-4">
                                        <span className="text-4xl font-bold">{plan.price}</span>
                                        <span className="text-muted-foreground">{plan.period}</span>
                                    </div>
                                </CardHeader>

                                <CardContent>
                                    <ul className="space-y-3 mb-6">
                                        {plan.features.map((feature, index) => (
                                            <li key={index} className="flex items-center">
                                                <Check className="h-4 w-4 text-green-500 mr-3 flex-shrink-0" />
                                                <span className="text-sm">{feature}</span>
                                            </li>
                                        ))}
                                    </ul>

                                    <Button
                                        className="w-full"
                                        variant={plan.popular ? 'default' : 'outline'}
                                        onClick={() => handleSubscribe(plan.planId, parseInt(plan.price.replace('₹', '')))}
                                        disabled={loading === plan.planId || (user?.plan === plan.planId)}
                                    >
                                        {loading === plan.planId ? 'Processing...' :
                                            user?.plan === plan.planId ? 'Current Plan' :
                                                plan.planId === 'free' ? 'Free Forever' : 'Subscribe Now'}
                                    </Button>
                                </CardContent>
                            </Card>
                        ))}
                    </div>

                    <div className="mt-12 text-center">
                        <p className="text-muted-foreground">
                            All plans include 24/7 customer support and a 30-day money-back guarantee.
                        </p>
                    </div>

                    {isTestMode && (
                        <Card className="mt-8 bg-blue-50 dark:bg-blue-950/20 border-blue-200 dark:border-blue-800">
                            <CardHeader>
                                <CardTitle className="flex items-center text-blue-800 dark:text-blue-200">
                                    🧪 Test Payment Information
                                </CardTitle>
                            </CardHeader>
                            <CardContent>
                                <div className="grid md:grid-cols-2 gap-6">
                                    <div>
                                        <h4 className="font-semibold mb-2 text-blue-800 dark:text-blue-200">Test Card Numbers:</h4>
                                        <ul className="space-y-1 text-sm text-blue-700 dark:text-blue-300">
                                            <li><strong>Success:</strong> 4111 1111 1111 1111</li>
                                            <li><strong>Success:</strong> 5555 5555 5555 4444</li>
                                            <li><strong>Failure:</strong> 4000 0000 0000 0002</li>
                                            <li><strong>CVV:</strong> Any 3 digits</li>
                                            <li><strong>Expiry:</strong> Any future date</li>
                                        </ul>
                                    </div>
                                    <div>
                                        <h4 className="font-semibold mb-2 text-blue-800 dark:text-blue-200">Test UPI IDs:</h4>
                                        <ul className="space-y-1 text-sm text-blue-700 dark:text-blue-300">
                                            <li><strong>Success:</strong> success@razorpay</li>
                                            <li><strong>Failure:</strong> failure@razorpay</li>
                                        </ul>
                                        <p className="text-xs text-blue-600 dark:text-blue-400 mt-2">
                                            💡 No real money will be charged in test mode
                                        </p>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>
                    )}
                </div>
            </div>
        </div>
    )
}
