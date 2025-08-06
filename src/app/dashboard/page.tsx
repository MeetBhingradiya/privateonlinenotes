'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { Plus, FileText, Settings, Trash2, Edit, Pin, PinOff } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { GlassCard } from '@/components/ui/glass-card';
import { getRelativeTime, formatFileSize } from '@/lib/utils';

interface DashboardFile {
  id: string;
  title: string;
  slug: string;
  description?: string;
  permission: 'public' | 'unlisted' | 'private';
  isPinned: boolean;
  tags: string[];
  fileSize: number;
  viewCount: number;
  createdAt: string;
  updatedAt: string;
}

const getPermissionColor = (permission: string) => {
  switch (permission) {
    case 'public': return 'text-green-400';
    case 'unlisted': return 'text-yellow-400';
    case 'private': return 'text-red-400';
    default: return 'text-white';
  }
};

export default function DashboardPage() {
  const [files, setFiles] = useState<DashboardFile[]>([]);
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState<{ name: string; email: string } | null>(null);
  const [selectedFiles, setSelectedFiles] = useState<Set<string>>(new Set());
  const [isDeleting, setIsDeleting] = useState(false);

  useEffect(() => {
    fetchUserFiles();
  }, []);

  const fetchUserFiles = async () => {
    try {
      const response = await fetch('/api/user/files');
      const data = await response.json();

      if (response.ok) {
        setFiles(data.files);
        setUser(data.user);
      } else if (response.status === 401) {
        // User not authenticated
        window.location.href = '/auth/login';
      }
    } catch (error) {
      console.error('Error fetching files:', error);
    } finally {
      setLoading(false);
    }
  };

  const handlePinToggle = async (fileId: string, isPinned: boolean) => {
    try {
      const response = await fetch(`/api/files/${fileId}/pin`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ isPinned: !isPinned }),
      });

      if (response.ok) {
        setFiles(prev => prev.map(file => 
          file.id === fileId ? { ...file, isPinned: !isPinned } : file
        ));
      }
    } catch (error) {
      console.error('Error toggling pin:', error);
    }
  };

  const handleDelete = async (fileId: string) => {
    if (!confirm('Are you sure you want to delete this file?')) return;

    try {
      const response = await fetch(`/api/files/${fileId}`, {
        method: 'DELETE',
      });

      if (response.ok) {
        setFiles(prev => prev.filter(file => file.id !== fileId));
        setSelectedFiles(prev => {
          const newSet = new Set(prev);
          newSet.delete(fileId);
          return newSet;
        });
      }
    } catch (error) {
      console.error('Error deleting file:', error);
    }
  };

  const handleBulkDelete = async () => {
    if (selectedFiles.size === 0) return;
    
    if (!confirm(`Are you sure you want to delete ${selectedFiles.size} file(s)?`)) return;

    setIsDeleting(true);
    try {
      const response = await fetch('/api/user/files', {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ fileIds: Array.from(selectedFiles) }),
      });

      if (response.ok) {
        setFiles(prev => prev.filter(file => !selectedFiles.has(file.id)));
        setSelectedFiles(new Set());
      }
    } catch (error) {
      console.error('Error bulk deleting files:', error);
    } finally {
      setIsDeleting(false);
    }
  };

  const handleSelectFile = (fileId: string) => {
    setSelectedFiles(prev => {
      const newSet = new Set(prev);
      if (newSet.has(fileId)) {
        newSet.delete(fileId);
      } else {
        newSet.add(fileId);
      }
      return newSet;
    });
  };

  const handleSelectAll = () => {
    if (selectedFiles.size === files.length) {
      setSelectedFiles(new Set());
    } else {
      setSelectedFiles(new Set(files.map(file => file.id)));
    }
  };

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-16">
        <div className="text-center">
          <div className="animate-spin h-12 w-12 border-4 border-white/20 border-t-white rounded-full mx-auto mb-4"></div>
          <p className="text-white/70">Loading your dashboard...</p>
        </div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="container mx-auto px-4 py-16">
        <div className="max-w-2xl mx-auto text-center">
          <h1 className="text-2xl font-bold text-white mb-4">Authentication Required</h1>
          <p className="text-white/70 mb-6">
            Please sign in to access your dashboard.
          </p>
          <Button variant="glass" asChild>
            <Link href="/auth/login">Sign In</Link>
          </Button>
        </div>
      </div>
    );
  }

  const pinnedFiles = files.filter(file => file.isPinned);
  const unpinnedFiles = files.filter(file => !file.isPinned);

  return (
    <div className="container mx-auto px-4 py-16">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-12">
          <div>
            <h1 className="text-4xl font-bold text-white mb-2">
              Welcome back, {user.name}!
            </h1>
            <p className="text-white/70">
              Manage your notes and track their performance
            </p>
          </div>
          
          <div className="flex gap-3 mt-4 md:mt-0">
            {selectedFiles.size > 0 && (
              <>
                <Button
                  variant="destructive"
                  onClick={handleBulkDelete}
                  disabled={isDeleting}
                  className="bg-red-600 hover:bg-red-700"
                >
                  <Trash2 className="h-4 w-4 mr-2" />
                  {isDeleting ? 'Deleting...' : `Delete ${selectedFiles.size}`}
                </Button>
                <Button
                  variant="ghost"
                  onClick={() => setSelectedFiles(new Set())}
                  className="text-white"
                >
                  Cancel
                </Button>
              </>
            )}
            <Button variant="glass" asChild>
              <Link href="/create">
                <Plus className="h-4 w-4 mr-2" />
                New Note
              </Link>
            </Button>
            <Button variant="ghost" asChild className="text-white">
              <Link href="/settings">
                <Settings className="h-4 w-4 mr-2" />
                Settings
              </Link>
            </Button>
          </div>
        </div>

        {/* Bulk Actions Bar */}
        {files.length > 0 && (
          <div className="mb-6">
            <GlassCard className="p-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={selectedFiles.size === files.length && files.length > 0}
                      onChange={handleSelectAll}
                      className="rounded"
                    />
                    <span className="text-white/70 text-sm">
                      {selectedFiles.size === 0 
                        ? 'Select all' 
                        : `${selectedFiles.size} of ${files.length} selected`
                      }
                    </span>
                  </label>
                </div>
                
                {selectedFiles.size > 0 && (
                  <div className="flex gap-2">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={handleBulkDelete}
                      disabled={isDeleting}
                      className="text-red-400 hover:text-red-300"
                    >
                      <Trash2 className="h-4 w-4 mr-1" />
                      Delete Selected
                    </Button>
                  </div>
                )}
              </div>
            </GlassCard>
          </div>
        )}

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
          <GlassCard className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-white/70 text-sm">Total Notes</p>
                <p className="text-2xl font-bold text-white">{files.length}</p>
              </div>
              <FileText className="h-8 w-8 text-blue-400" />
            </div>
          </GlassCard>

          <GlassCard className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-white/70 text-sm">Total Views</p>
                <p className="text-2xl font-bold text-white">
                  {files.reduce((sum, file) => sum + file.viewCount, 0)}
                </p>
              </div>
              <div className="h-8 w-8 bg-green-400 rounded-full flex items-center justify-center">
                <span className="text-white text-sm font-bold">👁</span>
              </div>
            </div>
          </GlassCard>

          <GlassCard className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-white/70 text-sm">Pinned Notes</p>
                <p className="text-2xl font-bold text-white">{pinnedFiles.length}</p>
              </div>
              <Pin className="h-8 w-8 text-yellow-400" />
            </div>
          </GlassCard>
        </div>

        {/* Pinned Files */}
        {pinnedFiles.length > 0 && (
          <div className="mb-12">
            <h2 className="text-2xl font-bold text-white mb-6 flex items-center">
              <Pin className="h-6 w-6 mr-2 text-yellow-400" />
              Pinned Notes
            </h2>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {pinnedFiles.map((file) => (
                <FileCard 
                  key={file.id} 
                  file={file} 
                  isSelected={selectedFiles.has(file.id)}
                  onSelect={handleSelectFile}
                  onPinToggle={handlePinToggle}
                  onDelete={handleDelete}
                />
              ))}
            </div>
          </div>
        )}

        {/* All Files */}
        <div>
          <h2 className="text-2xl font-bold text-white mb-6">
            {pinnedFiles.length > 0 ? 'All Notes' : 'Your Notes'}
          </h2>

          {unpinnedFiles.length === 0 && pinnedFiles.length === 0 ? (
            <GlassCard className="p-12 text-center">
              <FileText className="h-16 w-16 text-white/30 mx-auto mb-4" />
              <h3 className="text-xl font-semibold text-white mb-2">No notes yet</h3>
              <p className="text-white/70 mb-6">
                Start creating and sharing your ideas with the world!
              </p>
              <Button variant="glass" asChild>
                <Link href="/create">Create Your First Note</Link>
              </Button>
            </GlassCard>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {unpinnedFiles.map((file) => (
                <FileCard 
                  key={file.id} 
                  file={file} 
                  isSelected={selectedFiles.has(file.id)}
                  onSelect={handleSelectFile}
                  onPinToggle={handlePinToggle}
                  onDelete={handleDelete}
                />
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

function FileCard({ 
  file, 
  isSelected,
  onSelect,
  onPinToggle, 
  onDelete 
}: { 
  file: DashboardFile; 
  isSelected: boolean;
  onSelect: (id: string) => void;
  onPinToggle: (id: string, isPinned: boolean) => void;
  onDelete: (id: string) => void;
}) {
  return (
    <GlassCard hover className="p-6">
      <div className="flex flex-col h-full">
        <div className="flex items-start justify-between mb-3">
          <div className="flex items-start gap-3 flex-1">
            <input
              type="checkbox"
              checked={isSelected}
              onChange={() => onSelect(file.id)}
              className="mt-1 rounded"
            />
            <h3 className="text-lg font-semibold text-white line-clamp-2 flex-1">
              <Link 
                href={`/file/${file.slug}`}
                className="hover:text-blue-300 transition-colors"
              >
                {file.title}
              </Link>
            </h3>
          </div>
          
          <div className="flex gap-1 ml-2">
            <button
              onClick={() => onPinToggle(file.id, file.isPinned)}
              className="p-1 hover:bg-white/10 rounded transition-colors"
              title={file.isPinned ? 'Unpin' : 'Pin'}
            >
              {file.isPinned ? (
                <PinOff className="h-4 w-4 text-yellow-400" />
              ) : (
                <Pin className="h-4 w-4 text-white/50 hover:text-yellow-400" />
              )}
            </button>
            
            <Link
              href={`/edit/${file.slug}`}
              className="p-1 hover:bg-white/10 rounded transition-colors"
              title="Edit"
            >
              <Edit className="h-4 w-4 text-white/50 hover:text-blue-400" />
            </Link>
            
            <button
              onClick={() => onDelete(file.id)}
              className="p-1 hover:bg-white/10 rounded transition-colors"
              title="Delete"
            >
              <Trash2 className="h-4 w-4 text-white/50 hover:text-red-400" />
            </button>
          </div>
        </div>

        {file.description && (
          <p className="text-white/70 text-sm mb-3 line-clamp-2">
            {file.description}
          </p>
        )}

        <div className="flex items-center gap-2 mb-3">
          <span className={`text-xs px-2 py-1 rounded-full bg-white/10 ${getPermissionColor(file.permission)}`}>
            {file.permission}
          </span>
          {file.tags.slice(0, 2).map(tag => (
            <span key={tag} className="text-xs px-2 py-1 rounded-full bg-white/5 text-white/60">
              #{tag}
            </span>
          ))}
          {file.tags.length > 2 && (
            <span className="text-xs text-white/40">+{file.tags.length - 2}</span>
          )}
        </div>

        <div className="mt-auto pt-3 border-t border-white/10">
          <div className="flex items-center justify-between text-white/60 text-xs">
            <span>{getRelativeTime(new Date(file.createdAt))}</span>
            <div className="flex items-center gap-3">
              <span>{file.viewCount} views</span>
              <span>{formatFileSize(file.fileSize)}</span>
            </div>
          </div>
        </div>
      </div>
    </GlassCard>
  );
}
