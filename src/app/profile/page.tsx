'use client'

import { useState, useEffect } from 'react'
import { useAuth } from '@/components/providers/auth-provider'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent } from '@/components/ui/card'
import { PageLayout } from '@/components/page-layout'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import toast from 'react-hot-toast'
import { User, Mail, Lock, Shield, Settings, Trash2, Save, Eye, EyeOff, ArrowRight, Crown, Calendar, FileText, Star, AlertTriangle } from 'lucide-react'

// Extended user type with MongoDB properties
interface ExtendedUser {
    id?: string
    name?: string
    email?: string
    username?: string
    plan?: 'free' | 'premium' | 'enterprise'
    role?: 'user' | 'moderator' | 'admin'
    avatar?: string
    isBlocked?: boolean
    createdAt?: string | Date
    filesCount?: number
}

const profileSchema = z.object({
    name: z.string().min(2, 'Name must be at least 2 characters'),
    email: z.string().email('Please enter a valid email'),
})

const passwordSchema = z.object({
    currentPassword: z.string().min(1, 'Current password is required'),
    newPassword: z.string().min(6, 'Password must be at least 6 characters'),
    confirmPassword: z.string(),
}).refine((data) => data.newPassword === data.confirmPassword, {
    message: "Passwords don't match",
    path: ["confirmPassword"],
})

type ProfileFormData = z.infer<typeof profileSchema>
type PasswordFormData = z.infer<typeof passwordSchema>

