import type { Metadata } from 'next'
import './globals.css'
import { ThemeProvider } from '@/components/providers/theme-provider'
import { AuthProvider } from '@/components/providers/auth-provider'
import { Toaster } from 'react-hot-toast'

export const metadata: Metadata = {
    title: 'Notta.in - Fast & Secure Note Sharing',
    description: 'Ultimate note sharing platform for students and professionals',
}

export default function RootLayout({
    children,
}: {
    children: React.ReactNode
}) {
    return (
        <html lang="en" suppressHydrationWarning>
            <body>
                <ThemeProvider attribute="class" defaultTheme="system" enableSystem>
                    <AuthProvider>
                        {children}
                        <Toaster position="top-right" />
                    </AuthProvider>
                </ThemeProvider>
            </body>
        </html>
    )
}
