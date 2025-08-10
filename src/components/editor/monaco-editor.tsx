'use client'

import { useState, useEffect, useCallback } from 'react'
import { Editor } from '@monaco-editor/react'
import { Button } from '@/components/ui/button'
import { Save, Download, Share, History } from 'lucide-react'
import { Icon } from '@iconify/react'
import { useTheme } from 'next-themes'
import toast from 'react-hot-toast'

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

  useEffect(() => {
    setContent(file.content || '')
    setHasChanges(false)
  }, [file])

  const handleSave = useCallback(async () => {
    setSaving(true)
    try {
      await onSave(content)
      setHasChanges(false)
    } catch {
      toast.error('Failed to save file')
    } finally {
      setSaving(false)
    }
  }, [onSave, content])

  // Handle keyboard shortcuts
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Ctrl+S to save
      if ((e.ctrlKey || e.metaKey) && e.key === 's') {
        e.preventDefault()
        if (hasChanges) {
          handleSave()
        }
      }
    }

    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [hasChanges, handleSave])

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
    <div className="flex flex-col h-full">
      {/* Toolbar */}
      <div className="flex items-center justify-between p-4 border-b bg-card">
        <div className="flex items-center space-x-2">
          <h2 className="font-semibold text-lg">{file.name}</h2>
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
            <Download className="h-4 w-4 mr-1" />
            Download
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={handleShare}
          >
            <Share className="h-4 w-4 mr-1" />
            Share
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => toast('Version history coming soon!')}
          >
            <History className="h-4 w-4 mr-1" />
            History
          </Button>
          {!readOnly && (
            <Button
              onClick={handleSave}
              disabled={!hasChanges || saving}
              size="sm"
            >
              <Save className="h-4 w-4 mr-1" />
              {saving ? 'Saving...' : 'Save'}
            </Button>
          )}
        </div>
      </div>

      {/* Editor */}
      <div className="flex-1">
        <Editor
          height="100%"
          language={getLanguage(file.name)}
          value={content}
          onChange={(value) => {
            if (!readOnly) {
              setContent(value || '')
              setHasChanges(value !== file.content)
              onChange?.(value || '')
            }
          }}
          theme={theme === 'dark' ? 'vs-dark' : 'light'}
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
          }}
        />
      </div>

      {/* Status Bar */}
      <div className="flex items-center justify-between p-2 bg-muted text-sm text-muted-foreground border-t">
        <div className="flex items-center space-x-4">
          <span>Language: {getLanguage(file.name)}</span>
          <span>Size: {content.length} characters</span>
        </div>
        <div className="flex items-center space-x-4">
          <span>Last saved: {new Date(file.updatedAt).toLocaleTimeString()}</span>
          <span>Lines: {content.split('\n').length}</span>
        </div>
      </div>
    </div>
  )
}
