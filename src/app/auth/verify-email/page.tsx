'use client';

import { useState, useEffect, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { CheckCircle, XCircle, Mail, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { GlassCard } from '@/components/ui/glass-card';
import toast from 'react-hot-toast';

function VerifyEmailContent() {
  const [isVerifying, setIsVerifying] = useState(false);
  const [verificationStatus, setVerificationStatus] = useState<'pending' | 'success' | 'error' | 'expired'>('pending');
  const [message, setMessage] = useState('');
  const [isResending, setIsResending] = useState(false);
  const router = useRouter();
  const searchParams = useSearchParams();
  const token = searchParams.get('token');
  const email = searchParams.get('email');

  useEffect(() => {
    if (token) {
      verifyEmail(token);
    }
  }, [token]);

  const verifyEmail = async (verificationToken: string) => {
    setIsVerifying(true);
    try {
      const response = await fetch('/api/auth/verify-email', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ token: verificationToken }),
      });

      const result = await response.json();

      if (response.ok) {
        setVerificationStatus('success');
        setMessage('Your email has been successfully verified! You can now sign in to your account.');
        toast.success('Email verified successfully!');
      } else if (response.status === 400 && result.error?.includes('expired')) {
        setVerificationStatus('expired');
        setMessage('Your verification token has expired. Please request a new verification email.');
      } else {
        setVerificationStatus('error');
        setMessage(result.error || 'Verification failed. Please try again.');
        toast.error(result.error || 'Verification failed');
      }
    } catch (error) {
      console.error('Verification error:', error);
      setVerificationStatus('error');
      setMessage('An error occurred during verification. Please try again.');
      toast.error('Verification failed');
    } finally {
      setIsVerifying(false);
    }
  };

  const resendVerificationEmail = async () => {
    if (!email) {
      toast.error('Email address not found. Please register again.');
      return;
    }

    setIsResending(true);
    try {
      const response = await fetch('/api/auth/resend-verification', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email }),
      });

      const result = await response.json();

      if (response.ok) {
        toast.success('Verification email sent! Please check your inbox.');
        setMessage('A new verification email has been sent. Please check your inbox and spam folder.');
      } else {
        toast.error(result.error || 'Failed to resend verification email');
      }
    } catch (error) {
      console.error('Resend error:', error);
      toast.error('Failed to resend verification email');
    } finally {
      setIsResending(false);
    }
  };

  const getStatusIcon = () => {
    switch (verificationStatus) {
      case 'success':
        return <CheckCircle className="h-16 w-16 text-green-400 mx-auto" />;
      case 'error':
      case 'expired':
        return <XCircle className="h-16 w-16 text-red-400 mx-auto" />;
      case 'pending':
      default:
        return <Mail className="h-16 w-16 text-blue-400 mx-auto" />;
    }
  };

  const getStatusTitle = () => {
    switch (verificationStatus) {
      case 'success':
        return 'Email Verified!';
      case 'error':
        return 'Verification Failed';
      case 'expired':
        return 'Token Expired';
      case 'pending':
      default:
        return token ? 'Verifying Email...' : 'Check Your Email';
    }
  };

  const getStatusMessage = () => {
    if (message) return message;
    
    switch (verificationStatus) {
      case 'pending':
        return token 
          ? 'Please wait while we verify your email address...'
          : 'We\'ve sent a verification link to your email address. Please check your inbox and click the link to verify your account.';
      default:
        return '';
    }
  };

  return (
    <div className="container mx-auto px-4 py-16">
      <div className="max-w-md mx-auto">
        <GlassCard className="p-8 text-center">
          <div className="mb-6">
            {isVerifying ? (
              <Loader2 className="h-16 w-16 text-white/70 mx-auto animate-spin" />
            ) : (
              getStatusIcon()
            )}
          </div>

          <h1 className="text-2xl font-bold text-white mb-4">
            {getStatusTitle()}
          </h1>

          <p className="text-white/70 mb-6 leading-relaxed">
            {getStatusMessage()}
          </p>

          <div className="space-y-4">
            {verificationStatus === 'success' && (
              <Button
                variant="glass"
                className="w-full"
                onClick={() => router.push('/auth/login')}
              >
                Sign In Now
              </Button>
            )}

            {(verificationStatus === 'expired' || verificationStatus === 'error') && email && (
              <Button
                variant="glass"
                className="w-full"
                onClick={resendVerificationEmail}
                disabled={isResending}
              >
                {isResending ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    Sending...
                  </>
                ) : (
                  'Resend Verification Email'
                )}
              </Button>
            )}

            {verificationStatus === 'pending' && !token && (
              <div className="text-sm text-white/60">
                <p className="mb-2">Didn&apos;t receive the email?</p>
                <button
                  onClick={() => router.push('/auth/register')}
                  className="text-white hover:underline"
                >
                  Try registering again
                </button>
                <span className="mx-2">•</span>
                <button
                  onClick={() => toast('Check your spam folder and make sure the email address is correct', { icon: 'ℹ️' })}
                  className="text-white hover:underline"
                >
                  Check spam folder
                </button>
              </div>
            )}

            <div className="pt-4 border-t border-white/20">
              <Link
                href="/auth/login"
                className="text-white/70 hover:text-white text-sm"
              >
                Back to Sign In
              </Link>
            </div>
          </div>
        </GlassCard>

        {!token && (
          <div className="mt-8 text-center">
            <Link
              href="/create"
              className="text-white/70 hover:text-white text-sm"
            >
              Continue as anonymous user
            </Link>
          </div>
        )}
      </div>
    </div>
  );
}

export default function VerifyEmailPage() {
  return (
    <Suspense fallback={
      <div className="container mx-auto px-4 py-16">
        <div className="max-w-md mx-auto">
          <GlassCard className="p-8 text-center">
            <Loader2 className="h-16 w-16 text-white/70 mx-auto animate-spin mb-4" />
            <p className="text-white/70">Loading...</p>
          </GlassCard>
        </div>
      </div>
    }>
      <VerifyEmailContent />
    </Suspense>
  );
}
