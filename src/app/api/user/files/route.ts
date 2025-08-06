import { NextRequest, NextResponse } from 'next/server';
import mongoose from 'mongoose';
import connectDB from '@/lib/mongodb';
import File, { IFile } from '@/models/File';
import FileContent, { IFileContent } from '@/models/FileContent';
import { getUserFromToken } from '@/lib/auth';

export async function GET(request: NextRequest) {
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

    // Fetch user's files with content size calculation
    const files = await File.find({ author: user._id })
      .sort({ isPinned: -1, updatedAt: -1 })
      .lean() as unknown as (IFile & { _id: mongoose.Types.ObjectId })[];

    // Get file contents to calculate sizes
    const filesWithDetails = await Promise.all(
      files.map(async (file) => {
        const content = await FileContent.findOne({ fileId: file._id }).lean() as IFileContent | null;
        const contentSize = content?.content?.length || 0;

        return {
          id: file._id.toString(),
          title: file.title,
          slug: file.slug,
          description: file.description,
          permission: file.permission,
          isPinned: file.isPinned,
          tags: file.tags,
          fileSize: contentSize,
          viewCount: file.viewCount,
          createdAt: file.createdAt.toISOString(),
          updatedAt: file.updatedAt.toISOString(),
        };
      })
    );

    // Return files with user info
    return NextResponse.json({
      success: true,
      files: filesWithDetails,
      user: {
        id: user._id.toString(),
        name: user.name,
        email: user.email,
      },
    });

  } catch (error) {
    console.error('Error fetching user files:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function DELETE(request: NextRequest) {
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

    const { fileIds } = await request.json();
    
    if (!fileIds || !Array.isArray(fileIds)) {
      return NextResponse.json(
        { error: 'File IDs array is required' },
        { status: 400 }
      );
    }

    // Verify all files belong to the user
    const files = await File.find({
      _id: { $in: fileIds },
      author: user._id
    });

    if (files.length !== fileIds.length) {
      return NextResponse.json(
        { error: 'Some files not found or access denied' },
        { status: 403 }
      );
    }

    // Delete files and their content
    await Promise.all([
      File.deleteMany({ _id: { $in: fileIds }, author: user._id }),
      FileContent.deleteMany({ fileId: { $in: fileIds } })
    ]);

    return NextResponse.json({
      success: true,
      message: `Deleted ${fileIds.length} file(s)`,
      deletedCount: fileIds.length
    });

  } catch (error) {
    console.error('Error bulk deleting files:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
