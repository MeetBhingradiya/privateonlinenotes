'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { ArrowLeft, Save, Eye, Globe, Lock, Users } from 'lucide-react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { GlassCard } from '@/components/ui/glass-card';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import rehypeRaw from 'rehype-raw';
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';
import { atomDark } from 'react-syntax-highlighter/dist/esm/styles/prism';
import toast from 'react-hot-toast';

interface FileData {
  id: string;
  title: string;
  slug: string;
  description: string;
  content: string;
  permission: 'public' | 'unlisted' | 'private';
  tags: string[];
}

export default function EditFilePage({ params }: { params: Promise<{ slug: string }> }) {
  const router = useRouter();
  const [file, setFile] = useState<FileData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [isPreview, setIsPreview] = useState(false);
  
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    content: '',
    permission: 'private' as 'public' | 'unlisted' | 'private',
    tags: [] as string[],
    tagsInput: ''
  });

  useEffect(() => {
    const fetchFile = async (slug: string) => {
      try {
        const response = await fetch(`/api/files/by-slug/${slug}`);
        const data = await response.json();

        if (response.ok) {
          setFile(data.file);
          setFormData({
            title: data.file.title,
            description: data.file.description || '',
            content: data.content || '',
            permission: data.file.permission,
            tags: data.file.tags || [],
            tagsInput: (data.file.tags || []).join(', ')
          });
        } else if (response.status === 401) {
          router.push('/auth/login');
        } else {
          toast.error(data.error || 'File not found');
          router.push('/dashboard');
        }
      } catch (error) {
        console.error('Error fetching file:', error);
        toast.error('Failed to load file');
        router.push('/dashboard');
      } finally {
        setIsLoading(false);
      }
    };

    const initializePage = async () => {
      const { slug } = await params;
      fetchFile(slug);
    };
    initializePage();
  }, [params, router]);

  const handleSave = async () => {
    if (!formData.title.trim() || !formData.content.trim()) {
      toast.error('Title and content are required');
      return;
    }

    setIsSaving(true);
    try {
      const tags = formData.tagsInput
        .split(',')
        .map(tag => tag.trim())
        .filter(tag => tag.length > 0);

      const response = await fetch(`/api/files/${file?.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title: formData.title.trim(),
          description: formData.description.trim(),
          content: formData.content,
          permission: formData.permission,
          tags: tags
        }),
      });

      const data = await response.json();

      if (response.ok) {
        toast.success('File updated successfully!');
        router.push(`/file/${data.file.slug}`);
      } else {
        toast.error(data.error || 'Failed to update file');
      }
    } catch (error) {
      console.error('Error updating file:', error);
      toast.error('Failed to update file');
    } finally {
      setIsSaving(false);
    }
  };

  const getPermissionIcon = (permission: string) => {
    switch (permission) {
      case 'public': return <Globe className="h-4 w-4" />;
      case 'unlisted': return <Users className="h-4 w-4" />;
      case 'private': return <Lock className="h-4 w-4" />;
      default: return <Lock className="h-4 w-4" />;
    }
  };

  if (isLoading) {
    return (
      <div className="container mx-auto px-4 py-16">
        <div className="text-center">
          <div className="animate-spin h-12 w-12 border-4 border-white/20 border-t-white rounded-full mx-auto mb-4"></div>
          <p className="text-white/70">Loading file...</p>
        </div>
      </div>
    );
  }

  if (!file) {
    return (
      <div className="container mx-auto px-4 py-16">
        <div className="max-w-2xl mx-auto text-center">
          <h1 className="text-2xl font-bold text-white mb-4">File Not Found</h1>
          <p className="text-white/70 mb-6">
            The file you&apos;re looking for doesn&apos;t exist or you don&apos;t have permission to edit it.
          </p>
          <Button variant="glass" asChild>
            <Link href="/dashboard">Back to Dashboard</Link>
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-4">
            <Button variant="ghost" asChild className="text-white">
              <Link href="/dashboard">
                <ArrowLeft className="h-4 w-4 mr-2" />
                Back to Dashboard
              </Link>
            </Button>
            <h1 className="text-2xl font-bold text-white">Edit Note</h1>
          </div>
          
          <div className="flex gap-3">
            <Button
              variant="ghost"
              onClick={() => setIsPreview(!isPreview)}
              className="text-white"
            >
              <Eye className="h-4 w-4 mr-2" />
              {isPreview ? 'Edit' : 'Preview'}
            </Button>
            <Button
              variant="glass"
              onClick={handleSave}
              disabled={isSaving}
            >
              <Save className="h-4 w-4 mr-2" />
              {isSaving ? 'Saving...' : 'Save Changes'}
            </Button>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2">
            {isPreview ? (
              <GlassCard className="p-6">
                <h2 className="text-2xl font-bold text-white mb-4">{formData.title}</h2>
                {formData.description && (
                  <p className="text-white/70 mb-6">{formData.description}</p>
                )}
                <div className="prose prose-invert max-w-none">
                  <ReactMarkdown
                    remarkPlugins={[remarkGfm]}
                    rehypePlugins={[rehypeRaw]}
                    components={{
                      code({ className, children, ...props }: { className?: string; children?: React.ReactNode; [key: string]: any }) {
                        const match = /language-(\w+)/.exec(className || '');
                        return match ? (
                          <SyntaxHighlighter
                            style={atomDark as Record<string, React.CSSProperties>}
                            language={match[1]}
                            PreTag="div"
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
                    {formData.content}
                  </ReactMarkdown>
                </div>
              </GlassCard>
            ) : (
              <div className="space-y-6">
                <GlassCard className="p-6">
                  <div className="space-y-4">
                    <div>
                      <label htmlFor="title" className="block text-sm font-medium text-white mb-2">
                        Title *
                      </label>
                      <Input
                        id="title"
                        value={formData.title}
                        onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
                        placeholder="Enter note title..."
                        className="w-full"
                      />
                    </div>

                    <div>
                      <label htmlFor="description" className="block text-sm font-medium text-white mb-2">
                        Description
                      </label>
                      <Textarea
                        id="description"
                        value={formData.description}
                        onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                        placeholder="Brief description of your note..."
                        rows={3}
                        className="w-full"
                      />
                    </div>
                  </div>
                </GlassCard>

                <GlassCard className="p-6">
                  <div>
                    <label htmlFor="content" className="block text-sm font-medium text-white mb-2">
                      Content (Markdown) *
                    </label>
                    <Textarea
                      id="content"
                      value={formData.content}
                      onChange={(e) => setFormData(prev => ({ ...prev, content: e.target.value }))}
                      placeholder="Write your note content in Markdown..."
                      rows={20}
                      className="w-full font-mono"
                    />
                  </div>
                </GlassCard>
              </div>
            )}
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            <GlassCard className="p-6">
              <h3 className="text-lg font-semibold text-white mb-4">Settings</h3>
              
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-white mb-2">
                    Visibility
                  </label>
                  <div className="space-y-2">
                    {[
                      { value: 'private', label: 'Private', desc: 'Only you can see this' },
                      { value: 'unlisted', label: 'Unlisted', desc: 'Anyone with link can view' },
                      { value: 'public', label: 'Public', desc: 'Visible to everyone' }
                    ].map(option => (
                      <label key={option.value} className="flex items-start gap-3 cursor-pointer">
                        <input
                          type="radio"
                          name="permission"
                          value={option.value}
                          checked={formData.permission === option.value}
                          onChange={(e) => setFormData(prev => ({ 
                            ...prev, 
                            permission: e.target.value as 'public' | 'unlisted' | 'private'
                          }))}
                          className="mt-1"
                        />
                        <div>
                          <div className="flex items-center gap-2 text-white">
                            {getPermissionIcon(option.value)}
                            <span className="font-medium">{option.label}</span>
                          </div>
                          <p className="text-white/60 text-sm">{option.desc}</p>
                        </div>
                      </label>
                    ))}
                  </div>
                </div>

                <div>
                  <label htmlFor="tags" className="block text-sm font-medium text-white mb-2">
                    Tags
                  </label>
                  <Input
                    id="tags"
                    value={formData.tagsInput}
                    onChange={(e) => setFormData(prev => ({ ...prev, tagsInput: e.target.value }))}
                    placeholder="javascript, tutorial, web-dev"
                    className="w-full"
                  />
                  <p className="text-white/60 text-xs mt-1">
                    Separate tags with commas
                  </p>
                </div>
              </div>
            </GlassCard>

            <GlassCard className="p-6">
              <h3 className="text-lg font-semibold text-white mb-4">File Info</h3>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-white/60">Slug:</span>
                  <span className="text-white">{file.slug}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-white/60">Current URL:</span>
                  <Link 
                    href={`/file/${file.slug}`}
                    className="text-blue-400 hover:text-blue-300 transition-colors truncate"
                    target="_blank"
                  >
                    /file/{file.slug}
                  </Link>
                </div>
              </div>
            </GlassCard>
          </div>
        </div>
      </div>
    </div>
  );
}
