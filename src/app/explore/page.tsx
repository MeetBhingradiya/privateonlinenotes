'use client';

import { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';
import { Search, Filter, FileText, Eye, Clock, User } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { GlassCard } from '@/components/ui/glass-card';
import { formatFileSize, getRelativeTime } from '@/lib/utils';

interface File {
  id: string;
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
}

export default function ExplorePage() {
  const [files, setFiles] = useState<File[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedTags, setSelectedTags] = useState<string[]>([]);
  const [hasMore, setHasMore] = useState(true);
  const [offset, setOffset] = useState(0);

  const fetchFiles = useCallback(async (isLoadMore = false) => {
    try {
      const params = new URLSearchParams({
        permission: 'public',
        limit: '12',
        offset: isLoadMore ? offset.toString() : '0',
      });

      if (searchTerm) {
        params.append('search', searchTerm);
      }

      if (selectedTags.length > 0) {
        params.append('tags', selectedTags.join(','));
      }

      const response = await fetch(`/api/files?${params}`);
      const data = await response.json();

      if (response.ok) {
        if (isLoadMore) {
          setFiles(prev => [...prev, ...data.files]);
        } else {
          setFiles(data.files);
          setOffset(0);
        }
        setHasMore(data.hasMore);
        setOffset(prev => isLoadMore ? prev + data.files.length : data.files.length);
      }
    } catch (error) {
      console.error('Error fetching files:', error);
    } finally {
      setLoading(false);
    }
  }, [searchTerm, selectedTags, offset]);

  useEffect(() => {
    fetchFiles();
  }, [searchTerm, selectedTags, fetchFiles]);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    fetchFiles();
  };

  const toggleTag = (tag: string) => {
    setSelectedTags(prev => 
      prev.includes(tag) 
        ? prev.filter(t => t !== tag)
        : [...prev, tag]
    );
  };

  // Get all unique tags from files
  const allTags = Array.from(
    new Set(files.flatMap(file => file.tags))
  ).slice(0, 20); // Show only first 20 tags

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-16">
        <div className="text-center">
          <div className="animate-spin h-12 w-12 border-4 border-white/20 border-t-white rounded-full mx-auto mb-4"></div>
          <p className="text-white/70">Loading public notes...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-16">
      <div className="text-center mb-12">
        <h1 className="text-4xl font-bold text-white mb-4">Explore Public Notes</h1>
        <p className="text-white/70 max-w-2xl mx-auto">
          Discover amazing content shared by our community. Find tutorials, guides, 
          stories, and more created by users around the world.
        </p>
      </div>

      {/* Search and Filters */}
      <div className="max-w-4xl mx-auto mb-12">
        <GlassCard className="p-6">
          <form onSubmit={handleSearch} className="mb-6">
            <div className="flex gap-3">
              <div className="flex-1 relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-white/50" />
                <Input
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  placeholder="Search notes by title or description..."
                  className="pl-11"
                />
              </div>
              <Button type="submit" variant="glass">
                <Search className="h-4 w-4" />
              </Button>
            </div>
          </form>

          {/* Tags Filter */}
          {allTags.length > 0 && (
            <div>
              <div className="flex items-center gap-2 mb-3">
                <Filter className="h-4 w-4 text-white/70" />
                <span className="text-white/70 text-sm">Filter by tags:</span>
              </div>
              <div className="flex flex-wrap gap-2">
                {allTags.map(tag => (
                  <button
                    key={tag}
                    onClick={() => toggleTag(tag)}
                    className={`px-3 py-1 rounded-full text-sm transition-colors ${
                      selectedTags.includes(tag)
                        ? 'bg-white/20 text-white'
                        : 'bg-white/5 text-white/70 hover:bg-white/10 hover:text-white'
                    }`}
                  >
                    #{tag}
                  </button>
                ))}
              </div>
            </div>
          )}
        </GlassCard>
      </div>

      {/* Advertisement */}
      <div className="max-w-4xl mx-auto mb-12">
        <p className="text-white/40 text-xs mb-2 text-center">Advertisement</p>
        <GlassCard className="p-4">
          <div id="google-adsense-explore" className="min-h-[90px] bg-white/5 rounded flex items-center justify-center">
            {process.env.NODE_ENV === 'development' && (
              <div className="border-2 border-dashed border-white/20 rounded p-4 text-center text-white/40">
                <p>Google AdSense Placeholder</p>
                <p className="text-xs mt-1">Leaderboard Ad (728x90)</p>
              </div>
            )}
          </div>
        </GlassCard>
      </div>

      {/* Files Grid */}
      {files.length === 0 ? (
        <div className="text-center py-16">
          <FileText className="h-16 w-16 text-white/30 mx-auto mb-4" />
          <h3 className="text-xl font-semibold text-white mb-2">No notes found</h3>
          <p className="text-white/70 mb-6">
            {searchTerm || selectedTags.length > 0
              ? 'Try adjusting your search criteria'
              : 'Be the first to share a public note!'}
          </p>
          <Button variant="glass" asChild>
            <Link href="/create">Create First Note</Link>
          </Button>
        </div>
      ) : (
        <>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-12">
            {files.map((file) => (
              <GlassCard key={file.id} hover className="p-6">
                <div className="flex flex-col h-full">
                  <div className="flex-1">
                    <h3 className="text-lg font-semibold text-white mb-2 line-clamp-2">
                      <Link 
                        href={`/file/${file.slug}`}
                        className="hover:text-blue-300 transition-colors"
                      >
                        {file.title}
                      </Link>
                    </h3>
                    
                    {file.description && (
                      <p className="text-white/70 text-sm mb-3 line-clamp-3">
                        {file.description}
                      </p>
                    )}

                    {file.tags.length > 0 && (
                      <div className="flex flex-wrap gap-1 mb-3">
                        {file.tags.slice(0, 3).map(tag => (
                          <span
                            key={tag}
                            className="px-2 py-1 bg-white/10 text-white/70 text-xs rounded-full"
                          >
                            #{tag}
                          </span>
                        ))}
                        {file.tags.length > 3 && (
                          <span className="px-2 py-1 text-white/50 text-xs">
                            +{file.tags.length - 3} more
                          </span>
                        )}
                      </div>
                    )}
                  </div>

                  <div className="pt-4 border-t border-white/10">
                    <div className="flex items-center justify-between text-white/60 text-xs mb-2">
                      <div className="flex items-center gap-1">
                        <User className="h-3 w-3" />
                        <span>
                          {file.isAnonymous 
                            ? (file.anonymousAuthor?.name || 'Anonymous')
                            : file.author?.name || 'Unknown'
                          }
                        </span>
                      </div>
                      <div className="flex items-center gap-1">
                        <Clock className="h-3 w-3" />
                        <span>{getRelativeTime(new Date(file.createdAt))}</span>
                      </div>
                    </div>

                    <div className="flex items-center justify-between text-white/50 text-xs">
                      <div className="flex items-center gap-1">
                        <Eye className="h-3 w-3" />
                        <span>{file.viewCount} views</span>
                      </div>
                      <span>{formatFileSize(file.fileSize)}</span>
                    </div>
                  </div>
                </div>
              </GlassCard>
            ))}
          </div>

          {/* Load More Button */}
          {hasMore && (
            <div className="text-center">
              <Button
                variant="glass"
                onClick={() => fetchFiles(true)}
                disabled={loading}
              >
                {loading ? 'Loading...' : 'Load More'}
              </Button>
            </div>
          )}
        </>
      )}
    </div>
  );
}
