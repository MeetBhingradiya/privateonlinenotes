import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import User from '@/models/User';
import { sendEmail } from '@/lib/auth';
import crypto from 'crypto';

export async function POST(request: NextRequest) {
  try {
    await connectDB();

    const { email } = await request.json();

    if (!email) {
      return NextResponse.json(
        { error: 'Email address is required' },
        { status: 400 }
      );
    }

    // Find user by email
    const user = await User.findOne({ email: email.toLowerCase() });

    if (!user) {
      return NextResponse.json(
        { error: 'No account found with this email address' },
        { status: 404 }
      );
    }

    if (user.isEmailVerified) {
      return NextResponse.json(
        { error: 'Email is already verified' },
        { status: 400 }
      );
    }

    // Generate new verification token
    const verificationToken = crypto.randomBytes(32).toString('hex');
    const verificationExpires = new Date(Date.now() + 24 * 60 * 60 * 1000); // 24 hours

    // Update user with new token
    user.emailVerificationToken = verificationToken;
    user.emailVerificationExpires = verificationExpires;
    await user.save();

    // Send verification email
    const verificationUrl = `${process.env.NEXT_PUBLIC_APP_URL}/auth/verify-email?token=${verificationToken}&email=${encodeURIComponent(email)}`;
    
    const emailHtml = `
      <div style="max-width: 600px; margin: 0 auto; font-family: Arial, sans-serif;">
        <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); padding: 40px; text-align: center;">
          <h1 style="color: white; margin: 0; font-size: 28px;">PrivateOnlineNotes</h1>
        </div>
        <div style="padding: 40px; background: #f8f9fa;">
          <h2 style="color: #333; margin-bottom: 20px;">Verify Your Email Address</h2>
          <p style="color: #666; line-height: 1.6; margin-bottom: 30px;">
            Hi ${user.name},<br><br>
            Thank you for registering with PrivateOnlineNotes! Please click the button below to verify your email address and activate your account.
          </p>
          <div style="text-align: center; margin: 30px 0;">
            <a href="${verificationUrl}" style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 15px 30px; text-decoration: none; border-radius: 8px; font-weight: bold; display: inline-block;">
              Verify Email Address
            </a>
          </div>
          <p style="color: #999; font-size: 14px; margin-top: 30px;">
            If the button doesn't work, copy and paste this link into your browser:<br>
            <a href="${verificationUrl}" style="color: #667eea; word-break: break-all;">${verificationUrl}</a>
          </p>
          <p style="color: #999; font-size: 14px; margin-top: 20px;">
            This verification link will expire in 24 hours. If you didn't request this email, you can safely ignore it.
          </p>
        </div>
        <div style="padding: 20px; text-align: center; background: #e9ecef; color: #666; font-size: 12px;">
          <p>&copy; ${new Date().getFullYear()} PrivateOnlineNotes. All rights reserved.</p>
        </div>
      </div>
    `;

    const emailSent = await sendEmail(
      email,
      'Verify Your Email Address - PrivateOnlineNotes',
      emailHtml
    );

    if (!emailSent) {
      return NextResponse.json(
        { error: 'Failed to send verification email. Please try again.' },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      message: 'Verification email sent successfully'
    });

  } catch (error) {
    console.error('Resend verification email error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
