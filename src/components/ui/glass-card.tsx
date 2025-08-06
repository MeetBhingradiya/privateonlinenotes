import React from 'react';
import { cn } from '@/lib/utils';

interface GlassCardProps {
  children: React.ReactNode;
  className?: string;
  hover?: boolean;
}

export function GlassCard({ children, className, hover = false }: GlassCardProps) {
  return (
    <div
      className={cn(
        'backdrop-blur-md',
        'bg-white/80 dark:bg-slate-800/80',
        'border border-slate-200/50 dark:border-slate-700/50',
        'rounded-xl shadow-lg dark:shadow-xl',
        'transition-all duration-300',
        hover && 'hover:shadow-xl hover:scale-[1.02] hover:bg-white/90 dark:hover:bg-slate-800/90',
        className
      )}
    >
      {children}
    </div>
  );
}

interface GradientBackgroundProps {
  children: React.ReactNode;
  className?: string;
}

export function GradientBackground({ children, className }: GradientBackgroundProps) {
  const gradients = [
    'from-purple-400/20 via-pink-400/20 to-red-400/20',
    'from-blue-400/20 via-purple-400/20 to-pink-400/20',
    'from-green-400/20 via-blue-400/20 to-purple-400/20',
    'from-yellow-400/20 via-red-400/20 to-pink-400/20',
    'from-indigo-400/20 via-purple-400/20 to-pink-400/20',
    'from-teal-400/20 via-blue-400/20 to-indigo-400/20',
  ];

  const randomGradient = gradients[Math.floor(Math.random() * gradients.length)];

  return (
    <div className={cn('relative min-h-screen overflow-hidden', className)}>
      {/* Animated Background Shapes */}
      <div className="absolute inset-0 overflow-hidden">
        <div className={`absolute top-0 -left-4 w-72 h-72 bg-gradient-to-r ${randomGradient} rounded-full mix-blend-multiply filter blur-xl opacity-70 animate-blob`} />
        <div className={`absolute top-0 -right-4 w-72 h-72 bg-gradient-to-r ${gradients[(gradients.indexOf(randomGradient) + 1) % gradients.length]} rounded-full mix-blend-multiply filter blur-xl opacity-70 animate-blob animation-delay-2000`} />
        <div className={`absolute -bottom-8 left-20 w-72 h-72 bg-gradient-to-r ${gradients[(gradients.indexOf(randomGradient) + 2) % gradients.length]} rounded-full mix-blend-multiply filter blur-xl opacity-70 animate-blob animation-delay-4000`} />
      </div>

      {/* Mesh Grid Background */}
      <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHZpZXdCb3g9IjAgMCA2MCA2MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZyBmaWxsPSJub25lIiBmaWxsLXJ1bGU9ImV2ZW5vZGQiPjxnIGZpbGw9IiM5Q0EzQUYiIGZpbGwtb3BhY2l0eT0iMC4xIj48Y2lyY2xlIGN4PSIzMCIgY3k9IjMwIiByPSIxLjUiLz48L2c+PC9nPjwvc3ZnPg==')] opacity-20" />
      
      {/* Content */}
      <div className="relative z-10">
        {children}
      </div>
    </div>
  );
}
