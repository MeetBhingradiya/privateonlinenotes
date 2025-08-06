import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import File from '@/models/File';
import FileContent from '@/models/FileContent';
import { getUserFromToken } from '@/lib/auth';

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
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
    const { id } = await params;

    // Find the file
    const file = await File.findOne({
      _id: id,
      author: user._id
    });

    if (!file) {
      return NextResponse.json(
        { error: 'File not found' },
        { status: 404 }
      );
    }

    // Delete the file and its content
    await Promise.all([
      File.deleteOne({ _id: id, author: user._id }),
      FileContent.deleteOne({ fileId: id })
    ]);

    return NextResponse.json({
      success: true,
      message: 'File deleted successfully',
      deletedFile: {
        id: file._id.toString(),
        title: file.title,
        slug: file.slug
      }
    });

  } catch (error) {
    console.error('Error deleting file:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
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

    const { title, description, content, permission, tags } = await request.json();

    // Validate required fields
    if (!title || !content) {
      return NextResponse.json(
        { error: 'Title and content are required' },
        { status: 400 }
      );
    }

    // Await params to get the actual values
    const { id } = await params;

    // Find the file
    const file = await File.findOne({
      _id: id,
      author: user._id
    });

    if (!file) {
      return NextResponse.json(
        { error: 'File not found' },
        { status: 404 }
      );
    }

    // Update file metadata
    file.title = title;
    file.description = description || '';
    file.permission = permission || 'private';
    file.tags = tags || [];
    file.updatedAt = new Date();
    await file.save();

    // Update file content
    await FileContent.findOneAndUpdate(
      { fileId: file._id },
      { 
        content: content,
        updatedAt: new Date()
      },
      { upsert: true }
    );

    return NextResponse.json({
      success: true,
      message: 'File updated successfully',
      file: {
        id: file._id.toString(),
        title: file.title,
        slug: file.slug,
        description: file.description,
        permission: file.permission,
        tags: file.tags,
        updatedAt: file.updatedAt.toISOString()
      }
    });

  } catch (error) {
    console.error('Error updating file:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
