import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import User from '@/models/User';
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

    return NextResponse.json({
      success: true,
      user: {
        id: user._id.toString(),
        name: user.name,
        email: user.email,
        isEmailVerified: user.isEmailVerified,
        createdAt: user.createdAt.toISOString(),
      }
    });

  } catch (error) {
    console.error('Error fetching user profile:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function PUT(request: NextRequest) {
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

    const { name, email } = await request.json();

    // Validate input
    if (!name?.trim() || !email?.trim()) {
      return NextResponse.json(
        { error: 'Name and email are required' },
        { status: 400 }
      );
    }

    // Check if email is already taken by another user
    if (email.toLowerCase() !== user.email.toLowerCase()) {
      const existingUser = await User.findOne({ 
        email: email.toLowerCase(),
        _id: { $ne: user._id }
      });

      if (existingUser) {
        return NextResponse.json(
          { error: 'Email already taken' },
          { status: 400 }
        );
      }

      // Mark email as unverified if changed
      user.isEmailVerified = false;
    }

    // Update user
    user.name = name.trim();
    user.email = email.toLowerCase().trim();
    user.updatedAt = new Date();
    await user.save();

    return NextResponse.json({
      success: true,
      message: 'Profile updated successfully',
      user: {
        id: user._id.toString(),
        name: user.name,
        email: user.email,
        isEmailVerified: user.isEmailVerified,
      }
    });

  } catch (error) {
    console.error('Error updating user profile:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
