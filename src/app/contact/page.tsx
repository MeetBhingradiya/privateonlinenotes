'use client'

import { useState } from 'react'
import Link from 'next/link'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { ArrowLeft, Mail, MapPin, Clock, Send, MessageSquare, AlertCircle, CheckCircle, Globe } from 'lucide-react'
import { Header } from '@/components/header'
import toast from 'react-hot-toast'

const contactSchema = z.object({
    name: z.string().min(2, 'Name must be at least 2 characters'),
    email: z.string().email('Please enter a valid email'),
    subject: z.string().min(5, 'Subject must be at least 5 characters'),
    message: z.string().min(10, 'Message must be at least 10 characters'),
})

type ContactFormData = z.infer<typeof contactSchema>

export default function ContactPage() {
    const [loading, setLoading] = useState(false)

    const {
        register,
        handleSubmit,
        reset,
        formState: { errors },
    } = useForm<ContactFormData>({
        resolver: zodResolver(contactSchema),
    })

    const onSubmit = async (data: ContactFormData) => {
        setLoading(true)
        try {
            const response = await fetch('/api/contact', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(data),
            })

            if (response.ok) {
                toast.success('Message sent successfully! We\'ll get back to you soon.')
                reset()
            } else {
                toast.error('Failed to send message. Please try again.')
            }
        } catch {
            toast.error('An error occurred. Please try again.')
        } finally {
            setLoading(false)
        }
    }

    return (
        <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 dark:from-gray-950 dark:via-blue-950 dark:to-indigo-950">
            <Header />
            
            <div className="container mx-auto px-6 py-8">
                <div className="max-w-7xl mx-auto">
                    
                    {/* Enhanced Header */}
                    <div className="relative mb-16">
                        <div className="absolute inset-0 bg-grid-pattern opacity-5"></div>
                        <div className="relative">
                            <Link href="/">
                                <Button variant="ghost" className="mb-8 bg-white/80 dark:bg-gray-900/80 backdrop-blur-sm shadow-lg hover:shadow-xl transition-all border-0 rounded-xl">
                                    <ArrowLeft className="h-4 w-4 mr-2" />
                                    Back to Home
                                </Button>
                            </Link>
                            
                            <div className="text-center">
                                <div className="inline-flex items-center rounded-full border bg-white/80 dark:bg-gray-900/80 backdrop-blur-sm px-6 py-3 text-sm shadow-lg mb-8">
                                    <MessageSquare className="mr-2 h-4 w-4 text-blue-600" />
                                    <span className="font-medium">Get in Touch</span>
                                    <div className="ml-3 w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                                </div>

                                <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold tracking-tight mb-6">
                                    <span className="bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 bg-clip-text text-transparent">
                                        Contact Us
                                    </span>
                                </h1>

                                <p className="text-lg md:text-xl text-gray-600 dark:text-gray-300 max-w-3xl mx-auto leading-relaxed">
                                    Have questions about NottaIn? We'd love to hear from you. Our team is here to help you get the most out of our platform.
                                </p>
                            </div>
                        </div>
                    </div>

                    <div className="grid lg:grid-cols-3 gap-8">
                        
                        {/* Contact Information - Left Column */}
                        <div className="lg:col-span-1 space-y-6">
                            
                            {/* Contact Details Card */}
                            <Card className="border-0 bg-white/80 dark:bg-gray-900/80 backdrop-blur-sm shadow-xl overflow-hidden">
                                <CardHeader className="text-center pb-4">
                                    <div className="w-16 h-16 bg-gradient-to-br from-blue-500 via-purple-600 to-pink-600 rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-lg">
                                        <Mail className="h-8 w-8 text-white" />
                                    </div>
                                    <CardTitle className="text-xl text-gray-900 dark:text-gray-100">Get in Touch</CardTitle>
                                    <CardDescription className="text-gray-600 dark:text-gray-300">
                                        Reach out through any of these channels
                                    </CardDescription>
                                </CardHeader>
                                <CardContent className="space-y-6">
                                    <div className="flex items-start space-x-4 p-4 bg-blue-50 dark:bg-blue-950/30 rounded-xl border border-blue-200 dark:border-blue-800">
                                        <div className="w-10 h-10 bg-blue-100 dark:bg-blue-900 rounded-lg flex items-center justify-center flex-shrink-0">
                                            <Mail className="h-5 w-5 text-blue-600 dark:text-blue-400" />
                                        </div>
                                        <div>
                                            <p className="font-semibold text-gray-900 dark:text-gray-100">Email</p>
                                            <p className="text-blue-600 dark:text-blue-400 font-medium">contact@notta.in</p>
                                            <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                                                We typically respond within 24 hours
                                            </p>
                                        </div>
                                    </div>

                                    <div className="flex items-start space-x-4 p-4 bg-purple-50 dark:bg-purple-950/30 rounded-xl border border-purple-200 dark:border-purple-800">
                                        <div className="w-10 h-10 bg-purple-100 dark:bg-purple-900 rounded-lg flex items-center justify-center flex-shrink-0">
                                            <MapPin className="h-5 w-5 text-purple-600 dark:text-purple-400" />
                                        </div>
                                        <div>
                                            <p className="font-semibold text-gray-900 dark:text-gray-100">Address</p>
                                            <p className="text-gray-700 dark:text-gray-300">
                                                Surat, Gujarat, 395004<br />
                                                India
                                            </p>
                                        </div>
                                    </div>

                                    <div className="flex items-start space-x-4 p-4 bg-green-50 dark:bg-green-950/30 rounded-xl border border-green-200 dark:border-green-800">
                                        <div className="w-10 h-10 bg-green-100 dark:bg-green-900 rounded-lg flex items-center justify-center flex-shrink-0">
                                            <Clock className="h-5 w-5 text-green-600 dark:text-green-400" />
                                        </div>
                                        <div>
                                            <p className="font-semibold text-gray-900 dark:text-gray-100">Business Hours</p>
                                            <div className="text-sm text-gray-700 dark:text-gray-300 space-y-1">
                                                <p>Monday - Friday: 9:00 AM - 6:00 PM IST</p>
                                                <p>Saturday: 10:00 AM - 4:00 PM IST</p>
                                                <p>Sunday: Closed</p>
                                            </div>
                                        </div>
                                    </div>
                                </CardContent>
                            </Card>

                            {/* Quick Links Card */}
                            <Card className="border-0 bg-white/80 dark:bg-gray-900/80 backdrop-blur-sm shadow-xl overflow-hidden">
                                <CardHeader>
                                    <CardTitle className="text-lg flex items-center text-gray-900 dark:text-gray-100">
                                        <Globe className="h-5 w-5 mr-2 text-blue-500" />
                                        Quick Links
                                    </CardTitle>
                                </CardHeader>
                                <CardContent className="space-y-3">
                                    <Link href="/privacy" className="flex items-center p-3 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors group">
                                        <div className="w-2 h-2 bg-blue-500 rounded-full mr-3 group-hover:scale-125 transition-transform"></div>
                                        <span className="text-gray-700 dark:text-gray-300 group-hover:text-blue-600 dark:group-hover:text-blue-400">Privacy Policy</span>
                                    </Link>
                                    <Link href="/terms" className="flex items-center p-3 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors group">
                                        <div className="w-2 h-2 bg-purple-500 rounded-full mr-3 group-hover:scale-125 transition-transform"></div>
                                        <span className="text-gray-700 dark:text-gray-300 group-hover:text-purple-600 dark:group-hover:text-purple-400">Terms of Service</span>
                                    </Link>
                                    <Link href="/pricing" className="flex items-center p-3 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors group">
                                        <div className="w-2 h-2 bg-green-500 rounded-full mr-3 group-hover:scale-125 transition-transform"></div>
                                        <span className="text-gray-700 dark:text-gray-300 group-hover:text-green-600 dark:group-hover:text-green-400">Pricing Plans</span>
                                    </Link>
                                </CardContent>
                            </Card>
                        </div>

                        {/* Contact Form - Right Column */}
                        <div className="lg:col-span-2">
                            <Card className="border-0 bg-white/80 dark:bg-gray-900/80 backdrop-blur-sm shadow-xl overflow-hidden">
                                <CardHeader className="pb-8">
                                    <div className="flex items-center space-x-4">
                                        <div className="w-12 h-12 bg-gradient-to-br from-green-500 via-blue-600 to-purple-600 rounded-xl flex items-center justify-center shadow-lg">
                                            <Send className="h-6 w-6 text-white" />
                                        </div>
                                        <div>
                                            <CardTitle className="text-2xl text-gray-900 dark:text-gray-100">Send a Message</CardTitle>
                                            <CardDescription className="text-gray-600 dark:text-gray-300">
                                                Fill out the form below and we'll get back to you as soon as possible
                                            </CardDescription>
                                        </div>
                                    </div>
                                </CardHeader>
                                <CardContent>
                                    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
                                        
                                        <div className="grid md:grid-cols-2 gap-6">
                                            <div>
                                                <label className="text-sm font-semibold mb-3 block text-gray-700 dark:text-gray-300">
                                                    Full Name *
                                                </label>
                                                <Input
                                                    {...register('name')}
                                                    placeholder="Enter your full name"
                                                    className={`h-12 rounded-xl border-gray-200 dark:border-gray-700 focus:border-blue-500 dark:focus:border-blue-400 focus:ring-blue-500/20 transition-all ${
                                                        errors.name ? 'border-red-500 focus:border-red-500' : ''
                                                    }`}
                                                />
                                                {errors.name && (
                                                    <p className="text-red-500 text-sm mt-2 flex items-center">
                                                        <AlertCircle className="h-4 w-4 mr-1" />
                                                        {errors.name.message}
                                                    </p>
                                                )}
                                            </div>

                                            <div>
                                                <label className="text-sm font-semibold mb-3 block text-gray-700 dark:text-gray-300">
                                                    Email Address *
                                                </label>
                                                <div className="relative">
                                                    <Mail className="absolute left-4 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                                                    <Input
                                                        {...register('email')}
                                                        type="email"
                                                        placeholder="your@email.com"
                                                        className={`h-12 pl-12 rounded-xl border-gray-200 dark:border-gray-700 focus:border-blue-500 dark:focus:border-blue-400 focus:ring-blue-500/20 transition-all ${
                                                            errors.email ? 'border-red-500 focus:border-red-500' : ''
                                                        }`}
                                                    />
                                                </div>
                                                {errors.email && (
                                                    <p className="text-red-500 text-sm mt-2 flex items-center">
                                                        <AlertCircle className="h-4 w-4 mr-1" />
                                                        {errors.email.message}
                                                    </p>
                                                )}
                                            </div>
                                        </div>

                                        <div>
                                            <label className="text-sm font-semibold mb-3 block text-gray-700 dark:text-gray-300">
                                                Subject *
                                            </label>
                                            <Input
                                                {...register('subject')}
                                                placeholder="What is this regarding?"
                                                className={`h-12 rounded-xl border-gray-200 dark:border-gray-700 focus:border-blue-500 dark:focus:border-blue-400 focus:ring-blue-500/20 transition-all ${
                                                    errors.subject ? 'border-red-500 focus:border-red-500' : ''
                                                }`}
                                            />
                                            {errors.subject && (
                                                <p className="text-red-500 text-sm mt-2 flex items-center">
                                                    <AlertCircle className="h-4 w-4 mr-1" />
                                                    {errors.subject.message}
                                                </p>
                                            )}
                                        </div>

                                        <div>
                                            <label className="text-sm font-semibold mb-3 block text-gray-700 dark:text-gray-300">
                                                Message *
                                            </label>
                                            <Textarea
                                                {...register('message')}
                                                placeholder="Please provide details about your inquiry..."
                                                rows={6}
                                                className={`rounded-xl border-gray-200 dark:border-gray-700 focus:border-blue-500 dark:focus:border-blue-400 focus:ring-blue-500/20 transition-all resize-none ${
                                                    errors.message ? 'border-red-500 focus:border-red-500' : ''
                                                }`}
                                            />
                                            {errors.message && (
                                                <p className="text-red-500 text-sm mt-2 flex items-center">
                                                    <AlertCircle className="h-4 w-4 mr-1" />
                                                    {errors.message.message}
                                                </p>
                                            )}
                                        </div>

                                        <div className="flex flex-col sm:flex-row gap-4 pt-4">
                                            <Button 
                                                type="submit" 
                                                disabled={loading}
                                                className="flex-1 h-12 rounded-xl bg-gradient-to-r from-blue-500 to-indigo-600 hover:from-blue-600 hover:to-indigo-700 text-white shadow-lg hover:shadow-xl transition-all duration-300"
                                            >
                                                {loading ? (
                                                    <div className="flex items-center">
                                                        <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent mr-2"></div>
                                                        Sending Message...
                                                    </div>
                                                ) : (
                                                    <div className="flex items-center">
                                                        <Send className="h-4 w-4 mr-2" />
                                                        Send Message
                                                    </div>
                                                )}
                                            </Button>
                                            
                                            <Button 
                                                type="button" 
                                                variant="outline"
                                                onClick={() => reset()}
                                                className="h-12 rounded-xl border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-all"
                                            >
                                                Clear Form
                                            </Button>
                                        </div>

                                        <div className="p-4 bg-blue-50 dark:bg-blue-950/30 rounded-xl border border-blue-200 dark:border-blue-800">
                                            <div className="flex items-start space-x-3">
                                                <CheckCircle className="h-5 w-5 text-blue-600 dark:text-blue-400 mt-0.5 flex-shrink-0" />
                                                <div className="text-sm text-blue-700 dark:text-blue-300">
                                                    <p className="font-medium mb-1">Response Time</p>
                                                    <p>We typically respond to all inquiries within 24 hours during business days. For urgent matters, please include "URGENT" in your subject line.</p>
                                                </div>
                                            </div>
                                        </div>
                                    </form>
                                </CardContent>
                            </Card>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    )
}
