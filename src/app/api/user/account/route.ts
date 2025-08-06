import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import User from '@/models/User';
import File from '@/models/File';
import FileContent from '@/models/FileContent';
import { getUserFromToken } from '@/lib/auth';

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

    // Delete all user's files and content
    const userFiles = await File.find({ author: user._id }).select('_id');
    const fileIds = userFiles.map((file: Record<string, any>) => file._id);

    await Promise.all([
      File.deleteMany({ author: user._id }),
      FileContent.deleteMany({ fileId: { $in: fileIds } }),
      User.deleteOne({ _id: user._id })
    ]);

    return NextResponse.json({
      success: true,
      message: 'Account deleted successfully'
    });

  } catch (error) {
    console.error('Error deleting account:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
