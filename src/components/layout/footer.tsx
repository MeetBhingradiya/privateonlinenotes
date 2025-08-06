'use client';

import Link from 'next/link';
import { FileText, Github, Twitter, Mail } from 'lucide-react';
import { GlassCard } from '@/components/ui/glass-card';

export function Footer() {
  return (
    <footer className="mt-24">
      <GlassCard className="mx-4 mb-6 rounded-t-none md:rounded-t-xl">
        <div className="container mx-auto px-6 py-12">
          {/* Advertisement Placeholder */}
          <div className="mb-12">
            <div className="text-center">
              <p className="text-slate-400 dark:text-slate-500 text-xs mb-4">Advertisement</p>
              <div className="bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg p-6 min-h-[100px] flex items-center justify-center">
                <div className="text-slate-400 dark:text-slate-500 text-sm">
                  {/* Google AdSense code will be inserted here */}
                  <div id="google-adsense-footer" className="min-h-[90px]">
                    {process.env.NODE_ENV === 'development' && (
                      <div className="border-2 border-dashed border-slate-300 dark:border-slate-600 rounded p-4 text-center">
                        <p>Google AdSense Placeholder</p>
                        <p className="text-xs mt-1">728x90 Banner Ad</p>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-4 gap-10">
            {/* Brand */}
            <div className="col-span-1 md:col-span-2">
              <div className="flex items-center space-x-2 mb-6">
                <FileText className="h-6 w-6 text-slate-700 dark:text-slate-300" />
                <span className="text-lg font-bold text-slate-900 dark:text-white">
                  PrivateOnlineNotes
                </span>
              </div>
              <p className="text-slate-600 dark:text-slate-300 text-sm mb-6 max-w-md leading-relaxed">
                A modern, secure platform for sharing markdown files with advanced 
                privacy controls and beautiful design. Create, share, and collaborate seamlessly.
              </p>
              <div className="flex items-center space-x-4">
                <a
                  href="https://github.com"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 transition-colors"
                >
                  <Github className="h-5 w-5" />
                </a>
                <a
                  href="https://twitter.com"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 transition-colors"
                >
                  <Twitter className="h-5 w-5" />
                </a>
                <a
                  href="mailto:support@privateonlinenotes.com"
                  className="text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 transition-colors"
                >
                  <Mail className="h-5 w-5" />
                </a>
              </div>
            </div>

            {/* Quick Links */}
            <div>
              <h3 className="text-slate-900 dark:text-white font-semibold mb-6">Quick Links</h3>
              <ul className="space-y-3">
                <li>
                  <Link
                    href="/explore"
                    className="text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white transition-colors text-sm"
                  >
                    Explore Notes
                  </Link>
                </li>
                <li>
                  <Link
                    href="/create"
                    className="text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white transition-colors text-sm"
                  >
                    Create Note
                  </Link>
                </li>
                <li>
                  <Link
                    href="/dashboard"
                    className="text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white transition-colors text-sm"
                  >
                    Dashboard
                  </Link>
                </li>
                <li>
                  <Link
                    href="/auth/register"
                    className="text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white transition-colors text-sm"
                  >
                    Sign Up
                  </Link>
                </li>
              </ul>
            </div>

            {/* Legal */}
            <div>
              <h3 className="text-slate-900 dark:text-white font-semibold mb-6">Legal & Support</h3>
              <ul className="space-y-3">
                <li>
                  <Link
                    href="/privacy"
                    className="text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white transition-colors text-sm"
                  >
                    Privacy Policy
                  </Link>
                </li>
                <li>
                  <Link
                    href="/terms"
                    className="text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white transition-colors text-sm"
                  >
                    Terms of Service
                  </Link>
                </li>
                <li>
                  <Link
                    href="/contact"
                    className="text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white transition-colors text-sm"
                  >
                    Contact Us
                  </Link>
                </li>
                <li>
                  <Link
                    href="/docs"
                    className="text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white transition-colors text-sm"
                  >
                    Documentation
                  </Link>
                </li>
              </ul>
            </div>
          </div>

          {/* Bottom Bar */}
          <div className="mt-12 pt-8 border-t border-slate-200 dark:border-slate-700">
            <div className="flex flex-col md:flex-row justify-between items-center">
              <p className="text-slate-500 dark:text-slate-400 text-sm">
                © 2025 PrivateOnlineNotes. All rights reserved.
              </p>
              <p className="text-slate-400 dark:text-slate-500 text-xs mt-2 md:mt-0">
                Made with ❤️ using Next.js & Tailwind CSS
              </p>
            </div>
          </div>
        </div>
      </GlassCard>
    </footer>
  );
}
