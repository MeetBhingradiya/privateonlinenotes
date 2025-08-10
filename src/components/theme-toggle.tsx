'use client'

import { useTheme } from 'next-themes'
import { IconButton } from '@/components/ui/button'
import { Icon } from '@iconify/react'

export function ThemeToggle() {
    const { theme, setTheme } = useTheme()

    return (
        <IconButton
            variant="outline"
            size="icon"
            onClick={() => setTheme(theme === 'light' ? 'dark' : 'light')}
            tooltip="Toggle theme"
        >
            <Icon
                icon={theme === 'light' ? 'material-symbols:dark-mode' : 'material-symbols:light-mode'}
                width={20}
                height={20}
                className="transition-all"
            />
        </IconButton>
    )
}