export default function ProfilePage() {
    const { user, updateUser, loading: authLoading } = useAuth()
    const router = useRouter()
    const [loading, setLoading] = useState(false)
    const [passwordLoading, setPasswordLoading] = useState(false)
    const [showCurrentPassword, setShowCurrentPassword] = useState(false)
    const [showNewPassword, setShowNewPassword] = useState(false)
    const [showConfirmPassword, setShowConfirmPassword] = useState(false)
    const [extendedUser, setExtendedUser] = useState<ExtendedUser | null>(null)
    const [filesCount, setFilesCount] = useState(0)

    const profileForm = useForm<ProfileFormData>({
        resolver: zodResolver(profileSchema),
        defaultValues: {
            name: '',
            email: '',
        },
    })

    const passwordForm = useForm<PasswordFormData>({
        resolver: zodResolver(passwordSchema),
    })

    // Update form when user data is loaded
    useEffect(() => {
        if (user) {
            profileForm.reset({
                name: user.name || '',
                email: user.email || '',
            })

            // Fetch extended user data and files count
            fetchExtendedUserData()
        }
    }, [user, profileForm])

    const fetchExtendedUserData = async () => {
        try {
            // Fetch user profile data
            const profileResponse = await fetch('/api/auth/me')
            if (profileResponse.ok) {
                const profileData = await profileResponse.json()
                setExtendedUser(profileData)
            }

            // Fetch files count
            const filesResponse = await fetch('/api/files')
            if (filesResponse.ok) {
                const filesData = await filesResponse.json()
                setFilesCount(filesData.files?.length || 0)
            }
        } catch (error) {
            console.error('Failed to fetch extended user data:', error)
        }
    }

    // Show loading while auth is being checked
    if (authLoading) {
        return (
            <PageLayout title="Profile" showBackButton={true} backTo="/dashboard">
                <div className="flex items-center justify-center min-h-[60vh]">
                    <div className="text-center">
                        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
                        <p className="text-lg">Loading profile...</p>
                    </div>
                </div>
            </PageLayout>
        )
    }

    // Redirect if not authenticated
    if (!user) {
        router.push('/auth/login')
        return null
    }

    const onProfileSubmit = async (data: ProfileFormData) => {
        setLoading(true)
        try {
            const response = await fetch('/api/user/profile', {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(data),
            })

            if (response.ok) {
                const updatedUser = await response.json()
                updateUser(updatedUser)
                toast.success('Profile updated successfully!')
            } else {
                const error = await response.json()
                toast.error(error.message || 'Failed to update profile')
            }
        } catch {
            toast.error('An error occurred. Please try again.')
        } finally {
            setLoading(false)
        }
    }

    const onPasswordSubmit = async (data: PasswordFormData) => {
        setPasswordLoading(true)
        try {
            console.log('Submitting password change request...')
            const response = await fetch('/api/user/password', {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    currentPassword: data.currentPassword,
                    newPassword: data.newPassword,
                }),
            })

            const result = await response.json()
            console.log('Password change response:', { status: response.status, result })

            if (response.ok || result.success) {
                toast.success('Password updated successfully!')
                passwordForm.reset()
                setShowCurrentPassword(false)
                setShowNewPassword(false)
                setShowConfirmPassword(false)
            } else {
                console.error('Password change failed:', result)
                toast.error(result.message || 'Failed to update password')
            }
        } catch (error) {
            console.error('Password change error:', error)
            toast.error('An error occurred. Please try again.')
        } finally {
            setPasswordLoading(false)
        }
    }

    const handleDeleteAccount = async () => {
        if (!confirm('Are you sure you want to delete your account? This action cannot be undone and will permanently delete all your files and data.')) {
            return
        }

        try {
            const response = await fetch('/api/user/delete', {
                method: 'DELETE',
            })

            if (response.ok) {
                toast.success('Account deleted successfully')
                router.push('/auth/login')
            } else {
                const error = await response.json()
                toast.error(error.message || 'Failed to delete account')
            }
        } catch {
            toast.error('An error occurred. Please try again.')
        }
    }

    const formatDate = (dateString: string | Date) => {
        return new Date(dateString).toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'long',
            day: 'numeric'
        })
    }

    return (
        <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 dark:from-gray-950 dark:via-blue-950 dark:to-indigo-950">
            <PageLayout title="Profile Settings" showBackButton={true} backTo="/dashboard" className="bg-transparent">
                <div className="container mx-auto px-6 py-8">
                    <div className="max-w-6xl mx-auto space-y-8">

                        {/* Enhanced Header */}
                        <div className="relative">
                            <div className="absolute inset-0 bg-grid-pattern opacity-5"></div>
                            <div className="relative text-center mb-12">
                                <div className="inline-flex items-center rounded-full border bg-white/80 dark:bg-gray-900/80 backdrop-blur-sm px-6 py-3 text-sm shadow-lg mb-6">
                                    <Settings className="mr-2 h-4 w-4 text-blue-600" />
                                    <span className="font-medium">Account Settings</span>
                                    <div className="ml-3 w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                                </div>

                                <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold tracking-tight mb-4">
                                    <span className="bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 bg-clip-text text-transparent">
                                        Profile Settings
                                    </span>
                                </h1>

                                <p className="text-lg md:text-xl text-gray-600 dark:text-gray-300 max-w-3xl mx-auto leading-relaxed">
                                    Manage your account information, security settings, and preferences
                                </p>
                            </div>
                        </div>

                        <div className="grid grid-cols-1 xl:grid-cols-3 gap-8">

                            {/* Left Column - Profile Overview */}
                            <div className="xl:col-span-1 space-y-6">

                                {/* Profile Card */}
                                <Card className="border-0 bg-white/80 dark:bg-gray-900/80 backdrop-blur-sm shadow-xl overflow-hidden">
                                    <CardContent className="p-8">
                                        <div className="text-center space-y-6">
                                            {/* Avatar */}
                                            <div className="relative">
                                                <div className="w-32 h-32 bg-gradient-to-br from-blue-500 via-purple-600 to-pink-600 rounded-3xl flex items-center justify-center mx-auto shadow-2xl">
                                                    <span className="text-white font-bold text-4xl">
                                                        {user.name ? user.name.charAt(0).toUpperCase() : user.username ? user.username.charAt(0).toUpperCase() : '?'}
                                                    </span>
                                                </div>
                                                <div className="absolute -bottom-2 -right-2 w-8 h-8 bg-green-500 rounded-full flex items-center justify-center border-4 border-white dark:border-gray-900">
                                                    <div className="w-3 h-3 bg-white rounded-full"></div>
                                                </div>
                                            </div>

                                            {/* User Info */}
                                            <div className="space-y-2">
                                                <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-100">
                                                    {user.name || user.username || 'Anonymous User'}
                                                </h2>
                                                <p className="text-gray-600 dark:text-gray-400">@{user.username || 'unknown'}</p>
                                                <p className="text-sm text-gray-500 dark:text-gray-500">{user.email}</p>
                                            </div>

                                            {/* Plan Badge */}
                                            <div className="flex justify-center">
                                                <div className={`inline-flex items-center px-4 py-2 rounded-full text-sm font-semibold ${user.plan === 'premium'
                                                        ? 'bg-gradient-to-r from-yellow-400 to-orange-500 text-white'
                                                        : 'bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300'
                                                    }`}>
                                                    {user.plan === 'premium' ? (
                                                        <Crown className="w-4 h-4 mr-2" />
                                                    ) : (
                                                        <Star className="w-4 h-4 mr-2" />
                                                    )}
                                                    {user.plan?.charAt(0).toUpperCase() + user.plan?.slice(1)} Plan
                                                </div>
                                            </div>

                                            {/* Stats */}
                                            <div className="grid grid-cols-2 gap-4 pt-6 border-t border-gray-200 dark:border-gray-700">
                                                <div className="text-center">
                                                    <div className="text-2xl font-bold text-blue-600 dark:text-blue-400">
                                                        {filesCount}
                                                    </div>
                                                    <div className="text-sm text-gray-600 dark:text-gray-400">Files</div>
                                                </div>
                                                <div className="text-center">
                                                    <div className="text-2xl font-bold text-purple-600 dark:text-purple-400">
                                                        {extendedUser?.createdAt ? Math.floor((Date.now() - new Date(extendedUser.createdAt).getTime()) / (1000 * 60 * 60 * 24)) : 0}
                                                    </div>
                                                    <div className="text-sm text-gray-600 dark:text-gray-400">Days</div>
                                                </div>
                                            </div>
                                        </div>
                                    </CardContent>
                                </Card>

                                {/* Account Info */}
                                <Card className="border-0 bg-white/80 dark:bg-gray-900/80 backdrop-blur-sm shadow-xl overflow-hidden">
                                    <CardContent className="p-6">
                                        <h3 className="font-bold text-lg mb-4 flex items-center text-gray-900 dark:text-gray-100">
                                            <Shield className="h-5 w-5 mr-2 text-blue-500" />
                                            Account Information
                                        </h3>

                                        <div className="space-y-4">
                                            <div className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-800/50 rounded-lg">
                                                <span className="text-sm text-gray-600 dark:text-gray-400">Role</span>
                                                <span className="text-sm font-medium text-gray-900 dark:text-gray-100 capitalize">
                                                    {user.role || 'User'}
                                                </span>
                                            </div>

                                            <div className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-800/50 rounded-lg">
                                                <span className="text-sm text-gray-600 dark:text-gray-400">Member Since</span>
                                                <span className="text-sm font-medium text-gray-900 dark:text-gray-100">
                                                    {extendedUser?.createdAt ? formatDate(extendedUser.createdAt) : 'Unknown'}
                                                </span>
                                            </div>

                                            <div className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-800/50 rounded-lg">
                                                <span className="text-sm text-gray-600 dark:text-gray-400">Status</span>
                                                <div className="flex items-center">
                                                    <div className={`w-2 h-2 rounded-full mr-2 ${extendedUser?.isBlocked ? 'bg-red-500' : 'bg-green-500'}`}></div>
                                                    <span className="text-sm font-medium text-gray-900 dark:text-gray-100">
                                                        {extendedUser?.isBlocked ? 'Blocked' : 'Active'}
                                                    </span>
                                                </div>
                                            </div>
                                        </div>
                                    </CardContent>
                                </Card>
                            </div>

                            {/* Right Column - Settings Forms */}
                            <div className="xl:col-span-2 space-y-8">

                                {/* Profile Information */}
                                <Card className="border-0 bg-white/80 dark:bg-gray-900/80 backdrop-blur-sm shadow-xl overflow-hidden">
                                    <CardContent className="p-8">
                                        <h3 className="font-bold text-2xl mb-2 flex items-center text-gray-900 dark:text-gray-100">
                                            <User className="h-6 w-6 mr-3 text-blue-500" />
                                            Profile Information
                                        </h3>
                                        <p className="text-gray-600 dark:text-gray-300 mb-8">
                                            Update your personal information and email address
                                        </p>

                                        <form onSubmit={profileForm.handleSubmit(onProfileSubmit)} className="space-y-6">
                                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                                <div>
                                                    <label className="text-sm font-semibold mb-3 block text-gray-700 dark:text-gray-300">
                                                        Full Name
                                                    </label>
                                                    <Input
                                                        {...profileForm.register('name')}
                                                        placeholder="Enter your full name"
                                                        className={`h-12 rounded-xl border-gray-200 dark:border-gray-700 focus:border-blue-500 dark:focus:border-blue-400 focus:ring-blue-500/20 transition-all ${profileForm.formState.errors.name ? 'border-red-500 focus:border-red-500' : ''
                                                            }`}
                                                    />
                                                    {profileForm.formState.errors.name && (
                                                        <p className="text-red-500 text-sm mt-2 flex items-center">
                                                            <AlertTriangle className="h-4 w-4 mr-1" />
                                                            {profileForm.formState.errors.name.message}
                                                        </p>
                                                    )}
                                                </div>

                                                <div>
                                                    <label className="text-sm font-semibold mb-3 block text-gray-700 dark:text-gray-300">
                                                        Email Address
                                                    </label>
                                                    <div className="relative">
                                                        <Mail className="absolute left-4 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                                                        <Input
                                                            {...profileForm.register('email')}
                                                            type="email"
                                                            placeholder="your@email.com"
                                                            className={`h-12 pl-12 rounded-xl border-gray-200 dark:border-gray-700 focus:border-blue-500 dark:focus:border-blue-400 focus:ring-blue-500/20 transition-all ${profileForm.formState.errors.email ? 'border-red-500 focus:border-red-500' : ''
                                                                }`}
                                                        />
                                                    </div>
                                                    {profileForm.formState.errors.email && (
                                                        <p className="text-red-500 text-sm mt-2 flex items-center">
                                                            <AlertTriangle className="h-4 w-4 mr-1" />
                                                            {profileForm.formState.errors.email.message}
                                                        </p>
                                                    )}
                                                </div>
                                            </div>

                                            <div className="flex justify-end">
                                                <Button
                                                    type="submit"
                                                    disabled={loading}
                                                    className="px-8 py-3 rounded-xl bg-gradient-to-r from-blue-500 to-indigo-600 hover:from-blue-600 hover:to-indigo-700 text-white shadow-lg hover:shadow-xl transition-all duration-300"
                                                >
                                                    {loading ? (
                                                        <div className="flex items-center">
                                                            <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent mr-2"></div>
                                                            Saving...
                                                        </div>
                                                    ) : (
                                                        <div className="flex items-center">
                                                            <Save className="h-4 w-4 mr-2" />
                                                            Save Changes
                                                        </div>
                                                    )}
                                                </Button>
                                            </div>
                                        </form>
                                    </CardContent>
                                </Card>

                                {/* Password Security */}
                                <Card className="border-0 bg-white/80 dark:bg-gray-900/80 backdrop-blur-sm shadow-xl overflow-hidden">
                                    <CardContent className="p-8">
                                        <h3 className="font-bold text-2xl mb-2 flex items-center text-gray-900 dark:text-gray-100">
                                            <Lock className="h-6 w-6 mr-3 text-blue-500" />
                                            Password Security
                                        </h3>
                                        <p className="text-gray-600 dark:text-gray-300 mb-8">
                                            Update your password to keep your account secure
                                        </p>

                                        <form onSubmit={passwordForm.handleSubmit(onPasswordSubmit)} className="space-y-6">
                                            <div>
                                                <label className="text-sm font-semibold mb-3 block text-gray-700 dark:text-gray-300">
                                                    Current Password
                                                </label>
                                                <div className="relative">
                                                    <Lock className="absolute left-4 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                                                    <Input
                                                        {...passwordForm.register('currentPassword')}
                                                        type={showCurrentPassword ? 'text' : 'password'}
                                                        placeholder="Enter current password"
                                                        className={`h-12 pl-12 pr-12 rounded-xl border-gray-200 dark:border-gray-700 focus:border-blue-500 dark:focus:border-blue-400 focus:ring-blue-500/20 transition-all ${passwordForm.formState.errors.currentPassword ? 'border-red-500 focus:border-red-500' : ''
                                                            }`}
                                                    />
                                                    <Button
                                                        type="button"
                                                        variant="ghost"
                                                        size="sm"
                                                        onClick={() => setShowCurrentPassword(!showCurrentPassword)}
                                                        className="absolute right-3 top-1/2 transform -translate-y-1/2 h-8 w-8 rounded-full hover:bg-gray-200 dark:hover:bg-gray-700"
                                                    >
                                                        {showCurrentPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                                                    </Button>
                                                </div>
                                                {passwordForm.formState.errors.currentPassword && (
                                                    <p className="text-red-500 text-sm mt-2 flex items-center">
                                                        <AlertTriangle className="h-4 w-4 mr-1" />
                                                        {passwordForm.formState.errors.currentPassword.message}
                                                    </p>
                                                )}
                                            </div>

                                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                                <div>
                                                    <label className="text-sm font-semibold mb-3 block text-gray-700 dark:text-gray-300">
                                                        New Password
                                                    </label>
                                                    <div className="relative">
                                                        <Lock className="absolute left-4 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                                                        <Input
                                                            {...passwordForm.register('newPassword')}
                                                            type={showNewPassword ? 'text' : 'password'}
                                                            placeholder="Enter new password"
                                                            className={`h-12 pl-12 pr-12 rounded-xl border-gray-200 dark:border-gray-700 focus:border-blue-500 dark:focus:border-blue-400 focus:ring-blue-500/20 transition-all ${passwordForm.formState.errors.newPassword ? 'border-red-500 focus:border-red-500' : ''
                                                                }`}
                                                        />
                                                        <Button
                                                            type="button"
                                                            variant="ghost"
                                                            size="sm"
                                                            onClick={() => setShowNewPassword(!showNewPassword)}
                                                            className="absolute right-3 top-1/2 transform -translate-y-1/2 h-8 w-8 rounded-full hover:bg-gray-200 dark:hover:bg-gray-700"
                                                        >
                                                            {showNewPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                                                        </Button>
                                                    </div>
                                                    {passwordForm.formState.errors.newPassword && (
                                                        <p className="text-red-500 text-sm mt-2 flex items-center">
                                                            <AlertTriangle className="h-4 w-4 mr-1" />
                                                            {passwordForm.formState.errors.newPassword.message}
                                                        </p>
                                                    )}
                                                </div>

                                                <div>
                                                    <label className="text-sm font-semibold mb-3 block text-gray-700 dark:text-gray-300">
                                                        Confirm New Password
                                                    </label>
                                                    <div className="relative">
                                                        <Lock className="absolute left-4 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                                                        <Input
                                                            {...passwordForm.register('confirmPassword')}
                                                            type={showConfirmPassword ? 'text' : 'password'}
                                                            placeholder="Confirm new password"
                                                            className={`h-12 pl-12 pr-12 rounded-xl border-gray-200 dark:border-gray-700 focus:border-blue-500 dark:focus:border-blue-400 focus:ring-blue-500/20 transition-all ${passwordForm.formState.errors.confirmPassword ? 'border-red-500 focus:border-red-500' : ''
                                                                }`}
                                                        />
                                                        <Button
                                                            type="button"
                                                            variant="ghost"
                                                            size="sm"
                                                            onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                                                            className="absolute right-3 top-1/2 transform -translate-y-1/2 h-8 w-8 rounded-full hover:bg-gray-200 dark:hover:bg-gray-700"
                                                        >
                                                            {showConfirmPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                                                        </Button>
                                                    </div>
                                                    {passwordForm.formState.errors.confirmPassword && (
                                                        <p className="text-red-500 text-sm mt-2 flex items-center">
                                                            <AlertTriangle className="h-4 w-4 mr-1" />
                                                            {passwordForm.formState.errors.confirmPassword.message}
                                                        </p>
                                                    )}
                                                </div>
                                            </div>

                                            <div className="flex justify-end">
                                                <Button
                                                    type="submit"
                                                    disabled={passwordLoading}
                                                    className="px-8 py-3 rounded-xl bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700 text-white shadow-lg hover:shadow-xl transition-all duration-300"
                                                >
                                                    {passwordLoading ? (
                                                        <div className="flex items-center">
                                                            <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent mr-2"></div>
                                                            Updating...
                                                        </div>
                                                    ) : (
                                                        <div className="flex items-center">
                                                            <Shield className="h-4 w-4 mr-2" />
                                                            Update Password
                                                        </div>
                                                    )}
                                                </Button>
                                            </div>
                                        </form>
                                    </CardContent>
                                </Card>

                                {/* Account Plan */}
                                <Card className="border-0 bg-white/80 dark:bg-gray-900/80 backdrop-blur-sm shadow-xl overflow-hidden">
                                    <CardContent className="p-8">
                                        <h3 className="font-bold text-2xl mb-2 flex items-center text-gray-900 dark:text-gray-100">
                                            <Crown className="h-6 w-6 mr-3 text-blue-500" />
                                            Account Plan
                                        </h3>
                                        <p className="text-gray-600 dark:text-gray-300 mb-8">
                                            Your current plan and usage information
                                        </p>

                                        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between p-6 bg-gradient-to-r from-blue-50 to-purple-50 dark:from-blue-950/30 dark:to-purple-950/30 rounded-2xl border border-blue-200 dark:border-blue-800">
                                            <div className="flex items-center space-x-4">
                                                <div className={`w-16 h-16 rounded-2xl flex items-center justify-center ${user.plan === 'premium'
                                                        ? 'bg-gradient-to-r from-yellow-400 to-orange-500'
                                                        : 'bg-gradient-to-r from-gray-400 to-gray-500'
                                                    }`}>
                                                    {user.plan === 'premium' ? (
                                                        <Crown className="h-8 w-8 text-white" />
                                                    ) : (
                                                        <Star className="h-8 w-8 text-white" />
                                                    )}
                                                </div>
                                                <div>
                                                    <h4 className="text-xl font-bold text-gray-900 dark:text-gray-100 capitalize">
                                                        {user.plan} Plan
                                                    </h4>
                                                    <p className="text-gray-600 dark:text-gray-400">
                                                        {user.plan === 'premium'
                                                            ? 'All premium features included'
                                                            : 'Basic features with limitations'
                                                        }
                                                    </p>
                                                </div>
                                            </div>

                                            {user.plan === 'free' && (
                                                <div className="mt-4 sm:mt-0">
                                                    <Button
                                                        variant="outline"
                                                        className="rounded-xl border-blue-200 dark:border-blue-700 text-blue-600 dark:text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-950/50 transition-all"
                                                    >
                                                        <Crown className="h-4 w-4 mr-2" />
                                                        Upgrade to Premium
                                                        <ArrowRight className="h-4 w-4 ml-2" />
                                                    </Button>
                                                </div>
                                            )}
                                        </div>
                                    </CardContent>
                                </Card>

                                {/* Danger Zone */}
                                <Card className="bg-red-50/80 dark:bg-red-950/20 backdrop-blur-sm shadow-xl overflow-hidden border border-red-200 dark:border-red-800">
                                    <CardContent className="p-8">
                                        <h3 className="font-bold text-2xl mb-2 flex items-center text-red-600 dark:text-red-400">
                                            <AlertTriangle className="h-6 w-6 mr-3" />
                                            Danger Zone
                                        </h3>
                                        <p className="text-red-600 dark:text-red-400 mb-8">
                                            Permanently delete your account and all associated data
                                        </p>

                                        <div className="p-6 bg-white/60 dark:bg-gray-900/40 rounded-2xl border border-red-200 dark:border-red-800">
                                            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between">
                                                <div>
                                                    <h4 className="font-semibold text-gray-900 dark:text-gray-100 mb-2">
                                                        Delete Account
                                                    </h4>
                                                    <p className="text-sm text-gray-600 dark:text-gray-400 max-w-md">
                                                        This action cannot be undone. All your files, shared links, and account data will be permanently deleted.
                                                    </p>
                                                </div>

                                                <div className="mt-4 sm:mt-0">
                                                    <Button
                                                        variant="destructive"
                                                        onClick={handleDeleteAccount}
                                                        className="px-6 py-3 rounded-xl bg-gradient-to-r from-red-500 to-red-600 hover:from-red-600 hover:to-red-700 text-white shadow-lg hover:shadow-xl transition-all duration-300"
                                                    >
                                                        <Trash2 className="h-4 w-4 mr-2" />
                                                        Delete Account
                                                    </Button>
                                                </div>
                                            </div>
                                        </div>
                                    </CardContent>
                                </Card>
                            </div>
                        </div>
                    </div>
                </div>
            </PageLayout>
        </div>
    )
}
