'use client'

import { useState, useEffect, useCallback, useRef } from 'react'
import { Editor } from '@monaco-editor/react'
import { Button } from '@/components/ui/button'
import { Download, Share, Settings } from 'lucide-react'
import { Icon } from '@iconify/react'
import { useTheme } from 'next-themes'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import toast from 'react-hot-toast'
import * as monaco from 'monaco-editor'

interface FileItem {
    _id: string
    name: string
    content?: string
    language?: string
    size: number
    updatedAt: string
}

interface MonacoEditorProps {
    file: FileItem
    onSave: (content: string) => void
    onChange?: (content: string) => void
    readOnly?: boolean
}

export function MonacoEditor({ file, onSave, onChange, readOnly = false }: MonacoEditorProps) {
    const { theme } = useTheme()
    const [content, setContent] = useState(file.content || '')
    const [hasChanges, setHasChanges] = useState(false)
    const [saving, setSaving] = useState(false)
    const [selectedLanguage, setSelectedLanguage] = useState<string>('')
    const [showLanguageSelect, setShowLanguageSelect] = useState(false)
    const editorRef = useRef<monaco.editor.IStandaloneCodeEditor | null>(null)
    const userChangedLanguage = useRef(false)

    useEffect(() => {
        setContent(file.content || '')
        setHasChanges(false)
        
        // Only auto-detect language if user hasn't manually changed it for this file
        if (!userChangedLanguage.current) {
            const detectedLanguage = file.language || getLanguage(file.name)
            setSelectedLanguage(detectedLanguage)
        }
        
        // Reset user language change flag when switching files
        userChangedLanguage.current = false
    }, [file._id, file.content, file.language, file.name]) // Include all used file properties

    const handleContentChange = (value: string | undefined) => {
        if (!readOnly) {
            const newContent = value || ''
            setContent(newContent)
            // Immediately update hasChanges when content changes
            const originalContent = file.content || ''
            const hasNewChanges = newContent !== originalContent
            setHasChanges(hasNewChanges)
            onChange?.(newContent)
        }
    }

    const handleSave = useCallback(async () => {
        setSaving(true)
        try {
            await onSave(content)
            setHasChanges(false)
            toast.success('File saved successfully!')
            // Update the file content reference to match current content
            file.content = content
        } catch {
            toast.error('Failed to save file')
        } finally {
            setSaving(false)
        }
    }, [onSave, content, file])

    // Handle Monaco editor setup and keyboard shortcuts
    const handleEditorDidMount = (editor: monaco.editor.IStandaloneCodeEditor) => {
        editorRef.current = editor
        
        // Add custom keyboard shortcuts to the editor
        editor.addCommand(monaco.KeyMod.CtrlCmd | monaco.KeyCode.KeyS, () => {
            if (hasChanges && !saving) {
                handleSave()
            }
        })
        
        // Focus the editor for immediate typing
        editor.focus()
    }

    const availableLanguages = [
        { value: 'plaintext', label: 'Plain Text' },
        { value: 'javascript', label: 'JavaScript' },
        { value: 'typescript', label: 'TypeScript' },
        { value: 'python', label: 'Python' },
        { value: 'html', label: 'HTML' },
        { value: 'css', label: 'CSS' },
        { value: 'scss', label: 'SCSS' },
        { value: 'less', label: 'Less' },
        { value: 'json', label: 'JSON' },
        { value: 'markdown', label: 'Markdown' },
        { value: 'xml', label: 'XML' },
        { value: 'sql', label: 'SQL' },
        { value: 'yaml', label: 'YAML' },
        { value: 'shell', label: 'Shell/Bash' },
        { value: 'powershell', label: 'PowerShell' },
        { value: 'bat', label: 'Batch' },
        { value: 'php', label: 'PHP' },
        { value: 'java', label: 'Java' },
        { value: 'cpp', label: 'C++' },
        { value: 'c', label: 'C' },
        { value: 'csharp', label: 'C#' },
        { value: 'go', label: 'Go' },
        { value: 'rust', label: 'Rust' },
        { value: 'ruby', label: 'Ruby' },
        { value: 'swift', label: 'Swift' },
        { value: 'kotlin', label: 'Kotlin' },
        { value: 'dart', label: 'Dart' },
        { value: 'ini', label: 'INI/Config' },
        { value: 'toml', label: 'TOML' },
    ]

    const getLanguage = (filename: string): string => {
        const ext = filename.split('.').pop()?.toLowerCase()
        const languageMap: Record<string, string> = {
            // JavaScript/TypeScript
            js: 'javascript',
            jsx: 'javascript',
            mjs: 'javascript',
            ts: 'typescript',
            tsx: 'typescript',
            
            // Python
            py: 'python',
            pyw: 'python',
            
            // Web technologies
            html: 'html',
            htm: 'html',
            css: 'css',
            scss: 'scss',
            sass: 'scss',
            less: 'less',
            
            // Data formats
            json: 'json',
            xml: 'xml',
            yaml: 'yaml',
            yml: 'yaml',
            
            // Markup
            md: 'markdown',
            markdown: 'markdown',
            
            // Shell/Command
            sh: 'shell',
            bash: 'shell',
            zsh: 'shell',
            fish: 'shell',
            ps1: 'powershell',
            bat: 'bat',
            cmd: 'bat',
            
            // Programming languages
            php: 'php',
            java: 'java',
            cpp: 'cpp',
            cxx: 'cpp',
            cc: 'cpp',
            c: 'c',
            h: 'c',
            hpp: 'cpp',
            cs: 'csharp',
            go: 'go',
            rs: 'rust',
            rb: 'ruby',
            swift: 'swift',
            kt: 'kotlin',
            dart: 'dart',
            
            // SQL
            sql: 'sql',
            
            // Configuration
            ini: 'ini',
            cfg: 'ini',
            conf: 'ini',
            toml: 'toml',
            
            // Others
            txt: 'plaintext',
            log: 'plaintext',
        }
        return languageMap[ext || ''] || 'plaintext'
    }

    const handleLanguageChange = (newLanguage: string) => {
        setSelectedLanguage(newLanguage)
        setShowLanguageSelect(false)
        userChangedLanguage.current = true // Mark that user manually changed language
        
        // Update the file's language preference
        if (file.language !== newLanguage) {
            // Save language preference to the file
            fetch(`/api/files/${file._id}`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ language: newLanguage }),
            }).catch(() => {
                // Silently fail if language update fails
            })
        }
    }

    const handleDownload = () => {
        const blob = new Blob([content], { type: 'text/plain' })
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

    const handleShare = async () => {
        try {
            const response = await fetch(`/api/files/${file._id}/share`, {
                method: 'POST',
            })

            if (response.ok) {
                const data = await response.json()
                navigator.clipboard.writeText(`${window.location.origin}/share/${data.shareCode}`)
                toast.success('Share link copied to clipboard!')
            } else {
                toast.error('Failed to generate share link')
            }
        } catch {
            toast.error('Error sharing file')
        }
    }

    return (
        <div className="flex flex-col h-full relative">
            {/* Toolbar */}
            <div className="flex items-center justify-between p-4 border-b bg-card">
                <div className="flex items-center space-x-4">
                    <h2 className="font-semibold text-lg">{file.name}</h2>
                    
                    {/* Language selector */}
                    <div className="flex items-center space-x-2">
                        <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => setShowLanguageSelect(!showLanguageSelect)}
                            className="text-xs"
                        >
                            <Settings className="h-3 w-3 mr-1" />
                            {availableLanguages.find(lang => lang.value === selectedLanguage)?.label || 'Language'}
                        </Button>
                        
                        {showLanguageSelect && (
                            <div className="absolute top-16 left-4 z-50">
                                <Select value={selectedLanguage} onValueChange={handleLanguageChange}>
                                    <SelectTrigger className="w-48">
                                        <SelectValue placeholder="Select language" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {availableLanguages.map((lang) => (
                                            <SelectItem key={lang.value} value={lang.value}>
                                                {lang.label}
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            </div>
                        )}
                    </div>

                    {hasChanges && (
                        <div className="flex items-center space-x-2">
                            <span className="text-xs bg-orange-100 text-orange-800 px-2 py-1 rounded-full dark:bg-orange-900 dark:text-orange-200 font-medium">
                                <Icon icon="material-symbols:edit" className="inline h-3 w-3 mr-1" />
                                Unsaved changes
                            </span>
                            <span className="text-xs text-muted-foreground px-2 py-1 bg-muted rounded-md">
                                Press <kbd className="px-1 py-0.5 bg-background rounded text-xs font-mono">Ctrl+S</kbd> to save
                            </span>
                        </div>
                    )}
                </div>
                
                <div className="flex items-center space-x-2">
                    <Button
                        variant="outline"
                        size="sm"
                        onClick={handleDownload}
                    >
                        <Download className="h-4 w-4" />
                    </Button>
                    <Button
                        variant="outline"
                        size="sm"
                        onClick={handleShare}
                    >
                        <Share className="h-4 w-4" />
                    </Button>
                </div>
            </div>

            {/* Editor */}
            <div className="flex-1">
                <Editor
                    height="100%"
                    language={selectedLanguage}
                    value={content}
                    onChange={handleContentChange}
                    onMount={handleEditorDidMount}
                    theme={theme === 'dark' ? 'vs-dark' : 'vs-light'}
                    options={{
                        fontSize: 14,
                        fontFamily: "'JetBrains Mono', 'Fira Code', 'Cascadia Code', 'SF Mono', monospace",
                        minimap: { enabled: true },
                        scrollBeyondLastLine: false,
                        automaticLayout: true,
                        tabSize: 2,
                        insertSpaces: true,
                        wordWrap: 'on',
                        lineNumbers: 'on',
                        folding: true,
                        matchBrackets: 'always',
                        autoIndent: 'full',
                        formatOnPaste: true,
                        formatOnType: true,
                        suggestOnTriggerCharacters: true,
                        quickSuggestions: true,
                        parameterHints: { enabled: true },
                        hover: { enabled: true },
                        readOnly: readOnly,
                        renderLineHighlight: 'all',
                        selectOnLineNumbers: true,
                        roundedSelection: false,
                        cursorStyle: 'line',
                        cursorBlinking: 'blink',
                    }}
                />
            </div>

            {/* Status Bar */}
            <div className="flex items-center justify-between p-2 bg-muted text-sm text-muted-foreground border-t">
                <div className="flex items-center space-x-4">
                    <span>Language: {availableLanguages.find(lang => lang.value === selectedLanguage)?.label || 'Unknown'}</span>
                    <span>Size: {content.length} characters</span>
                    <span>Lines: {content.split('\n').length}</span>
                </div>
                <div className="flex items-center space-x-4">
                    <span>Last saved: {new Date(file.updatedAt).toLocaleTimeString()}</span>
                    {hasChanges && (
                        <span className="text-orange-600 dark:text-orange-400 font-medium">
                            • Modified
                        </span>
                    )}
                </div>
            </div>
        </div>
    )
}
