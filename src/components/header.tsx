'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { useRouter, usePathname } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { ThemeToggle } from '@/components/theme-toggle'
import { useAuth } from '@/components/providers/auth-provider'
import { Icon } from '@iconify/react'
import {
    Menu,
    X,
    User,
    Settings,
    LogOut,
    Shield,
    FileText,
    Search,
    Home,
    ArrowLeft,
    Crown,
    Plus,
    Command,
    ChevronDown
} from 'lucide-react'

interface HeaderProps {
    showBackButton?: boolean
    backTo?: string
    title?: string
    className?: string
}

export function Header({ showBackButton = false, backTo = '/', title, className = '' }: HeaderProps) {
    const { user, logout } = useAuth()
    const router = useRouter()
    const pathname = usePathname()
    const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
    const [userMenuOpen, setUserMenuOpen] = useState(false)
    const [scrolled, setScrolled] = useState(false)

    // Handle scroll effect
    useEffect(() => {
        const handleScroll = () => {
            setScrolled(window.scrollY > 20)
        }
        window.addEventListener('scroll', handleScroll)
        return () => window.removeEventListener('scroll', handleScroll)
    }, [])

    // Close mobile menu on route change
    useEffect(() => {
        setMobileMenuOpen(false)
        setUserMenuOpen(false)
    }, [pathname])

    const handleLogout = async () => {
        try {
            await logout()
            router.push('/')
        } catch (error) {
            console.error('Logout failed:', error)
        }
    }

    const navigation = [
        { name: 'Home', href: '/', icon: Home, description: 'Welcome page' },
        { name: 'Explore', href: '/explore', icon: Search, description: 'Discover files' },
        { name: 'Pricing', href: '/pricing', icon: Crown, description: 'View plans' },
        { name: 'Contact', href: '/contact', icon: User, description: 'Get in touch' },
    ]

    const isActivePath = (href: string) => {
        if (href === '/') return pathname === '/'
        return pathname.startsWith(href)
    }

    return (
        <header className={`sticky top-0 z-50 transition-all duration-300 ${
            scrolled 
                ? 'bg-white/95 dark:bg-gray-950/95 backdrop-blur-xl border-b border-gray-200/50 dark:border-gray-800/50 shadow-lg shadow-gray-900/5 dark:shadow-gray-900/20' 
                : 'bg-white/80 dark:bg-gray-950/80 backdrop-blur-xl border-b border-gray-200/30 dark:border-gray-800/30'
        } ${className}`}>
            <div className="container mx-auto px-4 sm:px-6 lg:px-8">
                <div className="flex justify-between items-center h-16 lg:h-18">
                    
                    {/* Left Section */}
                    <div className="flex items-center space-x-4 lg:space-x-6">
                        {/* Back Button */}
                        {showBackButton && (
                            <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => router.push(backTo)}
                                className="hover:bg-gray-100/80 dark:hover:bg-gray-800/80 backdrop-blur-sm rounded-xl transition-all group"
                            >
                                <ArrowLeft className="h-4 w-4 mr-2 group-hover:-translate-x-0.5 transition-transform" />
                                <span className="hidden sm:inline">Back</span>
                            </Button>
                        )}

                        {/* Logo */}
                        <Link href="/" className="flex items-center space-x-3 group">
                            <div className="relative">
                                <div className="h-10 w-10 bg-gradient-to-br from-blue-500 via-purple-600 to-pink-600 rounded-xl flex items-center justify-center shadow-lg group-hover:shadow-xl transition-all duration-300 group-hover:scale-105">
                                    <Icon icon="material-symbols:note-stack" className="h-6 w-6 text-white" />
                                </div>
                                <div className="absolute -top-1 -right-1 w-3 h-3 bg-green-500 rounded-full border-2 border-white dark:border-gray-950 animate-pulse"></div>
                            </div>
                            <div className="hidden sm:block">
                                <span className="text-xl lg:text-2xl font-bold bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 bg-clip-text text-transparent">
                                    Notta.in
                                </span>
                                <div className="text-xs text-gray-500 dark:text-gray-400 -mt-1">
                                    Share & Store
                                </div>
                            </div>
                        </Link>

                        {/* Page Title */}
                        {title && (
                            <div className="hidden lg:flex items-center space-x-3">
                                <div className="w-px h-6 bg-gray-300 dark:bg-gray-600"></div>
                                <div className="flex items-center space-x-2">
                                    <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                                    <span className="text-lg font-semibold text-gray-900 dark:text-white">{title}</span>
                                </div>
                            </div>
                        )}
                    </div>

                    {/* Center Navigation - Desktop */}
                    <nav className="hidden lg:flex items-center">
                        <div className="flex items-center space-x-2 backdrop-blur-sm rounded-2xl p-2">
                            {navigation.map((item) => (
                                <Link
                                    key={item.name}
                                    href={item.href}
                                    className={`relative flex items-center space-x-2 px-4 py-2.5 rounded-xl text-sm font-medium transition-all duration-200 group ${
                                        isActivePath(item.href)
                                            ? 'bg-white/90 dark:bg-gray-900/90 text-blue-600 dark:text-blue-400 shadow-lg backdrop-blur-sm'
                                            : 'text-gray-700 dark:text-gray-300 hover:text-blue-600 dark:hover:text-blue-400 hover:bg-white/30 dark:hover:bg-gray-800/30 backdrop-blur-sm'
                                    }`}
                                >
                                    <item.icon className={`h-4 w-4 transition-transform group-hover:scale-110 ${
                                        isActivePath(item.href) ? 'text-blue-600 dark:text-blue-400' : ''
                                    }`} />
                                    <span>{item.name}</span>
                                    {isActivePath(item.href) && (
                                        <div className="absolute -bottom-1 left-1/2 transform -translate-x-1/2 w-1 h-1 bg-blue-500 rounded-full"></div>
                                    )}
                                </Link>
                            ))}
                        </div>
                    </nav>

                    {/* Right Section */}
                    <div className="flex items-center space-x-3">
                        {/* Theme Toggle */}
                        <div className="hidden sm:block">
                            <ThemeToggle />
                        </div>

                        {user ? (
                            <>
                                {/* User Menu */}
                                <div className="relative">
                                    <Button
                                        variant="ghost"
                                        size="sm"
                                        onClick={() => setUserMenuOpen(!userMenuOpen)}
                                        className="flex items-center space-x-2 hover:bg-gray-100/80 dark:hover:bg-gray-800/80 rounded-xl p-2 group"
                                    >
                                        <div className="relative">
                                            <div className="h-8 w-8 bg-gradient-to-br from-blue-500 via-purple-600 to-pink-600 rounded-xl flex items-center justify-center shadow-lg group-hover:shadow-xl transition-all">
                                                <span className="text-white text-sm font-bold">
                                                    {(user.name || user.username).charAt(0).toUpperCase()}
                                                </span>
                                            </div>
                                            <div className="absolute -bottom-0.5 -right-0.5 w-3 h-3 bg-green-500 rounded-full border-2 border-white dark:border-gray-950"></div>
                                        </div>
                                        <div className="hidden lg:block text-left">
                                            <div className="text-sm font-semibold text-gray-900 dark:text-white">
                                                {user.name || user.username}
                                            </div>
                                            <div className="text-xs text-gray-500 dark:text-gray-400 -mt-0.5">
                                                {user.plan?.toUpperCase() || 'FREE'}
                                            </div>
                                        </div>
                                        <ChevronDown className={`h-4 w-4 text-gray-500 transition-transform ${userMenuOpen ? 'rotate-180' : ''}`} />
                                    </Button>

                                    {/* Enhanced User Dropdown */}
                                    {userMenuOpen && (
                                        <div className="absolute right-0 mt-2 w-72 bg-white/95 dark:bg-gray-900/95 backdrop-blur-xl rounded-2xl shadow-2xl border border-gray-200/50 dark:border-gray-700/50 z-50 overflow-hidden">
                                            {/* User Info Header */}
                                            <div className="p-4 bg-gradient-to-r from-blue-50 to-purple-50 dark:from-blue-950/30 dark:to-purple-950/30 border-b border-gray-200/50 dark:border-gray-700/50">
                                                <div className="flex items-center space-x-3">
                                                    <div className="h-12 w-12 bg-gradient-to-br from-blue-500 via-purple-600 to-pink-600 rounded-xl flex items-center justify-center shadow-lg">
                                                        <span className="text-white font-bold text-lg">
                                                            {(user.name || user.username).charAt(0).toUpperCase()}
                                                        </span>
                                                    </div>
                                                    <div className="flex-1 min-w-0">
                                                        <p className="text-sm font-semibold text-gray-900 dark:text-white truncate">
                                                            {user.name || user.username}
                                                        </p>
                                                        <p className="text-sm text-gray-600 dark:text-gray-400 truncate">
                                                            {user.email || `@${user.username}`}
                                                        </p>
                                                        <div className="flex items-center mt-1">
                                                            <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
                                                                user.plan === 'premium'
                                                                    ? 'bg-purple-100 text-purple-800 dark:bg-purple-900/50 dark:text-purple-200'
                                                                    : user.plan === 'enterprise'
                                                                    ? 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/50 dark:text-yellow-200'
                                                                    : 'bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-200'
                                                            }`}>
                                                                {user.plan === 'premium' && <Crown className="h-3 w-3 mr-1" />}
                                                                {(user.plan || 'free').toUpperCase()}
                                                            </span>
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>

                                            {/* Quick Stats */}
                                            <div className="p-3 border-b border-gray-200/50 dark:border-gray-700/50">
                                                <div className="grid grid-cols-2 gap-3 text-center">
                                                    <div className="p-2 bg-blue-50 dark:bg-blue-950/30 rounded-lg">
                                                        <div className="text-lg font-bold text-blue-600 dark:text-blue-400">12</div>
                                                        <div className="text-xs text-gray-600 dark:text-gray-400">Files</div>
                                                    </div>
                                                    <div className="p-2 bg-purple-50 dark:bg-purple-950/30 rounded-lg">
                                                        <div className="text-lg font-bold text-purple-600 dark:text-purple-400">3</div>
                                                        <div className="text-xs text-gray-600 dark:text-gray-400">Shares</div>
                                                    </div>
                                                </div>
                                            </div>

                                            {/* Menu Items */}
                                            <div className="p-2">
                                                <Link
                                                    href="/profile"
                                                    className="flex items-center w-full px-3 py-2.5 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100/80 dark:hover:bg-gray-800/50 rounded-xl transition-all group"
                                                    onClick={() => setUserMenuOpen(false)}
                                                >
                                                    <Settings className="h-4 w-4 mr-3 group-hover:rotate-45 transition-transform" />
                                                    <span>Profile Settings</span>
                                                </Link>

                                                <div className="border-t border-gray-200/50 dark:border-gray-700/50 my-2"></div>

                                                <button
                                                    onClick={handleLogout}
                                                    className="flex items-center w-full px-3 py-2.5 text-sm text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-950/30 rounded-xl transition-all group"
                                                >
                                                    <LogOut className="h-4 w-4 mr-3 group-hover:translate-x-0.5 transition-transform" />
                                                    <span>Sign Out</span>
                                                </button>
                                            </div>
                                        </div>
                                    )}
                                </div>
                            </>
                        ) : (
                            <div className="flex items-center space-x-2">
                                <Link href="/auth/login">
                                    <Button 
                                        variant="ghost" 
                                        size="sm"
                                        className="rounded-xl hover:bg-gray-100/80 dark:hover:bg-gray-800/80"
                                    >
                                        <span className="hidden sm:inline">Sign In</span>
                                        <User className="h-4 w-4 sm:hidden" />
                                    </Button>
                                </Link>
                                <Link href="/auth/register">
                                    <Button 
                                        size="sm"
                                        className="rounded-xl bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 shadow-lg hover:shadow-xl transition-all"
                                    >
                                        <span className="hidden sm:inline">Sign Up</span>
                                        <Plus className="h-4 w-4 sm:hidden" />
                                    </Button>
                                </Link>
                            </div>
                        )}

                        {/* Mobile Menu Button */}
                        <Button
                            variant="ghost"
                            size="sm"
                            className="lg:hidden hover:bg-gray-100/80 dark:hover:bg-gray-800/80 rounded-xl"
                            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                        >
                            {mobileMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
                        </Button>
                    </div>
                </div>

                {/* Enhanced Mobile Navigation */}
                {mobileMenuOpen && (
                    <div className="lg:hidden border-t border-gray-200/50 dark:border-gray-700/50 backdrop-blur-xl">
                        <div className="p-4 space-y-3">
                            {/* Mobile Theme Toggle */}
                            <div className="flex items-center justify-between p-3 bg-white/30 dark:bg-gray-800/30 backdrop-blur-sm rounded-xl">
                                <span className="text-sm font-medium text-gray-700 dark:text-gray-300">Theme</span>
                                <ThemeToggle />
                            </div>

                            {/* Navigation Links */}
                            <div className="space-y-1">
                                {navigation.map((item) => (
                                    <Link
                                        key={item.name}
                                        href={item.href}
                                        className={`flex items-center justify-between p-3 rounded-xl text-sm font-medium transition-all ${
                                            isActivePath(item.href)
                                                ? 'bg-white/90 dark:bg-gray-900/90 text-blue-600 dark:text-blue-400 shadow-lg backdrop-blur-sm'
                                                : 'text-gray-700 dark:text-gray-300 hover:bg-white/30 dark:hover:bg-gray-800/30 backdrop-blur-sm'
                                        }`}
                                        onClick={() => setMobileMenuOpen(false)}
                                    >
                                        <div className="flex items-center space-x-3">
                                            <item.icon className="h-5 w-5" />
                                            <div>
                                                <div>{item.name}</div>
                                                <div className="text-xs text-gray-500 dark:text-gray-400">{item.description}</div>
                                            </div>
                                        </div>
                                        {isActivePath(item.href) && (
                                            <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                                        )}
                                    </Link>
                                ))}
                            </div>

                            {/* User Actions */}
                            {user && (
                                <div className="pt-3 border-t border-gray-200/50 dark:border-gray-700/50 space-y-1">
                                    <Link
                                        href="/profile"
                                        className="flex items-center space-x-3 p-3 text-gray-700 dark:text-gray-300 hover:bg-white/30 dark:hover:bg-gray-800/30 backdrop-blur-sm rounded-xl text-sm font-medium transition-all"
                                        onClick={() => setMobileMenuOpen(false)}
                                    >
                                        <Settings className="h-5 w-5" />
                                        <span>Profile Settings</span>
                                    </Link>
                                </div>
                            )}
                        </div>
                    </div>
                )}
            </div>

            {/* Click outside handlers */}
            {userMenuOpen && (
                <div
                    className="fixed inset-0 z-40"
                    onClick={() => setUserMenuOpen(false)}
                />
            )}
            {mobileMenuOpen && (
                <div
                    className="fixed inset-0 z-30 lg:hidden"
                    onClick={() => setMobileMenuOpen(false)}
                />
            )}
        </header>
    )
}
