import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import File from '@/models/File';
import { getUserFromToken } from '@/lib/auth';

export async function PATCH(
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

    const { isPinned } = await request.json();
    
    if (typeof isPinned !== 'boolean') {
      return NextResponse.json(
        { error: 'isPinned must be a boolean' },
        { status: 400 }
      );
    }

    // Await params to get the actual values
    const { id } = await params;

    // Find and update the file
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

    file.isPinned = isPinned;
    file.updatedAt = new Date();
    await file.save();

    return NextResponse.json({
      success: true,
      message: isPinned ? 'File pinned' : 'File unpinned',
      file: {
        id: file._id.toString(),
        isPinned: file.isPinned
      }
    });

  } catch (error) {
    console.error('Error toggling pin status:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
