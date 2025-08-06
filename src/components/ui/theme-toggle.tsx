'use client';

import { Moon, Sun, Monitor } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useTheme } from '@/components/providers/theme-provider';
import { cn } from '@/lib/utils';

export function ThemeToggle() {
  const { theme, setTheme } = useTheme();

  const themes = [
    { value: 'light', icon: Sun, label: 'Light' },
    { value: 'dark', icon: Moon, label: 'Dark' },
    { value: 'system', icon: Monitor, label: 'System' },
  ] as const;

  return (
    <div className="flex items-center space-x-1 backdrop-blur-md bg-slate-100/80 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 rounded-lg p-1">
      {themes.map(({ value, icon: Icon, label }) => (
        <Button
          key={value}
          variant="ghost"
          size="sm"
          onClick={() => setTheme(value)}
          className={cn(
            "h-8 w-8 p-0 transition-all duration-200",
            theme === value 
              ? "bg-slate-200 dark:bg-slate-700 text-slate-900 dark:text-slate-100" 
              : "text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-100 hover:bg-slate-200/50 dark:hover:bg-slate-700/50"
          )}
          title={label}
        >
          <Icon className="h-4 w-4" />
        </Button>
      ))}
    </div>
  );
}
