import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import nodemailer from 'nodemailer';
import { NextRequest } from 'next/server';
import connectDB from '@/lib/mongodb';
import User from '@/models/User';

const JWT_SECRET = process.env.JWT_SECRET!;
const EMAIL_CONFIG = {
  host: process.env.EMAIL_HOST,
  port: parseInt(process.env.EMAIL_PORT || '587'),
  secure: false,
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
};

export async function hashPassword(password: string): Promise<string> {
  const saltRounds = 12;
  return bcrypt.hash(password, saltRounds);
}

export async function comparePassword(password: string, hash: string): Promise<boolean> {
  return bcrypt.compare(password, hash);
}

export function generateToken(payload: Record<string, any>, expiresIn: string = '7d'): string {
  return jwt.sign(payload, JWT_SECRET, { expiresIn } as jwt.SignOptions);
}

export function verifyToken(token: string): Record<string, any> | null {
  try {
    return jwt.verify(token, JWT_SECRET) as Record<string, any>;
  } catch {
    return null;
  }
}

export async function sendEmail(to: string, subject: string, html: string): Promise<boolean> {
  try {
    const transporter = nodemailer.createTransport(EMAIL_CONFIG);
    
    await transporter.sendMail({
      from: process.env.EMAIL_FROM,
      to,
      subject,
      html,
    });
    
    return true;
  } catch (error) {
    console.error('Email sending failed:', error);
    return false;
  }
}

export async function sendOTPEmail(email: string, otp: string): Promise<boolean> {
  const subject = 'Your OTP Code - PrivateOnlineNotes';
  const html = `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
      <h2 style="color: #333;">Your OTP Code</h2>
      <p>Hi there,</p>
      <p>Your one-time password (OTP) code is:</p>
      <div style="background: #f5f5f5; padding: 20px; text-align: center; font-size: 24px; font-weight: bold; letter-spacing: 2px; margin: 20px 0;">
        ${otp}
      </div>
      <p>This code will expire in 10 minutes.</p>
      <p>If you didn't request this code, please ignore this email.</p>
      <p>Best regards,<br>The PrivateOnlineNotes Team</p>
    </div>
  `;
  
  return sendEmail(email, subject, html);
}

export async function sendPasswordResetEmail(email: string, resetToken: string): Promise<boolean> {
  const resetUrl = `${process.env.NEXT_PUBLIC_APP_URL}/auth/reset-password?token=${resetToken}`;
  const subject = 'Reset Your Password - PrivateOnlineNotes';
  const html = `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
      <h2 style="color: #333;">Reset Your Password</h2>
      <p>Hi there,</p>
      <p>You requested to reset your password. Click the button below to set a new password:</p>
      <div style="text-align: center; margin: 30px 0;">
        <a href="${resetUrl}" style="background: #007bff; color: white; padding: 12px 24px; text-decoration: none; border-radius: 5px; display: inline-block;">
          Reset Password
        </a>
      </div>
      <p>Or copy and paste this link in your browser:</p>
      <p style="word-break: break-all; color: #666;">${resetUrl}</p>
      <p>This link will expire in 1 hour.</p>
      <p>If you didn't request a password reset, please ignore this email.</p>
      <p>Best regards,<br>The PrivateOnlineNotes Team</p>
    </div>
  `;
  
  return sendEmail(email, subject, html);
}

export async function sendEmailVerification(email: string, verificationToken: string): Promise<boolean> {
  const verifyUrl = `${process.env.NEXT_PUBLIC_APP_URL}/auth/verify-email?token=${verificationToken}`;
  const subject = 'Verify Your Email - PrivateOnlineNotes';
  const html = `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
      <h2 style="color: #333;">Verify Your Email</h2>
      <p>Hi there,</p>
      <p>Thanks for signing up! Please verify your email address by clicking the button below:</p>
      <div style="text-align: center; margin: 30px 0;">
        <a href="${verifyUrl}" style="background: #28a745; color: white; padding: 12px 24px; text-decoration: none; border-radius: 5px; display: inline-block;">
          Verify Email
        </a>
      </div>
      <p>Or copy and paste this link in your browser:</p>
      <p style="word-break: break-all; color: #666;">${verifyUrl}</p>
      <p>This link will expire in 24 hours.</p>
      <p>If you didn't create an account, please ignore this email.</p>
      <p>Best regards,<br>The PrivateOnlineNotes Team</p>
    </div>
  `;
  
  return sendEmail(email, subject, html);
}

export async function getUserFromToken(request: NextRequest) {
  try {
    const token = request.cookies.get('auth-token')?.value || 
                  request.headers.get('authorization')?.replace('Bearer ', '');
    
    if (!token) {
      return null;
    }

    const decoded = verifyToken(token);
    if (!decoded || !decoded.userId) {
      return null;
    }

    await connectDB();
    const user = await User.findById(decoded.userId);
    return user;
  } catch (error) {
    console.error('Error getting user from token:', error);
    return null;
  }
}
