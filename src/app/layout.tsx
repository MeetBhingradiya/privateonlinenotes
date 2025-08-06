import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { ThemeProvider } from "@/components/providers/theme-provider";
import { ClientHeader } from "@/components/layout/client-header";
import { Footer } from "@/components/layout/footer";
import { Background } from "@/components/ui/background";
import { Toaster } from "react-hot-toast";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "PrivateOnlineNotes - Secure Markdown File Sharing",
  description: "A modern, secure platform for sharing markdown files with advanced privacy controls and beautiful design.",
  keywords: ["markdown", "notes", "file sharing", "privacy", "secure"],
  authors: [{ name: "PrivateOnlineNotes Team" }],
  openGraph: {
    title: "PrivateOnlineNotes - Secure Markdown File Sharing",
    description: "A modern, secure platform for sharing markdown files with advanced privacy controls and beautiful design.",
    type: "website",
    url: process.env.NEXT_PUBLIC_APP_URL,
  },
  twitter: {
    card: "summary_large_image",
    title: "PrivateOnlineNotes - Secure Markdown File Sharing",
    description: "A modern, secure platform for sharing markdown files with advanced privacy controls and beautiful design.",
  },
  robots: "index, follow",
};

export function generateViewport() {
  return {
    width: 'device-width',
    initialScale: 1,
  };
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        {/* Google AdSense */}
        {process.env.NEXT_PUBLIC_GOOGLE_ADSENSE_CLIENT_ID && (
          <script
            async
            src={`https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=${process.env.NEXT_PUBLIC_GOOGLE_ADSENSE_CLIENT_ID}`}
            crossOrigin="anonymous"
          />
        )}
      </head>
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased min-h-screen`}
      >
        <ThemeProvider>
          <Background>
            <ClientHeader />
            <main className="flex-1">
              {children}
            </main>
            <Footer />
          </Background>
          <Toaster
            position="top-right"
            toastOptions={{
              duration: 4000,
              className: 'bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 border border-slate-200 dark:border-slate-700',
            }}
          />
        </ThemeProvider>
      </body>
    </html>
  );
}
