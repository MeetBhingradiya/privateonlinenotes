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
        if (file && typeof window !== 'undefined' && navigator.clipboard) {
            const shareUrl = `${window.location.origin}/share/${file.shareCode}`
            navigator.clipboard.writeText(shareUrl)
                .then(() => toast.success('Share link copied to clipboard!'))
                .catch(() => toast.error('Failed to copy link'))
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
        <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 dark:from-gray-950 dark:via-blue-950 dark:to-indigo-950">
            {/* Header */}
            <header className="border-b bg-card/80 backdrop-blur-sm">
                <div className="container mx-auto px-4 py-4">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-4">
                            <Link href="/" className="flex items-center space-x-2">
                                <h1 className="text-2xl font-bold text-primary">Notta.in</h1>
                            </Link>
                            <div className="h-6 w-px bg-border" />
                            <div>
                                <h2 className="font-semibold text-lg">Anonymous Notes</h2>
                                <p className="text-sm text-muted-foreground">
                                    Create and share notes without an account
                                </p>
                            </div>
                        </div>
                        <div className="flex items-center space-x-2">
                            <ThemeToggle />
                            <Link href="/auth/login">
                                <Button size="sm" variant="outline">
                                    <ArrowLeft className="h-4 w-4 mr-1" />
                                    Sign In
                                </Button>
                            </Link>
                        </div>
                    </div>
                </div>
            </header>

            <div className="container mx-auto px-4 py-8">
                <div className="max-w-7xl mx-auto">
                    {!file ? (
                        <>
                            {/* Hero Section */}
                            <div className="text-center mb-12">
                                <div className="inline-flex items-center justify-center w-20 h-20 bg-gradient-to-br from-blue-500 to-purple-600 rounded-3xl mb-6 shadow-xl">
                                    <FileText className="w-10 h-10 text-white" />
                                </div>
                                <h1 className="text-5xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent mb-4">
                                    Create Anonymous Notes
                                </h1>
                                <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
                                    Share code, notes, and text instantly without creating an account.
                                    Perfect for quick collaboration and temporary sharing.
                                </p>
                            </div>

                            <div className="grid lg:grid-cols-4 gap-6">
                                {/* Settings Panel */}
                                <div className="lg:col-span-1">
                                    <Card className="shadow-xl border-0 bg-card/80 backdrop-blur-sm">
                                        <CardHeader>
                                            <CardTitle className="text-lg">File Settings</CardTitle>
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
                                                    className="bg-background/50"
                                                />
                                            </div>

                                            <div>
                                                <label className="text-sm font-medium mb-2 block">Language</label>
                                                <select
                                                    value={language}
                                                    onChange={(e) => setLanguage(e.target.value)}
                                                    className="w-full p-2 border rounded-md bg-background/50 text-foreground"
                                                >
                                                    <option value="plaintext">Plain Text</option>
                                                    <option value="javascript">JavaScript</option>
                                                    <option value="typescript">TypeScript</option>
                                                    <option value="python">Python</option>
                                                    <option value="java">Java</option>
                                                    <option value="cpp">C++</option>
                                                    <option value="html">HTML</option>
                                                    <option value="css">CSS</option>
                                                    <option value="json">JSON</option>
                                                    <option value="markdown">Markdown</option>
                                                    <option value="sql">SQL</option>
                                                    <option value="xml">XML</option>
                                                </select>
                                            </div>

                                            <div>
                                                <label className="text-sm font-medium mb-2 block">Expires In</label>
                                                <select
                                                    value={expiryHours}
                                                    onChange={(e) => setExpiryHours(Number(e.target.value))}
                                                    className="w-full p-2 border rounded-md bg-background/50 text-foreground"
                                                >
                                                    <option value={1}>1 hour</option>
                                                    <option value={6}>6 hours</option>
                                                    <option value={24}>24 hours</option>
                                                    <option value={72}>3 days</option>
                                                    <option value={168}>1 week</option>
                                                    <option value={0}>Never expires</option>
                                                </select>
                                            </div>

                                            <Button
                                                onClick={createAnonymousFile}
                                                className="w-full bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700"
                                                disabled={loading}
                                            >
                                                {loading ? 'Creating...' : 'Create Anonymous File'}
                                            </Button>
                                        </CardContent>
                                    </Card>

                                    {/* Info Card */}
                                    <Card className="mt-4 shadow-xl border-0 bg-card/80 backdrop-blur-sm">
                                        <CardContent className="p-4">
                                            <h3 className="font-semibold text-sm mb-2">How it works</h3>
                                            <ul className="text-xs text-muted-foreground space-y-1">
                                                <li>• No account required</li>
                                                <li>• Instant sharing via link</li>
                                                <li>• Auto-expiry options</li>
                                                <li>• Support for multiple languages</li>
                                            </ul>
                                        </CardContent>
                                    </Card>
                                </div>

                                {/* Editor */}
                                <Card className="lg:col-span-3 shadow-xl border-0 bg-card/80 backdrop-blur-sm">
                                    <CardHeader>
                                        <CardTitle className="flex items-center text-lg">
                                            <FileText className="h-5 w-5 mr-2" />
                                            Content Editor
                                        </CardTitle>
                                        <CardDescription>
                                            Write your content here. It will be saved when you create the file.
                                        </CardDescription>
                                    </CardHeader>
                                    <CardContent>
                                        <div className="h-[60vh] border rounded-md overflow-hidden">
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
                                                    lineNumbers: 'on',
                                                    folding: true,
                                                    matchBrackets: 'always',
                                                }}
                                            />
                                        </div>
                                    </CardContent>
                                </Card>
                            </div>
                        </>
                    ) : (
                        <>
                            {/* Success Hero */}
                            <div className="text-center mb-8">
                                <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-br from-green-500 to-emerald-600 rounded-2xl mb-4 shadow-lg">
                                    <FileText className="w-8 h-8 text-white" />
                                </div>
                                <h1 className="text-3xl font-bold text-foreground mb-2">File Created Successfully!</h1>
                                <p className="text-muted-foreground">Your anonymous file is ready to share</p>
                            </div>

                            <Card className="shadow-2xl border-0 bg-card/80 backdrop-blur-sm">
                                <CardHeader>
                                    <div className="flex justify-between items-start">
                                        <div>
                                            <CardTitle className="flex items-center text-xl">
                                                <FileText className="h-6 w-6 mr-2" />
                                                {file.name}
                                            </CardTitle>
                                            <CardDescription className="flex items-center mt-2 text-base">
                                                <Clock className="h-4 w-4 mr-1" />
                                                {file.expiresAt
                                                    ? `Expires on ${new Date(file.expiresAt).toLocaleString()}`
                                                    : 'Never expires'
                                                }
                                            </CardDescription>
                                        </div>
                                        <div className="flex space-x-2">
                                            <Button variant="outline" onClick={copyShareLink} className="shadow-sm">
                                                <Share className="h-4 w-4 mr-2" />
                                                Copy Link
                                            </Button>
                                            <Button variant="outline" onClick={downloadFile} className="shadow-sm">
                                                <Download className="h-4 w-4 mr-2" />
                                                Download
                                            </Button>
                                            <Button onClick={resetForm} className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700">
                                                Create New
                                            </Button>
                                        </div>
                                    </div>
                                </CardHeader>
                                <CardContent>
                                    <div className="h-[60vh] border rounded-md overflow-hidden mb-6">
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
                                                lineNumbers: 'on',
                                            }}
                                        />
                                    </div>

                                    <div className="p-6 bg-gradient-to-r from-blue-50 to-purple-50 dark:from-blue-950/20 dark:to-purple-950/20 rounded-lg border">
                                        <p className="text-sm font-medium mb-3 flex items-center">
                                            <Share className="h-4 w-4 mr-2" />
                                            Share Link:
                                        </p>
                                        <div className="flex items-center space-x-2">
                                            <Input
                                                value={typeof window !== 'undefined' ? `${window.location.origin}/share/${file.shareCode}` : `/share/${file.shareCode}`}
                                                readOnly
                                                className="font-mono text-sm bg-background/50"
                                            />
                                            <Button variant="outline" size="sm" onClick={copyShareLink} className="shrink-0">
                                                <Copy className="h-4 w-4" />
                                            </Button>
                                        </div>
                                    </div>
                                </CardContent>
                            </Card>
                        </>
                    )}

                    {/* Footer Notice */}
                    <div className="mt-12 text-center">
                        <Card className="inline-block shadow-lg border-0 bg-card/60 backdrop-blur-sm">
                            <CardContent className="p-6">
                                <p className="text-muted-foreground text-sm mb-2">
                                    <strong>Privacy Notice:</strong> Anonymous files are publicly accessible via share links.
                                </p>
                                <p className="text-muted-foreground text-xs">
                                    Do not include sensitive or personal information. Files may be automatically deleted after expiry.
                                </p>
                            </CardContent>
                        </Card>
                    </div>
                </div>
            </div>
        </div>
    )
}
