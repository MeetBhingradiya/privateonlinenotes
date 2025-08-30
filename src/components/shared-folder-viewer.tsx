'use client'

import { useState, useEffect, useCallback } from 'react'
import { FileText, FolderPlus, ArrowLeft, Eye, Download, Copy, Home, User } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { formatDate, formatFileSize } from '@/lib/utils'
import { MonacoEditor } from '@/components/editor/monaco-editor'
import { ThemeToggle } from '@/components/theme-toggle'
import Link from 'next/link'
import toast from 'react-hot-toast'

interface FolderItem {
    _id: string
    name: string
    type: 'file' | 'folder'
    content?: string
    language?: string
    size: number
    createdAt: string
    updatedAt: string
    path: string
}

interface SharedFolderProps {
    folder: {
        _id: string
        name: string
        owner?: {
            name: string
            email: string
        } | null
    }
}

export function SharedFolderViewer({ folder }: SharedFolderProps) {
    const [items, setItems] = useState<FolderItem[]>([])
    const [currentPath, setCurrentPath] = useState('/')
    const [selectedFile, setSelectedFile] = useState<FolderItem | null>(null)
    const [loading, setLoading] = useState(true)
    const [copied, setCopied] = useState(false)

    const handleDownloadFile = () => {
        if (!selectedFile || !selectedFile.content) return
        
        const blob = new Blob([selectedFile.content], { type: 'text/plain' })
        const url = URL.createObjectURL(blob)
        const a = document.createElement('a')
        a.href = url
        a.download = selectedFile.name
        document.body.appendChild(a)
        a.click()
        document.body.removeChild(a)
        URL.revokeObjectURL(url)
        toast.success('File downloaded successfully')
    }

    const handleCopyContent = async () => {
        if (!selectedFile || !selectedFile.content) return
        
        try {
            await navigator.clipboard.writeText(selectedFile.content)
            setCopied(true)
            setTimeout(() => setCopied(false), 2000)
            toast.success('Content copied to clipboard')
        } catch {
            toast.error('Failed to copy content')
        }
    }

    const fetchFolderContents = useCallback(async () => {
        try {
            setLoading(true)
            const response = await fetch(`/api/shared-folder/${folder._id}/contents?path=${encodeURIComponent(currentPath)}`)
            if (response.ok) {
                const data = await response.json()
                setItems(data)
            }
        } catch (error) {
            console.error('Error fetching folder contents:', error)
        } finally {
            setLoading(false)
        }
    }, [folder._id, currentPath])

    useEffect(() => {
        fetchFolderContents()
    }, [fetchFolderContents])

    const handleFolderSelect = (folder: FolderItem) => {
        const newPath = currentPath === '/' ? `/${folder.name}` : `${currentPath}/${folder.name}`
        setCurrentPath(newPath)
        setSelectedFile(null)
    }

    const handleFileSelect = async (file: FolderItem) => {
        setSelectedFile(file)
        
        // Fetch file content
        try {
            const response = await fetch(`/api/shared-folder/${folder._id}/file/${file._id}`)
            if (response.ok) {
                const data = await response.json()
                setSelectedFile(prev => prev ? { ...prev, content: data.content, language: data.language } : null)
            }
        } catch (error) {
            console.error('Error loading file:', error)
        }
    }

    const navigateUp = () => {
        const pathParts = currentPath.split('/').filter(Boolean)
        if (pathParts.length > 0) {
            pathParts.pop()
            setCurrentPath('/' + pathParts.join('/'))
        }
    }

    return (
        <div className="min-h-screen bg-background">
            {/* Header */}
            <header className="border-b bg-card">
                <div className="container mx-auto px-4 py-4">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-4">
                            <Link href="/" className="flex items-center space-x-2">
                                <h1 className="text-2xl font-bold text-primary">Notta.in</h1>
                            </Link>
                            <div className="h-6 w-px bg-border" />
                            <div>
                                <h2 className="font-semibold text-lg">{folder.name}</h2>
                                <p className="text-sm text-muted-foreground">
                                    Shared by {folder.owner ? folder.owner.name : 'Anonymous'}
                                </p>
                            </div>
                        </div>
                        <div className="flex items-center space-x-2">
                            {selectedFile && (
                                <>
                                    <Button variant="outline" size="sm" onClick={handleCopyContent}>
                                        <Copy className="h-4 w-4 mr-1" />
                                        {copied ? 'Copied!' : 'Copy'}
                                    </Button>
                                    <Button variant="outline" size="sm" onClick={handleDownloadFile}>
                                        <Download className="h-4 w-4 mr-1" />
                                        Download
                                    </Button>
                                </>
                            )}
                            <ThemeToggle />
                            <Link href="/auth/login">
                                <Button size="sm">
                                    <Home className="h-4 w-4 mr-1" />
                                    Sign In
                                </Button>
                            </Link>
                        </div>
                    </div>

                    {/* Breadcrumb */}
                    {currentPath !== '/' && (
                        <div className="mt-4 flex items-center space-x-2 text-sm text-muted-foreground">
                            <button
                                onClick={() => setCurrentPath('/')}
                                className="hover:text-foreground transition-colors"
                            >
                                {folder.name}
                            </button>
                            {currentPath.split('/').filter(Boolean).map((part, index, array) => (
                                <span key={index} className="flex items-center space-x-2">
                                    <span>/</span>
                                    <button
                                        onClick={() => {
                                            const newPath = '/' + array.slice(0, index + 1).join('/')
                                            setCurrentPath(newPath)
                                        }}
                                        className="hover:text-foreground transition-colors"
                                    >
                                        {part}
                                    </button>
                                </span>
                            ))}
                        </div>
                    )}
                </div>
            </header>

            {/* Content */}
            <div className="container mx-auto px-4 py-6">
                <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
                    {/* Folder Contents Sidebar */}
                    <div className="lg:col-span-1">
                        <Card>
                            <CardHeader>
                                <CardTitle className="text-lg flex items-center">
                                    <Eye className="h-5 w-5 mr-2" />
                                    Folder Contents
                                </CardTitle>
                            </CardHeader>
                            <CardContent>
                                {currentPath !== '/' && (
                                    <Button
                                        variant="ghost"
                                        className="w-full justify-start mb-4"
                                        onClick={navigateUp}
                                    >
                                        <ArrowLeft className="mr-2 h-4 w-4" />
                                        Back
                                    </Button>
                                )}

                                <div className="space-y-2">
                                    {loading ? (
                                        <div className="text-center py-8 text-muted-foreground">Loading...</div>
                                    ) : items.length === 0 ? (
                                        <div className="text-center py-8 text-muted-foreground">
                                            This folder is empty
                                        </div>
                                    ) : (
                                        items.map((item) => (
                                            <Card 
                                                key={item._id} 
                                                className={`cursor-pointer transition-all hover:shadow-md border ${
                                                    selectedFile?._id === item._id 
                                                        ? 'border-primary bg-primary/5' 
                                                        : 'border-border hover:border-primary/50'
                                                }`}
                                                onClick={() => {
                                                    if (item.type === 'file') {
                                                        handleFileSelect(item)
                                                    } else {
                                                        handleFolderSelect(item)
                                                    }
                                                }}
                                            >
                                                <CardContent className="p-3">
                                                    <div className="flex items-center space-x-3">
                                                        {item.type === 'folder' ? (
                                                            <FolderPlus className="h-5 w-5 text-blue-500" />
                                                        ) : (
                                                            <FileText className="h-5 w-5 text-green-500" />
                                                        )}
                                                        <div className="flex-1 min-w-0">
                                                            <p className="font-medium text-sm truncate">{item.name}</p>
                                                            <div className="flex items-center space-x-2 text-xs text-muted-foreground">
                                                                <span>{formatFileSize(item.size)}</span>
                                                                <span>•</span>
                                                                <span>{formatDate(item.createdAt)}</span>
                                                            </div>
                                                        </div>
                                                    </div>
                                                </CardContent>
                                            </Card>
                                        ))
                                    )}
                                </div>
                            </CardContent>
                        </Card>

                        {/* Folder Info Card */}
                        <Card className="mt-4">
                            <CardHeader>
                                <CardTitle className="text-lg">Folder Information</CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                <div>
                                    <h4 className="font-medium text-sm text-muted-foreground mb-1">
                                        Folder Name
                                    </h4>
                                    <p className="text-sm">{folder.name}</p>
                                </div>
                                <div>
                                    <h4 className="font-medium text-sm text-muted-foreground mb-1">
                                        Shared By
                                    </h4>
                                    <div className="flex items-center space-x-2">
                                        <User className="h-4 w-4" />
                                        <p className="text-sm">{folder.owner ? folder.owner.name : 'Anonymous'}</p>
                                    </div>
                                </div>
                                <div>
                                    <h4 className="font-medium text-sm text-muted-foreground mb-1">
                                        Items
                                    </h4>
                                    <p className="text-sm">{items.length} {items.length === 1 ? 'item' : 'items'}</p>
                                </div>
                            </CardContent>
                        </Card>

                        <Card className="mt-4">
                            <CardContent className="p-4">
                                <p className="text-sm text-muted-foreground text-center">
                                    Create your own account to start sharing folders
                                </p>
                                <Link href="/auth/register" className="block mt-2">
                                    <Button className="w-full" size="sm">
                                        Create Account
                                    </Button>
                                </Link>
                            </CardContent>
                        </Card>
                    </div>

                    {/* File Viewer */}
                    <div className="lg:col-span-3">
                        <div className="h-[calc(100vh-12rem)]">
                            {selectedFile ? (
                                <MonacoEditor
                                    file={selectedFile as any}
                                    onSave={() => { }} // Read-only for shared files
                                    readOnly={true}
                                />
                            ) : (
                                <div className="flex items-center justify-center h-full text-muted-foreground bg-card rounded-lg border">
                                    <div className="text-center">
                                        <FolderPlus className="h-16 w-16 mx-auto mb-4 opacity-50" />
                                        <h3 className="text-lg font-medium mb-2">Browse the folder</h3>
                                        <p>Select a file from the folder to view its contents</p>
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    )
}
