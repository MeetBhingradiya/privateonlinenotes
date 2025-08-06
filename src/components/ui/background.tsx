'use client';

import { useTheme } from '@/components/providers/theme-provider';

export function Background({ children }: { children: React.ReactNode }) {
  const { resolvedTheme } = useTheme();

  return (
    <div className={`min-h-screen transition-colors duration-300 ${
      resolvedTheme === 'dark' 
        ? 'bg-slate-900' 
        : 'bg-slate-50'
    }`}>
      {/* Gradient overlay for title/highlighted areas */}
      <div className="absolute inset-0 bg-gradient-to-br from-blue-500/5 via-purple-500/5 to-pink-500/5 pointer-events-none" />
      
      {/* Content */}
      <div className="relative z-10">
        {children}
      </div>
    </div>
  );
}
