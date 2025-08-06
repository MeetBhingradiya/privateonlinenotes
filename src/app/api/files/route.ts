import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import File from '@/models/File';
import FileContent from '@/models/FileContent';
import { generateSlug } from '@/lib/utils';
import { verifyToken } from '@/lib/auth';

export async function POST(request: NextRequest) {
  try {
    await connectDB();
    
    const { title, description, content, permission, tags, anonymousName } = await request.json();

    // Validate input
    if (!title || !content) {
      return NextResponse.json(
        { error: 'Title and content are required' },
        { status: 400 }
      );
    }

    if (!['public', 'unlisted', 'private'].includes(permission)) {
      return NextResponse.json(
        { error: 'Invalid permission level' },
        { status: 400 }
      );
    }

    // Check authentication for private files
    let user = null;
    const authToken = request.cookies.get('auth-token')?.value;
    
    if (authToken) {
      const decoded = verifyToken(authToken);
      if (decoded) {
        user = { id: decoded.userId, email: decoded.email };
      }
    }

    // Private files require authentication
    if (permission === 'private' && !user) {
      return NextResponse.json(
        { error: 'Authentication required for private files' },
        { status: 401 }
      );
    }

    // Generate unique slug
    let slug = generateSlug(title);
    let slugExists = await File.findOne({ slug });
    let counter = 1;
    
    while (slugExists) {
      slug = `${generateSlug(title)}-${counter}`;
      slugExists = await File.findOne({ slug });
      counter++;
    }

    // Create file document
    const fileData = {
      title: title.trim(),
      slug,
      description: description?.trim(),
      permission,
      tags: tags || [],
      isAnonymous: !user,
      ...(user ? { author: user.id } : {}),
      ...(anonymousName && !user ? { anonymousAuthor: { name: anonymousName.trim() } } : {}),
    };

    const file = await File.create(fileData);

    // Create file content
    await FileContent.create({
      fileId: file._id,
      content,
      version: 1,
      size: Buffer.byteLength(content, 'utf-8'),
      checksum: Buffer.from(content).toString('base64').slice(0, 16),
    });

    // Update file size
    file.fileSize = Buffer.byteLength(content, 'utf-8');
    await file.save();

    return NextResponse.json(
      {
        message: 'File created successfully',
        slug: file.slug,
        file: {
          id: file._id,
          title: file.title,
          slug: file.slug,
          permission: file.permission,
          createdAt: file.createdAt,
        },
      },
      { status: 201 }
    );
  } catch (error) {
    console.error('File creation error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function GET(request: NextRequest) {
  try {
    await connectDB();
    
    const { searchParams } = new URL(request.url);
    const permission = searchParams.get('permission');
    const limit = parseInt(searchParams.get('limit') || '10');
    const offset = parseInt(searchParams.get('offset') || '0');
    const search = searchParams.get('search');
    const tags = searchParams.get('tags');

    // Build query
    const query: Record<string, any> = { isDeleted: false };

    if (permission) {
      query.permission = permission;
    } else {
      // Only show public files by default
      query.permission = 'public';
    }

    if (search) {
      query.$or = [
        { title: { $regex: search, $options: 'i' } },
        { description: { $regex: search, $options: 'i' } },
      ];
    }

    if (tags) {
      const tagArray = tags.split(',').map(tag => tag.trim());
      query.tags = { $in: tagArray };
    }

    // Get files
    const files = await File.find(query)
      .populate('author', 'name')
      .sort({ createdAt: -1 })
      .skip(offset)
      .limit(limit)
      .lean();

    const total = await File.countDocuments(query);

    const formattedFiles = files.map((file: Record<string, any>) => ({
      id: file._id,
      title: file.title,
      slug: file.slug,
      description: file.description,
      permission: file.permission,
      tags: file.tags,
      author: file.author ? { name: file.author.name } : null,
      anonymousAuthor: file.anonymousAuthor,
      isAnonymous: file.isAnonymous,
      viewCount: file.viewCount,
      fileSize: file.fileSize,
      createdAt: file.createdAt,
      updatedAt: file.updatedAt,
    }));

    return NextResponse.json({
      files: formattedFiles,
      total,
      hasMore: offset + files.length < total,
    });
  } catch (error) {
    console.error('Files fetch error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
