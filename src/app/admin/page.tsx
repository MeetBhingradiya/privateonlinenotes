'use client'

import { useEffect, useCallback, useReducer } from 'react'
import dynamic from 'next/dynamic'
import { useAuth } from '@/components/providers/auth-provider'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent } from '@/components/ui/card'
import { PageLayout } from '@/components/page-layout'
import { Shield, Users, FileText, Share, Ban, Trash2, Search, Clock, Eye, AlertTriangle, X, Edit3, Save, RotateCcw, ArrowRight, Settings, Database, Activity, TrendingUp, Filter, Download, Star, Code, ExternalLink } from 'lucide-react'
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
    role: string
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

// State management using useReducer for better performance
interface AdminState {
    activeTab: 'users' | 'files' | 'shares'
    data: {
        users: AdminUser[]
        files: AdminFile[]
        shares: AdminShare[]
    }
    pagination: PaginationInfo
    search: {
        query: string
        term: string
    }
    ui: {
        loading: boolean
        fileViewerOpen: boolean
        isEditingName: boolean
        isSavingChanges: boolean
    }
    selectedFile: AdminFile | null
    fileContent: string
    editing: {
        name: string
        language: string
    }
}

type AdminAction =
    | { type: 'SET_ACTIVE_TAB'; payload: 'users' | 'files' | 'shares' }
    | { type: 'SET_LOADING'; payload: boolean }
    | { type: 'SET_DATA'; payload: { type: 'users' | 'files' | 'shares'; data: any[]; pagination: PaginationInfo } }
    | { type: 'SET_SEARCH_QUERY'; payload: string }
    | { type: 'SET_SEARCH_TERM'; payload: string }
    | { type: 'SET_PAGINATION'; payload: Partial<PaginationInfo> }
    | { type: 'OPEN_FILE_VIEWER'; payload: { file: AdminFile; content: string } }
    | { type: 'CLOSE_FILE_VIEWER' }
    | { type: 'SET_EDITING_MODE'; payload: boolean }
    | { type: 'SET_EDITING_NAME'; payload: string }
    | { type: 'SET_EDITING_LANGUAGE'; payload: string }
    | { type: 'SET_SAVING'; payload: boolean }
    | { type: 'UPDATE_SELECTED_FILE'; payload: Partial<AdminFile> }

const initialState: AdminState = {
    activeTab: 'users',
    data: {
        users: [],
        files: [],
        shares: []
    },
    pagination: {
        currentPage: 1,
        totalPages: 1,
        totalCount: 0,
        hasNextPage: false,
        hasPrevPage: false,
        limit: 20
    },
    search: {
        query: '',
        term: ''
    },
    ui: {
        loading: false,
        fileViewerOpen: false,
        isEditingName: false,
        isSavingChanges: false
    },
    selectedFile: null,
    fileContent: '',
    editing: {
        name: '',
        language: ''
    }
}

function adminReducer(state: AdminState, action: AdminAction): AdminState {
    switch (action.type) {
        case 'SET_ACTIVE_TAB':
            return {
                ...state,
                activeTab: action.payload,
                pagination: { ...initialState.pagination },
                search: { query: '', term: '' }
            }
        case 'SET_LOADING':
            return { ...state, ui: { ...state.ui, loading: action.payload } }
        case 'SET_DATA':
            return {
                ...state,
                data: { ...state.data, [action.payload.type]: action.payload.data },
                pagination: action.payload.pagination
            }
        case 'SET_SEARCH_QUERY':
            return { ...state, search: { ...state.search, query: action.payload } }
        case 'SET_SEARCH_TERM':
            return { ...state, search: { ...state.search, term: action.payload } }
        case 'SET_PAGINATION':
            return { ...state, pagination: { ...state.pagination, ...action.payload } }
        case 'OPEN_FILE_VIEWER':
            return {
                ...state,
                selectedFile: action.payload.file,
                fileContent: action.payload.content,
                ui: { ...state.ui, fileViewerOpen: true, isEditingName: false },
                editing: {
                    name: action.payload.file.name,
                    language: action.payload.file.language || ''
                }
            }
        case 'CLOSE_FILE_VIEWER':
            return {
                ...state,
                selectedFile: null,
                fileContent: '',
                ui: { ...state.ui, fileViewerOpen: false, isEditingName: false },
                editing: { name: '', language: '' }
            }
        case 'SET_EDITING_MODE':
            return { ...state, ui: { ...state.ui, isEditingName: action.payload } }
        case 'SET_EDITING_NAME':
            return { ...state, editing: { ...state.editing, name: action.payload } }
        case 'SET_EDITING_LANGUAGE':
            return { ...state, editing: { ...state.editing, language: action.payload } }
        case 'SET_SAVING':
            return { ...state, ui: { ...state.ui, isSavingChanges: action.payload } }
        case 'UPDATE_SELECTED_FILE':
            return {
                ...state,
                selectedFile: state.selectedFile ? { ...state.selectedFile, ...action.payload } : null
            }
        default:
            return state
    }
}

