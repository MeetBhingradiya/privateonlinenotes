'use client'

import { useState, useEffect, useCallback } from 'react'
import dynamic from 'next/dynamic'
import { useAuth } from '@/components/providers/auth-provider'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { PageLayout } from '@/components/page-layout'
import { Shield, Users, FileText, Share, Ban, Trash2, Search, Clock, Eye, AlertTriangle, X } from 'lucide-react'
import { formatDate } from '@/lib/utils'
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Badge } from '@/components/ui/badge'
import toast from 'react-hot-toast'

// Dynamically import MonacoEditor to prevent SSR issues
const MonacoEditor = dynamic(() => import('@/components/editor/monaco-editor').then(mod => ({ default: mod.MonacoEditor })), {
    ssr: false,
    loading: () => <div className="flex items-center justify-center h-96"><div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div></div>
})

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
    content?: string
    type: 'file' | 'folder'
    language?: string
    owner: { name: string; username: string; email: string } | null
    size: number
    createdAt: string
    isPublic: boolean
    shareCode?: string
    reportCount: number
    isBlocked?: boolean
    path: string
}

interface AdminShare {
    _id: string
    shareCode: string
    fileName: string
    owner: { name: string; username: string; email: string } | null
    accessCount: number
    expiresAt?: string
    isBlocked: boolean
    createdAt: string
}

interface PaginationInfo {
    currentPage: number
    totalPages: number
    totalCount: number
    hasNextPage: boolean
    hasPrevPage: boolean
    limit: number
}

interface AdminResponse<T> {
    users?: T[]
    files?: T[]
    shares?: T[]
    pagination: PaginationInfo
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
    const [selectedFile, setSelectedFile] = useState<AdminFile | null>(null)
    const [fileViewerOpen, setFileViewerOpen] = useState(false)
    const [fileContent, setFileContent] = useState('')
    
    // Pagination state
    const [pagination, setPagination] = useState<PaginationInfo>({
        currentPage: 1,
        totalPages: 1,
        totalCount: 0,
        hasNextPage: false,
        hasPrevPage: false,
        limit: 20
    })
    const [searchQuery, setSearchQuery] = useState('')

    const loadData = useCallback(async (page = 1, search = '') => {
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

            const params = new URLSearchParams({
                page: page.toString(),
                limit: '20',
                ...(search && { search })
            })

            console.log('Loading admin data from:', `${endpoint}?${params}`)
            const response = await fetch(`${endpoint}?${params}`)
            console.log('Admin API response status:', response.status)
            
            if (response.ok) {
                const data: AdminResponse<any> = await response.json()
                console.log('Admin data loaded:', data)
                
                setPagination(data.pagination)
                
                switch (activeTab) {
                    case 'users':
                        setUsers(data.users || [])
                        break
                    case 'files':
                        setFiles(data.files || [])
                        break
                    case 'shares':
                        setShares(data.shares || [])
                        break
                }
            } else {
                const errorData = await response.json()
                console.error('Admin API error:', errorData)
                toast.error(`Failed to load ${activeTab}: ${errorData.message || 'Unknown error'}`)
            }
        } catch (error) {
            console.error('Load data error:', error)
            toast.error(`Failed to load ${activeTab}`)
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
        loadData(1, '')
    }, [user, router, loadData, authLoading])

    // Handle search with debouncing
    useEffect(() => {
        const timeoutId = setTimeout(() => {
            if (searchQuery !== searchTerm) {
                setSearchTerm(searchQuery)
                setPagination(prev => ({ ...prev, currentPage: 1 }))
                loadData(1, searchQuery)
            }
        }, 500)

        return () => clearTimeout(timeoutId)
    }, [searchQuery, loadData, searchTerm])

    // Reset pagination when tab changes
    useEffect(() => {
        setPagination(prev => ({ ...prev, currentPage: 1 }))
        setSearchQuery('')
        setSearchTerm('')
        loadData(1, '')
    }, [activeTab, loadData])

    const handlePageChange = (newPage: number) => {
        setPagination(prev => ({ ...prev, currentPage: newPage }))
        loadData(newPage, searchTerm)
    }

    const blockUser = async (userId: string) => {
        try {
            const response = await fetch(`/api/admin/users/${userId}/block`, {
                method: 'POST'
            })
            if (response.ok) {
                toast.success('User blocked successfully')
                loadData(pagination.currentPage, searchTerm)
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
                loadData(pagination.currentPage, searchTerm)
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
                loadData(pagination.currentPage, searchTerm)
            }
        } catch (error) {
            console.error('Delete file error:', error)
            toast.error('Failed to delete file')
        }
    }

