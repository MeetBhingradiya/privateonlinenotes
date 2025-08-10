'use client'

import { useState, useEffect, useCallback } from 'react'
import { FileText, FolderPlus, ArrowLeft, Eye } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { formatDate, formatFileSize } from '@/lib/utils'
import { MonacoEditor } from '@/components/editor/monaco-editor'

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
    owner: {
      name: string
      email: string
    }
  }
}

export function SharedFolderViewer({ folder }: SharedFolderProps) {
  const [items, setItems] = useState<FolderItem[]>([])
  const [currentPath, setCurrentPath] = useState('/')
  const [selectedFile, setSelectedFile] = useState<FolderItem | null>(null)
  const [loading, setLoading] = useState(true)

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

  const openItem = async (item: FolderItem) => {
    if (item.type === 'folder') {
      setCurrentPath(item.path)
      setSelectedFile(null)
      return
    }

    // For files, load content
    try {
      const response = await fetch(`/api/shared-folder/${folder._id}/file/${item._id}`)
      if (response.ok) {
        const fileData = await response.json()
        setSelectedFile(fileData)
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
      <div className="border-b bg-card p-6">
        <div className="max-w-6xl mx-auto">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h1 className="text-2xl font-bold">{folder.name}</h1>
              <p className="text-muted-foreground">
                Shared by {folder.owner.name}
              </p>
            </div>
            <div className="flex items-center space-x-2">
              <Eye className="h-4 w-4 text-muted-foreground" />
              <span className="text-sm text-muted-foreground">Viewing shared folder</span>
            </div>
          </div>

          {/* Breadcrumb */}
          <div className="flex items-center space-x-2 text-sm text-muted-foreground">
            <button
              onClick={() => setCurrentPath('/')}
              className="hover:text-foreground"
            >
              {folder.name}
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
        </div>
      </div>

      <div className="flex max-w-6xl mx-auto">
        {/* Folder Contents */}
        <div className="w-80 border-r bg-card">
          <div className="p-4">
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
                    className={`cursor-pointer hover:bg-muted/50 transition-colors ${
                      selectedFile?._id === item._id ? 'ring-2 ring-primary' : ''
                    }`}
                    onClick={() => openItem(item)}
                  >
                    <CardContent className="p-3">
                      <div className="flex items-center space-x-2">
                        {item.type === 'folder' ? (
                          <FolderPlus className="h-4 w-4 text-blue-500" />
                        ) : (
                          <FileText className="h-4 w-4 text-gray-500" />
                        )}
                        <div className="flex-1 min-w-0">
                          <span className="text-sm font-medium truncate block">{item.name}</span>
                          <div className="text-xs text-muted-foreground">
                            {formatFileSize(item.size)} • {formatDate(item.updatedAt)}
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))
              )}
            </div>
          </div>
        </div>

        {/* File Viewer */}
        <div className="flex-1">
          {selectedFile ? (
            <MonacoEditor
              file={selectedFile as any}
              onSave={() => {}} // Read-only for shared files
              readOnly={true}
            />
          ) : (
            <div className="flex items-center justify-center h-full text-muted-foreground">
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
  )
}
