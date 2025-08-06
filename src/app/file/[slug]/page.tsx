import { notFound } from 'next/navigation';
import { Metadata } from 'next';
import connectDB from '@/lib/mongodb';
import File from '@/models/File';
import FileContent, { IFileContent } from '@/models/FileContent';
import FileViewer from '@/components/file/file-viewer';

interface FilePageProps {
  params: Promise<{
    slug: string;
  }>;
}

interface FileWithContent {
  _id: string;
  title: string;
  slug: string;
  description?: string;
  permission: 'public' | 'unlisted' | 'private';
  tags: string[];
  isAnonymous: boolean;
  isPinned: boolean;
  viewCount: number;
  fileSize: number;
  createdAt: Date;
  updatedAt: Date;
  content: string;
  author?: {
    name: string;
  };
  anonymousAuthor?: {
    name: string;
  };
}

async function getFile(slug: string): Promise<FileWithContent | null> {
  try {
    await connectDB();
    
    const file = await File.findOne({ slug, isDeleted: false })
      .populate('author', 'name')
      .lean() as any;

    if (!file) {
      return null;
    }

    const fileContent = await FileContent.findOne({ fileId: file._id })
      .sort({ version: -1 })
      .lean() as IFileContent | null;

    if (!fileContent) {
      return null;
    }

    // Increment view count
    await File.findByIdAndUpdate(file._id, {
      $inc: { viewCount: 1 },
      lastViewedAt: new Date(),
    });

    // Convert all ObjectId fields to strings
    const plainFile = {
      ...file,
      _id: file._id.toString(),
      author: file.author ? {
        _id: file.author._id?.toString(),
        name: file.author.name
      } : undefined,
      content: fileContent.content,
    };

    // Remove any undefined fields to ensure clean serialization
    if (!plainFile.author) {
      delete plainFile.author;
    }

    return plainFile as FileWithContent;
  } catch (error) {
    console.error('Error fetching file:', error);
    return null;
  }
}

export async function generateMetadata({ params }: FilePageProps): Promise<Metadata> {
  const { slug } = await params;
  const file = await getFile(slug);

  if (!file) {
    return {
      title: 'File Not Found',
    };
  }

  return {
    title: `${file.title} - PrivateOnlineNotes`,
    description: file.description || `Read "${file.title}" on PrivateOnlineNotes`,
    openGraph: {
      title: file.title,
      description: file.description || `Read "${file.title}" on PrivateOnlineNotes`,
      type: 'article',
      url: `${process.env.NEXT_PUBLIC_APP_URL}/file/${file.slug}`,
    },
    twitter: {
      card: 'summary_large_image',
      title: file.title,
      description: file.description || `Read "${file.title}" on PrivateOnlineNotes`,
    },
  };
}

export default async function FilePage({ params }: FilePageProps) {
  const { slug } = await params;
  const file = await getFile(slug);

  if (!file) {
    notFound();
  }

  // Check if file is accessible
  if (file.permission === 'private') {
    // In a real app, you'd check authentication here
    // For now, we'll show an access denied message
    return (
      <div className="container mx-auto px-4 py-16">
        <div className="max-w-2xl mx-auto text-center">
          <h1 className="text-2xl font-bold text-white mb-4">Access Denied</h1>
          <p className="text-white/70">
            This file is private and requires authentication to view.
          </p>
        </div>
      </div>
    );
  }

  return <FileViewer file={{
    _id: file._id,
    title: file.title,
    slug: file.slug,
    description: file.description,
    permission: file.permission,
    tags: file.tags,
    author: file.author,
    anonymousAuthor: file.anonymousAuthor,
    isAnonymous: file.isAnonymous,
    viewCount: file.viewCount,
    fileSize: file.content.length,
    createdAt: file.createdAt.toISOString(),
    updatedAt: file.updatedAt.toISOString(),
    content: file.content,
  }} />;
}