    const blockFile = async (fileId: string) => {
        if (!confirm('Are you sure you want to block this file? This will prevent it from being accessed.')) return

        try {
            const response = await fetch(`/api/admin/files/${fileId}/block`, {
                method: 'POST'
            })
            if (response.ok) {
                toast.success('File blocked successfully')
                loadData(pagination.currentPage, searchTerm)
            }
        } catch (error) {
            console.error('Block file error:', error)
            toast.error('Failed to block file')
        }
    }

    const unblockFile = async (fileId: string) => {
        try {
            const response = await fetch(`/api/admin/files/${fileId}/unblock`, {
                method: 'POST'
            })
            if (response.ok) {
                toast.success('File unblocked successfully')
                loadData(pagination.currentPage, searchTerm)
            }
        } catch (error) {
            console.error('Unblock file error:', error)
            toast.error('Failed to unblock file')
        }
    }

    const viewFile = async (file: AdminFile) => {
        setSelectedFile(file)
        setFileViewerOpen(true)
        
        if (file.type === 'file') {
            try {
                const response = await fetch(`/api/admin/files/${file._id}/content`)
                if (response.ok) {
                    const data = await response.json()
                    setFileContent(data.content || '')
                } else {
                    setFileContent('Error loading file content')
                }
            } catch (error) {
                console.error('Error loading file content:', error)
                setFileContent('Error loading file content')
            }
        } else {
            setFileContent('This is a folder - no content to display')
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
                loadData(pagination.currentPage, searchTerm)
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
                loadData(pagination.currentPage, searchTerm)
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
                loadData(pagination.currentPage, searchTerm)
            }
        } catch (error) {
            console.error('Block share error:', error)
            toast.error('Failed to block share link')
        }
    }

    // Data is already filtered server-side, no need for client-side filtering

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
                                    placeholder="Search users, files, or shares..."
                                    value={searchQuery}
                                    onChange={(e) => setSearchQuery(e.target.value)}
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
                                    {users.map((user) => (
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
                                <CardTitle className="text-foreground flex items-center">
                                    <FileText className="h-5 w-5 mr-2" />
                                    File Management & Moderation
                                </CardTitle>
                                <CardDescription className="text-foreground/70">
                                    View, moderate, and manage all user files. Click &quot;View&quot; to inspect file content.
                                </CardDescription>
                            </CardHeader>
                            <CardContent>
                                {loading ? (
                                    <div className="text-center py-8">
                                        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-red-600 mx-auto mb-4"></div>
                                        <p>Loading files...</p>
                                    </div>
                                ) : (
                                    <div className="space-y-4">
                                        {files.map((file) => (
                                            <div key={file._id} className="p-4 rounded-lg glass-card bg-white/30 dark:bg-white/5 border-white/20 dark:border-white/10 backdrop-blur-sm">
                                                <div className="flex items-start justify-between">
                                                    <div className="flex-1">
                                                        <div className="flex items-center space-x-3 mb-2">
                                                            <h3 className="font-medium text-foreground text-lg">{file.name}</h3>
                                                            
                                                            {/* Status badges */}
                                                            <div className="flex space-x-2">
                                                                {file.type === 'folder' && (
                                                                    <Badge variant="secondary">Folder</Badge>
                                                                )}
                                                                {file.isPublic && (
                                                                    <Badge variant="success">Public</Badge>
                                                                )}
                                                                {file.shareCode && (
                                                                    <Badge variant="outline">Shared</Badge>
                                                                )}
                                                                {file.isBlocked && (
                                                                    <Badge variant="error">Blocked</Badge>
                                                                )}
                                                                {file.reportCount > 0 && (
                                                                    <Badge variant="warning">
                                                                        <AlertTriangle className="h-3 w-3 mr-1" />
                                                                        {file.reportCount} report{file.reportCount > 1 ? 's' : ''}
                                                                    </Badge>
                                                                )}
                                                                {!file.owner && (
                                                                    <Badge variant="outline">Anonymous</Badge>
                                                                )}
                                                            </div>
                                                        </div>
                                                        
                                                        {/* File details */}
                                                        <div className="text-sm text-foreground/70 space-y-1">
                                                            {file.owner ? (
                                                                <p>
                                                                    <span className="font-medium">Owner:</span> {file.owner.name} (@{file.owner.username})
                                                                </p>
                                                            ) : (
                                                                <p className="text-orange-600 dark:text-orange-400">
                                                                    <span className="font-medium">Anonymous file</span> - No owner information
                                                                </p>
                                                            )}
                                                            
                                                            <div className="flex items-center space-x-4 text-xs text-foreground/60">
                                                                <span>Path: {file.path}</span>
                                                                <span>Size: {file.size} bytes</span>
                                                                <span>Created: {formatDate(file.createdAt)}</span>
                                                                {file.language && (
                                                                    <span>Language: {file.language}</span>
                                                                )}
                                                            </div>
                                                            
                                                            {file.owner?.email && (
                                                                <p className="text-xs">Email: {file.owner.email}</p>
                                                            )}
                                                        </div>
                                                    </div>
                                                    
                                                    {/* Action buttons */}
                                                    <div className="flex space-x-2 ml-4">
                                                        <Button
                                                            variant="outline"
                                                            size="sm"
                                                            onClick={() => viewFile(file)}
                                                            className="hover:bg-blue-500/20 hover:text-blue-600"
                                                        >
                                                            <Eye className="h-4 w-4 mr-1" />
                                                            View
                                                        </Button>
                                                        
                                                        {file.shareCode && (
                                                            <Button
                                                                variant="outline"
                                                                size="sm"
                                                                onClick={() => {
                                                                    if (typeof window !== 'undefined' && navigator.clipboard) {
                                                                        const shareUrl = `${window.location.origin}/share/${file.shareCode}`
                                                                        navigator.clipboard.writeText(shareUrl)
                                                                            .then(() => toast.success('Share link copied to clipboard'))
                                                                            .catch(() => toast.error('Failed to copy link'))
                                                                    }
                                                                }}
                                                                className="hover:bg-green-500/20 hover:text-green-600"
                                                            >
                                                                <Share className="h-4 w-4 mr-1" />
                                                                Copy Link
                                                            </Button>
                                                        )}
                                                        
                                                        {file.isBlocked ? (
                                                            <Button
                                                                variant="outline"
                                                                size="sm"
                                                                onClick={() => unblockFile(file._id)}
                                                                className="hover:bg-green-500/20 hover:text-green-600"
                                                            >
                                                                Unblock
                                                            </Button>
                                                        ) : (
                                                            <Button
                                                                variant="outline"
                                                                size="sm"
                                                                onClick={() => blockFile(file._id)}
                                                                className="hover:bg-orange-500/20 hover:text-orange-600"
                                                            >
                                                                <Ban className="h-4 w-4 mr-1" />
                                                                Block
                                                            </Button>
                                                        )}
                                                        
                                                        <Button
                                                            variant="outline"
                                                            size="sm"
                                                            onClick={() => deleteFile(file._id)}
                                                            className="hover:bg-red-500/20 hover:text-red-600"
                                                        >
                                                            <Trash2 className="h-4 w-4 mr-1" />
                                                            Delete
                                                        </Button>
                                                    </div>
                                                </div>
                                            </div>
                                        ))}
                                        
                                        {files.length === 0 && (
                                            <div className="text-center py-8 text-foreground/60">
                                                <FileText className="h-12 w-12 mx-auto mb-4 opacity-50" />
                                                <h3 className="text-lg font-medium mb-2">No files found</h3>
                                                <p>No files match your search criteria</p>
                                            </div>
                                        )}
                                    </div>
                                )}
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
                                {loading ? (
                                    <div className="text-center py-8">
                                        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-red-600 mx-auto mb-4"></div>
                                        <p>Loading shares...</p>
                                    </div>
                                ) : (
                                    <div className="space-y-4">
                                        {shares.map((share) => (
                                            <div key={share._id} className="flex items-center justify-between p-4 rounded-lg glass-card bg-white/30 dark:bg-white/5 border-white/20 dark:border-white/10 backdrop-blur-sm">
                                                <div>
                                                    <h3 className="font-medium text-foreground">{share.fileName}</h3>
                                                    <p className="text-sm text-foreground/70">
                                                        {share.owner ? (
                                                            <>Owner: {share.owner.name} (@{share.owner.username})</>
                                                        ) : (
                                                            <span className="text-orange-600">Anonymous file - No owner</span>
                                                        )}
                                                    </p>
                                                    <p className="text-xs text-foreground/60">
                                                        {share.owner ? (
                                                            <>Email: {share.owner.email} • </>
                                                        ) : (
                                                            <span className="text-orange-600">No owner email • </span>
                                                        )}
                                                        Share Code: {share.shareCode} • Access Count: {share.accessCount}
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
                                        
                                        {shares.length === 0 && (
                                            <div className="text-center py-8 text-foreground/60">
                                                <Share className="h-12 w-12 mx-auto mb-4 opacity-50" />
                                                <h3 className="text-lg font-medium mb-2">No shared links found</h3>
                                                <p>No shared files match your search criteria</p>
                                            </div>
                                        )}
                                    </div>
                                )}
                            </CardContent>
                        </Card>
                    )}

                    {loading && (
                        <div className="text-center py-8">
                            <p>Loading...</p>
                        </div>
                    )}

                    {/* Pagination */}
                    {!loading && pagination.totalPages > 1 && (
                        <Card className="glass-card bg-white/20 dark:bg-white/10 border-white/30 dark:border-white/20 backdrop-blur-xl">
                            <CardContent className="pt-6">
                                <div className="flex items-center justify-between">
                                    <div className="text-sm text-foreground/70">
                                        Showing {((pagination.currentPage - 1) * pagination.limit) + 1} to{' '}
                                        {Math.min(pagination.currentPage * pagination.limit, pagination.totalCount)} of{' '}
                                        {pagination.totalCount} results
                                    </div>
                                    
                                    <div className="flex items-center space-x-2">
                                        <Button
                                            variant="outline"
                                            size="sm"
                                            onClick={() => handlePageChange(pagination.currentPage - 1)}
                                            disabled={!pagination.hasPrevPage}
                                            className="glass-card bg-white/20 dark:bg-white/10"
                                        >
                                            Previous
                                        </Button>
                                        
                                        <div className="flex items-center space-x-1">
                                            {Array.from({ length: Math.min(5, pagination.totalPages) }, (_, i) => {
                                                const pageNum = Math.max(1, Math.min(
                                                    pagination.currentPage - 2 + i,
                                                    pagination.totalPages - 4 + i
                                                ))
                                                return (
                                                    <Button
                                                        key={pageNum}
                                                        variant={pageNum === pagination.currentPage ? 'default' : 'outline'}
                                                        size="sm"
                                                        onClick={() => handlePageChange(pageNum)}
                                                        className="w-10 glass-card bg-white/20 dark:bg-white/10"
                                                    >
                                                        {pageNum}
                                                    </Button>
                                                )
                                            })}
                                        </div>
                                        
                                        <Button
                                            variant="outline"
                                            size="sm"
                                            onClick={() => handlePageChange(pagination.currentPage + 1)}
                                            disabled={!pagination.hasNextPage}
                                            className="glass-card bg-white/20 dark:bg-white/10"
                                        >
                                            Next
                                        </Button>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>
                    )}
                </div>
            </div>
            
            {/* File Viewer Dialog */}
            <Dialog open={fileViewerOpen} onOpenChange={setFileViewerOpen}>
                <DialogContent className="max-w-6xl max-h-[90vh] overflow-hidden">
                    <DialogHeader>
                        <div className="flex items-center justify-between">
                            <div>
                                <DialogTitle className="text-xl font-bold">File Inspector</DialogTitle>
                                <DialogDescription>
                                    Viewing file content for moderation purposes
                                </DialogDescription>
                            </div>
                            <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => setFileViewerOpen(false)}
                            >
                                <X className="h-4 w-4" />
                            </Button>
                        </div>
                    </DialogHeader>
                    
                    {selectedFile && (
                        <div className="space-y-4">
                            {/* File metadata */}
                            <Card className="bg-muted/50">
                                <CardContent className="pt-4">
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                                        <div>
                                            <h4 className="font-semibold mb-2">File Information</h4>
                                            <div className="space-y-1">
                                                <p><span className="font-medium">Name:</span> {selectedFile.name}</p>
                                                <p><span className="font-medium">Type:</span> {selectedFile.type}</p>
                                                <p><span className="font-medium">Size:</span> {selectedFile.size} bytes</p>
                                                <p><span className="font-medium">Path:</span> {selectedFile.path}</p>
                                                <p><span className="font-medium">Language:</span> {selectedFile.language || 'Unknown'}</p>
                                                <p><span className="font-medium">Created:</span> {formatDate(selectedFile.createdAt)}</p>
                                            </div>
                                        </div>
                                        
                                        <div>
                                            <h4 className="font-semibold mb-2">Owner & Status</h4>
                                            <div className="space-y-1">
                                                {selectedFile.owner ? (
                                                    <>
                                                        <p><span className="font-medium">Owner:</span> {selectedFile.owner.name}</p>
                                                        <p><span className="font-medium">Username:</span> @{selectedFile.owner.username}</p>
                                                        <p><span className="font-medium">Email:</span> {selectedFile.owner.email}</p>
                                                    </>
                                                ) : (
                                                    <p className="text-orange-600"><span className="font-medium">Anonymous file</span> - No owner</p>
                                                )}
                                                <p><span className="font-medium">Public:</span> {selectedFile.isPublic ? 'Yes' : 'No'}</p>
                                                <p><span className="font-medium">Shared:</span> {selectedFile.shareCode ? 'Yes' : 'No'}</p>
                                                <p><span className="font-medium">Reports:</span> {selectedFile.reportCount}</p>
                                                <p><span className="font-medium">Status:</span> {selectedFile.isBlocked ? 'Blocked' : 'Active'}</p>
                                            </div>
                                        </div>
                                    </div>
                                    
                                    {/* Action buttons */}
                                    <div className="flex space-x-2 mt-4 pt-4 border-t">
                                        {selectedFile.shareCode && (
                                            <Button
                                                variant="outline"
                                                size="sm"
                                                onClick={() => {
                                                    if (typeof window !== 'undefined' && navigator.clipboard) {
                                                        const shareUrl = `${window.location.origin}/share/${selectedFile.shareCode}`
                                                        navigator.clipboard.writeText(shareUrl)
                                                            .then(() => toast.success('Share link copied to clipboard'))
                                                            .catch(() => toast.error('Failed to copy link'))
                                                    }
                                                }}
                                            >
                                                <Share className="h-4 w-4 mr-1" />
                                                Copy Share Link
                                            </Button>
                                        )}
                                        
                                        {selectedFile.isBlocked ? (
                                            <Button
                                                variant="outline"
                                                size="sm"
                                                onClick={() => {
                                                    unblockFile(selectedFile._id)
                                                    setFileViewerOpen(false)
                                                }}
                                                className="text-green-600 hover:text-green-700"
                                            >
                                                Unblock File
                                            </Button>
                                        ) : (
                                            <Button
                                                variant="outline"
                                                size="sm"
                                                onClick={() => {
                                                    blockFile(selectedFile._id)
                                                    setFileViewerOpen(false)
                                                }}
                                                className="text-orange-600 hover:text-orange-700"
                                            >
                                                <Ban className="h-4 w-4 mr-1" />
                                                Block File
                                            </Button>
                                        )}
                                        
                                        <Button
                                            variant="outline"
                                            size="sm"
                                            onClick={() => {
                                                deleteFile(selectedFile._id)
                                                setFileViewerOpen(false)
                                            }}
                                            className="text-red-600 hover:text-red-700"
                                        >
                                            <Trash2 className="h-4 w-4 mr-1" />
                                            Delete File
                                        </Button>
                                    </div>
                                </CardContent>
                            </Card>
                            
                            {/* File content */}
                            {selectedFile.type === 'file' && (
                                <Card className="flex-1 overflow-hidden">
                                    <CardHeader>
                                        <CardTitle className="text-lg">File Content</CardTitle>
                                        <CardDescription>
                                            Review the content of this file for any policy violations or inappropriate content
                                        </CardDescription>
                                    </CardHeader>
                                    <CardContent className="p-0">
                                        <div style={{ height: '400px' }}>
                                            <MonacoEditor
                                                file={{
                                                    _id: selectedFile._id,
                                                    name: selectedFile.name,
                                                    content: fileContent,
                                                    language: selectedFile.language,
                                                    size: selectedFile.size,
                                                    updatedAt: selectedFile.createdAt
                                                }}
                                                onSave={() => {}} // Read-only for admin
                                                readOnly={true}
                                            />
                                        </div>
                                    </CardContent>
                                </Card>
                            )}
                            
                            {selectedFile.type === 'folder' && (
                                <Card>
                                    <CardContent className="pt-6">
                                        <div className="text-center text-muted-foreground">
                                            <FileText className="h-12 w-12 mx-auto mb-4 opacity-50" />
                                            <h3 className="text-lg font-medium mb-2">Folder View</h3>
                                            <p>This is a folder. No content to display.</p>
                                        </div>
                                    </CardContent>
                                </Card>
                            )}
                        </div>
                    )}
                </DialogContent>
            </Dialog>
        </PageLayout>
    )
}
