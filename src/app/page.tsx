import Link from 'next/link';
import { ArrowRight, Shield, FileText, Users, Zap, Lock, Eye, Globe, EyeOff } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { GlassCard } from '@/components/ui/glass-card';

export default function HomePage() {
  return (
    <div className="container mx-auto px-6 py-20">
      {/* Hero Section */}
      <div className="text-center mb-24">
        <h1 className="text-4xl md:text-6xl font-bold text-slate-900 dark:text-white mb-8 leading-tight">
          Share Your Ideas
          <span className="block bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 bg-clip-text text-transparent mt-2">
            Securely & Beautifully
          </span>
        </h1>
        <p className="text-lg md:text-xl text-slate-600 dark:text-slate-300 mb-10 max-w-3xl mx-auto leading-relaxed">
          Create, share, and collaborate on markdown documents with advanced privacy controls,
          stunning design, and seamless user experience.
        </p>
        
        <div className="flex flex-col sm:flex-row gap-6 justify-center items-center mb-16">
          <Button size="lg" className="min-w-[200px]" asChild>
            <Link href="/auth/register" className='flex items-center'>
              Get Started Free
              <ArrowRight className="ml-2 h-5 w-5" />
            </Link>
          </Button>
          <Button size="lg" variant="outline" className="min-w-[200px]" asChild>
            <Link href="/explore">
              Explore Public Notes
            </Link>
          </Button>
        </div>

        {/* Advertisement Placeholder */}
        <div className="mb-20">
          <p className="text-slate-400 dark:text-slate-500 text-xs mb-4">Advertisement</p>
          <GlassCard className="max-w-4xl mx-auto">
            <div className="p-6">
              <div id="google-adsense-hero" className="min-h-[90px]">
                {process.env.NODE_ENV === 'development' && (
                  <div className="border-2 border-dashed border-slate-300 dark:border-slate-600 rounded p-6 text-center text-slate-400 dark:text-slate-500">
                    <p>Google AdSense Placeholder</p>
                    <p className="text-xs mt-1">Leaderboard Ad (728x90)</p>
                  </div>
                )}
              </div>
            </div>
          </GlassCard>
        </div>
      </div>

      {/* Features Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 mb-24">
        <GlassCard hover className="p-8">
          <Shield className="h-12 w-12 text-blue-500 mb-6" />
          <h3 className="text-xl font-semibold text-slate-900 dark:text-white mb-4">Privacy First</h3>
          <p className="text-slate-600 dark:text-slate-300 leading-relaxed">
            Three privacy levels: Public, Unlisted, and Private. You control who sees your content.
          </p>
        </GlassCard>

        <GlassCard hover className="p-8">
          <FileText className="h-12 w-12 text-green-500 mb-6" />
          <h3 className="text-xl font-semibold text-slate-900 dark:text-white mb-4">Markdown Support</h3>
          <p className="text-slate-600 dark:text-slate-300 leading-relaxed">
            Full markdown support with syntax highlighting, tables, and rich formatting.
          </p>
        </GlassCard>

        <GlassCard hover className="p-8">
          <Users className="h-12 w-12 text-purple-500 mb-6" />
          <h3 className="text-xl font-semibold text-slate-900 dark:text-white mb-4">Anonymous Sharing</h3>
          <p className="text-slate-600 dark:text-slate-300 leading-relaxed">
            Share without creating an account. Perfect for quick notes and temporary sharing.
          </p>
        </GlassCard>

        <GlassCard hover className="p-8">
          <Zap className="h-12 w-12 text-yellow-500 mb-6" />
          <h3 className="text-xl font-semibold text-slate-900 dark:text-white mb-4">Lightning Fast</h3>
          <p className="text-slate-600 dark:text-slate-300 leading-relaxed">
            Built with Next.js 15 and optimized for speed. Your content loads instantly.
          </p>
        </GlassCard>

        <GlassCard hover className="p-8">
          <Lock className="h-12 w-12 text-red-500 mb-6" />
          <h3 className="text-xl font-semibold text-slate-900 dark:text-white mb-4">Secure Authentication</h3>
          <p className="text-slate-600 dark:text-slate-300 leading-relaxed">
            Multiple auth methods including email OTP, passwords, and modern passkeys.
          </p>
        </GlassCard>

        <GlassCard hover className="p-8">
          <Eye className="h-12 w-12 text-indigo-500 mb-6" />
          <h3 className="text-xl font-semibold text-slate-900 dark:text-white mb-4">Beautiful Design</h3>
          <p className="text-slate-600 dark:text-slate-300 leading-relaxed">
            Modern glass-morphism design with dark/light themes and smooth animations.
          </p>
        </GlassCard>
      </div>

      {/* Privacy Levels Section */}
      <div className="text-center mb-20">
        <h2 className="text-4xl font-bold text-slate-900 dark:text-white mb-12">Choose Your Privacy Level</h2>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <GlassCard hover className="p-8">
            <Globe className="h-16 w-16 text-green-500 mx-auto mb-6" />
            <h3 className="text-2xl font-semibold text-slate-900 dark:text-white mb-4">Public</h3>
            <p className="text-slate-600 dark:text-slate-300 mb-6">
              Visible to everyone and discoverable through search and explore pages.
            </p>
            <ul className="text-slate-500 dark:text-slate-400 text-sm space-y-2">
              <li>• Appears in public listings</li>
              <li>• Searchable by everyone</li>
              <li>• Shareable via direct link</li>
            </ul>
          </GlassCard>

          <GlassCard hover className="p-8">
            <EyeOff className="h-16 w-16 text-yellow-500 mx-auto mb-6" />
            <h3 className="text-2xl font-semibold text-slate-900 dark:text-white mb-4">Unlisted</h3>
            <p className="text-slate-600 dark:text-slate-300 mb-6">
              Only accessible via direct link. Hidden from public discovery.
            </p>
            <ul className="text-slate-500 dark:text-slate-400 text-sm space-y-2">
              <li>• Hidden from public listings</li>
              <li>• Accessible via link only</li>
              <li>• Perfect for sharing with teams</li>
            </ul>
          </GlassCard>

          <GlassCard hover className="p-8">
            <Lock className="h-16 w-16 text-red-500 mx-auto mb-6" />
            <h3 className="text-2xl font-semibold text-slate-900 dark:text-white mb-4">Private</h3>
            <p className="text-slate-600 dark:text-slate-300 mb-6">
              Only visible to you. Requires authentication to access.
            </p>
            <ul className="text-slate-500 dark:text-slate-400 text-sm space-y-2">
              <li>• Only you can access</li>
              <li>• Requires login to view</li>
              <li>• Maximum privacy protection</li>
            </ul>
          </GlassCard>
        </div>
      </div>

      {/* CTA Section */}
      <div className="text-center">
        <GlassCard className="p-12 max-w-4xl mx-auto">
          <h2 className="text-3xl font-bold text-slate-900 dark:text-white mb-6">
            Ready to Start Sharing?
          </h2>
          <p className="text-xl text-slate-600 dark:text-slate-300 mb-8">
            Join thousands of users who trust PrivateOnlineNotes for their content sharing needs.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button size="lg" asChild>
              <Link href="/auth/register">
                Create Free Account
              </Link>
            </Button>
            <Button size="lg" variant="outline" asChild>
              <Link href="/create">
                Start Writing Anonymously
              </Link>
            </Button>
          </div>
        </GlassCard>
      </div>
    </div>
  );
}
