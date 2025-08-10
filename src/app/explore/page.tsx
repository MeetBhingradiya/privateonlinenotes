'use client'

import { useState, useEffect, useCallback } from 'react'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { FileText, Search, Eye, Calendar, User, ArrowLeft, Folder } from 'lucide-react'
import { formatDate, formatFileSize } from '@/lib/utils'
import { useRouter } from 'next/navigation'

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
    const router = useRouter()
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
            javascript: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200',
            typescript: 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200',
            python: 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200',
            html: 'bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-200',
            css: 'bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200',
            json: 'bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-200',
        }
        return colors[language] || 'bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-200'
    }

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
                                <h1 className="text-3xl font-bold text-primary">Explore</h1>
                                <p className="text-muted-foreground">Discover public files shared by the community</p>
                            </div>
                        </div>
                        <Link href="/dashboard">
                            <Button>Go to Dashboard</Button>
                        </Link>
                    </div>

                    {/* Search and Filters */}
                    <div className="flex flex-col sm:flex-row gap-4">
                        <div className="relative flex-1">
                            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                            <Input
                                placeholder="Search files or authors..."
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                className="pl-10"
                            />
                        </div>
                        <div className="flex space-x-2">
                            <Button
                                variant={sortBy === 'recent' ? 'default' : 'outline'}
                                onClick={() => setSortBy('recent')}
                                size="sm"
                            >
                                Recent
                            </Button>
                            <Button
                                variant={sortBy === 'popular' ? 'default' : 'outline'}
                                onClick={() => setSortBy('popular')}
                                size="sm"
                            >
                                Popular
                            </Button>
                            <Button
                                variant={sortBy === 'name' ? 'default' : 'outline'}
                                onClick={() => setSortBy('name')}
                                size="sm"
                            >
                                Name
                            </Button>
                        </div>
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
                        <FileText className="h-16 w-16 mx-auto mb-4 text-muted-foreground opacity-50" />
                        <h3 className="text-lg font-medium mb-2">No files found</h3>
                        <p className="text-muted-foreground">
                            {searchQuery ? 'Try adjusting your search terms' : 'No public files have been shared yet'}
                        </p>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {filteredFiles.map((file) => (
                            <Card key={file._id} className="hover:shadow-lg transition-shadow">
                                <CardHeader>
                                    <CardTitle className="flex items-center space-x-2">
                                        {file.type === 'folder' ? (
                                            <Folder className="h-5 w-5 text-blue-500" />
                                        ) : (
                                            <FileText className="h-5 w-5 text-muted-foreground" />
                                        )}
                                        <span className="truncate">{file.name}</span>
                                    </CardTitle>
                                    <div className="flex items-center space-x-2">
                                        {file.type === 'file' && (
                                            <span className={`px-2 py-1 rounded-full text-xs font-medium ${getLanguageColor(file.language)}`}>
                                                {file.language}
                                            </span>
                                        )}
                                        {file.type === 'folder' && (
                                            <span className="px-2 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200">
                                                Folder
                                            </span>
                                        )}
                                        <span className="text-xs text-muted-foreground">
                                            {formatFileSize(file.size)}
                                        </span>
                                    </div>
                                </CardHeader>
                                <CardContent className="space-y-4">
                                    <div className="flex items-center space-x-4 text-sm text-muted-foreground">
                                        <div className="flex items-center space-x-1">
                                            <User className="h-3 w-3" />
                                            <span>{file.owner.name}</span>
                                        </div>
                                        <div className="flex items-center space-x-1">
                                            <Eye className="h-3 w-3" />
                                            <span>{file.accessCount} views</span>
                                        </div>
                                    </div>
                                    <div className="flex items-center space-x-1 text-xs text-muted-foreground">
                                        <Calendar className="h-3 w-3" />
                                        <span>Shared {formatDate(file.createdAt)}</span>
                                    </div>
                  <Link href={`/share/${file.slug}`}>
                    <Button className="w-full" size="sm">
                      {file.type === 'folder' ? 'Browse Folder' : 'View File'}
                    </Button>
                  </Link>
                                </CardContent>
                            </Card>
                        ))}
                    </div>
                )}
            </div>
        </div>
    )
}
