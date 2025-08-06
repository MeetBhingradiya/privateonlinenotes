'use client';

import { useState } from 'react';
import Link from 'next/link';
import { 
  User, 
  Clock, 
  Eye, 
  Tag, 
  Share2, 
  Download, 
  Copy,
  Globe,
  Lock,
  EyeOff
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { GlassCard } from '@/components/ui/glass-card';
import { formatFileSize, getRelativeTime } from '@/lib/utils';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';
import { vscDarkPlus } from 'react-syntax-highlighter/dist/esm/styles/prism';
import toast from 'react-hot-toast';

interface FileViewerProps {
  file: {
    _id: string;
    title: string;
    slug: string;
    description?: string;
    permission: 'public' | 'unlisted' | 'private';
    tags: string[];
    author?: { name: string };
    anonymousAuthor?: { name: string };
    isAnonymous: boolean;
    viewCount: number;
    fileSize: number;
    createdAt: string;
    updatedAt: string;
    content: string;
  };
}

export default function FileViewer({ file }: FileViewerProps) {
  const [isSharing, setIsSharing] = useState(false);

  const handleShare = async () => {
    setIsSharing(true);
    try {
      const url = `${window.location.origin}/file/${file.slug}`;
      
      if (navigator.share) {
        await navigator.share({
          title: file.title,
          text: file.description || `Check out this note: ${file.title}`,
          url,
        });
      } else {
        await navigator.clipboard.writeText(url);
        toast.success('Link copied to clipboard!');
      }
    } catch (error) {
      console.error('Error sharing:', error);
      toast.error('Failed to share');
    } finally {
      setIsSharing(false);
    }
  };

  const handleDownload = () => {
    const element = document.createElement('a');
    const file_content = new Blob([file.content], { type: 'text/markdown' });
    element.href = URL.createObjectURL(file_content);
    element.download = `${file.slug}.md`;
    document.body.appendChild(element);
    element.click();
    document.body.removeChild(element);
    toast.success('File downloaded!');
  };

  const handleCopyContent = async () => {
    try {
      await navigator.clipboard.writeText(file.content);
      toast.success('Content copied to clipboard!');
    } catch {
      toast.error('Failed to copy content');
    }
  };

  const getPermissionIcon = () => {
    switch (file.permission) {
      case 'public':
        return <Globe className="h-4 w-4 text-green-400" />;
      case 'unlisted':
        return <EyeOff className="h-4 w-4 text-yellow-400" />;
      case 'private':
        return <Lock className="h-4 w-4 text-red-400" />;
    }
  };

  const getPermissionText = () => {
    switch (file.permission) {
      case 'public':
        return 'Public';
      case 'unlisted':
        return 'Unlisted';
      case 'private':
        return 'Private';
    }
  };

  return (
    <div className="container mx-auto px-4 py-16">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center gap-2 mb-4">
            {getPermissionIcon()}
            <span className="text-white/70 text-sm">{getPermissionText()}</span>
          </div>
          
          <h1 className="text-4xl font-bold text-white mb-4">{file.title}</h1>
          
          {file.description && (
            <p className="text-xl text-white/80 mb-6">{file.description}</p>
          )}

          {/* Meta Information */}
          <div className="flex flex-wrap items-center gap-6 text-white/60 mb-6">
            <div className="flex items-center gap-2">
              <User className="h-4 w-4" />
              <span>
                {file.isAnonymous 
                  ? (file.anonymousAuthor?.name || 'Anonymous')
                  : file.author?.name || 'Unknown'
                }
              </span>
            </div>
            
            <div className="flex items-center gap-2">
              <Clock className="h-4 w-4" />
              <span>{getRelativeTime(new Date(file.createdAt))}</span>
            </div>
            
            <div className="flex items-center gap-2">
              <Eye className="h-4 w-4" />
              <span>{file.viewCount} views</span>
            </div>
            
            <span>{formatFileSize(file.fileSize)}</span>
          </div>

          {/* Tags */}
          {file.tags.length > 0 && (
            <div className="flex flex-wrap gap-2 mb-6">
              {file.tags.map(tag => (
                <Link
                  key={tag}
                  href={`/explore?tags=${encodeURIComponent(tag)}`}
                  className="flex items-center gap-1 px-3 py-1 bg-white/10 hover:bg-white/20 text-white/80 rounded-full text-sm transition-colors"
                >
                  <Tag className="h-3 w-3" />
                  {tag}
                </Link>
              ))}
            </div>
          )}

          {/* Action Buttons */}
          <div className="flex flex-wrap gap-3">
            <Button
              variant="glass"
              size="sm"
              onClick={handleShare}
              disabled={isSharing}
            >
              <Share2 className="h-4 w-4 mr-2" />
              {isSharing ? 'Sharing...' : 'Share'}
            </Button>
            
            <Button
              variant="ghost"
              size="sm"
              onClick={handleDownload}
              className="text-white"
            >
              <Download className="h-4 w-4 mr-2" />
              Download
            </Button>
            
            <Button
              variant="ghost"
              size="sm"
              onClick={handleCopyContent}
              className="text-white"
            >
              <Copy className="h-4 w-4 mr-2" />
              Copy
            </Button>
          </div>
        </div>

        {/* Advertisement */}
        <div className="mb-8">
          <p className="text-white/40 text-xs mb-2 text-center">Advertisement</p>
          <GlassCard className="p-4">
            <div id="google-adsense-file" className="min-h-[90px] bg-white/5 rounded flex items-center justify-center">
              {process.env.NODE_ENV === 'development' && (
                <div className="border-2 border-dashed border-white/20 rounded p-4 text-center text-white/40">
                  <p>Google AdSense Placeholder</p>
                  <p className="text-xs mt-1">Leaderboard Ad (728x90)</p>
                </div>
              )}
            </div>
          </GlassCard>
        </div>

        {/* Content */}
        <GlassCard className="p-8">
          <div className="markdown-content">
            <ReactMarkdown
              remarkPlugins={[remarkGfm]}
              components={{
                code({ className, children, ...props }: { className?: string; children?: React.ReactNode; [key: string]: any }) {
                  const match = /language-(\w+)/.exec(className || '');
                  return match ? (
                    <SyntaxHighlighter
                      style={vscDarkPlus as Record<string, React.CSSProperties>}
                      language={match[1]}
                      PreTag="div"
                      className="rounded-lg"
                      {...props}
                    >
                      {String(children).replace(/\n$/, '')}
                    </SyntaxHighlighter>
                  ) : (
                    <code className={className} {...props}>
                      {children}
                    </code>
                  );
                },
              }}
            >
              {file.content}
            </ReactMarkdown>
          </div>
        </GlassCard>

        {/* Back to Explore */}
        <div className="mt-8 text-center">
          <Button variant="ghost" asChild className="text-white">
            <Link href="/explore">← Back to Explore</Link>
          </Button>
        </div>
      </div>
    </div>
  );
}
