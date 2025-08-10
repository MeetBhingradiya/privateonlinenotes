import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

export function middleware(request: NextRequest) {
    const { pathname } = request.nextUrl

    // Allow access to auth pages and share pages
    if (
        pathname.startsWith('/auth/') ||
        pathname.startsWith('/share/') ||
        pathname.startsWith('/api/auth/') ||
        pathname.startsWith('/api/anonymous/') ||
        pathname.startsWith('/api/contact') ||
        pathname.startsWith('/api/payments/') ||
        pathname.startsWith('/api/admin/') ||
        pathname.startsWith('/_next/') ||
        pathname.startsWith('/favicon.ico') ||
        pathname === '/' ||
        pathname === '/terms' ||
        pathname === '/privacy' ||
        pathname === '/pricing' ||
        pathname === '/contact' ||
        pathname === '/anonymous' ||
        pathname === '/sitemap.xml'
    ) {
        return NextResponse.next()
    }

    // Check for authentication token
    const token = request.cookies.get('token')?.value

    if (!token) {
        return NextResponse.redirect(new URL('/auth/login', request.url))
    }

    // For simplicity, we'll just check if token exists
    // JWT verification will be done in API routes
    try {
        // Simple token format check
        if (!token || token.split('.').length !== 3) {
            throw new Error('Invalid token format')
        }
        return NextResponse.next()
    } catch {
        // Token is invalid, redirect to login
        const response = NextResponse.redirect(new URL('/auth/login', request.url))
        response.cookies.delete('token')
        return response
    }
}

export const config = {
    matcher: [
        /*
         * Match all request paths except for the ones starting with:
         * - api (API routes)
         * - _next/static (static files)
         * - _next/image (image optimization files)
         * - favicon.ico (favicon file)
         */
        '/((?!api|_next/static|_next/image|favicon.ico).*)',
    ],
}
