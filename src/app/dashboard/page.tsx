'use client'

import { useAuth } from '@/components/providers/auth-provider'
import { useState, useEffect, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent } from '@/components/ui/card'
import { FileText, FolderPlus, Search, Grid, List, Sun, Moon, LogOut, Settings, Share, Trash2, Crown, Zap, Compass, FolderOpen } from 'lucide-react'
import { useTheme } from 'next-themes'
import { formatDate, formatFileSize } from '@/lib/utils'
import { MonacoEditor } from '@/components/editor/monaco-editor'
import { ShareModal } from '@/components/share-modal'
import toast from 'react-hot-toast'

interface FileItem {
    _id: string
    name: string
    type: 'file' | 'folder'
    content?: string
    language?: string
    size: number
    path: string
    createdAt: string
    updatedAt: string
    isPublic: boolean
    shareCode?: string
    slug?: string
}

export default function DashboardPage() {
    const { user, logout, loading: authLoading } = useAuth()
    const router = useRouter()
    const { theme, setTheme } = useTheme()
    const [files, setFiles] = useState<FileItem[]>([])
    const [currentPath, setCurrentPath] = useState('/')
    const [selectedFile, setSelectedFile] = useState<FileItem | null>(null)
    const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid')
    const [searchQuery, setSearchQuery] = useState('')
    const [isCreating, setIsCreating] = useState(false)
    const [newItemName, setNewItemName] = useState('')
    const [newItemType, setNewItemType] = useState<'file' | 'folder'>('file')
    const [loading, setLoading] = useState(true)
    const [shareModalOpen, setShareModalOpen] = useState(false)
    const [fileToShare, setFileToShare] = useState<FileItem | null>(null)

    const fetchFiles = useCallback(async () => {
        try {
            setLoading(true)
            const response = await fetch(`/api/files?path=${encodeURIComponent(currentPath)}`)
            if (response.ok) {
                const data = await response.json()
                setFiles(data)
            } else {
                toast.error('Failed to load files')
            }
        } catch {
            toast.error('Error loading files')
        } finally {
            setLoading(false)
        }
    }, [currentPath])

    useEffect(() => {
        fetchFiles()
    }, [currentPath, fetchFiles])

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

    const createItem = async () => {
        if (!newItemName.trim()) {
            toast.error('Please enter a name')
            return
        }

        try {
            const response = await fetch('/api/files', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    name: newItemName,
                    type: newItemType,
                    currentPath: currentPath, // Send current path instead of constructed path
                }),
            })

            if (response.ok) {
                const newItem = await response.json()
                setFiles([...files, newItem])
                setIsCreating(false)
                setNewItemName('')
                toast.success(`${newItemType === 'file' ? 'File' : 'Folder'} created successfully`)
            } else {
                const error = await response.json()
                toast.error(error.message || 'Failed to create item')
            }
        } catch {
            toast.error('Error creating item')
        }
    }

    const openFile = async (file: FileItem) => {
        if (file.type === 'folder') {
            // Navigate to folder using its path
            setCurrentPath(file.path)
            return
        }

        try {
            const response = await fetch(`/api/files/${file._id}`)
            if (response.ok) {
                const fileData = await response.json()
                setSelectedFile(fileData)
            } else {
                toast.error('Failed to open file')
            }
        } catch {
            toast.error('Error opening file')
        }
    }

    const saveFile = async (content: string) => {
        if (!selectedFile) return

        try {
            const response = await fetch(`/api/files/${selectedFile._id}`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ content }),
            })

            if (response.ok) {
                const updatedFile = await response.json()
                setSelectedFile(updatedFile)
                toast.success('File saved successfully')
            } else {
                toast.error('Failed to save file')
            }
        } catch {
            toast.error('Error saving file')
        }
    }

    const shareFile = async (file: FileItem) => {
        setFileToShare(file)
        setShareModalOpen(true)
    }

    const handleShare = (shareData: { shareCode: string; slug: string }) => {
        // Update the file in the list with new sharing data
        setFiles(files.map(f =>
            f._id === fileToShare?._id
                ? { ...f, shareCode: shareData.shareCode, slug: shareData.slug, isPublic: true }
                : f
        ))
    }

    const deleteFile = async (file: FileItem) => {
        if (!confirm(`Are you sure you want to delete ${file.name}?`)) return

        try {
            const response = await fetch(`/api/files/${file._id}`, {
                method: 'DELETE',
            })

            if (response.ok) {
                setFiles(files.filter(f => f._id !== file._id))
                if (selectedFile?._id === file._id) {
                    setSelectedFile(null)
                }
                toast.success('Item deleted successfully')
            } else {
                toast.error('Failed to delete item')
            }
        } catch {
            toast.error('Error deleting item')
        }
    }

    const filteredFiles = files.filter(file =>
        file.name.toLowerCase().includes(searchQuery.toLowerCase())
    )

    const handleLogout = async () => {
        await logout()
        router.push('/auth/login')
    }

    if (!user) return null

    return (
        <div className="flex h-screen bg-background">
            {/* Sidebar */}
            <div className="w-64 border-r bg-card p-4">
                <div className="mb-6">
                    <h1 className="text-2xl font-bold text-primary">Notta.in</h1>
                    <p className="text-sm text-muted-foreground">Welcome, {user.name}</p>
                    <div className="mt-2 text-xs text-muted-foreground">
                        Plan: <span className="capitalize font-medium">{user.plan || 'Free'}</span>
                    </div>
                </div>

                {/* Plan Status & Upgrade Section */}
                {(!user.plan || user.plan === 'free') && (
                    <div className="mb-6 p-3 bg-gradient-to-r from-blue-50 to-purple-50 dark:from-blue-950/20 dark:to-purple-950/20 rounded-lg border border-blue-200 dark:border-blue-800">
                        <div className="flex items-center mb-2">
                            <Crown className="h-4 w-4 text-blue-600 mr-2" />
                            <span className="text-sm font-medium text-blue-800 dark:text-blue-200">Upgrade Available</span>
                        </div>
                        <p className="text-xs text-blue-700 dark:text-blue-300 mb-3">
                            Unlock unlimited files, advanced sharing, and premium features
                        </p>
                        <Link href="/pricing">
                            <Button size="sm" className="w-full bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700">
                                <Zap className="h-3 w-3 mr-1" />
                                Upgrade Now
                            </Button>
                        </Link>
                    </div>
                )}

                {user.plan === 'premium' && (
                    <div className="mb-6 p-3 bg-gradient-to-r from-green-50 to-emerald-50 dark:from-green-950/20 dark:to-emerald-950/20 rounded-lg border border-green-200 dark:border-green-800">
                        <div className="flex items-center mb-2">
                            <Crown className="h-4 w-4 text-green-600 mr-2" />
                            <span className="text-sm font-medium text-green-800 dark:text-green-200">Premium Plan</span>
                        </div>
                        <p className="text-xs text-green-700 dark:text-green-300 mb-3">
                            Want even more? Check out Enterprise features
                        </p>
                        <Link href="/pricing">
                            <Button size="sm" variant="outline" className="w-full border-green-300 text-green-700 hover:bg-green-50">
                                View Enterprise
                            </Button>
                        </Link>
                    </div>
                )}

                {user.plan === 'enterprise' && (
                    <div className="mb-6 p-3 bg-gradient-to-r from-amber-50 to-orange-50 dark:from-amber-950/20 dark:to-orange-950/20 rounded-lg border border-amber-200 dark:border-amber-800">
                        <div className="flex items-center mb-2">
                            <Crown className="h-4 w-4 text-amber-600 mr-2" />
                            <span className="text-sm font-medium text-amber-800 dark:text-amber-200">Enterprise Plan</span>
                        </div>
                        <p className="text-xs text-amber-700 dark:text-amber-300">
                            You have the highest tier with all premium features!
                        </p>
                    </div>
                )}

                <div className="space-y-2">
                    <Button
                        variant="ghost"
                        className="w-full justify-start"
                        onClick={() => {
                            setIsCreating(true)
                            setNewItemType('file')
                        }}
                    >
                        <FileText className="mr-2 h-4 w-4" />
                        New File
                    </Button>
                    <Button
                        variant="ghost"
                        className="w-full justify-start"
                        onClick={() => {
                            setIsCreating(true)
                            setNewItemType('folder')
                        }}
                    >
                        <FolderPlus className="mr-2 h-4 w-4" />
                        New Folder
                    </Button>
                    <Link href="/explore">
                        <Button variant="ghost" className="w-full justify-start">
                            <Compass className="mr-2 h-4 w-4" />
                            Explore Public Files
                        </Button>
                    </Link>
                    <Link href="/shared">
                        <Button variant="ghost" className="w-full justify-start">
                            <FolderOpen className="mr-2 h-4 w-4" />
                            Manage Shared Files
                        </Button>
                    </Link>
                </div>

                <div className="mt-8 space-y-2">
                    <Button
                        variant="ghost"
                        className="w-full justify-start"
                        onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
                    >
                        {theme === 'dark' ? <Sun className="mr-2 h-4 w-4" /> : <Moon className="mr-2 h-4 w-4" />}
                        {theme === 'dark' ? 'Light Mode' : 'Dark Mode'}
                    </Button>
                    <Link href="/profile">
                        <Button variant="ghost" className="w-full justify-start">
                            <Settings className="mr-2 h-4 w-4" />
                            Profile
                        </Button>
                    </Link>
                    <Button variant="ghost" className="w-full justify-start" onClick={handleLogout}>
                        <LogOut className="mr-2 h-4 w-4" />
                        Logout
                    </Button>
                </div>
            </div>

            {/* Main Content */}
            <div className="flex-1 flex">
                {/* File Explorer */}
                <div className="w-80 border-r bg-card">
                    <div className="p-4 border-b">
                        <div className="flex items-center justify-between mb-4">
                            <h2 className="font-semibold">Files</h2>
                            <div className="flex items-center space-x-1">
                                <Button
                                    variant="ghost"
                                    size="sm"
                                    onClick={() => setViewMode('grid')}
                                    className={viewMode === 'grid' ? 'bg-muted' : ''}
                                >
                                    <Grid className="h-4 w-4" />
                                </Button>
                                <Button
                                    variant="ghost"
                                    size="sm"
                                    onClick={() => setViewMode('list')}
                                    className={viewMode === 'list' ? 'bg-muted' : ''}
                                >
                                    <List className="h-4 w-4" />
                                </Button>
                            </div>
                        </div>
                        <div className="relative">
                            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                            <Input
                                placeholder="Search files..."
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                className="pl-10"
                            />
                        </div>
                    </div>

                    <div className="p-4">
                        {/* Breadcrumb */}
                        <div className="mb-4 text-sm text-muted-foreground">
                            <button
                                onClick={() => setCurrentPath('/')}
                                className="hover:text-foreground"
                            >
                                Root
                            </button>
                            {currentPath !== '/' && currentPath.split('/').filter(Boolean).map((part, index, arr) => (
                                <span key={index}>
                                    {' / '}
                                    <button
                                        onClick={() => {
                                            const newPath = '/' + arr.slice(0, index + 1).join('/')
                                            setCurrentPath(newPath)
                                        }}
                                        className="hover:text-foreground"
                                    >
                                        {part}
                                    </button>
                                </span>
                            ))}
                        </div>

                        {/* Create Item Form */}
                        {isCreating && (
                            <Card className="mb-4">
                                <CardContent className="p-4">
                                    <Input
                                        placeholder={`${newItemType === 'file' ? 'File' : 'Folder'} name`}
                                        value={newItemName}
                                        onChange={(e) => setNewItemName(e.target.value)}
                                        onKeyPress={(e) => e.key === 'Enter' && createItem()}
                                        autoFocus
                                    />
                                    <div className="flex space-x-2 mt-2">
                                        <Button size="sm" onClick={createItem}>Create</Button>
                                        <Button size="sm" variant="outline" onClick={() => setIsCreating(false)}>
                                            Cancel
                                        </Button>
                                    </div>
                                </CardContent>
                            </Card>
                        )}

                        {/* File List */}
                        <div className="space-y-2">
                            {loading ? (
                                <div className="text-center py-8 text-muted-foreground">Loading...</div>
                            ) : filteredFiles.length === 0 ? (
                                <div className="text-center py-8 text-muted-foreground">
                                    {searchQuery ? 'No files found' : 'No files yet'}
                                </div>
                            ) : (
                                filteredFiles.map((file) => (
                                    <Card
                                        key={file._id}
                                        className={`cursor-pointer hover:bg-muted/50 transition-colors ${selectedFile?._id === file._id ? 'ring-2 ring-primary' : ''
                                            }`}
                                        onClick={() => openFile(file)}
                                    >
                                        <CardContent className="p-3">
                                            <div className="flex items-center justify-between">
                                                <div className="flex items-center space-x-2">
                                                    {file.type === 'folder' ? (
                                                        <FolderPlus className="h-4 w-4 text-blue-500" />
                                                    ) : (
                                                        <FileText className="h-4 w-4 text-gray-500" />
                                                    )}
                                                    <span className="text-sm font-medium">{file.name}</span>
                                                </div>
                                                <div className="flex space-x-1">
                                                    <Button
                                                        variant="ghost"
                                                        size="sm"
                                                        onClick={(e) => {
                                                            e.stopPropagation()
                                                            shareFile(file)
                                                        }}
                                                    >
                                                        <Share className="h-3 w-3" />
                                                    </Button>
                                                    <Button
                                                        variant="ghost"
                                                        size="sm"
                                                        onClick={(e) => {
                                                            e.stopPropagation()
                                                            deleteFile(file)
                                                        }}
                                                    >
                                                        <Trash2 className="h-3 w-3" />
                                                    </Button>
                                                </div>
                                            </div>
                                            {viewMode === 'list' && (
                                                <div className="mt-1 text-xs text-muted-foreground">
                                                    {formatFileSize(file.size)} • {formatDate(file.updatedAt)}
                                                </div>
                                            )}
                                        </CardContent>
                                    </Card>
                                ))
                            )}
                        </div>
                    </div>
                </div>

                {/* Editor */}
                <div className="flex-1">
                    {selectedFile ? (
                        <MonacoEditor
                            file={selectedFile}
                            onSave={saveFile}
                        />
                    ) : (
                        <div className="flex items-center justify-center h-full text-muted-foreground">
                            <div className="text-center">
                                <FileText className="h-16 w-16 mx-auto mb-4 opacity-50" />
                                <h3 className="text-lg font-medium mb-2">No file selected</h3>
                                <p>Select a file from the sidebar to start editing</p>
                            </div>
                        </div>
                    )}
                </div>
            </div>

            <ShareModal
                isOpen={shareModalOpen}
                onClose={() => {
                    setShareModalOpen(false)
                    setFileToShare(null)
                }}
                file={fileToShare}
                onShare={handleShare}
            />
        </div>
    )
}
