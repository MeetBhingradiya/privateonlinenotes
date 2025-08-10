import type { Metadata } from 'next'
import './globals.css'
import { ThemeProvider } from '@/components/providers/theme-provider'
import { AuthProvider } from '@/components/providers/auth-provider'
import { TooltipProvider } from '@/components/ui/tooltip'
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
                {/* Animated background elements */}
                <div className="fixed inset-0 -z-10 overflow-hidden">
                    <div className="absolute top-1/4 left-1/4 w-72 h-72 bg-blue-400/30 rounded-full blur-3xl animate-pulse"></div>
                    <div className="absolute top-3/4 right-1/4 w-96 h-96 bg-purple-400/20 rounded-full blur-3xl animate-pulse delay-1000"></div>
                    <div className="absolute bottom-1/4 left-1/3 w-80 h-80 bg-cyan-400/25 rounded-full blur-3xl animate-pulse delay-2000"></div>
                </div>
                
                <ThemeProvider attribute="class" defaultTheme="system" enableSystem>
                    <TooltipProvider>
                        <AuthProvider>
                            {children}
                            <Toaster position="top-right" />
                        </AuthProvider>
                    </TooltipProvider>
                </ThemeProvider>
            </body>
        </html>
    )
}
