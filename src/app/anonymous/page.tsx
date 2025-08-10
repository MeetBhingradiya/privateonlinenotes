'use client'

import { useState } from 'react'
import Link from 'next/link'
import { Editor } from '@monaco-editor/react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { ArrowLeft, FileText, Download, Copy, Share, Clock } from 'lucide-react'
import { ThemeToggle } from '@/components/theme-toggle'
import { useTheme } from 'next-themes'
import toast from 'react-hot-toast'

interface AnonymousFile {
  _id: string
  name: string
  content: string
  language: string
  shareCode: string
  expiresAt?: Date
  createdAt: Date
}

export default function AnonymousPage() {
  const { theme } = useTheme()
  const [file, setFile] = useState<AnonymousFile | null>(null)
  const [fileName, setFileName] = useState('anonymous-note')
  const [content, setContent] = useState('')
  const [language, setLanguage] = useState('plaintext')
  const [expiryHours, setExpiryHours] = useState(24)
  const [loading, setLoading] = useState(false)

  const createAnonymousFile = async () => {
    if (!content.trim()) {
      toast.error('Please add some content')
      return
    }

    setLoading(true)
    try {
      const response = await fetch('/api/anonymous/files', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: fileName,
          content,
          language,
          expiryHours
        }),
      })

      if (response.ok) {
        const newFile = await response.json()
        setFile(newFile)
        toast.success('Anonymous file created!')
      } else {
        toast.error('Failed to create file')
      }
    } catch {
      toast.error('An error occurred')
    } finally {
      setLoading(false)
    }
  }

  const copyShareLink = () => {
    if (file) {
      const shareUrl = `${window.location.origin}/share/${file.shareCode}`
      navigator.clipboard.writeText(shareUrl)
      toast.success('Share link copied to clipboard!')
    }
  }

  const downloadFile = () => {
    if (file) {
      const blob = new Blob([file.content], { type: 'text/plain' })
      const url = URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = file.name
      document.body.appendChild(a)
      a.click()
      document.body.removeChild(a)
      URL.revokeObjectURL(url)
      toast.success('File downloaded!')
    }
  }

  const resetForm = () => {
    setFile(null)
    setContent('')
    setFileName('anonymous-note')
    setLanguage('plaintext')
    setExpiryHours(24)
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-6xl mx-auto">
          <div className="flex justify-between items-center mb-8">
            <div>
              <Link href="/">
                <Button variant="ghost" className="mb-4">
                  <ArrowLeft className="h-4 w-4 mr-2" />
                  Back to Home
                </Button>
              </Link>
              <h1 className="text-4xl font-bold mb-2">Anonymous Notes</h1>
              <p className="text-muted-foreground">
                Create and share notes without creating an account
              </p>
            </div>
            <ThemeToggle />
          </div>

          {!file ? (
            <div className="grid lg:grid-cols-3 gap-6">
              {/* Settings Panel */}
              <Card>
                <CardHeader>
                  <CardTitle>File Settings</CardTitle>
                  <CardDescription>
                    Configure your anonymous file
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <label className="text-sm font-medium mb-2 block">File Name</label>
                    <Input
                      value={fileName}
                      onChange={(e) => setFileName(e.target.value)}
                      placeholder="Enter file name"
                    />
                  </div>

                  <div>
                    <label className="text-sm font-medium mb-2 block">Language</label>
                    <select
                      value={language}
                      onChange={(e) => setLanguage(e.target.value)}
                      className="w-full p-2 border rounded-md bg-background"
                    >
                      <option value="plaintext">Plain Text</option>
                      <option value="javascript">JavaScript</option>
                      <option value="python">Python</option>
                      <option value="java">Java</option>
                      <option value="cpp">C++</option>
                      <option value="html">HTML</option>
                      <option value="css">CSS</option>
                      <option value="json">JSON</option>
                      <option value="markdown">Markdown</option>
                    </select>
                  </div>

                  <div>
                    <label className="text-sm font-medium mb-2 block">Expires In</label>
                    <select
                      value={expiryHours}
                      onChange={(e) => setExpiryHours(Number(e.target.value))}
                      className="w-full p-2 border rounded-md bg-background"
                    >
                      <option value={1}>1 hour</option>
                      <option value={6}>6 hours</option>
                      <option value={24}>24 hours</option>
                      <option value={72}>3 days</option>
                      <option value={168}>1 week</option>
                      <option value={0}>Never</option>
                    </select>
                  </div>

                  <Button onClick={createAnonymousFile} className="w-full" disabled={loading}>
                    {loading ? 'Creating...' : 'Create Anonymous File'}
                  </Button>
                </CardContent>
              </Card>

              {/* Editor */}
              <Card className="lg:col-span-2">
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <FileText className="h-5 w-5 mr-2" />
                    Content Editor
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="h-96 border rounded-md">
                    <Editor
                      height="100%"
                      language={language}
                      value={content}
                      onChange={(value) => setContent(value || '')}
                      theme={theme === 'dark' ? 'vs-dark' : 'light'}
                      options={{
                        minimap: { enabled: false },
                        scrollBeyondLastLine: false,
                        fontSize: 14,
                        wordWrap: 'on',
                        automaticLayout: true,
                      }}
                    />
                  </div>
                </CardContent>
              </Card>
            </div>
          ) : (
            <Card>
              <CardHeader>
                <div className="flex justify-between items-start">
                  <div>
                    <CardTitle className="flex items-center">
                      <FileText className="h-5 w-5 mr-2" />
                      {file.name}
                    </CardTitle>
                    <CardDescription className="flex items-center mt-2">
                      <Clock className="h-4 w-4 mr-1" />
                      {file.expiresAt 
                        ? `Expires on ${new Date(file.expiresAt).toLocaleString()}`
                        : 'Never expires'
                      }
                    </CardDescription>
                  </div>
                  <div className="flex space-x-2">
                    <Button variant="outline" onClick={copyShareLink}>
                      <Share className="h-4 w-4 mr-2" />
                      Copy Link
                    </Button>
                    <Button variant="outline" onClick={downloadFile}>
                      <Download className="h-4 w-4 mr-2" />
                      Download
                    </Button>
                    <Button onClick={resetForm}>
                      Create New
                    </Button>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="h-96 border rounded-md">
                  <Editor
                    height="100%"
                    language={file.language}
                    value={file.content}
                    theme={theme === 'dark' ? 'vs-dark' : 'light'}
                    options={{
                      minimap: { enabled: false },
                      scrollBeyondLastLine: false,
                      fontSize: 14,
                      wordWrap: 'on',
                      automaticLayout: true,
                      readOnly: true,
                    }}
                  />
                </div>
                
                <div className="mt-4 p-4 bg-muted rounded-md">
                  <p className="text-sm font-medium mb-2">Share Link:</p>
                  <div className="flex items-center space-x-2">
                    <Input
                      value={`${window.location.origin}/share/${file.shareCode}`}
                      readOnly
                      className="font-mono text-sm"
                    />
                    <Button variant="outline" size="sm" onClick={copyShareLink}>
                      <Copy className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}

          <div className="mt-8 text-center">
            <p className="text-muted-foreground text-sm">
              Anonymous files are publicly accessible via share links. 
              {' '}Do not include sensitive information.
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}
