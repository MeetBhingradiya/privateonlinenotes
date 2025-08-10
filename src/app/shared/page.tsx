'use client'

import { useAuth } from '@/components/providers/auth-provider'
import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent, CardHeader } from '@/components/ui/card'
import { FileText, FolderPlus, Search, Eye, Copy, ExternalLink, Trash2, Settings, ArrowLeft, Globe, Lock } from 'lucide-react'
import { formatDate, formatFileSize } from '@/lib/utils'
import toast from 'react-hot-toast'

interface SharedFile {
    _id: string
    name: string
    type: 'file' | 'folder'
    slug: string
    shareCode: string
    isPublic: boolean
    accessCount: number
    createdAt: string
    updatedAt: string
    size: number
    language?: string
}

export default function SharedFilesPage() {
    const { user, loading: authLoading } = useAuth()
    const router = useRouter()
    const [files, setFiles] = useState<SharedFile[]>([])
    const [loading, setLoading] = useState(true)
    const [searchQuery, setSearchQuery] = useState('')

    useEffect(() => {
        if (user) {
            fetchSharedFiles()
        }
    }, [user])

    const fetchSharedFiles = async () => {
        try {
            setLoading(true)
            const response = await fetch('/api/shared-files')
            if (response.ok) {
                const data = await response.json()
                setFiles(data)
            } else {
                toast.error('Failed to load shared files')
            }
        } catch {
            toast.error('Error loading shared files')
        } finally {
            setLoading(false)
        }
    }

    const copyShareLink = async (file: SharedFile, useSlug = true) => {
        const url = `${window.location.origin}/share/${useSlug ? file.slug : file.shareCode}`
        try {
            await navigator.clipboard.writeText(url)
            toast.success('Link copied to clipboard!')
    } catch {
      toast.error('Failed to copy link')
    }
    }

    const unshareFile = async (file: SharedFile) => {
        if (!confirm(`Are you sure you want to unshare "${file.name}"?`)) return

        try {
            const response = await fetch(`/api/files/${file._id}/unshare`, {
                method: 'POST',
            })

            if (response.ok) {
                setFiles(files.filter(f => f._id !== file._id))
                toast.success('File unshared successfully')
            } else {
                toast.error('Failed to unshare file')
            }
    } catch {
      toast.error('Error unsharing file')
    }
    }

    const togglePublicStatus = async (file: SharedFile) => {
        try {
            const response = await fetch(`/api/files/${file._id}/share`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ isPublic: !file.isPublic })
            })

            if (response.ok) {
                setFiles(files.map(f =>
                    f._id === file._id
                        ? { ...f, isPublic: !f.isPublic }
                        : f
                ))
                toast.success(`File is now ${!file.isPublic ? 'public' : 'private'}`)
            } else {
                toast.error('Failed to update visibility')
            }
    } catch {
      toast.error('Error updating visibility')
    }
    }

    // Show loading while auth is being checked
    if (authLoading) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <div className="text-lg">Loading...</div>
            </div>
        )
    }

    // Redirect if not authenticated
    if (!user) {
        router.push('/auth/login')
        return null
    }

    const filteredFiles = files.filter(file =>
        file.name.toLowerCase().includes(searchQuery.toLowerCase())
    )

    return (
        <div className="min-h-screen bg-background">
            {/* Header */}
            <div className="border-b bg-card">
                <div className="max-w-6xl mx-auto px-4 py-6">
                    <div className="flex items-center justify-between mb-6">
                        <div className="flex items-center space-x-4">
                            <Button
                                variant="ghost"
                                onClick={() => router.back()}
                                className="flex items-center space-x-2"
                            >
                                <ArrowLeft className="h-4 w-4" />
                                <span>Back</span>
                            </Button>
                            <div>
                                <h1 className="text-3xl font-bold text-primary">Shared Files</h1>
                                <p className="text-muted-foreground">Manage your shared files and folders</p>
                            </div>
                        </div>
                        <Link href="/dashboard">
                            <Button>Go to Dashboard</Button>
                        </Link>
                    </div>

                    {/* Search */}
                    <div className="relative max-w-md">
                        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                        <Input
                            placeholder="Search shared files..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className="pl-10"
                        />
                    </div>
                </div>
            </div>

            {/* Content */}
            <div className="max-w-6xl mx-auto px-4 py-8">
                {loading ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {[...Array(6)].map((_, i) => (
                            <Card key={i} className="animate-pulse">
                                <CardHeader className="space-y-2">
                                    <div className="h-4 bg-muted rounded w-3/4"></div>
                                    <div className="h-3 bg-muted rounded w-1/2"></div>
                                </CardHeader>
                                <CardContent>
                                    <div className="space-y-2">
                                        <div className="h-3 bg-muted rounded"></div>
                                        <div className="h-3 bg-muted rounded w-2/3"></div>
                                    </div>
                                </CardContent>
                            </Card>
                        ))}
                    </div>
                ) : filteredFiles.length === 0 ? (
                    <div className="text-center py-16">
                        <Settings className="h-16 w-16 mx-auto mb-4 text-muted-foreground opacity-50" />
                        <h3 className="text-lg font-medium mb-2">No shared files</h3>
                        <p className="text-muted-foreground mb-4">
                            {searchQuery ? 'No files match your search' : 'You haven\'t shared any files yet'}
                        </p>
                        <Link href="/dashboard">
                            <Button>Go to Dashboard</Button>
                        </Link>
                    </div>
                ) : (
                    <div className="space-y-4">
                        <div className="flex items-center justify-between">
                            <p className="text-sm text-muted-foreground">
                                {filteredFiles.length} shared {filteredFiles.length === 1 ? 'item' : 'items'}
                            </p>
                        </div>

                        <div className="grid grid-cols-1 gap-4">
                            {filteredFiles.map((file) => (
                                <Card key={file._id} className="hover:shadow-md transition-shadow">
                                    <CardContent className="p-6">
                                        <div className="flex items-center justify-between">
                                            <div className="flex items-center space-x-4 flex-1">
                                                <div className="flex items-center space-x-3">
                                                    {file.type === 'folder' ? (
                                                        <FolderPlus className="h-8 w-8 text-blue-500" />
                                                    ) : (
                                                        <FileText className="h-8 w-8 text-gray-500" />
                                                    )}
                                                    <div>
                                                        <h3 className="font-medium text-lg">{file.name}</h3>
                                                        <div className="flex items-center space-x-4 text-sm text-muted-foreground">
                                                            <span className="flex items-center space-x-1">
                                                                {file.isPublic ? (
                                                                    <Globe className="h-3 w-3" />
                                                                ) : (
                                                                    <Lock className="h-3 w-3" />
                                                                )}
                                                                <span>{file.isPublic ? 'Public' : 'Private'}</span>
                                                            </span>
                                                            <span className="flex items-center space-x-1">
                                                                <Eye className="h-3 w-3" />
                                                                <span>{file.accessCount} views</span>
                                                            </span>
                                                            <span>{formatFileSize(file.size)}</span>
                                                            <span>Shared {formatDate(file.createdAt)}</span>
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>

                                            <div className="flex items-center space-x-2">
                                                <Button
                                                    variant="outline"
                                                    size="sm"
                                                    onClick={() => copyShareLink(file, true)}
                                                    className="flex items-center space-x-1"
                                                >
                                                    <Copy className="h-3 w-3" />
                                                    <span>Copy Link</span>
                                                </Button>

                                                <Button
                                                    variant="outline"
                                                    size="sm"
                                                    onClick={() => window.open(`/share/${file.slug}`, '_blank')}
                                                    className="flex items-center space-x-1"
                                                >
                                                    <ExternalLink className="h-3 w-3" />
                                                    <span>View</span>
                                                </Button>

                                                <Button
                                                    variant="outline"
                                                    size="sm"
                                                    onClick={() => togglePublicStatus(file)}
                                                    className="flex items-center space-x-1"
                                                >
                                                    {file.isPublic ? <Lock className="h-3 w-3" /> : <Globe className="h-3 w-3" />}
                                                    <span>{file.isPublic ? 'Make Private' : 'Make Public'}</span>
                                                </Button>

                                                <Button
                                                    variant="outline"
                                                    size="sm"
                                                    onClick={() => unshareFile(file)}
                                                    className="flex items-center space-x-1 text-red-600 hover:text-red-700"
                                                >
                                                    <Trash2 className="h-3 w-3" />
                                                    <span>Unshare</span>
                                                </Button>
                                            </div>
                                        </div>

                                        {/* Share URLs */}
                                        <div className="mt-4 pt-4 border-t space-y-2">
                                            <div className="flex items-center space-x-2">
                                                <label className="text-xs text-muted-foreground min-w-[80px]">Pretty URL:</label>
                                                <Input
                                                    value={`${window.location.origin}/share/${file.slug}`}
                                                    readOnly
                                                    className="text-xs h-8 flex-1"
                                                />
                                                <Button
                                                    size="sm"
                                                    variant="ghost"
                                                    onClick={() => copyShareLink(file, true)}
                                                >
                                                    <Copy className="h-3 w-3" />
                                                </Button>
                                            </div>
                                            <div className="flex items-center space-x-2">
                                                <label className="text-xs text-muted-foreground min-w-[80px]">Share Code:</label>
                                                <Input
                                                    value={`${window.location.origin}/share/${file.shareCode}`}
                                                    readOnly
                                                    className="text-xs h-8 flex-1"
                                                />
                                                <Button
                                                    size="sm"
                                                    variant="ghost"
                                                    onClick={() => copyShareLink(file, false)}
                                                >
                                                    <Copy className="h-3 w-3" />
                                                </Button>
                                            </div>
                                        </div>
                                    </CardContent>
                                </Card>
                            ))}
                        </div>
                    </div>
                )}
            </div>
        </div>
    )
}
