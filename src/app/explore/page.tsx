'use client'

import { useState, useEffect, useCallback } from 'react'
import Link from 'next/link'
import { Input } from '@/components/ui/input'
import { Header } from '@/components/header'
import { Footer } from '@/components/footer'
import { FileText, Search, Eye, Calendar, User, Folder, Filter, TrendingUp, Clock, SortAsc, Sparkles } from 'lucide-react'
import { formatDate, formatFileSize } from '@/lib/utils'

interface PublicFile {
    _id: string
    name: string
    type: 'file' | 'folder'
    slug: string
    language: string
    size: number
    accessCount: number
    createdAt: string
    updatedAt: string
    owner: {
        name: string
    }
}

export default function ExplorePage() {
    const [files, setFiles] = useState<PublicFile[]>([])
    const [loading, setLoading] = useState(true)
    const [searchQuery, setSearchQuery] = useState('')
    const [sortBy, setSortBy] = useState<'recent' | 'popular' | 'name'>('recent')

    const fetchPublicFiles = useCallback(async () => {
        try {
            setLoading(true)
            const response = await fetch(`/api/explore?sort=${sortBy}`)
            if (response.ok) {
                const data = await response.json()
                setFiles(data)
            }
        } catch (error) {
            console.error('Error fetching public files:', error)
        } finally {
            setLoading(false)
        }
    }, [sortBy])

    useEffect(() => {
        fetchPublicFiles()
    }, [fetchPublicFiles])

    const filteredFiles = files.filter(file =>
        file.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        file.owner.name.toLowerCase().includes(searchQuery.toLowerCase())
    )

    const getLanguageColor = (language: string) => {
        const colors: { [key: string]: string } = {
            javascript: 'bg-yellow-400/20 text-yellow-700 dark:text-yellow-300 border-yellow-400/30',
            typescript: 'bg-blue-400/20 text-blue-700 dark:text-blue-300 border-blue-400/30',
            python: 'bg-green-400/20 text-green-700 dark:text-green-300 border-green-400/30',
            html: 'bg-orange-400/20 text-orange-700 dark:text-orange-300 border-orange-400/30',
            css: 'bg-purple-400/20 text-purple-700 dark:text-purple-300 border-purple-400/30',
            json: 'bg-gray-400/20 text-gray-700 dark:text-gray-300 border-gray-400/30',
        }
        return colors[language] || 'bg-gray-400/20 text-gray-700 dark:text-gray-300 border-gray-400/30'
    }

    return (
        <>
            <Header />
            <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 dark:from-gray-950 dark:via-blue-950 dark:to-indigo-950">
                <div className="max-w-7xl mx-auto px-4 py-8">
                {/* Header Section */}
                <div className="text-center mb-12">
                    <div className="inline-flex items-center justify-center w-20 h-20 bg-gradient-to-br from-blue-500 to-purple-600 rounded-3xl mb-6 shadow-xl">
                        <Sparkles className="w-10 h-10 text-white" />
                    </div>
                    <h1 className="text-5xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent mb-4">
                        Explore
                    </h1>
                    <p className="text-xl text-gray-600 dark:text-gray-400 max-w-2xl mx-auto">
                        Discover amazing files and projects shared by our creative community
                    </p>
                </div>

                {/* Search and Filter Section */}
                <div className="backdrop-blur-xl bg-white/70 dark:bg-gray-900/70 border border-white/20 dark:border-gray-700/30 rounded-2xl shadow-2xl p-6 mb-8">
                    <div className="flex flex-col lg:flex-row gap-6 items-center">
                        {/* Search Bar */}
                        <div className="relative flex-1 w-full">
                            <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                            <Input
                                placeholder="Search files, folders, or authors..."
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                className="pl-12 pr-4 py-3 bg-white/50 dark:bg-gray-800/50 border border-gray-200 dark:border-gray-700 rounded-xl text-gray-900 dark:text-gray-100 placeholder-gray-500 dark:placeholder-gray-400 focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
                            />
                        </div>

                        {/* Sort Buttons */}
                        <div className="flex items-center gap-2">
                            <Filter className="h-5 w-5 text-gray-500 dark:text-gray-400" />
                            <div className="flex bg-white/50 dark:bg-gray-800/50 rounded-xl border border-gray-200 dark:border-gray-700 p-1">
                                {[
                                    { key: 'recent', label: 'Recent', icon: Clock },
                                    { key: 'popular', label: 'Popular', icon: TrendingUp },
                                    { key: 'name', label: 'Name', icon: SortAsc }
                                ].map(({ key, label, icon: Icon }) => (
                                    <button
                                        key={key}
                                        onClick={() => setSortBy(key as any)}
                                        className={`flex items-center space-x-2 px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200 ${
                                            sortBy === key
                                                ? 'bg-gradient-to-r from-blue-600 to-purple-600 text-white shadow-lg'
                                                : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-100 hover:bg-white/50 dark:hover:bg-gray-700/50'
                                        }`}
                                    >
                                        <Icon className="h-4 w-4" />
                                        <span>{label}</span>
                                    </button>
                                ))}
                            </div>
                        </div>
                    </div>
                </div>

                {/* Content Section */}
                {loading ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                        {[...Array(8)].map((_, i) => (
                            <div key={i} className="backdrop-blur-xl bg-white/70 dark:bg-gray-900/70 border border-white/20 dark:border-gray-700/30 rounded-2xl shadow-xl p-6 animate-pulse">
                                <div className="flex items-center space-x-3 mb-4">
                                    <div className="w-10 h-10 bg-gray-300 dark:bg-gray-600 rounded-xl"></div>
                                    <div className="flex-1">
                                        <div className="h-4 bg-gray-300 dark:bg-gray-600 rounded w-3/4 mb-2"></div>
                                        <div className="h-3 bg-gray-300 dark:bg-gray-600 rounded w-1/2"></div>
                                    </div>
                                </div>
                                <div className="space-y-3">
                                    <div className="h-3 bg-gray-300 dark:bg-gray-600 rounded"></div>
                                    <div className="h-3 bg-gray-300 dark:bg-gray-600 rounded w-2/3"></div>
                                    <div className="h-8 bg-gray-300 dark:bg-gray-600 rounded-lg"></div>
                                </div>
                            </div>
                        ))}
                    </div>
                ) : filteredFiles.length === 0 ? (
                    <div className="text-center py-20">
                        <div className="backdrop-blur-xl bg-white/70 dark:bg-gray-900/70 border border-white/20 dark:border-gray-700/30 rounded-2xl shadow-xl p-12 max-w-md mx-auto">
                            <div className="w-16 h-16 bg-gradient-to-br from-gray-400 to-gray-500 rounded-2xl flex items-center justify-center mx-auto mb-6">
                                <FileText className="h-8 w-8 text-white" />
                            </div>
                            <h3 className="text-xl font-semibold text-gray-900 dark:text-gray-100 mb-3">
                                No files found
                            </h3>
                            <p className="text-gray-600 dark:text-gray-400">
                                {searchQuery ? 'Try adjusting your search terms' : 'No public files have been shared yet'}
                            </p>
                        </div>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                        {filteredFiles.map((file) => (
                            <div
                                key={file._id}
                                className="backdrop-blur-xl bg-white/70 dark:bg-gray-900/70 border border-white/20 dark:border-gray-700/30 rounded-2xl shadow-xl hover:shadow-2xl transition-all duration-300 hover:scale-105 group"
                            >
                                <div className="p-6">
                                    {/* File Header */}
                                    <div className="flex items-center space-x-3 mb-4">
                                        <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${
                                            file.type === 'folder' 
                                                ? 'bg-gradient-to-br from-blue-500 to-blue-600' 
                                                : 'bg-gradient-to-br from-purple-500 to-pink-600'
                                        }`}>
                                            {file.type === 'folder' ? (
                                                <Folder className="h-5 w-5 text-white" />
                                            ) : (
                                                <FileText className="h-5 w-5 text-white" />
                                            )}
                                        </div>
                                        <div className="flex-1 min-w-0">
                                            <h3 className="font-semibold text-gray-900 dark:text-gray-100 truncate group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
                                                {file.name}
                                            </h3>
                                            <div className="flex items-center space-x-2 mt-1">
                                                {file.type === 'file' && (
                                                    <span className={`px-2 py-1 rounded-md text-xs font-medium border ${getLanguageColor(file.language)}`}>
                                                        {file.language}
                                                    </span>
                                                )}
                                                {file.type === 'folder' && (
                                                    <span className="px-2 py-1 rounded-md text-xs font-medium bg-blue-400/20 text-blue-700 dark:text-blue-300 border border-blue-400/30">
                                                        Folder
                                                    </span>
                                                )}
                                                <span className="text-xs text-gray-500 dark:text-gray-400">
                                                    {formatFileSize(file.size)}
                                                </span>
                                            </div>
                                        </div>
                                    </div>

                                    {/* File Stats */}
                                    <div className="space-y-3 mb-6">
                                        <div className="flex items-center justify-between text-sm text-gray-600 dark:text-gray-400">
                                            <div className="flex items-center space-x-1">
                                                <User className="h-3 w-3" />
                                                <span className="truncate">{file.owner.name}</span>
                                            </div>
                                            <div className="flex items-center space-x-1">
                                                <Eye className="h-3 w-3" />
                                                <span>{file.accessCount}</span>
                                            </div>
                                        </div>
                                        <div className="flex items-center space-x-1 text-xs text-gray-500 dark:text-gray-400">
                                            <Calendar className="h-3 w-3" />
                                            <span>Shared {formatDate(file.createdAt)}</span>
                                        </div>
                                    </div>

                                    {/* Action Button */}
                                    <Link href={`/share/${file.slug}`}>
                                        <button className="w-full bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white font-medium py-3 px-4 rounded-xl transition-all duration-200 shadow-lg hover:shadow-xl group-hover:scale-105">
                                            {file.type === 'folder' ? 'Browse Folder' : 'View File'}
                                        </button>
                                    </Link>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
        <Footer />
        </>
    )
}
