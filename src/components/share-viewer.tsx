'use client'

import { useState } from 'react'
import { Editor } from '@monaco-editor/react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Download, Copy, Home, User } from 'lucide-react'
import { useTheme } from 'next-themes'
import { ThemeToggle } from '@/components/theme-toggle'
import { formatDate, formatFileSize } from '@/lib/utils'
import toast from 'react-hot-toast'
import Link from 'next/link'

interface SharedFile {
  _id: string
  name: string
  content?: string
  language?: string
  size: number
  createdAt: string
  updatedAt: string
  owner: {
    name: string
    email: string
  }
}

interface ShareViewerProps {
  file: SharedFile
}

export function ShareViewer({ file }: ShareViewerProps) {
  const { theme } = useTheme()
  const [copied, setCopied] = useState(false)

  const getLanguage = (filename: string): string => {
    const ext = filename.split('.').pop()?.toLowerCase()
    const languageMap: Record<string, string> = {
      js: 'javascript',
      jsx: 'javascript',
      ts: 'typescript',
      tsx: 'typescript',
      py: 'python',
      html: 'html',
      css: 'css',
      scss: 'scss',
      json: 'json',
      md: 'markdown',
      xml: 'xml',
      sql: 'sql',
      yaml: 'yaml',
      yml: 'yaml',
      sh: 'shell',
      bash: 'shell',
      php: 'php',
      java: 'java',
      cpp: 'cpp',
      c: 'c',
      cs: 'csharp',
      go: 'go',
      rs: 'rust',
      rb: 'ruby',
      swift: 'swift',
      kt: 'kotlin',
      dart: 'dart',
    }
    return languageMap[ext || ''] || 'plaintext'
  }

  const handleDownload = () => {
    const blob = new Blob([file.content || ''], { type: 'text/plain' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = file.name
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
    URL.revokeObjectURL(url)
    toast.success('File downloaded successfully')
  }

  const handleCopyContent = async () => {
    try {
      await navigator.clipboard.writeText(file.content || '')
      setCopied(true)
      toast.success('Content copied to clipboard!')
      setTimeout(() => setCopied(false), 2000)
    } catch {
      toast.error('Failed to copy content')
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
                <h2 className="font-semibold text-lg">{file.name}</h2>
                <p className="text-sm text-muted-foreground">
                  Shared by {file.owner.name}
                </p>
              </div>
            </div>
            <div className="flex items-center space-x-2">
              <Button variant="outline" size="sm" onClick={handleCopyContent}>
                <Copy className="h-4 w-4 mr-1" />
                {copied ? 'Copied!' : 'Copy'}
              </Button>
              <Button variant="outline" size="sm" onClick={handleDownload}>
                <Download className="h-4 w-4 mr-1" />
                Download
              </Button>
              <ThemeToggle />
              <Link href="/auth/login">
                <Button size="sm">
                  <Home className="h-4 w-4 mr-1" />
                  Sign In
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </header>

      {/* Content */}
      <div className="container mx-auto px-4 py-6">
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          {/* File Info Sidebar */}
          <div className="lg:col-span-1">
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">File Information</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <h4 className="font-medium text-sm text-muted-foreground mb-1">
                    File Name
                  </h4>
                  <p className="text-sm">{file.name}</p>
                </div>
                <div>
                  <h4 className="font-medium text-sm text-muted-foreground mb-1">
                    Size
                  </h4>
                  <p className="text-sm">{formatFileSize(file.size)}</p>
                </div>
                <div>
                  <h4 className="font-medium text-sm text-muted-foreground mb-1">
                    Language
                  </h4>
                  <p className="text-sm capitalize">{getLanguage(file.name)}</p>
                </div>
                <div>
                  <h4 className="font-medium text-sm text-muted-foreground mb-1">
                    Created
                  </h4>
                  <p className="text-sm">{formatDate(file.createdAt)}</p>
                </div>
                <div>
                  <h4 className="font-medium text-sm text-muted-foreground mb-1">
                    Last Modified
                  </h4>
                  <p className="text-sm">{formatDate(file.updatedAt)}</p>
                </div>
                <div>
                  <h4 className="font-medium text-sm text-muted-foreground mb-1">
                    Shared By
                  </h4>
                  <div className="flex items-center space-x-2">
                    <User className="h-4 w-4" />
                    <p className="text-sm">{file.owner.name}</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="mt-4">
              <CardContent className="p-4">
                <p className="text-sm text-muted-foreground text-center">
                  Create your own account to start sharing files
                </p>
                <Link href="/auth/register" className="block mt-2">
                  <Button className="w-full" size="sm">
                    Create Account
                  </Button>
                </Link>
              </CardContent>
            </Card>
          </div>

          {/* Editor */}
          <div className="lg:col-span-3">
            <Card className="h-[calc(100vh-12rem)]">
              <CardContent className="p-0 h-full">
                <Editor
                  height="100%"
                  language={getLanguage(file.name)}
                  value={file.content || ''}
                  theme={theme === 'dark' ? 'vs-dark' : 'light'}
                  options={{
                    readOnly: true,
                    fontSize: 14,
                    fontFamily: "'JetBrains Mono', 'Fira Code', 'Cascadia Code', 'SF Mono', monospace",
                    minimap: { enabled: true },
                    scrollBeyondLastLine: false,
                    automaticLayout: true,
                    tabSize: 2,
                    lineNumbers: 'on',
                    folding: true,
                    wordWrap: 'on',
                    contextmenu: false,
                    selectOnLineNumbers: false,
                  }}
                />
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  )
}
