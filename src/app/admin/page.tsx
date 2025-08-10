'use client'

import { useState, useEffect, useCallback } from 'react'
import { useAuth } from '@/components/providers/auth-provider'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Shield, Users, FileText, Share, Ban, Trash2, Search, Clock } from 'lucide-react'
import { formatDate } from '@/lib/utils'
import toast from 'react-hot-toast'

interface AdminUser {
  _id: string
  name: string
  email: string
  plan: string
  createdAt: string
  isBlocked: boolean
  filesCount: number
}

interface AdminFile {
  _id: string
  name: string
  owner: { name: string; email: string }
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
  owner: { name: string; email: string }
  accessCount: number
  expiresAt?: string
  isBlocked: boolean
  createdAt: string
}

export default function AdminPanel() {
  const { user } = useAuth()
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
      
      const response = await fetch(endpoint)
      if (response.ok) {
        const data = await response.json()
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
    if (!user || user.email !== 'admin@notta.in') {
      router.push('/dashboard')
      return
    }
    loadData()
  }, [user, router, loadData])

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
    u.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    u.email.toLowerCase().includes(searchTerm.toLowerCase())
  )

  const filteredFiles = files.filter(f => 
    f.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    f.owner.email.toLowerCase().includes(searchTerm.toLowerCase())
  )

  const filteredShares = shares.filter(s => 
    s.fileName.toLowerCase().includes(searchTerm.toLowerCase()) ||
    s.owner.email.toLowerCase().includes(searchTerm.toLowerCase())
  )

  if (!user || user.email !== 'admin@notta.in') {
    return <div>Access denied</div>
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-7xl mx-auto">
          <div className="mb-8">
            <h1 className="text-4xl font-bold mb-2 flex items-center">
              <Shield className="h-8 w-8 mr-3 text-red-600" />
              Admin Panel
            </h1>
            <p className="text-muted-foreground">
              Manage users, files, and shared content
            </p>
          </div>

          {/* Tab Navigation */}
          <div className="flex space-x-4 mb-6">
            <Button
              variant={activeTab === 'users' ? 'default' : 'outline'}
              onClick={() => setActiveTab('users')}
              className="flex items-center"
            >
              <Users className="h-4 w-4 mr-2" />
              Users
            </Button>
            <Button
              variant={activeTab === 'files' ? 'default' : 'outline'}
              onClick={() => setActiveTab('files')}
              className="flex items-center"
            >
              <FileText className="h-4 w-4 mr-2" />
              Files
            </Button>
            <Button
              variant={activeTab === 'shares' ? 'default' : 'outline'}
              onClick={() => setActiveTab('shares')}
              className="flex items-center"
            >
              <Share className="h-4 w-4 mr-2" />
              Share Links
            </Button>
          </div>

          {/* Search Bar */}
          <Card className="mb-6">
            <CardContent className="pt-6">
              <div className="flex items-center space-x-2">
                <Search className="h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="max-w-md"
                />
              </div>
            </CardContent>
          </Card>

          {/* Content based on active tab */}
          {activeTab === 'users' && (
            <Card>
              <CardHeader>
                <CardTitle>User Management</CardTitle>
                <CardDescription>
                  Manage user accounts and permissions
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {filteredUsers.map((user) => (
                    <div key={user._id} className="flex items-center justify-between p-4 border rounded-lg">
                      <div>
                        <h3 className="font-medium">{user.name}</h3>
                        <p className="text-sm text-muted-foreground">{user.email}</p>
                        <p className="text-xs text-muted-foreground">
                          Plan: {user.plan} • Files: {user.filesCount} • Joined: {formatDate(user.createdAt)}
                        </p>
                      </div>
                      <div className="flex space-x-2">
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
            <Card>
              <CardHeader>
                <CardTitle>File Management</CardTitle>
                <CardDescription>
                  Monitor and manage user files
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {filteredFiles.map((file) => (
                    <div key={file._id} className="flex items-center justify-between p-4 border rounded-lg">
                      <div>
                        <h3 className="font-medium">{file.name}</h3>
                        <p className="text-sm text-muted-foreground">
                          Owner: {file.owner.name} ({file.owner.email})
                        </p>
                        <p className="text-xs text-muted-foreground">
                          Size: {file.size} bytes • Created: {formatDate(file.createdAt)}
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
            <Card>
              <CardHeader>
                <CardTitle>Share Link Management</CardTitle>
                <CardDescription>
                  Monitor and control shared content
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {filteredShares.map((share) => (
                    <div key={share._id} className="flex items-center justify-between p-4 border rounded-lg">
                      <div>
                        <h3 className="font-medium">{share.fileName}</h3>
                        <p className="text-sm text-muted-foreground">
                          Owner: {share.owner.name} ({share.owner.email})
                        </p>
                        <p className="text-xs text-muted-foreground">
                          Share Code: {share.shareCode} • Access Count: {share.accessCount}
                        </p>
                        {share.expiresAt && (
                          <p className="text-xs text-muted-foreground flex items-center">
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
    </div>
  )
}