export default function AdminPanel() {
    const { user, loading: authLoading } = useAuth()
    const router = useRouter()
    const [state, dispatch] = useReducer(adminReducer, initialState)

    const loadData = useCallback(async (page = 1, search = '') => {
        dispatch({ type: 'SET_LOADING', payload: true })
        try {
            let endpoint = ''
            switch (state.activeTab) {
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

                dispatch({
                    type: 'SET_DATA',
                    payload: {
                        type: state.activeTab,
                        data: data[state.activeTab] || [],
                        pagination: data.pagination
                    }
                })
            } else {
                const errorData = await response.json()
                console.error('Admin API error:', errorData)
                toast.error(`Failed to load ${state.activeTab}: ${errorData.message || 'Unknown error'}`)
            }
        } catch (error) {
            console.error('Load data error:', error)
            toast.error(`Failed to load ${state.activeTab}`)
        } finally {
            dispatch({ type: 'SET_LOADING', payload: false })
        }
    }, [state.activeTab])

    useEffect(() => {
        // Check if user is admin
        console.log('Admin check - user:', user)
        console.log('Admin check - username:', user?.username)
        console.log('Admin check - role:', user?.role)
        console.log('Admin check - isAdmin by username:', user?.username === 'admin')
        console.log('Admin check - isAdmin by role:', user?.role === 'admin')
        console.log('Admin check - user loading:', authLoading)

        if (authLoading) {
            console.log('Still loading user data...')
            return
        }

        if (!user || (user.username !== 'admin' && user.role !== 'admin')) {
            console.log('Access denied - redirecting to dashboard', { user, username: user?.username, role: user?.role })
            router.push('/dashboard')
            return
        }
        console.log('Admin access granted - loading data')
        loadData(1, '')
    }, [user, router, loadData, authLoading])

    // Handle search with debouncing
    useEffect(() => {
        const timeoutId = setTimeout(() => {
            if (state.search.query !== state.search.term) {
                dispatch({ type: 'SET_SEARCH_TERM', payload: state.search.query })
                dispatch({ type: 'SET_PAGINATION', payload: { currentPage: 1 } })
                loadData(1, state.search.query)
            }
        }, 500)

        return () => clearTimeout(timeoutId)
    }, [state.search.query, loadData, state.search.term])

    // Reset pagination when tab changes
    useEffect(() => {
        dispatch({ type: 'SET_PAGINATION', payload: { currentPage: 1 } })
        dispatch({ type: 'SET_SEARCH_QUERY', payload: '' })
        dispatch({ type: 'SET_SEARCH_TERM', payload: '' })
        loadData(1, '')
    }, [state.activeTab, loadData])

    const handlePageChange = (newPage: number) => {
        dispatch({ type: 'SET_PAGINATION', payload: { currentPage: newPage } })
        loadData(newPage, state.search.term)
    }

    const blockUser = async (userId: string) => {
        try {
            const response = await fetch(`/api/admin/users/${userId}/block`, {
                method: 'POST'
            })
            if (response.ok) {
                toast.success('User blocked successfully')
                loadData(state.pagination.currentPage, state.search.term)
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
                loadData(state.pagination.currentPage, state.search.term)
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
                loadData(state.pagination.currentPage, state.search.term)
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
                loadData(state.pagination.currentPage, state.search.term)
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
                loadData(state.pagination.currentPage, state.search.term)
            }
        } catch (error) {
            console.error('Unblock file error:', error)
            toast.error('Failed to unblock file')
        }
    }

    const viewFile = async (file: AdminFile) => {
        if (file.type === 'file') {
            try {
                const response = await fetch(`/api/admin/files/${file._id}/content`)
                if (response.ok) {
                    const data = await response.json()
                    dispatch({
                        type: 'OPEN_FILE_VIEWER',
                        payload: { file, content: data.content || '' }
                    })
                } else {
                    dispatch({
                        type: 'OPEN_FILE_VIEWER',
                        payload: { file, content: 'Error loading file content' }
                    })
                }
            } catch (error) {
                console.error('Error loading file content:', error)
                dispatch({
                    type: 'OPEN_FILE_VIEWER',
                    payload: { file, content: 'Error loading file content' }
                })
            }
        } else {
            dispatch({
                type: 'OPEN_FILE_VIEWER',
                payload: { file, content: 'This is a folder - no content to display' }
            })
        }
    }

    const saveFileChanges = async () => {
        if (!state.selectedFile) return

        dispatch({ type: 'SET_SAVING', payload: true })
        try {
            const updates: any = {}

            // Check if name changed
            if (state.editing.name !== state.selectedFile.name) {
                updates.name = state.editing.name
            }

            // Check if language changed
            if (state.editing.language !== (state.selectedFile.language || '')) {
                updates.language = state.editing.language
            }

            if (Object.keys(updates).length > 0) {
                const response = await fetch(`/api/admin/files/${state.selectedFile._id}/update`, {
                    method: 'PATCH',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify(updates)
                })

                if (response.ok) {
                    toast.success('File updated successfully')
                    // Update the selected file with new data
                    dispatch({ type: 'UPDATE_SELECTED_FILE', payload: updates })
                    // Reload the files list
                    loadData(state.pagination.currentPage, state.search.term)
                } else {
                    const error = await response.json()
                    toast.error(error.message || 'Failed to update file')
                }
            }

            dispatch({ type: 'SET_EDITING_MODE', payload: false })
        } catch (error) {
            console.error('Update file error:', error)
            toast.error('Failed to update file')
        } finally {
            dispatch({ type: 'SET_SAVING', payload: false })
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
                loadData(state.pagination.currentPage, state.search.term)
            } else {
                const error = await response.json()
                toast.error(error.message || 'Failed to update user plan')
            }
        } catch (error) {
            console.error('Update user plan error:', error)
            toast.error('Failed to update user plan')
        }
    }

    const updateUserRole = async (userId: string, newRole: string) => {
        try {
            const response = await fetch(`/api/admin/users/${userId}/role`, {
                method: 'PATCH',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ role: newRole })
            })
            if (response.ok) {
                toast.success(`User role updated to ${newRole}`)
                loadData(state.pagination.currentPage, state.search.term)
            } else {
                const error = await response.json()
                toast.error(error.message || 'Failed to update user role')
            }
        } catch (error) {
            console.error('Update user role error:', error)
            toast.error('Failed to update user role')
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
                loadData(state.pagination.currentPage, state.search.term)
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
                loadData(state.pagination.currentPage, state.search.term)
            }
        } catch (error) {
            console.error('Block share error:', error)
            toast.error('Failed to block share link')
        }
    }

    const unblockShare = async (shareId: string) => {
        try {
            const response = await fetch(`/api/admin/shares/${shareId}/unblock`, {
                method: 'POST'
            })
            if (response.ok) {
                toast.success('Share link unblocked successfully')
                loadData(state.pagination.currentPage, state.search.term)
            }
        } catch (error) {
            console.error('Unblock share error:', error)
            toast.error('Failed to unblock share link')
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

    if (!user || (user.username !== 'admin' && user.role !== 'admin')) {
        console.log('Admin access check failed:', { user, username: user?.username, role: user?.role })
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
        <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 dark:from-gray-950 dark:via-blue-950 dark:to-indigo-950">
            <PageLayout title="Admin Panel" showBackButton={true} backTo="/dashboard" className="bg-transparent">
                <div className="container mx-auto px-6 py-8">
                    <div className="max-w-7xl mx-auto space-y-8">
                        
                        {/* Enhanced Header with Stats */}
                        <div className="relative">
                            <div className="absolute inset-0 bg-grid-pattern opacity-5"></div>
                            <div className="relative">
                                {/* Welcome Banner */}
                                <div className="text-center mb-8">
                                    <div className="inline-flex items-center rounded-full border bg-white/80 dark:bg-gray-900/80 backdrop-blur-sm px-6 py-3 text-sm shadow-lg mb-6">
                                        <Shield className="mr-2 h-4 w-4 text-blue-600" />
                                        <span className="font-medium">Admin Control Center</span>
                                        <div className="ml-3 w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                                    </div>

                                    <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold tracking-tight mb-4">
                                        <span className="bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 bg-clip-text text-transparent">
                                            System Overview
                                        </span>
                                    </h1>

                                    <p className="text-lg md:text-xl text-muted-foreground max-w-3xl mx-auto leading-relaxed">
                                        Comprehensive platform management with real-time analytics, user administration, and content moderation
                                    </p>
                                </div>

                                {/* Stats Dashboard */}
                                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
                                    <Card className="group hover:shadow-xl transition-all duration-300 border-0 bg-white/80 dark:bg-gray-900/80 backdrop-blur-sm overflow-hidden">
                                        <CardContent className="p-6">
                                            <div className="flex items-center justify-between">
                                                <div>
                                                    <div className="text-2xl font-bold text-foreground mb-1">
                                                        {state.data.users.length}
                                                    </div>
                                                    <div className="text-sm text-muted-foreground">Total Users</div>
                                                </div>
                                                <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
                                                    <Users className="h-6 w-6 text-white" />
                                                </div>
                                            </div>
                                            <div className="mt-4">
                                                <div className="flex items-center text-sm">
                                                    <TrendingUp className="h-4 w-4 text-green-500 mr-2" />
                                                    <span className="text-green-600 font-medium">+12%</span>
                                                    <span className="text-muted-foreground ml-2">vs last month</span>
                                                </div>
                                            </div>
                                        </CardContent>
                                    </Card>

                                    <Card className="group hover:shadow-xl transition-all duration-300 border-0 bg-white/80 dark:bg-gray-900/80 backdrop-blur-sm overflow-hidden">
                                        <CardContent className="p-6">
                                            <div className="flex items-center justify-between">
                                                <div>
                                                    <div className="text-2xl font-bold text-foreground mb-1">
                                                        {state.data.files.length}
                                                    </div>
                                                    <div className="text-sm text-muted-foreground">Total Files</div>
                                                </div>
                                                <div className="w-12 h-12 bg-gradient-to-br from-purple-500 to-purple-600 rounded-xl flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
                                                    <FileText className="h-6 w-6 text-white" />
                                                </div>
                                            </div>
                                            <div className="mt-4">
                                                <div className="flex items-center text-sm">
                                                    <Activity className="h-4 w-4 text-blue-500 mr-2" />
                                                    <span className="text-blue-600 font-medium">+5.3%</span>
                                                    <span className="text-muted-foreground ml-2">vs last month</span>
                                                </div>
                                            </div>
                                        </CardContent>
                                    </Card>

                                    <Card className="group hover:shadow-xl transition-all duration-300 border-0 bg-white/80 dark:bg-gray-900/80 backdrop-blur-sm overflow-hidden">
                                        <CardContent className="p-6">
                                            <div className="flex items-center justify-between">
                                                <div>
                                                    <div className="text-2xl font-bold text-foreground mb-1">
                                                        {state.data.shares.length}
                                                    </div>
                                                    <div className="text-sm text-muted-foreground">Active Shares</div>
                                                </div>
                                                <div className="w-12 h-12 bg-gradient-to-br from-emerald-500 to-emerald-600 rounded-xl flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
                                                    <Share className="h-6 w-6 text-white" />
                                                </div>
                                            </div>
                                            <div className="mt-4">
                                                <div className="flex items-center text-sm">
                                                    <Star className="h-4 w-4 text-yellow-500 mr-2" />
                                                    <span className="text-yellow-600 font-medium">+8.1%</span>
                                                    <span className="text-muted-foreground ml-2">vs last month</span>
                                                </div>
                                            </div>
                                        </CardContent>
                                    </Card>
                                </div>
                            </div>
                        </div>

                        {/* Enhanced Navigation & Controls */}
                        <div className="space-y-8">
                            {/* Tab Navigation with Modern Design */}
                            <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6">
                                <div className="flex justify-center lg:justify-start">
                                    <div className="inline-flex items-center rounded-2xl bg-white/80 dark:bg-gray-900/80 backdrop-blur-sm p-1.5 shadow-xl border border-gray-200/50 dark:border-gray-700/50">
                                        <Button
                                            variant="ghost"
                                            onClick={() => dispatch({ type: 'SET_ACTIVE_TAB', payload: 'users' })}
                                            className={`relative flex items-center rounded-xl px-6 py-3 transition-all duration-300 ${state.activeTab === 'users'
                                                    ? 'bg-gradient-to-r from-blue-600 to-purple-600 text-white shadow-lg scale-105'
                                                    : 'hover:bg-gray-100 dark:hover:bg-gray-800 text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-gray-100'
                                                }`}
                                        >
                                            <Users className="h-4 w-4 mr-2" />
                                            Users
                                            <div className={`ml-3 px-2.5 py-1 text-xs rounded-full font-medium ${state.activeTab === 'users'
                                                    ? 'bg-white/25 text-white'
                                                    : 'bg-gray-200 dark:bg-gray-700 text-gray-600 dark:text-gray-300'
                                                }`}>
                                                {state.data.users.length}
                                            </div>
                                        </Button>
                                        <Button
                                            variant="ghost"
                                            onClick={() => dispatch({ type: 'SET_ACTIVE_TAB', payload: 'files' })}
                                            className={`relative flex items-center rounded-xl px-6 py-3 transition-all duration-300 ${state.activeTab === 'files'
                                                    ? 'bg-gradient-to-r from-blue-600 to-purple-600 text-white shadow-lg scale-105'
                                                    : 'hover:bg-gray-100 dark:hover:bg-gray-800 text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-gray-100'
                                                }`}
                                        >
                                            <FileText className="h-4 w-4 mr-2" />
                                            Files
                                            <div className={`ml-3 px-2.5 py-1 text-xs rounded-full font-medium ${state.activeTab === 'files'
                                                    ? 'bg-white/25 text-white'
                                                    : 'bg-gray-200 dark:bg-gray-700 text-gray-600 dark:text-gray-300'
                                                }`}>
                                                {state.data.files.length}
                                            </div>
                                        </Button>
                                        <Button
                                            variant="ghost"
                                            onClick={() => dispatch({ type: 'SET_ACTIVE_TAB', payload: 'shares' })}
                                            className={`relative flex items-center rounded-xl px-6 py-3 transition-all duration-300 ${state.activeTab === 'shares'
                                                    ? 'bg-gradient-to-r from-blue-600 to-purple-600 text-white shadow-lg scale-105'
                                                    : 'hover:bg-gray-100 dark:hover:bg-gray-800 text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-gray-100'
                                                }`}
                                        >
                                            <Share className="h-4 w-4 mr-2" />
                                            Shares
                                            <div className={`ml-3 px-2.5 py-1 text-xs rounded-full font-medium ${state.activeTab === 'shares'
                                                    ? 'bg-white/25 text-white'
                                                    : 'bg-gray-200 dark:bg-gray-700 text-gray-600 dark:text-gray-300'
                                                }`}>
                                                {state.data.shares.length}
                                            </div>
                                        </Button>
                                    </div>
                                </div>

                                {/* Quick Actions */}
                                <div className="flex items-center gap-3">
                                    <Button
                                        variant="outline"
                                        size="sm"
                                        className="rounded-xl border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-800"
                                    >
                                        <Filter className="h-4 w-4 mr-2" />
                                        Filter
                                    </Button>
                                    <Button
                                        variant="outline"
                                        size="sm"
                                        className="rounded-xl border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-800"
                                    >
                                        <Download className="h-4 w-4 mr-2" />
                                        Export
                                    </Button>
                                    <Button
                                        variant="outline"
                                        size="sm"
                                        className="rounded-xl border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-800"
                                    >
                                        <Settings className="h-4 w-4" />
                                    </Button>
                                </div>
                            </div>

                            {/* Enhanced Search Section */}
                            <Card className="bg-white/80 dark:bg-gray-900/80 backdrop-blur-sm shadow-xl border-0 overflow-hidden">
                                <CardContent className="p-8">
                                    <div className="flex flex-col lg:flex-row lg:items-center gap-6">
                                        <div className="flex-1">
                                            <div className="relative group">
                                                <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400 group-focus-within:text-blue-500 transition-colors" />
                                                <Input
                                                    placeholder={`Search ${state.activeTab === 'users' ? 'users by name, username, or email' : state.activeTab === 'files' ? 'files by name, type, or owner' : 'shared links by filename or owner'}...`}
                                                    value={state.search.query}
                                                    onChange={(e) => dispatch({ type: 'SET_SEARCH_QUERY', payload: e.target.value })}
                                                    className="pl-12 pr-12 py-4 text-lg bg-gray-50 dark:bg-gray-800 border-gray-200 dark:border-gray-700 focus:border-blue-500 dark:focus:border-blue-400 focus:ring-blue-500/20 rounded-xl transition-all"
                                                />
                                                {state.search.query && (
                                                    <Button
                                                        variant="ghost"
                                                        size="sm"
                                                        onClick={() => dispatch({ type: 'SET_SEARCH_QUERY', payload: '' })}
                                                        className="absolute right-3 top-1/2 transform -translate-y-1/2 h-8 w-8 rounded-full hover:bg-gray-200 dark:hover:bg-gray-700"
                                                    >
                                                        <X className="h-4 w-4" />
                                                    </Button>
                                                )}
                                            </div>
                                        </div>
                                        
                                        <div className="flex items-center gap-3">
                                            <div className="text-sm text-gray-500 dark:text-gray-400">
                                                {state.pagination.totalCount} total items
                                            </div>
                                            <div className="h-4 w-px bg-gray-300 dark:bg-gray-600"></div>
                                            <Button
                                                variant="ghost"
                                                size="sm"
                                                onClick={() => loadData(state.pagination.currentPage, state.search.term)}
                                                className="rounded-xl hover:bg-gray-100 dark:hover:bg-gray-800"
                                            >
                                                <RotateCcw className="h-4 w-4 mr-2" />
                                                Refresh
                                            </Button>
                                        </div>
                                    </div>

                                    {state.search.query && (
                                        <div className="mt-4 flex items-center gap-2">
                                            <div className="flex items-center text-sm text-blue-600 dark:text-blue-400">
                                                <div className="w-2 h-2 bg-blue-500 rounded-full animate-pulse mr-2"></div>
                                                Searching in {state.activeTab}
                                            </div>
                                            <div className="text-sm text-gray-500">
                                                • Found {
                                                    state.activeTab === 'users' ? state.data.users.length :
                                                    state.activeTab === 'files' ? state.data.files.length :
                                                    state.data.shares.length
                                                } results
                                            </div>
                                        </div>
                                    )}
                                </CardContent>
                            </Card>
                        </div>

                        {/* Users Management */}
                        {state.activeTab === 'users' && (
                            <div className="space-y-8">
                                {/* Section Header */}
                                <div className="text-center">
                                    <h2 className="text-3xl md:text-4xl font-bold mb-4">
                                        <span className="bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                                            User Management
                                        </span>
                                    </h2>
                                    <p className="text-lg text-gray-600 dark:text-gray-300 max-w-2xl mx-auto">
                                        Monitor user activity, manage permissions, and maintain platform security
                                    </p>
                                </div>

                                {/* Users Grid */}
                                <div className="grid gap-6">
                                    {state.data.users.map((user) => (
                                        <Card key={user._id} className="group hover:shadow-2xl hover:scale-[1.02] transition-all duration-300 border-0 bg-white/80 dark:bg-gray-900/80 backdrop-blur-sm overflow-hidden">
                                            <CardContent className="p-8">
                                                <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6">
                                                    <div className="flex items-center space-x-6">
                                                        {/* Enhanced User Avatar */}
                                                        <div className="relative">
                                                            <div className="w-20 h-20 bg-gradient-to-br from-blue-500 via-purple-600 to-pink-600 rounded-2xl flex items-center justify-center group-hover:scale-110 transition-all duration-300 shadow-lg">
                                                                <span className="text-white font-bold text-2xl">
                                                                    {user.name ? user.name.charAt(0).toUpperCase() : user.username ? user.username.charAt(0).toUpperCase() : '?'}
                                                                </span>
                                                            </div>
                                                            {user.isBlocked && (
                                                                <div className="absolute -top-2 -right-2 w-6 h-6 bg-red-500 rounded-full flex items-center justify-center">
                                                                    <Ban className="w-3 h-3 text-white" />
                                                                </div>
                                                            )}
                                                        </div>

                                                        {/* User Information */}
                                                        <div className="space-y-3 flex-1">
                                                            <div className="flex flex-wrap items-center gap-3">
                                                                <h3 className="text-2xl font-bold text-gray-900 dark:text-gray-100">
                                                                    {user.name || user.username || 'Unknown User'}
                                                                </h3>
                                                                
                                                                {/* Status Badges */}
                                                                <div className="flex flex-wrap gap-2">
                                                                    <Badge className={`px-3 py-1 rounded-full text-xs font-semibold ${(user.plan || 'free') === 'premium'
                                                                            ? 'bg-gradient-to-r from-purple-500 to-pink-500 text-white border-0'
                                                                            : (user.plan || 'free') === 'enterprise'
                                                                                ? 'bg-gradient-to-r from-yellow-500 to-orange-500 text-white border-0'
                                                                                : 'bg-gradient-to-r from-gray-500 to-gray-600 text-white border-0'
                                                                        }`}>
                                                                        {(user.plan || 'free').toUpperCase()}
                                                                    </Badge>
                                                                    
                                                                    <Badge className={`px-3 py-1 rounded-full text-xs font-semibold ${(user.role || 'user') === 'admin'
                                                                            ? 'bg-gradient-to-r from-red-500 to-red-600 text-white border-0'
                                                                            : (user.role || 'user') === 'moderator'
                                                                                ? 'bg-gradient-to-r from-blue-500 to-blue-600 text-white border-0'
                                                                                : 'bg-gradient-to-r from-green-500 to-green-600 text-white border-0'
                                                                        }`}>
                                                                        {(user.role || 'user').toUpperCase()}
                                                                    </Badge>
                                                                    
                                                                    {user.isBlocked && (
                                                                        <Badge className="bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-300 border border-red-200 dark:border-red-800 px-3 py-1 rounded-full text-xs font-semibold">
                                                                            BLOCKED
                                                                        </Badge>
                                                                    )}
                                                                </div>
                                                            </div>
                                                            
                                                            <div className="space-y-1">
                                                                <p className="text-gray-600 dark:text-gray-300 font-medium">
                                                                    @{user.username || 'unknown'}
                                                                </p>
                                                                <p className="text-gray-500 dark:text-gray-400 text-sm">
                                                                    {user.email || 'No email provided'}
                                                                </p>
                                                            </div>
                                                            
                                                            <div className="flex items-center gap-6 text-sm text-gray-500 dark:text-gray-400">
                                                                <div className="flex items-center gap-2">
                                                                    <FileText className="w-4 h-4" />
                                                                    <span className="font-medium">{user.filesCount || 0}</span>
                                                                    <span>files</span>
                                                                </div>
                                                                <div className="flex items-center gap-2">
                                                                    <Clock className="w-4 h-4" />
                                                                    <span>Joined {formatDate(user.createdAt)}</span>
                                                                </div>
                                                            </div>
                                                        </div>
                                                    </div>

                                                    {/* Action Controls */}
                                                    <div className="flex flex-col lg:flex-row items-stretch lg:items-center gap-4">
                                                        <div className="flex flex-col sm:flex-row gap-3">
                                                            {/* Plan Selector */}
                                                            <select
                                                                value={user.plan || 'free'}
                                                                onChange={(e) => updateUserPlan(user._id, e.target.value)}
                                                                className="px-4 py-2.5 rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 text-sm font-medium focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all"
                                                            >
                                                                <option value="free">Free Plan</option>
                                                                <option value="premium">Premium Plan</option>
                                                                <option value="enterprise">Enterprise Plan</option>
                                                            </select>

                                                            {/* Role Selector */}
                                                            <select
                                                                value={user.role || 'user'}
                                                                onChange={(e) => updateUserRole(user._id, e.target.value)}
                                                                className="px-4 py-2.5 rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 text-sm font-medium focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all"
                                                            >
                                                                <option value="user">User</option>
                                                                <option value="moderator">Moderator</option>
                                                                <option value="admin">Admin</option>
                                                            </select>
                                                        </div>

                                                        <div className="flex items-center gap-3">
                                                            {/* Delete User Files */}
                                                            <Button
                                                                variant="outline"
                                                                size="sm"
                                                                onClick={() => deleteUserFiles(user._id, user.name || user.username || 'Unknown User')}
                                                                className="rounded-xl border-red-200 dark:border-red-700 text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-950/50 hover:border-red-300 dark:hover:border-red-600 transition-all"
                                                                title="Delete all user files"
                                                            >
                                                                <Trash2 className="h-4 w-4" />
                                                            </Button>

                                                            {/* Block/Unblock User */}
                                                            {user.isBlocked ? (
                                                                <Button
                                                                    onClick={() => unblockUser(user._id)}
                                                                    className="rounded-xl bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700 text-white shadow-lg hover:shadow-xl transition-all"
                                                                >
                                                                    <RotateCcw className="h-4 w-4 mr-2" />
                                                                    Unblock
                                                                </Button>
                                                            ) : (
                                                                <Button
                                                                    variant="outline"
                                                                    onClick={() => blockUser(user._id)}
                                                                    className="rounded-xl border-orange-200 dark:border-orange-700 text-orange-600 dark:text-orange-400 hover:bg-orange-50 dark:hover:bg-orange-950/50 hover:border-orange-300 dark:hover:border-orange-600 transition-all"
                                                                >
                                                                    <Ban className="h-4 w-4 mr-2" />
                                                                    Block
                                                                </Button>
                                                            )}
                                                        </div>
                                                    </div>
                                                </div>
                                            </CardContent>
                                        </Card>
                                    ))}

                                    {state.data.users.length === 0 && (
                                        <div className="text-center py-20">
                                            <div className="w-24 h-24 bg-gradient-to-br from-gray-400 to-gray-500 rounded-2xl flex items-center justify-center mx-auto mb-6 opacity-50">
                                                <Users className="h-12 w-12 text-white" />
                                            </div>
                                            <h3 className="text-2xl font-bold text-gray-600 dark:text-gray-300 mb-2">No users found</h3>
                                            <p className="text-gray-500 dark:text-gray-400">No users match your search criteria</p>
                                        </div>
                                    )}
                                </div>
                            </div>
                        )}

                        {/* Files Management */}
                        {state.activeTab === 'files' && (
                            <div className="space-y-8">
                                {/* Section Header */}
                                <div className="text-center">
                                    <h2 className="text-3xl md:text-4xl font-bold mb-4">
                                        <span className="bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                                            File Management & Moderation
                                        </span>
                                    </h2>
                                    <p className="text-lg text-gray-600 dark:text-gray-300 max-w-2xl mx-auto">
                                        Monitor file activity, manage content safety, and ensure platform compliance
                                    </p>
                                </div>

                                {state.ui.loading ? (
                                    <div className="text-center py-20">
                                        <div className="w-24 h-24 bg-gradient-to-br from-blue-500 to-purple-600 rounded-2xl flex items-center justify-center mx-auto mb-8 animate-pulse shadow-xl">
                                            <FileText className="h-12 w-12 text-white" />
                                        </div>
                                        <h3 className="text-2xl font-bold text-gray-700 dark:text-gray-200 mb-2">Loading files...</h3>
                                        <p className="text-gray-500 dark:text-gray-400">Please wait while we fetch the latest data</p>
                                    </div>
                                ) : (
                                    <div className="grid gap-6">
                                        {state.data.files.map((file) => (
                                            <Card key={file._id} className="group hover:shadow-2xl hover:scale-[1.01] transition-all duration-300 border-0 bg-white/80 dark:bg-gray-900/80 backdrop-blur-sm overflow-hidden">
                                                <CardContent className="p-8">
                                                    <div className="flex flex-col lg:flex-row lg:items-start lg:justify-between gap-6">
                                                        <div className="flex items-start space-x-6 flex-1">
                                                            {/* Enhanced File Icon */}
                                                            <div className="relative">
                                                                <div className={`w-20 h-20 rounded-2xl flex items-center justify-center group-hover:scale-110 transition-all duration-300 shadow-lg ${file.type === 'folder'
                                                                        ? 'bg-gradient-to-br from-yellow-500 via-orange-500 to-red-500'
                                                                        : 'bg-gradient-to-br from-blue-500 via-purple-600 to-pink-600'
                                                                    }`}>
                                                                    <FileText className="h-10 w-10 text-white" />
                                                                </div>
                                                                {file.isBlocked && (
                                                                    <div className="absolute -top-2 -right-2 w-6 h-6 bg-red-500 rounded-full flex items-center justify-center">
                                                                        <Ban className="w-3 h-3 text-white" />
                                                                    </div>
                                                                )}
                                                            </div>

                                                            {/* File Information */}
                                                            <div className="flex-1 space-y-4">
                                                                <div className="flex flex-wrap items-center gap-3">
                                                                    <h3 className="text-2xl font-bold text-gray-900 dark:text-gray-100">{file.name}</h3>

                                                                    {/* Enhanced Status Badges */}
                                                                    <div className="flex flex-wrap gap-2">
                                                                        {file.type === 'folder' && (
                                                                            <Badge className="bg-gradient-to-r from-yellow-500 to-orange-500 text-white border-0 px-3 py-1 rounded-full text-xs font-semibold">
                                                                                FOLDER
                                                                            </Badge>
                                                                        )}
                                                                        {file.isPublic && (
                                                                            <Badge className="bg-gradient-to-r from-green-500 to-emerald-500 text-white border-0 px-3 py-1 rounded-full text-xs font-semibold">
                                                                                PUBLIC
                                                                            </Badge>
                                                                        )}
                                                                        {file.shareCode && (
                                                                            <Badge className="bg-gradient-to-r from-blue-500 to-indigo-500 text-white border-0 px-3 py-1 rounded-full text-xs font-semibold">
                                                                                <Share className="h-3 w-3 mr-1" />
                                                                                SHARED
                                                                            </Badge>
                                                                        )}
                                                                        {file.isBlocked && (
                                                                            <Badge className="bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-300 border border-red-200 dark:border-red-800 px-3 py-1 rounded-full text-xs font-semibold">
                                                                                <Ban className="h-3 w-3 mr-1" />
                                                                                BLOCKED
                                                                            </Badge>
                                                                        )}
                                                                        {file.reportCount > 0 && (
                                                                            <Badge className="bg-orange-100 dark:bg-orange-900/30 text-orange-700 dark:text-orange-300 border border-orange-200 dark:border-orange-800 px-3 py-1 rounded-full text-xs font-semibold">
                                                                                <AlertTriangle className="h-3 w-3 mr-1" />
                                                                                {file.reportCount} REPORT{file.reportCount > 1 ? 'S' : ''}
                                                                            </Badge>
                                                                        )}
                                                                        {!file.owner && (
                                                                            <Badge className="bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 border border-gray-200 dark:border-gray-700 px-3 py-1 rounded-full text-xs font-semibold">
                                                                                ANONYMOUS
                                                                            </Badge>
                                                                        )}
                                                                    </div>
                                                                </div>

                                                                {/* Owner Information */}
                                                                <div className="space-y-2">
                                                                    {file.owner ? (
                                                                        <div className="space-y-1">
                                                                            <p className="text-gray-700 dark:text-gray-200 font-medium">
                                                                                Owner: {file.owner.name || file.owner.username || 'Unknown'} 
                                                                                <span className="text-gray-500 dark:text-gray-400 ml-2">@{file.owner.username || 'unknown'}</span>
                                                                            </p>
                                                                            {file.owner.email && (
                                                                                <p className="text-gray-500 dark:text-gray-400 text-sm">
                                                                                    {file.owner.email}
                                                                                </p>
                                                                            )}
                                                                        </div>
                                                                    ) : (
                                                                        <p className="text-orange-600 dark:text-orange-400 font-medium">
                                                                            Anonymous file - No owner information
                                                                        </p>
                                                                    )}
                                                                </div>

                                                                {/* File Metadata */}
                                                                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 text-sm">
                                                                    <div className="flex items-center gap-2 text-gray-600 dark:text-gray-400">
                                                                        <FileText className="w-4 h-4" />
                                                                        <span className="font-mono text-xs bg-gray-100 dark:bg-gray-800 px-2 py-1 rounded">{file.path}</span>
                                                                    </div>
                                                                    <div className="flex items-center gap-2 text-gray-600 dark:text-gray-400">
                                                                        <Database className="w-4 h-4" />
                                                                        <span>{(file.size / 1024).toFixed(1)} KB</span>
                                                                    </div>
                                                                    <div className="flex items-center gap-2 text-gray-600 dark:text-gray-400">
                                                                        <Clock className="w-4 h-4" />
                                                                        <span>{formatDate(file.createdAt)}</span>
                                                                    </div>
                                                                    {file.language && (
                                                                        <div className="flex items-center gap-2 text-gray-600 dark:text-gray-400">
                                                                            <Code className="w-4 h-4" />
                                                                            <span className="px-2 py-1 bg-blue-100 dark:bg-blue-900/30 rounded text-xs font-mono text-blue-700 dark:text-blue-300">
                                                                                {file.language}
                                                                            </span>
                                                                        </div>
                                                                    )}
                                                                </div>
                                                            </div>
                                                        </div>

                                                        {/* Action Controls */}
                                                        <div className="flex flex-col sm:flex-row lg:flex-col gap-3">
                                                            <Button
                                                                onClick={() => viewFile(file)}
                                                                className="rounded-xl bg-gradient-to-r from-blue-500 to-indigo-600 hover:from-blue-600 hover:to-indigo-700 text-white shadow-lg hover:shadow-xl transition-all"
                                                            >
                                                                <Eye className="h-4 w-4 mr-2" />
                                                                Inspect
                                                            </Button>

                                                            {file.shareCode && (
                                                                <Button
                                                                    variant="outline"
                                                                    onClick={() => {
                                                                        if (typeof window !== 'undefined' && navigator.clipboard) {
                                                                            const shareUrl = `${window.location.origin}/share/${file.shareCode}`
                                                                            navigator.clipboard.writeText(shareUrl)
                                                                                .then(() => toast.success('Share link copied to clipboard'))
                                                                                .catch(() => toast.error('Failed to copy link'))
                                                                        }
                                                                    }}
                                                                    className="rounded-xl border-green-200 dark:border-green-700 text-green-600 dark:text-green-400 hover:bg-green-50 dark:hover:bg-green-950/50 hover:border-green-300 dark:hover:border-green-600 transition-all"
                                                                >
                                                                    <Share className="h-4 w-4 mr-2" />
                                                                    Copy Link
                                                                </Button>
                                                            )}

                                                            <div className="flex gap-2">
                                                                {file.isBlocked ? (
                                                                    <Button
                                                                        onClick={() => unblockFile(file._id)}
                                                                        size="sm"
                                                                        className="rounded-xl bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700 text-white shadow-lg hover:shadow-xl transition-all"
                                                                    >
                                                                        <RotateCcw className="h-4 w-4 mr-1" />
                                                                        Unblock
                                                                    </Button>
                                                                ) : (
                                                                    <Button
                                                                        variant="outline"
                                                                        size="sm"
                                                                        onClick={() => blockFile(file._id)}
                                                                        className="rounded-xl border-orange-200 dark:border-orange-700 text-orange-600 dark:text-orange-400 hover:bg-orange-50 dark:hover:bg-orange-950/50 hover:border-orange-300 dark:hover:border-orange-600 transition-all"
                                                                    >
                                                                        <Ban className="h-4 w-4 mr-1" />
                                                                        Block
                                                                    </Button>
                                                                )}

                                                                <Button
                                                                    variant="outline"
                                                                    size="sm"
                                                                    onClick={() => deleteFile(file._id)}
                                                                    className="rounded-xl border-red-200 dark:border-red-700 text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-950/50 hover:border-red-300 dark:hover:border-red-600 transition-all"
                                                                >
                                                                    <Trash2 className="h-4 w-4" />
                                                                </Button>
                                                            </div>
                                                        </div>
                                                    </div>
                                                </CardContent>
                                            </Card>
                                        ))}

                                        {state.data.files.length === 0 && (
                                            <div className="text-center py-20">
                                                <div className="w-24 h-24 bg-gradient-to-br from-gray-400 to-gray-500 rounded-2xl flex items-center justify-center mx-auto mb-6 opacity-50">
                                                    <FileText className="h-12 w-12 text-white" />
                                                </div>
                                                <h3 className="text-2xl font-bold text-gray-600 dark:text-gray-300 mb-2">No files found</h3>
                                                <p className="text-gray-500 dark:text-gray-400">No files match your search criteria</p>
                                            </div>
                                        )}
                                    </div>
                                )}
                            </div>
                        )}

                        {/* Shares Management */}
                        {state.activeTab === 'shares' && (
                            <div className="space-y-8">
                                {/* Section Header */}
                                <div className="text-center">
                                    <h2 className="text-3xl md:text-4xl font-bold mb-4">
                                        <span className="bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                                            Share Link Management
                                        </span>
                                    </h2>
                                    <p className="text-lg text-gray-600 dark:text-gray-300 max-w-2xl mx-auto">
                                        Monitor shared content, track access patterns, and maintain link security
                                    </p>
                                </div>

                                {state.ui.loading ? (
                                    <div className="text-center py-20">
                                        <div className="w-24 h-24 bg-gradient-to-br from-green-500 to-emerald-600 rounded-2xl flex items-center justify-center mx-auto mb-8 animate-pulse shadow-xl">
                                            <Share className="h-12 w-12 text-white" />
                                        </div>
                                        <h3 className="text-2xl font-bold text-gray-700 dark:text-gray-200 mb-2">Loading shares...</h3>
                                        <p className="text-gray-500 dark:text-gray-400">Please wait while we fetch the latest data</p>
                                    </div>
                                ) : (
                                    <div className="grid gap-6">
                                        {state.data.shares.map((share) => (
                                            <Card key={share._id} className="group hover:shadow-2xl hover:scale-[1.01] transition-all duration-300 border-0 bg-white/80 dark:bg-gray-900/80 backdrop-blur-sm overflow-hidden">
                                                <CardContent className="p-8">
                                                    <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6">
                                                        <div className="flex items-center space-x-6">
                                                            {/* Enhanced Share Icon */}
                                                            <div className="relative">
                                                                <div className="w-20 h-20 bg-gradient-to-br from-green-500 via-emerald-600 to-teal-600 rounded-2xl flex items-center justify-center group-hover:scale-110 transition-all duration-300 shadow-lg">
                                                                    <Share className="h-10 w-10 text-white" />
                                                                </div>
                                                                {share.isBlocked && (
                                                                    <div className="absolute -top-2 -right-2 w-6 h-6 bg-red-500 rounded-full flex items-center justify-center">
                                                                        <Ban className="w-3 h-3 text-white" />
                                                                    </div>
                                                                )}
                                                            </div>

                                                            {/* Share Information */}
                                                            <div className="space-y-3 flex-1">
                                                                <div className="flex flex-wrap items-center gap-3">
                                                                    <h3 className="text-2xl font-bold text-gray-900 dark:text-gray-100">{share.fileName}</h3>
                                                                    
                                                                    {share.isBlocked && (
                                                                        <Badge className="bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-300 border border-red-200 dark:border-red-800 px-3 py-1 rounded-full text-xs font-semibold">
                                                                            <Ban className="w-3 h-3 mr-1" />
                                                                            BLOCKED
                                                                        </Badge>
                                                                    )}
                                                                </div>

                                                                {/* Owner Information */}
                                                                <div className="space-y-1">
                                                                    {share.owner ? (
                                                                        <div>
                                                                            <p className="text-gray-700 dark:text-gray-200 font-medium">
                                                                                Owner: {share.owner.name || share.owner.username || 'Unknown'} 
                                                                                <span className="text-gray-500 dark:text-gray-400 ml-2">@{share.owner.username || 'unknown'}</span>
                                                                            </p>
                                                                            {share.owner.email && (
                                                                                <p className="text-gray-500 dark:text-gray-400 text-sm">
                                                                                    {share.owner.email}
                                                                                </p>
                                                                            )}
                                                                        </div>
                                                                    ) : (
                                                                        <p className="text-orange-600 dark:text-orange-400 font-medium">
                                                                            Anonymous file - No owner information
                                                                        </p>
                                                                    )}
                                                                </div>

                                                                {/* Share Metadata */}
                                                                <div className="flex flex-wrap items-center gap-6 text-sm">
                                                                    <div className="flex items-center gap-2 text-gray-600 dark:text-gray-400">
                                                                        <div className="px-3 py-1 bg-gray-100 dark:bg-gray-800 rounded-lg text-xs font-mono text-gray-700 dark:text-gray-300">
                                                                            {share.shareCode}
                                                                        </div>
                                                                    </div>
                                                                    <div className="flex items-center gap-2 text-gray-600 dark:text-gray-400">
                                                                        <Eye className="w-4 h-4" />
                                                                        <span className="font-medium">{share.accessCount}</span>
                                                                        <span>views</span>
                                                                    </div>
                                                                    <div className="flex items-center gap-2 text-gray-600 dark:text-gray-400">
                                                                        <Clock className="w-4 h-4" />
                                                                        <span>Created {formatDate(share.createdAt)}</span>
                                                                    </div>
                                                                    {share.expiresAt && (
                                                                        <div className="flex items-center gap-2 text-orange-600 dark:text-orange-400">
                                                                            <AlertTriangle className="w-4 h-4" />
                                                                            <span>Expires {formatDate(share.expiresAt)}</span>
                                                                        </div>
                                                                    )}
                                                                </div>
                                                            </div>
                                                        </div>

                                                        {/* Action Controls */}
                                                        <div className="flex items-center gap-3">
                                                            <Button
                                                                variant="outline"
                                                                onClick={() => {
                                                                    if (typeof window !== 'undefined' && navigator.clipboard) {
                                                                        const shareUrl = `${window.location.origin}/share/${share.shareCode}`
                                                                        navigator.clipboard.writeText(shareUrl)
                                                                            .then(() => toast.success('Share link copied to clipboard'))
                                                                            .catch(() => toast.error('Failed to copy link'))
                                                                    }
                                                                }}
                                                                className="rounded-xl border-gray-200 dark:border-gray-700 text-gray-600 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800 transition-all"
                                                            >
                                                                <Share className="h-4 w-4 mr-2" />
                                                                Copy Link
                                                            </Button>

                                                            {share.isBlocked ? (
                                                                <Button
                                                                    onClick={() => unblockShare(share._id)}
                                                                    className="rounded-xl bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700 text-white shadow-lg hover:shadow-xl transition-all"
                                                                >
                                                                    <RotateCcw className="h-4 w-4 mr-2" />
                                                                    Unblock
                                                                </Button>
                                                            ) : (
                                                                <Button
                                                                    variant="outline"
                                                                    onClick={() => blockShare(share._id)}
                                                                    className="rounded-xl border-red-200 dark:border-red-700 text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-950/50 hover:border-red-300 dark:hover:border-red-600 transition-all"
                                                                >
                                                                    <Ban className="h-4 w-4 mr-2" />
                                                                    Block
                                                                </Button>
                                                            )}
                                                        </div>
                                                    </div>
                                                </CardContent>
                                            </Card>
                                        ))}

                                        {state.data.shares.length === 0 && (
                                            <div className="text-center py-20">
                                                <div className="w-24 h-24 bg-gradient-to-br from-gray-400 to-gray-500 rounded-2xl flex items-center justify-center mx-auto mb-6 opacity-50">
                                                    <Share className="h-12 w-12 text-white" />
                                                </div>
                                                <h3 className="text-2xl font-bold text-gray-600 dark:text-gray-300 mb-2">No shared links found</h3>
                                                <p className="text-gray-500 dark:text-gray-400">No shared files match your search criteria</p>
                                            </div>
                                        )}
                                    </div>
                                )}
                            </div>
                        )}

                        {state.ui.loading && (
                            <div className="text-center py-20">
                                <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center mx-auto mb-6 animate-pulse">
                                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-white"></div>
                                </div>
                                <h3 className="text-xl font-semibold mb-2">Loading...</h3>
                                <p className="text-muted-foreground">Please wait while we fetch the latest data</p>
                            </div>
                        )}

                        {/* Enhanced Pagination */}
                        {!state.ui.loading && state.pagination.totalPages > 1 && (
                            <div className="mt-12">
                                <Card className="bg-white/80 dark:bg-gray-900/80 backdrop-blur-sm shadow-xl border-0 overflow-hidden">
                                    <CardContent className="p-8">
                                        <div className="flex flex-col lg:flex-row items-center justify-between space-y-6 lg:space-y-0">
                                            <div className="text-center lg:text-left">
                                                <div className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-1">
                                                    Page {state.pagination.currentPage} of {state.pagination.totalPages}
                                                </div>
                                                <div className="text-sm text-gray-600 dark:text-gray-400">
                                                    Showing <span className="font-medium text-blue-600 dark:text-blue-400">
                                                        {((state.pagination.currentPage - 1) * state.pagination.limit) + 1}-{Math.min(state.pagination.currentPage * state.pagination.limit, state.pagination.totalCount)}
                                                    </span> of <span className="font-medium text-blue-600 dark:text-blue-400">{state.pagination.totalCount}</span> results
                                                </div>
                                            </div>

                                            <div className="flex items-center gap-3">
                                                <Button
                                                    variant="outline"
                                                    onClick={() => handlePageChange(state.pagination.currentPage - 1)}
                                                    disabled={!state.pagination.hasPrevPage}
                                                    className="rounded-xl border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-800 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
                                                >
                                                    <ArrowRight className="h-4 w-4 rotate-180 mr-2" />
                                                    Previous
                                                </Button>

                                                <div className="flex items-center gap-1">
                                                    {(() => {
                                                        const totalPages = state.pagination.totalPages
                                                        const currentPage = state.pagination.currentPage
                                                        const pages = []

                                                        // Calculate start and end page numbers
                                                        let startPage = Math.max(1, currentPage - 2)
                                                        const endPage = Math.min(totalPages, startPage + 4)

                                                        // Adjust start page if we're near the end
                                                        if (endPage - startPage < 4) {
                                                            startPage = Math.max(1, endPage - 4)
                                                        }

                                                        // Add first page if not included
                                                        if (startPage > 1) {
                                                            pages.push(1)
                                                            if (startPage > 2) {
                                                                pages.push('...')
                                                            }
                                                        }

                                                        // Generate page numbers
                                                        for (let i = startPage; i <= endPage; i++) {
                                                            pages.push(i)
                                                        }

                                                        // Add last page if not included
                                                        if (endPage < totalPages) {
                                                            if (endPage < totalPages - 1) {
                                                                pages.push('...')
                                                            }
                                                            pages.push(totalPages)
                                                        }

                                                        return pages.map((pageNum, index) => (
                                                            pageNum === '...' ? (
                                                                <span key={`ellipsis-${index}`} className="px-3 py-2 text-gray-500 dark:text-gray-400">
                                                                    ...
                                                                </span>
                                                            ) : (
                                                                <Button
                                                                    key={`page-${pageNum}`}
                                                                    variant={pageNum === currentPage ? 'default' : 'outline'}
                                                                    onClick={() => handlePageChange(pageNum as number)}
                                                                    className={`w-11 h-11 rounded-xl transition-all ${pageNum === currentPage
                                                                            ? 'bg-gradient-to-r from-blue-600 to-purple-600 text-white shadow-lg hover:shadow-xl'
                                                                            : 'border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-800'
                                                                        }`}
                                                                >
                                                                    {pageNum}
                                                                </Button>
                                                            )
                                                        ))
                                                    })()}
                                                </div>

                                                <Button
                                                    variant="outline"
                                                    onClick={() => handlePageChange(state.pagination.currentPage + 1)}
                                                    disabled={!state.pagination.hasNextPage}
                                                    className="rounded-xl border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-800 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
                                                >
                                                    Next
                                                    <ArrowRight className="h-4 w-4 ml-2" />
                                                </Button>
                                            </div>
                                        </div>
                                    </CardContent>
                                </Card>
                            </div>
                        )}
                    </div>
                </div>

                {/* Rebuilt Modern File Inspector Dialog */}
                <Dialog open={state.ui.fileViewerOpen} onOpenChange={() => dispatch({ type: 'CLOSE_FILE_VIEWER' })}>
                    <DialogContent className="max-w-[95vw] w-[95vw] max-h-[95vh] h-[95vh] p-0 overflow-hidden flex flex-col bg-white/90 dark:bg-gray-950/90 backdrop-blur-2xl border-0 shadow-[0_32px_64px_rgba(0,0,0,0.2)] dark:shadow-[0_32px_64px_rgba(0,0,0,0.5)]">
                        {/* Modern Header with Glass Morphism */}
                        <DialogHeader className="relative p-8 pb-6 flex-shrink-0 bg-gradient-to-br from-blue-500/10 via-purple-500/10 to-pink-500/10 backdrop-blur-xl border-b border-white/20 dark:border-gray-800/50">
                            {/* Background Pattern */}
                            <div className="absolute inset-0 bg-[radial-gradient(circle_at_1px_1px,rgba(255,255,255,0.15)_1px,transparent_0)] bg-[size:20px_20px] opacity-30"></div>
                            
                            <div className="relative flex items-center justify-between">
                                <div className="flex items-center space-x-6">
                                    {/* Enhanced Icon */}
                                    <div className="relative">
                                        <div className="w-16 h-16 bg-gradient-to-br from-blue-600 via-purple-600 to-pink-600 rounded-3xl flex items-center justify-center shadow-2xl">
                                            <Eye className="h-8 w-8 text-white" />
                                        </div>
                                        {state.selectedFile?.isBlocked && (
                                            <div className="absolute -top-2 -right-2 w-6 h-6 bg-red-500 rounded-full flex items-center justify-center border-2 border-white dark:border-gray-950">
                                                <Ban className="w-3 h-3 text-white" />
                                            </div>
                                        )}
                                    </div>
                                    
                                    <div className="space-y-2">
                                        <DialogTitle className="text-3xl font-bold bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 bg-clip-text text-transparent">
                                            File Inspector
                                        </DialogTitle>
                                        <DialogDescription className="text-lg text-gray-600 dark:text-gray-300">
                                            Advanced content moderation and security analysis
                                        </DialogDescription>
                                        {state.selectedFile && (
                                            <div className="flex items-center gap-3 mt-3">
                                                <Badge className="bg-gradient-to-r from-blue-500 to-indigo-500 text-white border-0 px-3 py-1 rounded-full text-sm font-semibold">
                                                    {state.selectedFile.type.toUpperCase()}
                                                </Badge>
                                                {state.selectedFile.reportCount > 0 && (
                                                    <Badge className="bg-gradient-to-r from-orange-500 to-red-500 text-white border-0 px-3 py-1 rounded-full text-sm font-semibold animate-pulse">
                                                        <AlertTriangle className="h-3 w-3 mr-1" />
                                                        {state.selectedFile.reportCount} REPORT{state.selectedFile.reportCount > 1 ? 'S' : ''}
                                                    </Badge>
                                                )}
                                            </div>
                                        )}
                                    </div>
                                </div>
                                
                                <Button
                                    variant="outline"
                                    onClick={() => dispatch({ type: 'CLOSE_FILE_VIEWER' })}
                                    className="rounded-full w-12 h-12 p-0 border-white/30 dark:border-gray-700/50 bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm hover:bg-white dark:hover:bg-gray-700 transition-all duration-300"
                                >
                                    <X className="h-5 w-5" />
                                </Button>
                            </div>
                        </DialogHeader>

                        {state.selectedFile && (
                            <div className="flex-1 overflow-hidden flex min-h-0">
                                {/* Left Panel - Enhanced File Information */}
                                <div className="w-96 flex-shrink-0 bg-gradient-to-b from-gray-50/80 to-white/80 dark:from-gray-900/80 dark:to-gray-950/80 backdrop-blur-xl border-r border-white/20 dark:border-gray-800/50 overflow-y-auto">
                                    <div className="p-6 space-y-6">
                                        {/* File Header Card */}
                                        <Card className="border-0 bg-white/60 dark:bg-gray-900/60 backdrop-blur-sm shadow-lg">
                                            <CardContent className="p-6">
                                                <div className="flex items-start gap-4">
                                                    <div className={`w-16 h-16 rounded-2xl flex items-center justify-center shadow-lg ${
                                                        state.selectedFile.type === 'folder'
                                                            ? 'bg-gradient-to-br from-yellow-500 via-orange-500 to-red-500'
                                                            : 'bg-gradient-to-br from-blue-500 via-purple-600 to-pink-600'
                                                    }`}>
                                                        <FileText className="h-8 w-8 text-white" />
                                                    </div>
                                                    
                                                    <div className="flex-1 min-w-0">
                                                        {state.ui.isEditingName ? (
                                                            <div className="space-y-2">
                                                                <Input
                                                                    value={state.editing.name}
                                                                    onChange={(e) => dispatch({ type: 'SET_EDITING_NAME', payload: e.target.value })}
                                                                    className="text-lg font-semibold bg-white/80 dark:bg-gray-800/80 border-blue-200 dark:border-blue-700"
                                                                    onKeyDown={(e) => {
                                                                        if (e.key === 'Enter') saveFileChanges()
                                                                        if (e.key === 'Escape') {
                                                                            dispatch({ type: 'SET_EDITING_NAME', payload: state.selectedFile?.name || '' })
                                                                            dispatch({ type: 'SET_EDITING_MODE', payload: false })
                                                                        }
                                                                    }}
                                                                    autoFocus
                                                                />
                                                                <div className="flex items-center gap-2">
                                                                    <Button 
                                                                        size="sm" 
                                                                        onClick={saveFileChanges} 
                                                                        disabled={state.ui.isSavingChanges}
                                                                        className="bg-gradient-to-r from-green-500 to-emerald-600 text-white"
                                                                    >
                                                                        <Save className="h-3 w-3 mr-1" />
                                                                        Save
                                                                    </Button>
                                                                    <Button 
                                                                        size="sm" 
                                                                        variant="outline" 
                                                                        onClick={() => {
                                                                            dispatch({ type: 'SET_EDITING_NAME', payload: state.selectedFile?.name || '' })
                                                                            dispatch({ type: 'SET_EDITING_MODE', payload: false })
                                                                        }}
                                                                    >
                                                                        <X className="h-3 w-3" />
                                                                    </Button>
                                                                </div>
                                                            </div>
                                                        ) : (
                                                            <div className="space-y-2">
                                                                <div className="flex items-center gap-2">
                                                                    <h3 className="text-lg font-bold text-gray-900 dark:text-gray-100 truncate">
                                                                        {state.selectedFile.name || 'Unnamed file'}
                                                                    </h3>
                                                                    <Button 
                                                                        size="sm" 
                                                                        variant="ghost" 
                                                                        onClick={() => dispatch({ type: 'SET_EDITING_MODE', payload: true })}
                                                                        className="flex-shrink-0"
                                                                    >
                                                                        <Edit3 className="h-3 w-3" />
                                                                    </Button>
                                                                </div>
                                                                <p className="text-sm text-gray-500 dark:text-gray-400 font-mono bg-gray-100 dark:bg-gray-800 px-2 py-1 rounded">
                                                                    {state.selectedFile.path}
                                                                </p>
                                                            </div>
                                                        )}
                                                    </div>
                                                </div>
                                            </CardContent>
                                        </Card>

                                        {/* Owner Information Card */}
                                        <Card className="border-0 bg-white/60 dark:bg-gray-900/60 backdrop-blur-sm shadow-lg">
                                            <CardContent className="p-6">
                                                <h4 className="font-bold text-lg mb-4 flex items-center text-gray-900 dark:text-gray-100">
                                                    <Users className="h-5 w-5 mr-2 text-blue-500" />
                                                    Owner Information
                                                </h4>
                                                
                                                {state.selectedFile.owner ? (
                                                    <div className="space-y-4">
                                                        <div className="flex items-center gap-3">
                                                            <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-purple-600 rounded-xl flex items-center justify-center text-white font-bold text-lg">
                                                                {(state.selectedFile.owner.name || state.selectedFile.owner.username || 'U')[0].toUpperCase()}
                                                            </div>
                                                            <div>
                                                                <p className="font-semibold text-gray-900 dark:text-gray-100">
                                                                    {state.selectedFile.owner.name || state.selectedFile.owner.username || 'Unknown User'}
                                                                </p>
                                                                <p className="text-sm text-gray-500 dark:text-gray-400">
                                                                    @{state.selectedFile.owner.username || 'unknown'}
                                                                </p>
                                                            </div>
                                                        </div>
                                                        
                                                        {state.selectedFile.owner.email && (
                                                            <div className="p-3 bg-gray-50 dark:bg-gray-800/50 rounded-lg">
                                                                <p className="text-sm text-gray-600 dark:text-gray-300">
                                                                    <strong>Email:</strong> {state.selectedFile.owner.email}
                                                                </p>
                                                            </div>
                                                        )}
                                                    </div>
                                                ) : (
                                                    <div className="flex items-center gap-3 p-4 bg-orange-50 dark:bg-orange-950/30 rounded-lg border border-orange-200 dark:border-orange-800">
                                                        <AlertTriangle className="h-6 w-6 text-orange-500" />
                                                        <div>
                                                            <p className="font-semibold text-orange-800 dark:text-orange-200">Anonymous File</p>
                                                            <p className="text-sm text-orange-600 dark:text-orange-300">No owner information available</p>
                                                        </div>
                                                    </div>
                                                )}
                                            </CardContent>
                                        </Card>

                                        {/* File Metadata Card */}
                                        <Card className="border-0 bg-white/60 dark:bg-gray-900/60 backdrop-blur-sm shadow-lg">
                                            <CardContent className="p-6">
                                                <h4 className="font-bold text-lg mb-4 flex items-center text-gray-900 dark:text-gray-100">
                                                    <Database className="h-5 w-5 mr-2 text-blue-500" />
                                                    Metadata
                                                </h4>
                                                
                                                <div className="space-y-3">
                                                    <div className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-800/50 rounded-lg">
                                                        <span className="font-medium text-gray-700 dark:text-gray-300">Size</span>
                                                        <span className="text-sm font-mono bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 px-2 py-1 rounded">
                                                            {(state.selectedFile.size / 1024).toFixed(1)} KB
                                                        </span>
                                                    </div>
                                                    
                                                    <div className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-800/50 rounded-lg">
                                                        <span className="font-medium text-gray-700 dark:text-gray-300">Language</span>
                                                        <select
                                                            value={state.editing.language}
                                                            onChange={(e) => {
                                                                dispatch({ type: 'SET_EDITING_LANGUAGE', payload: e.target.value })
                                                                saveFileChanges()
                                                            }}
                                                            className="text-sm px-3 py-1 rounded-lg border bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 border-gray-200 dark:border-gray-700 focus:ring-2 focus:ring-blue-500/20 font-mono"
                                                            disabled={state.ui.isSavingChanges}
                                                        >
                                                            <option value="">Auto-detect</option>
                                                            <option value="javascript">JavaScript</option>
                                                            <option value="typescript">TypeScript</option>
                                                            <option value="python">Python</option>
                                                            <option value="java">Java</option>
                                                            <option value="cpp">C++</option>
                                                            <option value="html">HTML</option>
                                                            <option value="css">CSS</option>
                                                            <option value="json">JSON</option>
                                                            <option value="markdown">Markdown</option>
                                                            <option value="plaintext">Plain Text</option>
                                                        </select>
                                                    </div>
                                                    
                                                    <div className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-800/50 rounded-lg">
                                                        <span className="font-medium text-gray-700 dark:text-gray-300">Created</span>
                                                        <span className="text-sm text-gray-600 dark:text-gray-400">
                                                            {formatDate(state.selectedFile.createdAt)}
                                                        </span>
                                                    </div>
                                                </div>
                                            </CardContent>
                                        </Card>

                                        {/* Security & Status Card */}
                                        <Card className="border-0 bg-white/60 dark:bg-gray-900/60 backdrop-blur-sm shadow-lg">
                                            <CardContent className="p-6">
                                                <h4 className="font-bold text-lg mb-4 flex items-center text-gray-900 dark:text-gray-100">
                                                    <Shield className="h-5 w-5 mr-2 text-blue-500" />
                                                    Security & Status
                                                </h4>
                                                
                                                <div className="space-y-3">
                                                    <div className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-800/50 rounded-lg">
                                                        <span className="font-medium text-gray-700 dark:text-gray-300">Visibility</span>
                                                        <Badge className={`px-3 py-1 rounded-full text-xs font-semibold ${
                                                            state.selectedFile.isPublic 
                                                                ? 'bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-300' 
                                                                : 'bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300'
                                                        }`}>
                                                            {state.selectedFile.isPublic ? 'Public' : 'Private'}
                                                        </Badge>
                                                    </div>
                                                    
                                                    <div className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-800/50 rounded-lg">
                                                        <span className="font-medium text-gray-700 dark:text-gray-300">Shared</span>
                                                        <Badge className={`px-3 py-1 rounded-full text-xs font-semibold ${
                                                            state.selectedFile.shareCode 
                                                                ? 'bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300' 
                                                                : 'bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300'
                                                        }`}>
                                                            {state.selectedFile.shareCode ? 'Yes' : 'No'}
                                                        </Badge>
                                                    </div>
                                                    
                                                    <div className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-800/50 rounded-lg">
                                                        <span className="font-medium text-gray-700 dark:text-gray-300">Status</span>
                                                        <Badge className={`px-3 py-1 rounded-full text-xs font-semibold ${
                                                            state.selectedFile.isBlocked 
                                                                ? 'bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-300' 
                                                                : 'bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-300'
                                                        }`}>
                                                            {state.selectedFile.isBlocked ? 'Blocked' : 'Active'}
                                                        </Badge>
                                                    </div>
                                                    
                                                    {state.selectedFile.reportCount > 0 && (
                                                        <div className="flex items-center justify-between p-3 bg-orange-50 dark:bg-orange-950/30 rounded-lg border border-orange-200 dark:border-orange-800">
                                                            <span className="font-medium text-orange-700 dark:text-orange-300">Reports</span>
                                                            <Badge className="bg-orange-100 dark:bg-orange-900/30 text-orange-700 dark:text-orange-300 px-3 py-1 rounded-full text-xs font-semibold">
                                                                {state.selectedFile.reportCount} Report{state.selectedFile.reportCount > 1 ? 's' : ''}
                                                            </Badge>
                                                        </div>
                                                    )}
                                                </div>
                                            </CardContent>
                                        </Card>

                                        {/* Action Buttons */}
                                        <Card className="border-0 bg-white/60 dark:bg-gray-900/60 backdrop-blur-sm shadow-lg">
                                            <CardContent className="p-6">
                                                <h4 className="font-bold text-lg mb-4 flex items-center text-gray-900 dark:text-gray-100">
                                                    <Settings className="h-5 w-5 mr-2 text-blue-500" />
                                                    Quick Actions
                                                </h4>
                                                
                                                <div className="grid grid-cols-1 gap-3">
                                                    {state.selectedFile.shareCode && (
                                                        <Button
                                                            onClick={() => {
                                                                if (typeof window !== 'undefined' && navigator.clipboard && state.selectedFile) {
                                                                    const shareUrl = `${window.location.origin}/share/${state.selectedFile.shareCode}`
                                                                    navigator.clipboard.writeText(shareUrl)
                                                                        .then(() => toast.success('Share link copied to clipboard'))
                                                                        .catch(() => toast.error('Failed to copy link'))
                                                                }
                                                            }}
                                                            className="w-full justify-start rounded-xl bg-gradient-to-r from-blue-500 to-indigo-600 hover:from-blue-600 hover:to-indigo-700 text-white shadow-lg hover:shadow-xl transition-all"
                                                        >
                                                            <Share className="h-4 w-4 mr-2" />
                                                            Copy Share Link
                                                        </Button>
                                                    )}

                                                    <Button
                                                        variant="outline"
                                                        onClick={() => {
                                                            if (typeof window !== 'undefined' && state.selectedFile) {
                                                                window.open(`/share/${state.selectedFile.shareCode || state.selectedFile._id}`, '_blank')
                                                            }
                                                        }}
                                                        className="w-full justify-start rounded-xl border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-800 transition-all"
                                                    >
                                                        <ExternalLink className="h-4 w-4 mr-2" />
                                                        Open in New Tab
                                                    </Button>

                                                    {state.selectedFile.isBlocked ? (
                                                        <Button
                                                            onClick={() => {
                                                                if (state.selectedFile) {
                                                                    unblockFile(state.selectedFile._id)
                                                                    dispatch({ type: 'CLOSE_FILE_VIEWER' })
                                                                }
                                                            }}
                                                            className="w-full justify-start rounded-xl bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700 text-white shadow-lg hover:shadow-xl transition-all"
                                                        >
                                                            <RotateCcw className="h-4 w-4 mr-2" />
                                                            Unblock File
                                                        </Button>
                                                    ) : (
                                                        <Button
                                                            variant="outline"
                                                            onClick={() => {
                                                                if (state.selectedFile) {
                                                                    blockFile(state.selectedFile._id)
                                                                    dispatch({ type: 'CLOSE_FILE_VIEWER' })
                                                                }
                                                            }}
                                                            className="w-full justify-start rounded-xl border-orange-200 dark:border-orange-700 text-orange-600 dark:text-orange-400 hover:bg-orange-50 dark:hover:bg-orange-950/50 transition-all"
                                                        >
                                                            <Ban className="h-4 w-4 mr-2" />
                                                            Block File
                                                        </Button>
                                                    )}

                                                    <Button
                                                        variant="outline"
                                                        onClick={() => {
                                                            if (state.selectedFile && confirm(`Are you sure you want to delete "${state.selectedFile.name || 'this file'}"? This action cannot be undone.`)) {
                                                                deleteFile(state.selectedFile._id)
                                                                dispatch({ type: 'CLOSE_FILE_VIEWER' })
                                                            }
                                                        }}
                                                        className="w-full justify-start rounded-xl border-red-200 dark:border-red-700 text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-950/50 transition-all"
                                                    >
                                                        <Trash2 className="h-4 w-4 mr-2" />
                                                        Delete File
                                                    </Button>

                                                    {state.ui.isSavingChanges && (
                                                        <div className="flex items-center justify-center space-x-2 text-sm text-blue-600 dark:text-blue-400 p-3 bg-blue-50 dark:bg-blue-950/30 rounded-lg">
                                                            <div className="animate-spin rounded-full h-4 w-4 border-2 border-blue-600 border-t-transparent"></div>
                                                            <span>Saving changes...</span>
                                                        </div>
                                                    )}
                                                </div>
                                            </CardContent>
                                        </Card>
                                    </div>
                                </div>

                                {/* Right Panel - File Content */}
                                <div className="flex-1 overflow-hidden flex flex-col min-h-0 bg-white/50 dark:bg-gray-950/50 backdrop-blur-xl">
                                    {state.selectedFile.type === 'file' ? (
                                        <>
                                            <div className="p-6 border-b border-white/20 dark:border-gray-800/50 bg-gradient-to-r from-blue-50/80 to-purple-50/80 dark:from-blue-950/20 dark:to-purple-950/20 backdrop-blur-sm">
                                                <h4 className="font-bold text-xl flex items-center text-gray-900 dark:text-gray-100">
                                                    <Code className="h-6 w-6 mr-3 text-blue-500" />
                                                    File Content Analysis
                                                </h4>
                                                <p className="text-gray-600 dark:text-gray-300 mt-2">
                                                    Review the content of this file for policy violations, inappropriate content, or security issues
                                                </p>
                                            </div>
                                            <div className="flex-1 overflow-hidden">
                                                <MonacoEditor
                                                    file={{
                                                        _id: state.selectedFile._id,
                                                        name: state.selectedFile.name || 'Unnamed file',
                                                        content: state.fileContent,
                                                        language: state.selectedFile.language,
                                                        size: state.selectedFile.size,
                                                        updatedAt: state.selectedFile.createdAt
                                                    }}
                                                    onSave={() => { }} // Read-only for admin
                                                    readOnly={true}
                                                />
                                            </div>
                                        </>
                                    ) : (
                                        <div className="flex-1 flex items-center justify-center p-12">
                                            <div className="text-center">
                                                <div className="w-32 h-32 bg-gradient-to-br from-yellow-500 via-orange-500 to-red-500 rounded-3xl flex items-center justify-center mx-auto mb-8 shadow-2xl">
                                                    <FileText className="h-16 w-16 text-white" />
                                                </div>
                                                <h3 className="text-2xl font-bold text-gray-900 dark:text-gray-100 mb-4">Folder View</h3>
                                                <p className="text-lg text-gray-600 dark:text-gray-300 mb-2">This is a folder container</p>
                                                <p className="text-gray-500 dark:text-gray-400">Folders organize and contain other files and directories</p>
                                            </div>
                                        </div>
                                    )}
                                </div>
                            </div>
                        )}
                    </DialogContent>
                </Dialog>
            </PageLayout>
        </div>
    )
}
