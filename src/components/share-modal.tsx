'use client'

import { useState } from 'react'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Switch } from '@/components/ui/switch'
import { Copy, Check, ExternalLink, Settings } from 'lucide-react'
import toast from 'react-hot-toast'

interface FileItem {
    _id: string
    name: string
    type: 'file' | 'folder'
    isPublic: boolean
    shareCode?: string
    slug?: string
}

interface ShareModalProps {
    isOpen: boolean
    onClose: () => void
    file: FileItem | null
    onShare: (shareData: { shareCode: string; slug: string }) => void
}

export function ShareModal({ isOpen, onClose, file, onShare }: ShareModalProps) {
    const [isSharing, setIsSharing] = useState(false)
    const [shareData, setShareData] = useState<{ shareCode: string; slug: string } | null>(null)
    const [customSlug, setCustomSlug] = useState('')
    const [isPublic, setIsPublic] = useState(false)
    const [useCustomSlug, setUseCustomSlug] = useState(false)
    const [copiedLink, setCopiedLink] = useState<'slug' | 'code' | null>(null)

    const handleShare = async () => {
        if (!file) return

        setIsSharing(true)
        try {
            const response = await fetch(`/api/files/${file._id}/share`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    customSlug: useCustomSlug ? customSlug : undefined,
                    isPublic
                })
            })

            if (response.ok) {
                const data = await response.json()
                setShareData(data)
                onShare(data)
                toast.success('Share link generated successfully!')
            } else {
                const error = await response.json()
                toast.error(error.message || 'Failed to generate share link')
            }
        } catch {
            toast.error('Error generating share link')
        } finally {
            setIsSharing(false)
        }
    }

    const copyToClipboard = async (text: string, type: 'slug' | 'code') => {
        try {
            await navigator.clipboard.writeText(text)
            setCopiedLink(type)
            toast.success('Link copied to clipboard!')
            setTimeout(() => setCopiedLink(null), 2000)
    } catch {
      toast.error('Failed to copy link')
    }
    }

    const slugUrl = shareData ? `${window.location.origin}/share/${shareData.slug}` : ''
    const codeUrl = shareData ? `${window.location.origin}/share/${shareData.shareCode}` : ''

    const handleClose = () => {
        setShareData(null)
        setCustomSlug('')
        setIsPublic(false)
        setUseCustomSlug(false)
        setCopiedLink(null)
        onClose()
    }

    return (
        <Dialog open={isOpen} onOpenChange={handleClose}>
            <DialogContent className="sm:max-w-md">
                <DialogHeader>
                    <DialogTitle className="flex items-center space-x-2">
                        <Settings className="h-5 w-5" />
                        <span>Share {file?.type === 'folder' ? 'Folder' : 'File'}</span>
                    </DialogTitle>
                    <DialogDescription>
                        Generate a shareable link for &quot;{file?.name}&quot;
                    </DialogDescription>
                </DialogHeader>

                <div className="space-y-6">
                    {!shareData ? (
                        <>
                            {/* Public/Private Toggle */}
                            <div className="flex items-center justify-between">
                                <div className="space-y-0.5">
                                    <Label htmlFor="public-toggle">Make Public</Label>
                                    <p className="text-sm text-muted-foreground">
                                        Public {file?.type === 'folder' ? 'folders' : 'files'} appear in the explore page
                                    </p>
                                </div>
                                <Switch
                                    id="public-toggle"
                                    checked={isPublic}
                                    onCheckedChange={setIsPublic}
                                />
                            </div>

                            {/* Custom Slug Option */}
                            <div className="space-y-3">
                                <div className="flex items-center justify-between">
                                    <Label htmlFor="custom-slug-toggle">Custom URL</Label>
                                    <Switch
                                        id="custom-slug-toggle"
                                        checked={useCustomSlug}
                                        onCheckedChange={setUseCustomSlug}
                                    />
                                </div>

                                {useCustomSlug && (
                                    <div className="space-y-2">
                                        <Label htmlFor="custom-slug">Custom Slug</Label>
                                        <div className="flex">
                                            <span className="inline-flex items-center px-3 rounded-l-md border border-r-0 border-muted bg-muted text-muted-foreground text-sm">
                                                notta.in/share/
                                            </span>
                                            <Input
                                                id="custom-slug"
                                                value={customSlug}
                                                onChange={(e) => setCustomSlug(e.target.value)}
                                                placeholder="my-awesome-file"
                                                className="rounded-l-none"
                                            />
                                        </div>
                                        <p className="text-xs text-muted-foreground">
                                            Only letters, numbers, and hyphens allowed
                                        </p>
                                    </div>
                                )}
                            </div>

                            <Button
                                onClick={handleShare}
                                disabled={isSharing || (useCustomSlug && !customSlug.trim())}
                                className="w-full"
                            >
                                {isSharing ? 'Generating...' : 'Generate Share Link'}
                            </Button>
                        </>
                    ) : (
                        <div className="space-y-4">
                            {/* Slug URL */}
                            <div className="space-y-2">
                                <Label>Pretty URL</Label>
                                <div className="flex items-center space-x-2">
                                    <Input value={slugUrl} readOnly className="flex-1" />
                                    <Button
                                        size="sm"
                                        variant="outline"
                                        onClick={() => copyToClipboard(slugUrl, 'slug')}
                                    >
                                        {copiedLink === 'slug' ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
                                    </Button>
                                    <Button
                                        size="sm"
                                        variant="outline"
                                        onClick={() => window.open(slugUrl, '_blank')}
                                    >
                                        <ExternalLink className="h-4 w-4" />
                                    </Button>
                                </div>
                            </div>

                            {/* Share Code URL */}
                            <div className="space-y-2">
                                <Label>Share Code URL</Label>
                                <div className="flex items-center space-x-2">
                                    <Input value={codeUrl} readOnly className="flex-1" />
                                    <Button
                                        size="sm"
                                        variant="outline"
                                        onClick={() => copyToClipboard(codeUrl, 'code')}
                                    >
                                        {copiedLink === 'code' ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
                                    </Button>
                                    <Button
                                        size="sm"
                                        variant="outline"
                                        onClick={() => window.open(codeUrl, '_blank')}
                                    >
                                        <ExternalLink className="h-4 w-4" />
                                    </Button>
                                </div>
                            </div>

                            <div className="flex space-x-2">
                                <Button variant="outline" onClick={handleClose} className="flex-1">
                                    Done
                                </Button>
                                <Button
                                    onClick={() => setShareData(null)}
                                    variant="ghost"
                                    className="flex-1"
                                >
                                    Share Another
                                </Button>
                            </div>
                        </div>
                    )}
                </div>
            </DialogContent>
        </Dialog>
    )
}
