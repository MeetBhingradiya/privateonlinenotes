'use client';

import { useState, useEffect } from 'react';
import { User, Lock, Eye, EyeOff, Trash2, Save } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { GlassCard } from '@/components/ui/glass-card';
import { ThemeToggle } from '@/components/ui/theme-toggle';
import toast from 'react-hot-toast';

interface UserProfile {
  id: string;
  name: string;
  email: string;
  isEmailVerified: boolean;
  createdAt: string;
}

export default function SettingsPage() {
  const [user, setUser] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  
  const [profileForm, setProfileForm] = useState({
    name: '',
    email: '',
  });

  const [passwordForm, setPasswordForm] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: '',
    showCurrentPassword: false,
    showNewPassword: false,
    showConfirmPassword: false,
  });

  useEffect(() => {
    fetchUserProfile();
  }, []);

  const fetchUserProfile = async () => {
    try {
      const response = await fetch('/api/user/profile');
      const data = await response.json();

      if (response.ok) {
        setUser(data.user);
        setProfileForm({
          name: data.user.name,
          email: data.user.email,
        });
      } else if (response.status === 401) {
        window.location.href = '/auth/login';
      }
    } catch (error) {
      console.error('Error fetching profile:', error);
      toast.error('Failed to load profile');
    } finally {
      setLoading(false);
    }
  };

  const handleProfileUpdate = async () => {
    if (!profileForm.name.trim() || !profileForm.email.trim()) {
      toast.error('Name and email are required');
      return;
    }

    setIsSaving(true);
    try {
      const response = await fetch('/api/user/profile', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: profileForm.name.trim(),
          email: profileForm.email.trim(),
        }),
      });

      const data = await response.json();

      if (response.ok) {
        setUser(prev => prev ? { ...prev, name: data.user.name, email: data.user.email } : null);
        toast.success('Profile updated successfully!');
      } else {
        toast.error(data.error || 'Failed to update profile');
      }
    } catch (error) {
      console.error('Error updating profile:', error);
      toast.error('Failed to update profile');
    } finally {
      setIsSaving(false);
    }
  };

  const handlePasswordUpdate = async () => {
    if (!passwordForm.currentPassword || !passwordForm.newPassword || !passwordForm.confirmPassword) {
      toast.error('All password fields are required');
      return;
    }

    if (passwordForm.newPassword !== passwordForm.confirmPassword) {
      toast.error('New passwords do not match');
      return;
    }

    if (passwordForm.newPassword.length < 8) {
      toast.error('New password must be at least 8 characters long');
      return;
    }

    setIsSaving(true);
    try {
      const response = await fetch('/api/user/password', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          currentPassword: passwordForm.currentPassword,
          newPassword: passwordForm.newPassword,
        }),
      });

      const data = await response.json();

      if (response.ok) {
        setPasswordForm({
          currentPassword: '',
          newPassword: '',
          confirmPassword: '',
          showCurrentPassword: false,
          showNewPassword: false,
          showConfirmPassword: false,
        });
        toast.success('Password updated successfully!');
      } else {
        toast.error(data.error || 'Failed to update password');
      }
    } catch (error) {
      console.error('Error updating password:', error);
      toast.error('Failed to update password');
    } finally {
      setIsSaving(false);
    }
  };

  const handleDeleteAccount = async () => {
    try {
      const response = await fetch('/api/user/account', {
        method: 'DELETE',
      });

      const data = await response.json();

      if (response.ok) {
        toast.success('Account deleted successfully');
        window.location.href = '/';
      } else {
        toast.error(data.error || 'Failed to delete account');
      }
    } catch (error) {
      console.error('Error deleting account:', error);
      toast.error('Failed to delete account');
    }
  };

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-16">
        <div className="text-center">
          <div className="animate-spin h-12 w-12 border-4 border-white/20 border-t-white rounded-full mx-auto mb-4"></div>
          <p className="text-white/70">Loading settings...</p>
        </div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="container mx-auto px-4 py-16">
        <div className="max-w-2xl mx-auto text-center">
          <h1 className="text-2xl font-bold text-white mb-4">Authentication Required</h1>
          <p className="text-white/70 mb-6">
            Please sign in to access your settings.
          </p>
          <Button variant="glass" onClick={() => window.location.href = '/auth/login'}>
            Sign In
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-16">
      <div className="max-w-4xl mx-auto">
        <div className="mb-12">
          <h1 className="text-4xl font-bold text-white mb-2">Settings</h1>
          <p className="text-white/70">
            Manage your account settings and preferences
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-8">
            {/* Profile Settings */}
            <GlassCard className="p-6">
              <h2 className="text-xl font-semibold text-white mb-6 flex items-center">
                <User className="h-5 w-5 mr-2" />
                Profile Information
              </h2>

              <div className="space-y-4">
                <div>
                  <label htmlFor="name" className="block text-sm font-medium text-white mb-2">
                    Name
                  </label>
                  <Input
                    id="name"
                    value={profileForm.name}
                    onChange={(e) => setProfileForm(prev => ({ ...prev, name: e.target.value }))}
                    placeholder="Your name"
                    className="w-full"
                  />
                </div>

                <div>
                  <label htmlFor="email" className="block text-sm font-medium text-white mb-2">
                    Email
                  </label>
                  <Input
                    id="email"
                    type="email"
                    value={profileForm.email}
                    onChange={(e) => setProfileForm(prev => ({ ...prev, email: e.target.value }))}
                    placeholder="your.email@example.com"
                    className="w-full"
                  />
                  {!user.isEmailVerified && (
                    <p className="text-yellow-400 text-sm mt-1">
                      Email not verified. Check your inbox for verification email.
                    </p>
                  )}
                </div>

                <Button
                  variant="glass"
                  onClick={handleProfileUpdate}
                  disabled={isSaving}
                  className="w-full sm:w-auto"
                >
                  <Save className="h-4 w-4 mr-2" />
                  {isSaving ? 'Saving...' : 'Save Changes'}
                </Button>
              </div>
            </GlassCard>

            {/* Password Settings */}
            <GlassCard className="p-6">
              <h2 className="text-xl font-semibold text-white mb-6 flex items-center">
                <Lock className="h-5 w-5 mr-2" />
                Change Password
              </h2>

              <div className="space-y-4">
                <div>
                  <label htmlFor="currentPassword" className="block text-sm font-medium text-white mb-2">
                    Current Password
                  </label>
                  <div className="relative">
                    <Input
                      id="currentPassword"
                      type={passwordForm.showCurrentPassword ? 'text' : 'password'}
                      value={passwordForm.currentPassword}
                      onChange={(e) => setPasswordForm(prev => ({ ...prev, currentPassword: e.target.value }))}
                      placeholder="Enter current password"
                      className="w-full pr-10"
                    />
                    <button
                      type="button"
                      onClick={() => setPasswordForm(prev => ({ ...prev, showCurrentPassword: !prev.showCurrentPassword }))}
                      className="absolute right-3 top-1/2 transform -translate-y-1/2 text-white/50 hover:text-white"
                    >
                      {passwordForm.showCurrentPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                    </button>
                  </div>
                </div>

                <div>
                  <label htmlFor="newPassword" className="block text-sm font-medium text-white mb-2">
                    New Password
                  </label>
                  <div className="relative">
                    <Input
                      id="newPassword"
                      type={passwordForm.showNewPassword ? 'text' : 'password'}
                      value={passwordForm.newPassword}
                      onChange={(e) => setPasswordForm(prev => ({ ...prev, newPassword: e.target.value }))}
                      placeholder="Enter new password"
                      className="w-full pr-10"
                    />
                    <button
                      type="button"
                      onClick={() => setPasswordForm(prev => ({ ...prev, showNewPassword: !prev.showNewPassword }))}
                      className="absolute right-3 top-1/2 transform -translate-y-1/2 text-white/50 hover:text-white"
                    >
                      {passwordForm.showNewPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                    </button>
                  </div>
                </div>

                <div>
                  <label htmlFor="confirmPassword" className="block text-sm font-medium text-white mb-2">
                    Confirm New Password
                  </label>
                  <div className="relative">
                    <Input
                      id="confirmPassword"
                      type={passwordForm.showConfirmPassword ? 'text' : 'password'}
                      value={passwordForm.confirmPassword}
                      onChange={(e) => setPasswordForm(prev => ({ ...prev, confirmPassword: e.target.value }))}
                      placeholder="Confirm new password"
                      className="w-full pr-10"
                    />
                    <button
                      type="button"
                      onClick={() => setPasswordForm(prev => ({ ...prev, showConfirmPassword: !prev.showConfirmPassword }))}
                      className="absolute right-3 top-1/2 transform -translate-y-1/2 text-white/50 hover:text-white"
                    >
                      {passwordForm.showConfirmPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                    </button>
                  </div>
                </div>

                <Button
                  variant="glass"
                  onClick={handlePasswordUpdate}
                  disabled={isSaving}
                  className="w-full sm:w-auto"
                >
                  <Lock className="h-4 w-4 mr-2" />
                  {isSaving ? 'Updating...' : 'Update Password'}
                </Button>
              </div>
            </GlassCard>

            {/* Danger Zone */}
            <GlassCard className="p-6 border border-red-500/20">
              <h2 className="text-xl font-semibold text-red-400 mb-6 flex items-center">
                <Trash2 className="h-5 w-5 mr-2" />
                Danger Zone
              </h2>

              <div className="space-y-4">
                <div>
                  <h3 className="text-lg font-medium text-white mb-2">Delete Account</h3>
                  <p className="text-white/70 mb-4">
                    Permanently delete your account and all associated data. This action cannot be undone.
                  </p>
                  
                  {showDeleteConfirm ? (
                    <div className="space-y-3">
                      <p className="text-red-400 font-medium">
                        Are you sure you want to delete your account? This will permanently delete all your files and data.
                      </p>
                      <div className="flex gap-3">
                        <Button
                          variant="destructive"
                          onClick={handleDeleteAccount}
                          className="bg-red-600 hover:bg-red-700"
                        >
                          Yes, Delete My Account
                        </Button>
                        <Button
                          variant="ghost"
                          onClick={() => setShowDeleteConfirm(false)}
                          className="text-white"
                        >
                          Cancel
                        </Button>
                      </div>
                    </div>
                  ) : (
                    <Button
                      variant="destructive"
                      onClick={() => setShowDeleteConfirm(true)}
                      className="bg-red-600 hover:bg-red-700"
                    >
                      <Trash2 className="h-4 w-4 mr-2" />
                      Delete Account
                    </Button>
                  )}
                </div>
              </div>
            </GlassCard>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            <GlassCard className="p-6">
              <h3 className="text-lg font-semibold text-white mb-4">Preferences</h3>
              
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-white mb-2">
                    Theme
                  </label>
                  <ThemeToggle />
                </div>
              </div>
            </GlassCard>

            <GlassCard className="p-6">
              <h3 className="text-lg font-semibold text-white mb-4">Account Info</h3>
              
              <div className="space-y-3 text-sm">
                <div className="flex justify-between">
                  <span className="text-white/60">Member since:</span>
                  <span className="text-white">
                    {new Date(user.createdAt).toLocaleDateString()}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-white/60">Email status:</span>
                  <span className={user.isEmailVerified ? 'text-green-400' : 'text-yellow-400'}>
                    {user.isEmailVerified ? 'Verified' : 'Unverified'}
                  </span>
                </div>
              </div>
            </GlassCard>
          </div>
        </div>
      </div>
    </div>
  );
}
