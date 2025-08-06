'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Save, Eye, Lock, Globe, EyeOff } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { GlassCard } from '@/components/ui/glass-card';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import toast from 'react-hot-toast';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';

const createFileSchema = z.object({
  title: z.string().min(1, 'Title is required').max(200, 'Title too long'),
  description: z.string().max(500, 'Description too long').optional(),
  content: z.string().min(1, 'Content is required'),
  permission: z.enum(['public', 'unlisted', 'private']),
  tags: z.string().optional(),
});

type CreateFileForm = z.infer<typeof createFileSchema>;

export default function CreateFilePage() {
  const [isPreview, setIsPreview] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [anonymousName, setAnonymousName] = useState('');
  const router = useRouter();

  const {
    register,
    handleSubmit,
    watch,
    formState: { errors },
  } = useForm<CreateFileForm>({
    resolver: zodResolver(createFileSchema),
    defaultValues: {
      permission: 'private',
    },
  });

  const watchedContent = watch('content', '');
  const watchedPermission = watch('permission');

  const onSubmit = async (data: CreateFileForm) => {
    setIsLoading(true);
    try {
      const tags = data.tags
        ? data.tags.split(',').map(tag => tag.trim()).filter(Boolean)
        : [];

      const payload = {
        ...data,
        tags,
        anonymousName: anonymousName.trim() || undefined,
      };

      const response = await fetch('/api/files', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      const result = await response.json();

      if (response.ok) {
        toast.success('File created successfully!');
        router.push(`/file/${result.slug}`);
      } else {
        toast.error(result.error || 'Failed to create file');
      }
    } catch {
      toast.error('An error occurred. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const permissionOptions = [
    {
      value: 'public',
      label: 'Public',
      description: 'Visible to everyone and discoverable',
      icon: Globe,
      color: 'text-green-400',
    },
    {
      value: 'unlisted',
      label: 'Unlisted',
      description: 'Only accessible via direct link',
      icon: Eye,
      color: 'text-yellow-400',
    },
    {
      value: 'private',
      label: 'Private',
      description: 'Only visible to you',
      icon: Lock,
      color: 'text-red-400',
    },
  ];

  return (
    <div className="container mx-auto px-4 py-16">
      <div className="max-w-6xl mx-auto">
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-white mb-4">Create New Note</h1>
          <p className="text-white/70">
            Share your ideas with the world or keep them private
          </p>
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Main Content */}
            <div className="lg:col-span-2 space-y-6">
              <GlassCard className="p-6">
                <div className="space-y-4">
                  <div>
                    <label className="block text-white font-medium mb-2">
                      Title *
                    </label>
                    <Input
                      {...register('title')}
                      placeholder="Enter a catchy title..."
                      error={errors.title?.message}
                    />
                  </div>

                  <div>
                    <label className="block text-white font-medium mb-2">
                      Description
                    </label>
                    <Input
                      {...register('description')}
                      placeholder="Brief description (optional)"
                      error={errors.description?.message}
                    />
                  </div>

                  <div>
                    <label className="block text-white font-medium mb-2">
                      Tags
                    </label>
                    <Input
                      {...register('tags')}
                      placeholder="Enter tags separated by commas"
                    />
                    <p className="text-white/50 text-xs mt-1">
                      e.g., tutorial, javascript, web-development
                    </p>
                  </div>

                  {/* Anonymous Name Input */}
                  <div>
                    <label className="block text-white font-medium mb-2">
                      Anonymous Name (Optional)
                    </label>
                    <Input
                      value={anonymousName}
                      onChange={(e) => setAnonymousName(e.target.value)}
                      placeholder="Display name for anonymous posts"
                    />
                    <p className="text-white/50 text-xs mt-1">
                      Leave empty to post completely anonymously
                    </p>
                  </div>
                </div>
              </GlassCard>

              {/* Content Editor */}
              <GlassCard className="p-6">
                <div className="flex items-center justify-between mb-4">
                  <label className="text-white font-medium">
                    Content * (Markdown supported)
                  </label>
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    onClick={() => setIsPreview(!isPreview)}
                    className="text-white"
                  >
                    {isPreview ? (
                      <>
                        <EyeOff className="h-4 w-4 mr-2" />
                        Edit
                      </>
                    ) : (
                      <>
                        <Eye className="h-4 w-4 mr-2" />
                        Preview
                      </>
                    )}
                  </Button>
                </div>

                {isPreview ? (
                  <div className="min-h-[400px] p-4 bg-white/5 rounded-lg overflow-auto markdown-content">
                    <ReactMarkdown remarkPlugins={[remarkGfm]}>
                      {watchedContent || '*Start typing to see preview...*'}
                    </ReactMarkdown>
                  </div>
                ) : (
                  <Textarea
                    {...register('content')}
                    placeholder="Start writing your content in Markdown..."
                    className="min-h-[400px] font-mono"
                    error={errors.content?.message}
                  />
                )}
              </GlassCard>
            </div>

            {/* Sidebar */}
            <div className="space-y-6">
              {/* Privacy Settings */}
              <GlassCard className="p-6">
                <h3 className="text-white font-medium mb-4">Privacy Settings</h3>
                <div className="space-y-3">
                  {permissionOptions.map((option) => {
                    const IconComponent = option.icon;
                    return (
                      <label
                        key={option.value}
                        className={`flex items-start space-x-3 p-3 rounded-lg cursor-pointer transition-colors ${
                          watchedPermission === option.value
                            ? 'bg-white/20'
                            : 'hover:bg-white/10'
                        }`}
                      >
                        <input
                          {...register('permission')}
                          type="radio"
                          value={option.value}
                          className="sr-only"
                        />
                        <IconComponent className={`h-5 w-5 mt-0.5 ${option.color}`} />
                        <div className="flex-1">
                          <div className="text-white font-medium">
                            {option.label}
                          </div>
                          <div className="text-white/60 text-sm">
                            {option.description}
                          </div>
                        </div>
                      </label>
                    );
                  })}
                </div>
              </GlassCard>

              {/* Advertisement Placeholder */}
              <GlassCard className="p-4">
                <p className="text-white/40 text-xs mb-2 text-center">Advertisement</p>
                <div id="google-adsense-sidebar" className="min-h-[250px] bg-white/5 rounded flex items-center justify-center">
                  {process.env.NODE_ENV === 'development' && (
                    <div className="border-2 border-dashed border-white/20 rounded p-4 text-center text-white/40 text-sm">
                      <p>Google AdSense</p>
                      <p className="text-xs">Medium Rectangle</p>
                      <p className="text-xs">(300x250)</p>
                    </div>
                  )}
                </div>
              </GlassCard>

              {/* Action Buttons */}
              <div className="space-y-3">
                <Button
                  type="submit"
                  variant="glass"
                  className="w-full"
                  disabled={isLoading}
                >
                  {isLoading ? (
                    'Creating...'
                  ) : (
                    <>
                      <Save className="h-4 w-4 mr-2" />
                      Create Note
                    </>
                  )}
                </Button>
                
                <Button
                  type="button"
                  variant="ghost"
                  className="w-full text-white"
                  onClick={() => router.back()}
                >
                  Cancel
                </Button>
              </div>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
}
