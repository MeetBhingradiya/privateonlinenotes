import { NextRequest, NextResponse } from 'next/server';
import mongoose from 'mongoose';
import connectDB from '@/lib/mongodb';
import File, { IFile } from '@/models/File';
import FileContent, { IFileContent } from '@/models/FileContent';
import { getUserFromToken } from '@/lib/auth';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ slug: string }> }
) {
  try {
    await connectDB();

    // Get user from token
    const user = await getUserFromToken(request);
    if (!user) {
      return NextResponse.json(
        { error: 'Authentication required' },
        { status: 401 }
      );
    }

    // Await params to get the actual values
    const { slug } = await params;

    // Find the file by slug and user
    const file = await File.findOne({
      slug: slug,
      author: user._id
    }).lean() as (IFile & { _id: mongoose.Types.ObjectId }) | null;

    if (!file) {
      return NextResponse.json(
        { error: 'File not found or access denied' },
        { status: 404 }
      );
    }

    // Get file content
    const fileContent = await FileContent.findOne({
      fileId: file._id
    }).lean() as IFileContent | null;

    return NextResponse.json({
      success: true,
      file: {
        id: file._id.toString(),
        title: file.title,
        slug: file.slug,
        description: file.description,
        permission: file.permission,
        tags: file.tags,
        isPinned: file.isPinned,
        viewCount: file.viewCount,
        createdAt: file.createdAt.toISOString(),
        updatedAt: file.updatedAt.toISOString(),
      },
      content: fileContent?.content || ''
    });

  } catch (error) {
    console.error('Error fetching file by slug:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
