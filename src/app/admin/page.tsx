'use client'

import { useState, useEffect, useCallback } from 'react'
import { useAuth } from '@/components/providers/auth-provider'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { PageLayout } from '@/components/page-layout'
import { Shield, Users, FileText, Share, Ban, Trash2, Search, Clock } from 'lucide-react'
import { formatDate } from '@/lib/utils'
import toast from 'react-hot-toast'

interface AdminUser {
    _id: string
    name: string
    username: string
    email: string
    plan: string
    createdAt: string
    isBlocked: boolean
    filesCount: number
}

interface AdminFile {
    _id: string
    name: string
    owner: { name: string; username: string; email: string }
    size: number
    createdAt: string
    isPublic: boolean
    shareCode?: string
    reportCount: number
}

interface AdminShare {
    _id: string
    shareCode: string
    fileName: string
    owner: { name: string; username: string; email: string }
    accessCount: number
    expiresAt?: string
    isBlocked: boolean
    createdAt: string
}

export default function AdminPanel() {
    const { user, loading: authLoading } = useAuth()
    const router = useRouter()
    const [activeTab, setActiveTab] = useState('users')
    const [users, setUsers] = useState<AdminUser[]>([])
    const [files, setFiles] = useState<AdminFile[]>([])
    const [shares, setShares] = useState<AdminShare[]>([])
    const [searchTerm, setSearchTerm] = useState('')
    const [loading, setLoading] = useState(false)

    const loadData = useCallback(async () => {
        setLoading(true)
        try {
            let endpoint = ''
            switch (activeTab) {
                case 'users':
                    endpoint = '/api/admin/users'
                    break
                case 'files':
                    endpoint = '/api/admin/files'
                    break
                case 'shares':
                    endpoint = '/api/admin/shares'
                    break
            }

            console.log('Loading admin data from:', endpoint)
            const response = await fetch(endpoint)
            console.log('Admin API response status:', response.status)
            
            if (response.ok) {
                const data = await response.json()
                console.log('Admin data loaded:', data.length, 'items')
                switch (activeTab) {
                    case 'users':
                        setUsers(data)
                        break
                    case 'files':
                        setFiles(data)
                        break
                    case 'shares':
                        setShares(data)
                        break
                }
            } else {
                const errorData = await response.json()
                console.error('Admin API error:', errorData)
            }
        } catch (error) {
            console.error('Load data error:', error)
            // Handle error
        } finally {
            setLoading(false)
        }
    }, [activeTab])

    useEffect(() => {
        // Check if user is admin
        console.log('Admin check - user:', user)
        console.log('Admin check - username:', user?.username)
        console.log('Admin check - isAdmin:', user?.username === 'admin')
        console.log('Admin check - user loading:', authLoading)
        
        if (authLoading) {
            console.log('Still loading user data...')
            return
        }
        
        if (!user || user.username !== 'admin') {
            console.log('Access denied - redirecting to dashboard', { user, username: user?.username })
            router.push('/dashboard')
            return
        }
        console.log('Admin access granted - loading data')
        loadData()
    }, [user, router, loadData, authLoading])

    const blockUser = async (userId: string) => {
        try {
            const response = await fetch(`/api/admin/users/${userId}/block`, {
                method: 'POST'
            })
            if (response.ok) {
                toast.success('User blocked successfully')
                loadData()
            }
        } catch (error) {
            console.error('Block user error:', error)
            toast.error('Failed to block user')
        }
    }

    const unblockUser = async (userId: string) => {
        try {
            const response = await fetch(`/api/admin/users/${userId}/unblock`, {
                method: 'POST'
            })
            if (response.ok) {
                toast.success('User unblocked successfully')
                loadData()
            }
        } catch (error) {
            console.error('Unblock user error:', error)
            toast.error('Failed to unblock user')
        }
    }

    const deleteFile = async (fileId: string) => {
        if (!confirm('Are you sure you want to delete this file?')) return

        try {
            const response = await fetch(`/api/admin/files/${fileId}`, {
                method: 'DELETE'
            })
            if (response.ok) {
                toast.success('File deleted successfully')
                loadData()
            }
        } catch (error) {
            console.error('Delete file error:', error)
            toast.error('Failed to delete file')
        }
    }

    const updateUserPlan = async (userId: string, newPlan: string) => {
        try {
            const response = await fetch(`/api/admin/users/${userId}/plan`, {
                method: 'PATCH',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ plan: newPlan })
            })
            if (response.ok) {
                toast.success(`User plan updated to ${newPlan}`)
                loadData()
            } else {
                const error = await response.json()
                toast.error(error.message || 'Failed to update user plan')
            }
        } catch (error) {
            console.error('Update user plan error:', error)
            toast.error('Failed to update user plan')
        }
    }

    const deleteUserFiles = async (userId: string, userName: string) => {
        if (!confirm(`Are you sure you want to delete ALL files for user "${userName}"? This action cannot be undone.`)) return

        try {
            const response = await fetch(`/api/admin/users/${userId}/delete-files`, {
                method: 'DELETE'
            })
            if (response.ok) {
                const result = await response.json()
                toast.success(`Deleted ${result.deletedCount} files for user ${userName}`)
                loadData()
            } else {
                const error = await response.json()
                toast.error(error.message || 'Failed to delete user files')
            }
        } catch (error) {
            console.error('Delete user files error:', error)
            toast.error('Failed to delete user files')
        }
    }

    const blockShare = async (shareId: string) => {
        try {
            const response = await fetch(`/api/admin/shares/${shareId}/block`, {
                method: 'POST'
            })
            if (response.ok) {
                toast.success('Share link blocked successfully')
                loadData()
            }
        } catch (error) {
            console.error('Block share error:', error)
            toast.error('Failed to block share link')
        }
    }

    const filteredUsers = users.filter(u =>
        (u.name?.toLowerCase().includes(searchTerm.toLowerCase()) || '') ||
        (u.username?.toLowerCase().includes(searchTerm.toLowerCase()) || '') ||
        (u.email?.toLowerCase().includes(searchTerm.toLowerCase()) || '')
    )

    const filteredFiles = files.filter(f =>
        (f.name?.toLowerCase().includes(searchTerm.toLowerCase()) || '') ||
        (f.owner?.username?.toLowerCase().includes(searchTerm.toLowerCase()) || '') ||
        (f.owner?.email?.toLowerCase().includes(searchTerm.toLowerCase()) || '')
    )

    const filteredShares = shares.filter(s =>
        (s.fileName?.toLowerCase().includes(searchTerm.toLowerCase()) || '') ||
        (s.owner?.username?.toLowerCase().includes(searchTerm.toLowerCase()) || '') ||
        (s.owner?.email?.toLowerCase().includes(searchTerm.toLowerCase()) || '')
    )

    if (authLoading) {
        return (
            <PageLayout title="Admin Panel" showBackButton={true} backTo="/dashboard">
                <div className="flex items-center justify-center min-h-[60vh]">
                    <div className="text-center">
                        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-red-600 mx-auto mb-4"></div>
                        <p className="text-lg">Loading...</p>
                    </div>
                </div>
            </PageLayout>
        )
    }

    if (!user || user.username !== 'admin') {
        console.log('Admin access check failed:', { user, username: user?.username })
        return (
            <PageLayout title="Access Denied" showBackButton={true} backTo="/dashboard">
                <div className="flex items-center justify-center min-h-[60vh]">
                    <div className="text-center">
                        <div className="h-16 w-16 bg-red-100 dark:bg-red-900 rounded-full flex items-center justify-center mx-auto mb-4">
                            <Shield className="h-8 w-8 text-red-600 dark:text-red-400" />
                        </div>
                        <h1 className="text-2xl font-bold text-red-600 dark:text-red-400 mb-2">Access Denied</h1>
                        <p className="text-gray-600 dark:text-gray-400">You don&apos;t have permission to access this page.</p>
                        <p className="text-sm text-gray-500 dark:text-gray-500 mt-2">Only admin users can access this panel.</p>
                    </div>
                </div>
            </PageLayout>
        )
    }

    return (
        <PageLayout title="Admin Panel" showBackButton={true} backTo="/dashboard" className="bg-gradient-to-br from-red-50 via-white to-orange-50 dark:from-gray-900 dark:via-red-900 dark:to-orange-900">
            <div className="container mx-auto px-4 py-8">
                <div className="max-w-7xl mx-auto">
                    <div className="mb-8">
                        <h1 className="text-4xl font-bold mb-2 flex items-center bg-gradient-to-r from-red-600 to-orange-600 bg-clip-text text-transparent">
                            <Shield className="h-8 w-8 mr-3 text-red-600" />
                            Admin Panel
                        </h1>
                        <p className="text-foreground/70">
                            Manage users, files, and shared content
                        </p>
                    </div>

                    {/* Tab Navigation */}
                    <div className="flex space-x-4 mb-6">
                        <Button
                            variant={activeTab === 'users' ? 'default' : 'outline'}
                            onClick={() => setActiveTab('users')}
                            className="flex items-center glass-card bg-white/20 dark:bg-white/10 border-white/30 dark:border-white/20 backdrop-blur-xl"
                        >
                            <Users className="h-4 w-4 mr-2" />
                            Users
                        </Button>
                        <Button
                            variant={activeTab === 'files' ? 'default' : 'outline'}
                            onClick={() => setActiveTab('files')}
                            className="flex items-center glass-card bg-white/20 dark:bg-white/10 border-white/30 dark:border-white/20 backdrop-blur-xl"
                        >
                            <FileText className="h-4 w-4 mr-2" />
                            Files
                        </Button>
                        <Button
                            variant={activeTab === 'shares' ? 'default' : 'outline'}
                            onClick={() => setActiveTab('shares')}
                            className="flex items-center glass-card bg-white/20 dark:bg-white/10 border-white/30 dark:border-white/20 backdrop-blur-xl"
                        >
                            <Share className="h-4 w-4 mr-2" />
                            Share Links
                        </Button>
                    </div>

                    {/* Search Bar */}
                    <Card className="glass-card mb-6 bg-white/20 dark:bg-white/10 border-white/30 dark:border-white/20 backdrop-blur-xl">
                        <CardContent className="pt-6">
                            <div className="flex items-center space-x-2">
                                <Search className="h-4 w-4 text-foreground/60" />
                                <Input
                                    placeholder="Search..."
                                    value={searchTerm}
                                    onChange={(e) => setSearchTerm(e.target.value)}
                                    className="max-w-md glass-input"
                                />
                            </div>
                        </CardContent>
                    </Card>

                    {/* Content based on active tab */}
                    {activeTab === 'users' && (
                        <Card className="glass-card bg-white/20 dark:bg-white/10 border-white/30 dark:border-white/20 backdrop-blur-xl">
                            <CardHeader>
                                <CardTitle className="text-foreground">User Management</CardTitle>
                                <CardDescription className="text-foreground/70">
                                    Manage user accounts and permissions
                                </CardDescription>
                            </CardHeader>
                            <CardContent>
                                <div className="space-y-4">
                                    {filteredUsers.map((user) => (
                                        <div key={user._id} className="flex items-center justify-between p-4 rounded-lg glass-card bg-white/30 dark:bg-white/5 border-white/20 dark:border-white/10 backdrop-blur-sm">
                                            <div>
                                                <h3 className="font-medium text-foreground">{user.name}</h3>
                                                <p className="text-sm text-foreground/70">@{user.username}</p>
                                                <p className="text-sm text-foreground/70">{user.email}</p>
                                                <p className="text-xs text-foreground/60">
                                                    <span className={`inline-block px-2 py-1 rounded-full text-xs font-medium mr-2 ${
                                                        user.plan === 'premium' 
                                                            ? 'bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200'
                                                            : user.plan === 'pro'
                                                            ? 'bg-gold-100 text-gold-800 dark:bg-yellow-900 dark:text-yellow-200'
                                                            : 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200'
                                                    }`}>
                                                        {user.plan.toUpperCase()}
                                                    </span>
                                                    Files: {user.filesCount} • Joined: {formatDate(user.createdAt)}
                                                </p>
                                            </div>
                                            <div className="flex space-x-2">
                                                {/* Plan Selector */}
                                                <select
                                                    value={user.plan}
                                                    onChange={(e) => updateUserPlan(user._id, e.target.value)}
                                                    className="text-xs px-2 py-1 rounded border bg-white dark:bg-gray-800 border-gray-300 dark:border-gray-600"
                                                >
                                                    <option value="free">Free</option>
                                                    <option value="pro">Pro</option>
                                                    <option value="premium">Premium</option>
                                                </select>

                                                {/* Delete User Files */}
                                                <Button
                                                    variant="outline"
                                                    size="sm"
                                                    onClick={() => deleteUserFiles(user._id, user.name)}
                                                    className="text-red-600 hover:text-red-700"
                                                    title="Delete all user files"
                                                >
                                                    <Trash2 className="h-4 w-4" />
                                                </Button>

                                                {/* Block/Unblock User */}
                                                {user.isBlocked ? (
                                                    <Button
                                                        variant="outline"
                                                        size="sm"
                                                        onClick={() => unblockUser(user._id)}
                                                    >
                                                        Unblock
                                                    </Button>
                                                ) : (
                                                    <Button
                                                        variant="destructive"
                                                        size="sm"
                                                        onClick={() => blockUser(user._id)}
                                                    >
                                                        <Ban className="h-4 w-4 mr-1" />
                                                        Block
                                                    </Button>
                                                )}
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </CardContent>
                        </Card>
                    )}

                    {activeTab === 'files' && (
                        <Card className="glass-card bg-white/20 dark:bg-white/10 border-white/30 dark:border-white/20 backdrop-blur-xl">
                            <CardHeader>
                                <CardTitle className="text-foreground">File Management</CardTitle>
                                <CardDescription className="text-foreground/70">
                                    Monitor and manage user files
                                </CardDescription>
                            </CardHeader>
                            <CardContent>
                                <div className="space-y-4">
                                    {filteredFiles.map((file) => (
                                        <div key={file._id} className="flex items-center justify-between p-4 rounded-lg glass-card bg-white/30 dark:bg-white/5 border-white/20 dark:border-white/10 backdrop-blur-sm">
                                            <div>
                                                <h3 className="font-medium text-foreground">{file.name}</h3>
                                                <p className="text-sm text-foreground/70">
                                                    Owner: {file.owner.name} (@{file.owner.username})
                                                </p>
                                                <p className="text-xs text-foreground/60">
                                                    Email: {file.owner.email} • Size: {file.size} bytes • Created: {formatDate(file.createdAt)}
                                                    {file.reportCount > 0 && (
                                                        <span className="text-red-600 ml-2">
                                                            • {file.reportCount} reports
                                                        </span>
                                                    )}
                                                </p>
                                            </div>
                                            <div className="flex space-x-2">
                                                <Button
                                                    variant="destructive"
                                                    size="sm"
                                                    onClick={() => deleteFile(file._id)}
                                                >
                                                    <Trash2 className="h-4 w-4 mr-1" />
                                                    Delete
                                                </Button>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </CardContent>
                        </Card>
                    )}

                    {activeTab === 'shares' && (
                        <Card className="glass-card bg-white/20 dark:bg-white/10 border-white/30 dark:border-white/20 backdrop-blur-xl">
                            <CardHeader>
                                <CardTitle className="text-foreground">Share Link Management</CardTitle>
                                <CardDescription className="text-foreground/70">
                                    Monitor and control shared content
                                </CardDescription>
                            </CardHeader>
                            <CardContent>
                                <div className="space-y-4">
                                    {filteredShares.map((share) => (
                                        <div key={share._id} className="flex items-center justify-between p-4 rounded-lg glass-card bg-white/30 dark:bg-white/5 border-white/20 dark:border-white/10 backdrop-blur-sm">
                                            <div>
                                                <h3 className="font-medium text-foreground">{share.fileName}</h3>
                                                <p className="text-sm text-foreground/70">
                                                    Owner: {share.owner.name} (@{share.owner.username})
                                                </p>
                                                <p className="text-xs text-foreground/60">
                                                    Email: {share.owner.email} • Share Code: {share.shareCode} • Access Count: {share.accessCount}
                                                </p>
                                                {share.expiresAt && (
                                                    <p className="text-xs text-foreground/60 flex items-center">
                                                        <Clock className="h-3 w-3 mr-1" />
                                                        Expires: {formatDate(share.expiresAt)}
                                                    </p>
                                                )}
                                            </div>
                                            <div className="flex space-x-2">
                                                {share.isBlocked ? (
                                                    <span className="text-red-600 text-sm">Blocked</span>
                                                ) : (
                                                    <Button
                                                        variant="destructive"
                                                        size="sm"
                                                        onClick={() => blockShare(share._id)}
                                                    >
                                                        <Ban className="h-4 w-4 mr-1" />
                                                        Block
                                                    </Button>
                                                )}
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </CardContent>
                        </Card>
                    )}

                    {loading && (
                        <div className="text-center py-8">
                            <p>Loading...</p>
                        </div>
                    )}
                </div>
            </div>
        </PageLayout>
    )
}
