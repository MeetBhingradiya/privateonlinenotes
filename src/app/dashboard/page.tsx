'use client'

import { useAuth } from '@/components/providers/auth-provider'
import { useState, useEffect, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { IconButton } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent } from '@/components/ui/card'
import { Icon } from '@iconify/react'
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
    const [sidebarCollapsed, setSidebarCollapsed] = useState(false)
    const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false)
    const [originalContent, setOriginalContent] = useState('')

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

    // Add beforeunload event listener to warn about unsaved changes
    useEffect(() => {
        const handleBeforeUnload = (e: BeforeUnloadEvent) => {
            if (hasUnsavedChanges) {
                e.preventDefault()
                e.returnValue = 'You have unsaved changes. Are you sure you want to leave?'
                return 'You have unsaved changes. Are you sure you want to leave?'
            }
        }

        const handleKeyDown = (e: KeyboardEvent) => {
            // Ctrl+S to save
            if ((e.ctrlKey || e.metaKey) && e.key === 's') {
                e.preventDefault()
                if (selectedFile && hasUnsavedChanges && selectedFile.content) {
                    // Call save through a callback to avoid dependency issues
                    const saveContent = async () => {
                        try {
                            const response = await fetch(`/api/files/${selectedFile._id}`, {
                                method: 'PUT',
                                headers: { 'Content-Type': 'application/json' },
                                body: JSON.stringify({ content: selectedFile.content }),
                            })
                            if (response.ok) {
                                setHasUnsavedChanges(false)
                                setOriginalContent(selectedFile.content || '')
                            }
                        } catch (error) {
                            console.error('Save failed:', error)
                        }
                    }
                    saveContent()
                }
            }
        }

        // Handle browser navigation (back/forward buttons)
        const handlePopstate = () => {
            if (hasUnsavedChanges && selectedFile) {
                const confirmLeave = confirm(
                    `You have unsaved changes in "${selectedFile.name}". Do you want to save before navigating?\n\nClick "OK" to save and navigate, or "Cancel" to navigate without saving.`
                )
                if (!confirmLeave) {
                    setHasUnsavedChanges(false)
                }
                // Note: For popstate we just warn, actual save should be handled by the navigation logic
            }
        }

        window.addEventListener('beforeunload', handleBeforeUnload)
        window.addEventListener('keydown', handleKeyDown)
        window.addEventListener('popstate', handlePopstate)

        return () => {
            window.removeEventListener('beforeunload', handleBeforeUnload)
            window.removeEventListener('keydown', handleKeyDown)
            window.removeEventListener('popstate', handlePopstate)
        }
    }, [hasUnsavedChanges, selectedFile])

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

        // Check for unsaved changes
        if (hasUnsavedChanges && selectedFile) {
            const confirmCreate = confirm(
                `You have unsaved changes in "${selectedFile.name}". Do you want to save before creating a new ${newItemType}?\n\nClick "OK" to save and continue, or "Cancel" to continue without saving.`
            )
            if (confirmCreate) {
                try {
                    const response = await fetch(`/api/files/${selectedFile._id}`, {
                        method: 'PUT',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify({ content: selectedFile.content }),
                    })
                    if (response.ok) {
                        toast.success('File saved successfully')
                        setHasUnsavedChanges(false)
                    }
                } catch {
                    toast.error('Failed to save file')
                }
            }
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
        // Check for unsaved changes before switching files
        if (hasUnsavedChanges && selectedFile) {
            const confirmSwitch = confirm(
                `You have unsaved changes in "${selectedFile.name}". Do you want to save before switching files?\n\nClick "OK" to save and switch, or "Cancel" to switch without saving.`
            )
            if (confirmSwitch) {
                // Save current file first
                try {
                    const response = await fetch(`/api/files/${selectedFile._id}`, {
                        method: 'PUT',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify({ content: selectedFile.content }),
                    })
                    if (response.ok) {
                        toast.success('File saved successfully')
                    }
                } catch {
                    toast.error('Failed to save file')
                }
            }
            setHasUnsavedChanges(false)
        }

        if (file.type === 'folder') {
            // Check for unsaved changes before navigating
            if (hasUnsavedChanges && selectedFile) {
                const confirmNavigate = confirm(
                    `You have unsaved changes in "${selectedFile.name}". Do you want to save before navigating to the folder?\n\nClick "OK" to save and navigate, or "Cancel" to navigate without saving.`
                )
                if (confirmNavigate) {
                    try {
                        const response = await fetch(`/api/files/${selectedFile._id}`, {
                            method: 'PUT',
                            headers: { 'Content-Type': 'application/json' },
                            body: JSON.stringify({ content: selectedFile.content }),
                        })
                        if (response.ok) {
                            toast.success('File saved successfully')
                        }
                    } catch {
                        toast.error('Failed to save file')
                    }
                }
                setHasUnsavedChanges(false)
            }
            // Navigate to folder using its path
            setCurrentPath(file.path)
            return
        }

        try {
            const response = await fetch(`/api/files/${file._id}`)
            if (response.ok) {
                const fileData = await response.json()
                setSelectedFile(fileData)
                setOriginalContent(fileData.content || '')
                setHasUnsavedChanges(false)
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
                setOriginalContent(content)
                setHasUnsavedChanges(false)
                toast.success('File saved successfully')
            } else {
                toast.error('Failed to save file')
            }
        } catch {
            toast.error('Error saving file')
        }
    }

    const handleContentChange = (content: string) => {
        if (selectedFile) {
            setSelectedFile({ ...selectedFile, content })
            setHasUnsavedChanges(content !== originalContent)
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
        // Check if we're trying to delete the currently open file with unsaved changes
        if (selectedFile?._id === file._id && hasUnsavedChanges) {
            const confirmDelete = confirm(
                `"${file.name}" has unsaved changes. Are you sure you want to delete it?\n\nThis action cannot be undone and your changes will be lost.`
            )
            if (!confirmDelete) return
        } else if (!confirm(`Are you sure you want to delete ${file.name}?`)) {
            return
        }

        try {
            const response = await fetch(`/api/files/${file._id}`, {
                method: 'DELETE',
            })

            if (response.ok) {
                setFiles(files.filter(f => f._id !== file._id))
                if (selectedFile?._id === file._id) {
                    setSelectedFile(null)
                    setHasUnsavedChanges(false)
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

    const handleNavigation = async (path: string) => {
        // Check for unsaved changes before navigation
        if (hasUnsavedChanges && selectedFile) {
            const userChoice = confirm(
                `You have unsaved changes in "${selectedFile.name}". Do you want to save before navigating?\n\nClick "OK" to save and navigate, "Cancel" to navigate without saving.`
            )
            if (userChoice) {
                try {
                    const response = await fetch(`/api/files/${selectedFile._id}`, {
                        method: 'PUT',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify({ content: selectedFile.content }),
                    })
                    if (response.ok) {
                        toast.success('File saved successfully')
                        setHasUnsavedChanges(false)
                    } else {
                        toast.error('Failed to save file')
                        return // Don't navigate if save failed
                    }
                } catch {
                    toast.error('Failed to save file')
                    return // Don't navigate if save failed
                }
            } else {
                setHasUnsavedChanges(false)
            }
        }
        router.push(path)
    }

    const handleLogout = async () => {
        // Check for unsaved changes before logout
        if (hasUnsavedChanges && selectedFile) {
            const confirmLogout = confirm(
                `You have unsaved changes in "${selectedFile.name}". Do you want to save before logging out?\n\nClick "OK" to save and logout, or "Cancel" to logout without saving.`
            )
            if (confirmLogout) {
                try {
                    const response = await fetch(`/api/files/${selectedFile._id}`, {
                        method: 'PUT',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify({ content: selectedFile.content }),
                    })
                    if (response.ok) {
                        toast.success('File saved successfully')
                    }
                } catch {
                    toast.error('Failed to save file')
                }
            }
        }

        await logout()
        router.push('/auth/login')
    }

    if (!user) return null

    return (
        <div className="flex h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 dark:from-gray-900 dark:via-blue-900 dark:to-purple-900 overflow-hidden">
            {/* Sidebar */}
            <div className={`glass-sidebar ${sidebarCollapsed ? 'w-20' : 'w-72'} transition-all duration-300 ${sidebarCollapsed ? 'px-3 py-4' : 'px-5 py-4'} bg-white/10 dark:bg-white/5 border-r border-white/20 dark:border-white/10 backdrop-blur-xl flex flex-col h-full relative z-10`}>
                {/* Header with collapse toggle */}
                <div className={`flex items-center ${sidebarCollapsed ? 'flex-col' : 'justify-between'} ${sidebarCollapsed ? 'mb-4' : 'mb-6'}`}>
                    {!sidebarCollapsed && (
                        <div className="flex items-center space-x-3">
                            <div className="h-10 w-10 rounded-xl bg-gradient-to-br from-blue-600 to-purple-600 flex items-center justify-center shadow-lg">
                                <Icon icon="material-symbols:description" className="h-5 w-5 text-white" />
                            </div>
                            <div>
                                <h1 className="text-xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">Notta</h1>
                            </div>
                        </div>
                    )}
                    {sidebarCollapsed && (
                        <div className="h-10 w-10 rounded-xl bg-gradient-to-br from-blue-600 to-purple-600 flex items-center justify-center shadow-lg mb-3">
                            <Icon icon="material-symbols:description" className="h-5 w-5 text-white" />
                        </div>
                    )}
                    <IconButton
                        variant="ghost"
                        size="sm"
                        onClick={() => setSidebarCollapsed(!sidebarCollapsed)}
                        icon={sidebarCollapsed ? "menu" : "menu-open"}
                        tooltip={sidebarCollapsed ? "Expand sidebar" : "Collapse sidebar"}
                        className={`hover:bg-white/20 rounded-lg p-2 h-8 w-8 ${sidebarCollapsed ? 'mb-2' : ''}`}
                    />
                </div>

                {/* User info - only show when expanded */}
                {!sidebarCollapsed && (
                    <div className={`mb-6 p-4 glass-card border-white/20 dark:border-white/10 rounded-xl transition-all duration-300 ${user.plan === 'premium'
                        ? 'bg-gradient-to-br from-amber-500/20 via-orange-500/15 to-yellow-500/20 dark:from-amber-500/10 dark:via-orange-500/8 dark:to-yellow-500/10 border-amber-300/30 shadow-amber-500/20 shadow-lg animate-pulse'
                        : user.plan === 'pro'
                            ? 'bg-gradient-to-br from-green-500/20 via-emerald-500/15 to-teal-500/20 dark:from-green-500/10 dark:via-emerald-500/8 dark:to-teal-500/10 border-green-300/30 shadow-green-500/20 shadow-lg'
                            : 'bg-gradient-to-br from-blue-500/15 via-purple-500/10 to-indigo-500/15 dark:from-blue-500/8 dark:via-purple-500/5 dark:to-indigo-500/8 border-blue-300/20'
                        }`}>
                        <div className="flex items-center space-x-3">
                            <div className={`h-8 w-8 rounded-lg flex items-center justify-center transition-all duration-300 ${user.plan === 'premium'
                                ? 'bg-gradient-to-br from-amber-500 to-orange-600 shadow-lg shadow-amber-500/30 animate-bounce'
                                : user.plan === 'pro'
                                    ? 'bg-gradient-to-br from-green-500 to-emerald-600 shadow-lg shadow-green-500/30'
                                    : 'bg-gradient-to-br from-blue-500 to-purple-600 shadow-md'
                                }`}>
                                <Icon
                                    icon={user.plan === 'premium' ? "material-symbols:workspace-premium" :
                                        user.plan === 'pro' ? "material-symbols:star" :
                                            "material-symbols:person"}
                                    className={`h-4 w-4 text-white ${user.plan === 'premium' ? 'animate-spin' : ''}`}
                                />
                            </div>
                            <div>
                                <p className="text-sm text-foreground/90 font-medium">{user.name || user.username}</p>
                                <div className="text-xs text-foreground/60 flex items-center space-x-1">
                                    <span className={`capitalize font-semibold ${user.plan === 'premium'
                                        ? 'text-amber-600 dark:text-amber-400'
                                        : user.plan === 'pro'
                                            ? 'text-green-600 dark:text-green-400'
                                            : 'text-blue-600 dark:text-blue-400'
                                        }`}>
                                        {user.plan || 'Free'}
                                    </span>
                                    <span>Plan</span>
                                    {user.plan === 'premium' && (
                                        <Icon icon="material-symbols:auto-awesome" className="h-3 w-3 text-amber-500 animate-pulse" />
                                    )}
                                    {user.plan === 'pro' && (
                                        <Icon icon="material-symbols:verified" className="h-3 w-3 text-green-500" />
                                    )}
                                </div>
                            </div>
                        </div>
                    </div>
                )}

                {/* User info for collapsed state - simplified */}
                {sidebarCollapsed && (
                    <div className="mb-4 flex justify-center">
                        <div className={`h-8 w-8 rounded-lg flex items-center justify-center transition-all duration-300 ${user.plan === 'premium'
                            ? 'bg-gradient-to-br from-amber-500 to-orange-600 shadow-lg shadow-amber-500/40 animate-bounce'
                            : user.plan === 'pro'
                                ? 'bg-gradient-to-br from-green-500 to-emerald-600 shadow-lg shadow-green-500/40 hover:scale-110'
                                : 'bg-gradient-to-br from-blue-500 to-purple-600 shadow-md hover:scale-105'
                            }`}>
                            <Icon
                                icon={user.plan === 'premium' ? "material-symbols:workspace-premium" :
                                    user.plan === 'pro' ? "material-symbols:star" :
                                        "material-symbols:person"}
                                className={`h-4 w-4 text-white ${user.plan === 'premium' ? 'animate-spin' : ''}`}
                            />
                        </div>
                    </div>
                )}

                {/* Plan Status & Upgrade Section - only show when expanded */}
                {!sidebarCollapsed && (!user.plan || user.plan === 'free') && (
                    <div className="glass-card mb-6 p-4 bg-gradient-to-r from-blue-500/20 via-purple-500/15 to-indigo-500/20 dark:from-blue-500/10 dark:via-purple-500/8 dark:to-indigo-500/10 border-white/30 dark:border-white/20 backdrop-blur-lg rounded-xl relative overflow-hidden group hover:shadow-lg hover:shadow-blue-500/20 transition-all duration-300">
                        {/* Animated background gradient */}
                        <div className="absolute inset-0 bg-gradient-to-r from-blue-600/10 via-purple-600/5 to-indigo-600/10 opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
                        <div className="relative z-10">
                            <div className="flex items-center mb-3">
                                <Icon icon="material-symbols:workspace-premium" className="h-5 w-5 text-blue-600 mr-2 animate-pulse" />
                                <span className="text-sm font-semibold text-blue-800 dark:text-blue-200">Upgrade Available</span>
                                <div className="ml-auto">
                                    <div className="w-2 h-2 rounded-full bg-purple-500 animate-bounce"></div>
                                </div>
                            </div>
                            <p className="text-xs text-blue-700 dark:text-blue-300 mb-4 leading-relaxed">
                                Unlock unlimited files, advanced sharing, and premium features
                            </p>
                            <Link href="/pricing">
                                <IconButton
                                    size="sm"
                                    className="w-full bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white border-0 h-9 hover:scale-105 transition-all duration-200 shadow-lg hover:shadow-blue-500/30"
                                    icon="bolt"
                                    tooltip="Upgrade to premium plan"
                                >
                                    Upgrade Now
                                </IconButton>
                            </Link>
                        </div>
                    </div>
                )}

                {/* Visual indicators for collapsed state */}
                {sidebarCollapsed && (
                    <div className="flex flex-col space-y-2 items-center mb-6">
                        {/* Plan indicator with enhanced animations */}
                        <div className={`w-3 h-3 rounded-full shadow-lg transition-all duration-300 ${user.plan === 'premium'
                            ? 'bg-gradient-to-r from-amber-400 to-orange-500 animate-pulse shadow-amber-500/50'
                            : user.plan === 'pro'
                                ? 'bg-gradient-to-r from-green-400 to-emerald-500 shadow-green-500/50 animate-bounce'
                                : 'bg-gradient-to-r from-blue-400 to-purple-500 shadow-blue-500/50'
                            }`} title={`${user.plan || 'Free'} Plan`}>
                            {user.plan === 'premium' && (
                                <div className="w-full h-full rounded-full bg-gradient-to-r from-yellow-300 to-amber-400 animate-ping opacity-75"></div>
                            )}
                        </div>
                        {/* Upgrade indicator for free users with enhanced animation */}
                        {(!user.plan || user.plan === 'free') && (
                            <div className="relative">
                                <div className="w-2 h-2 rounded-full bg-gradient-to-r from-purple-400 to-pink-500 animate-pulse shadow-lg shadow-purple-500/50" title="Upgrade Available"></div>
                                <div className="absolute inset-0 w-2 h-2 rounded-full bg-gradient-to-r from-purple-300 to-pink-400 animate-ping opacity-75"></div>
                            </div>
                        )}
                        {/* Pro glow effect */}
                        {user.plan === 'pro' && (
                            <div className="w-1 h-1 rounded-full bg-green-300 animate-pulse opacity-60" title="Pro Features Active"></div>
                        )}
                        {/* Premium sparkle effect */}
                        {user.plan === 'premium' && (
                            <div className="flex space-x-1">
                                <div className="w-1 h-1 rounded-full bg-amber-300 animate-pulse" style={{ animationDelay: '0s' }}></div>
                                <div className="w-1 h-1 rounded-full bg-orange-300 animate-pulse" style={{ animationDelay: '0.2s' }}></div>
                                <div className="w-1 h-1 rounded-full bg-yellow-300 animate-pulse" style={{ animationDelay: '0.4s' }}></div>
                            </div>
                        )}
                    </div>
                )}

                {/* Navigation */}
                <div className="flex flex-col space-y-2 flex-1">
                    <IconButton
                        variant="ghost"
                        className={`w-full ${sidebarCollapsed ? 'justify-center px-0 h-10' : 'justify-start px-3 h-11'} hover:bg-white/20 rounded-xl transition-all duration-200`}
                        onClick={() => {
                            setIsCreating(true)
                            setNewItemType('file')
                        }}
                        icon="description"
                        tooltip="Create a new file"
                        iconSize={sidebarCollapsed ? 20 : 16}
                    >
                        {!sidebarCollapsed && <span className="text-sm font-medium">New File</span>}
                    </IconButton>
                    <IconButton
                        variant="ghost"
                        className={`w-full ${sidebarCollapsed ? 'justify-center px-0 h-10' : 'justify-start px-3 h-11'} hover:bg-white/20 rounded-xl transition-all duration-200`}
                        onClick={() => {
                            setIsCreating(true)
                            setNewItemType('folder')
                        }}
                        icon="create-new-folder"
                        tooltip="Create a new folder"
                        iconSize={sidebarCollapsed ? 20 : 16}
                    >
                        {!sidebarCollapsed && <span className="text-sm font-medium">New Folder</span>}
                    </IconButton>

                    {/* Divider */}
                    <div className="py-2 ">
                        <div className="h-px bg-white/20 dark:bg-white/10"></div>
                    </div>

                    <IconButton
                        variant="ghost"
                        className={`w-full ${sidebarCollapsed ? 'justify-center px-0 h-10' : 'justify-start px-3 h-11'} hover:bg-white/20 rounded-xl transition-all duration-200`}
                        icon="explore"
                        tooltip="Browse public files from other users"
                        iconSize={sidebarCollapsed ? 20 : 16}
                        onClick={() => handleNavigation('/explore')}
                    >
                        {!sidebarCollapsed && <span className="text-sm font-medium">Explore</span>}
                    </IconButton>
                    <IconButton
                        variant="ghost"
                        className={`w-full ${sidebarCollapsed ? 'justify-center px-0 h-10' : 'justify-start px-3 h-11'} hover:bg-white/20 rounded-xl transition-all duration-200`}
                        icon="folder-shared"
                        tooltip="View and manage your shared files"
                        iconSize={sidebarCollapsed ? 20 : 16}
                        onClick={() => handleNavigation('/shared')}
                    >
                        {!sidebarCollapsed && <span className="text-sm font-medium">Shared Files</span>}
                    </IconButton>
                </div>

                {/* Settings - Bottom of sidebar */}
                <div className="flex flex-col space-y-2 border-t border-white/20 dark:border-white/10 pt-3 mt-auto">
                    <IconButton
                        variant="ghost"
                        className={`w-full ${sidebarCollapsed ? 'justify-center px-0 h-10' : 'justify-start px-3 h-10'} hover:bg-white/20 rounded-xl transition-all duration-200`}
                        onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
                        icon={theme === 'dark' ? 'light-mode' : 'dark-mode'}
                        tooltip={`Switch to ${theme === 'dark' ? 'light' : 'dark'} mode`}
                        iconSize={sidebarCollapsed ? 18 : 16}
                    >
                        {!sidebarCollapsed && <span className="text-sm font-medium">{theme === 'dark' ? 'Light Mode' : 'Dark Mode'}</span>}
                    </IconButton>
                    <IconButton
                        variant="ghost"
                        className={`w-full ${sidebarCollapsed ? 'justify-center px-0 h-10' : 'justify-start px-3 h-10'} hover:bg-white/20 rounded-xl transition-all duration-200`}
                        icon="settings"
                        tooltip="Manage your profile and account settings"
                        iconSize={sidebarCollapsed ? 18 : 16}
                        onClick={() => handleNavigation('/profile')}
                    >
                        {!sidebarCollapsed && <span className="text-sm font-medium">Profile</span>}
                    </IconButton>
                    <IconButton
                        variant="ghost"
                        className={`w-full ${sidebarCollapsed ? 'justify-center px-0 h-10' : 'justify-start px-3 h-10'} hover:bg-red-500/20 rounded-xl transition-all duration-200 text-red-400 hover:text-red-300`}
                        onClick={handleLogout}
                        icon="logout"
                        tooltip="Sign out of your account"
                        iconSize={sidebarCollapsed ? 18 : 16}
                    >
                        {!sidebarCollapsed && <span className="text-sm font-medium">Logout</span>}
                    </IconButton>
                </div>
            </div>

            {/* Main Content */}
            <div className="flex-1 flex h-full overflow-hidden">
                {/* File Explorer */}
                <div className="glass-sidebar w-80 border-r border-white/20 dark:border-white/10 bg-white/5 dark:bg-white/3 backdrop-blur-lg flex flex-col h-full overflow-hidden">
                    <div className="p-6 border-b border-white/20 dark:border-white/10 flex-shrink-0">
                        <div className="flex items-center justify-between mb-6">
                            <h2 className="font-semibold text-foreground text-lg">Files</h2>
                            <div className="flex items-center space-x-1 glass p-1 rounded-lg bg-white/10 dark:bg-white/5 border-white/20 dark:border-white/10">
                                <IconButton
                                    variant="ghost"
                                    size="sm"
                                    onClick={() => setViewMode('grid')}
                                    className={`${viewMode === 'grid' ? 'bg-white/30 dark:bg-white/20' : 'hover:bg-white/20'} rounded-md`}
                                    icon="grid-view"
                                    tooltip="Switch to grid view"
                                />
                                <IconButton
                                    variant="ghost"
                                    size="sm"
                                    onClick={() => setViewMode('list')}
                                    className={`${viewMode === 'list' ? 'bg-white/30 dark:bg-white/20' : 'hover:bg-white/20'} rounded-md`}
                                    icon="view-list"
                                    tooltip="Switch to list view"
                                />
                            </div>
                        </div>
                        <div className="relative mb-4">
                            <Icon icon="material-symbols:search" className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-foreground/50" />
                            <Input
                                placeholder="Search files..."
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                className="pl-10 bg-white/5 dark:bg-white/3 border-white/20 dark:border-white/10 focus:border-white/40 focus:bg-white/10"
                            />
                        </div>
                    </div>

                    <div className="p-6 flex-1 overflow-y-auto">
                        {/* Breadcrumb */}
                        <div className="mb-6">
                            <div className="text-sm text-foreground/60 mb-2">
                                <button
                                    onClick={() => {
                                        if (hasUnsavedChanges && selectedFile) {
                                            const confirmNavigate = confirm(
                                                `You have unsaved changes in "${selectedFile.name}". Do you want to save before navigating?\n\nClick "OK" to save and navigate, or "Cancel" to navigate without saving.`
                                            )
                                            if (confirmNavigate) {
                                                saveFile(selectedFile.content || '').then(() => {
                                                    setCurrentPath('/')
                                                })
                                            } else {
                                                setHasUnsavedChanges(false)
                                                setCurrentPath('/')
                                            }
                                        } else {
                                            setCurrentPath('/')
                                        }
                                    }}
                                    className="hover:text-foreground transition-colors font-medium"
                                >
                                    Root
                                </button>
                                {currentPath !== '/' && currentPath.split('/').filter(Boolean).map((part, index, arr) => (
                                    <span key={index}>
                                        {' / '}
                                        <button
                                            onClick={() => {
                                                if (hasUnsavedChanges && selectedFile) {
                                                    const confirmNavigate = confirm(
                                                        `You have unsaved changes in "${selectedFile.name}". Do you want to save before navigating?\n\nClick "OK" to save and navigate, or "Cancel" to navigate without saving.`
                                                    )
                                                    if (confirmNavigate) {
                                                        saveFile(selectedFile.content || '').then(() => {
                                                            const newPath = '/' + arr.slice(0, index + 1).join('/')
                                                            setCurrentPath(newPath)
                                                        })
                                                    } else {
                                                        setHasUnsavedChanges(false)
                                                        const newPath = '/' + arr.slice(0, index + 1).join('/')
                                                        setCurrentPath(newPath)
                                                    }
                                                } else {
                                                    const newPath = '/' + arr.slice(0, index + 1).join('/')
                                                    setCurrentPath(newPath)
                                                }
                                            }}
                                            className="hover:text-foreground transition-colors font-medium"
                                        >
                                            {part}
                                        </button>
                                    </span>
                                ))}
                            </div>

                            {/* Unsaved changes warning in breadcrumb area */}
                            {hasUnsavedChanges && selectedFile && (
                                <div className="mb-4 p-3 bg-amber-50/80 dark:bg-amber-900/20 border border-amber-200/60 dark:border-amber-700/40 rounded-lg backdrop-blur-sm">
                                    <div className="flex items-center text-amber-800 dark:text-amber-200">
                                        <Icon icon="material-symbols:warning" className="h-4 w-4 mr-2 flex-shrink-0" />
                                        <div className="text-sm">
                                            <span className="font-medium">{selectedFile.name}</span> has unsaved changes
                                            <button
                                                onClick={() => saveFile(selectedFile.content || '')}
                                                className="ml-2 px-2 py-1 bg-amber-600 hover:bg-amber-700 text-white text-xs rounded transition-colors"
                                            >
                                                Save now
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            )}
                        </div>

                        {/* Create Item Form */}
                        {isCreating && (
                            <Card className="mb-6 bg-white/10 dark:bg-white/5 border-white/20 dark:border-white/10">
                                <CardContent className="p-4">
                                    <Input
                                        placeholder={`${newItemType === 'file' ? 'File' : 'Folder'} name`}
                                        value={newItemName}
                                        onChange={(e) => setNewItemName(e.target.value)}
                                        onKeyPress={(e) => e.key === 'Enter' && createItem()}
                                        autoFocus
                                        className="mb-3 bg-white/5 dark:bg-white/3 border-white/20 dark:border-white/10"
                                    />
                                    <div className="flex space-x-2">
                                        <IconButton
                                            size="sm"
                                            onClick={createItem}
                                            icon="add"
                                            tooltip={`Create new ${newItemType}`}
                                            className="flex-1 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700"
                                        >
                                            Create
                                        </IconButton>
                                        <IconButton
                                            size="sm"
                                            variant="outline"
                                            onClick={() => setIsCreating(false)}
                                            icon="close"
                                            tooltip="Cancel creation"
                                            className="border-white/20 hover:bg-white/20"
                                        >
                                            Cancel
                                        </IconButton>
                                    </div>
                                </CardContent>
                            </Card>
                        )}

                        {/* File List */}
                        <div className="space-y-3">
                            {loading ? (
                                <div className="text-center py-12 text-foreground/60">
                                    <Icon icon="material-symbols:hourglass-empty" className="h-8 w-8 mx-auto mb-2 animate-pulse" />
                                    Loading...
                                </div>
                            ) : filteredFiles.length === 0 ? (
                                <div className="text-center py-12 text-foreground/60">
                                    <Icon icon="material-symbols:folder-off" className="h-8 w-8 mx-auto mb-2" />
                                    {searchQuery ? 'No files found' : 'No files yet'}
                                </div>
                            ) : (filteredFiles.map((file) => (
                                <Card
                                    key={file._id}
                                    className={`group cursor-pointer transition-all duration-200 hover:bg-white/20 dark:hover:bg-white/10 ${selectedFile?._id === file._id
                                        ? 'ring-2 ring-blue-500 bg-blue-500/10 dark:bg-blue-500/5'
                                        : 'bg-white/5 dark:bg-white/3'
                                        } border-white/20 dark:border-white/10`}
                                    onClick={() => openFile(file)}
                                >
                                    <CardContent className="p-4">
                                        <div className="flex items-center justify-between">
                                            <div className="flex items-center space-x-3">
                                                {file.type === 'folder' ? (
                                                    <Icon icon="material-symbols:folder" className="h-5 w-5 text-blue-500 drop-shadow-sm" />
                                                ) : (
                                                    <Icon icon="material-symbols:description" className="h-5 w-5 text-foreground/70 drop-shadow-sm" />
                                                )}
                                                <span className="text-sm font-medium text-foreground flex items-center">
                                                    {file.name}
                                                    {/* {selectedFile?._id === file._id && hasUnsavedChanges && (
                                                        <span className="ml-2 flex items-center text-amber-600 dark:text-amber-400" title="Unsaved changes">
                                                            <Icon icon="material-symbols:circle" className="h-2 w-2 mr-1 animate-pulse" />
                                                            <span className="text-xs">*</span>
                                                        </span>
                                                    )} */}
                                                </span>
                                            </div>
                                            <div className="flex space-x-1 opacity-0 group-hover:opacity-100 transition-opacity">
                                                <IconButton
                                                    variant="ghost"
                                                    size="sm"
                                                    onClick={(e) => {
                                                        e.stopPropagation()
                                                        shareFile(file)
                                                    }}
                                                    icon="share"
                                                    tooltip="Share this file"
                                                    className="hover:bg-blue-500/20 hover:text-blue-600"
                                                />
                                                <IconButton
                                                    variant="ghost"
                                                    size="sm"
                                                    onClick={(e) => {
                                                        e.stopPropagation()
                                                        deleteFile(file)
                                                    }}
                                                    icon="delete"
                                                    tooltip="Delete this file"
                                                    className="hover:bg-red-500/20 hover:text-red-600"
                                                />
                                            </div>
                                        </div>
                                        {viewMode === 'list' && (
                                            <div className="mt-2 text-xs text-foreground/50 ml-8">
                                                {file.type === "file" ? formatFileSize(file.size) : null} {file.type === "file" ? "•" : null} {formatDate(file.updatedAt)}
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
                <div className="flex-1 bg-white/3 dark:bg-white/2 backdrop-blur-sm border-l border-white/10 dark:border-white/5 h-full overflow-hidden relative z-0">
                    {selectedFile ? (
                        <div className="h-full glass-card rounded-none border-0 bg-white/5 dark:bg-white/3 backdrop-blur-lg relative">
                            <MonacoEditor
                                file={selectedFile}
                                onSave={saveFile}
                                onChange={handleContentChange}
                            />
                        </div>
                    ) : (
                        <div className="flex items-center justify-center h-full text-foreground/50">
                            <div className="text-center glass-card p-8 bg-white/10 dark:bg-white/5 border-white/20 dark:border-white/10">
                                <Icon icon="material-symbols:description" className="h-16 w-16 mx-auto mb-4 opacity-50 drop-shadow-lg" />
                                <h3 className="text-lg font-medium mb-2 text-foreground">No file selected</h3>
                                <p className="text-foreground/70">Select a file from the sidebar to start editing</p>
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
