'use client';

import Link from 'next/link';
import { useState } from 'react';
import { FileText, Plus, User, Settings, LogOut, Menu, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { ThemeToggle } from '@/components/ui/theme-toggle';
import { GlassCard } from '@/components/ui/glass-card';

interface HeaderProps {
    user?: {
        id: string;
        name: string;
        email: string;
        isAnonymous: boolean;
    } | null;
    onLogout?: () => void;
}

export function Header({ user, onLogout }: HeaderProps) {
    const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

    return (
        <header className="sticky top-0 z-50 w-full">
            <GlassCard className="mx-4 mt-4 mb-0 rounded-b-none md:rounded-b-xl">
                <div className="container mx-auto px-4 py-3">
                    <div className="flex items-center justify-between">
                        {/* Logo */}
                        <Link href="/" className="flex items-center space-x-2">
                            <FileText className="h-8 w-8 text-blue-500" />
                            <span className="text-xl font-bold bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 bg-clip-text text-transparent">
                                PrivateOnlineNotes
                            </span>
                        </Link>

                        {/* Desktop Navigation */}
                        <nav className="hidden md:flex items-center space-x-6">
                            <Link
                                href="/pricing"
                                className="text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white transition-colors"
                            >
                                Pricing
                            </Link>

                            <Link
                                href="/explore"
                                className="text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white transition-colors"
                            >
                                Explore
                            </Link>
                        </nav>

                        {/* Desktop Actions */}
                        <div className="hidden md:flex items-center space-x-4">
                            <ThemeToggle />

                            {user ? (
                                <>

                                    <div className="relative group">
                                        <Button variant="ghost" size="sm" className="text-slate-700 dark:text-slate-200">
                                            <User className="h-4 w-4 mr-2" />
                                            {user.name}
                                        </Button>

                                        {/* Dropdown Menu */}
                                        <div className="absolute right-0 top-full mt-2 w-48 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200">
                                            <GlassCard className="p-1">

                                                <Link
                                                    href="/dashboard"
                                                    className="flex items-center w-full px-3 py-2 text-sm text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-700 rounded-md transition-colors"
                                                >
                                                    <User className="h-4 w-4 mr-2" />
                                                    Dashboard
                                                </Link>

                                                <Link
                                                    href="/create"
                                                    className="flex items-center w-full px-3 py-2 text-sm text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-700 rounded-md transition-colors"
                                                >
                                                    <Plus className="h-4 w-4 mr-2" />
                                                    New Note
                                                </Link>

                                                <Link
                                                    href="/settings"
                                                    className="flex items-center w-full px-3 py-2 text-sm text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-700 rounded-md transition-colors"
                                                >
                                                    <Settings className="h-4 w-4 mr-2" />
                                                    Settings
                                                </Link>
                                                <button
                                                    className="flex items-center w-full px-3 py-2 text-sm text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-700 rounded-md transition-colors"
                                                    onClick={() => onLogout?.()}
                                                >
                                                    <LogOut className="h-4 w-4 mr-2" />
                                                    Sign Out
                                                </button>
                                            </GlassCard>
                                        </div>
                                    </div>
                                </>
                            ) : (
                                <div className="flex items-center space-x-2">
                                    <Button variant="ghost" size="sm" asChild className="text-slate-600 dark:text-slate-300">
                                        <Link href="/auth/login">Login</Link>
                                    </Button>
                                    <Button variant="default" size="sm" asChild>
                                        <Link href="/auth/register">Register</Link>
                                    </Button>
                                </div>
                            )}
                        </div>

                        {/* Mobile Menu Button */}
                        <Button
                            variant="ghost"
                            size="sm"
                            className="md:hidden text-slate-700 dark:text-slate-200"
                            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                        >
                            {mobileMenuOpen ? (
                                <X className="h-5 w-5" />
                            ) : (
                                <Menu className="h-5 w-5" />
                            )}
                        </Button>
                    </div>

                    {/* Mobile Menu */}
                    {mobileMenuOpen && (
                        <div className="md:hidden mt-4 pt-4 border-t border-slate-200 dark:border-slate-700">
                            <div className="flex flex-col space-y-3">
                                <Link
                                    href="/explore"
                                    className="text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white transition-colors"
                                    onClick={() => setMobileMenuOpen(false)}
                                >
                                    Explore
                                </Link>

                                {user && (
                                    <Link
                                        href="/dashboard"
                                        className="text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white transition-colors"
                                        onClick={() => setMobileMenuOpen(false)}
                                    >
                                        Dashboard
                                    </Link>
                                )}

                                <div className="flex justify-between items-center">
                                    <ThemeToggle />

                                    {user ? (
                                        <div className="flex items-center space-x-2">
                                            <Button variant="default" size="sm" asChild>
                                                <Link href="/create" onClick={() => setMobileMenuOpen(false)}>
                                                    <Plus className="h-4 w-4 mr-2" />
                                                    New Note
                                                </Link>
                                            </Button>
                                        </div>
                                    ) : (
                                        <div className="flex items-center space-x-2">
                                            <Button variant="ghost" size="sm" asChild className="text-slate-600 dark:text-slate-300">
                                                <Link href="/auth/login" onClick={() => setMobileMenuOpen(false)}>
                                                    Sign In
                                                </Link>
                                            </Button>
                                            <Button variant="default" size="sm" asChild>
                                                <Link href="/auth/register" onClick={() => setMobileMenuOpen(false)}>
                                                    Sign Up
                                                </Link>
                                            </Button>
                                        </div>
                                    )}
                                </div>

                                {user && (
                                    <div className="pt-3 border-t border-slate-200 dark:border-slate-700">
                                        <div className="flex items-center space-x-2 mb-3">
                                            <User className="h-4 w-4 text-slate-600 dark:text-slate-300" />
                                            <span className="text-slate-700 dark:text-slate-200 text-sm">{user.name}</span>
                                        </div>
                                        <div className="flex flex-col space-y-2">
                                            <Link
                                                href="/settings"
                                                className="flex items-center text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white transition-colors text-sm"
                                                onClick={() => setMobileMenuOpen(false)}
                                            >
                                                <Settings className="h-4 w-4 mr-2" />
                                                Settings
                                            </Link>
                                            <button
                                                className="flex items-center text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white transition-colors text-sm"
                                                onClick={() => {
                                                    onLogout?.();
                                                    setMobileMenuOpen(false);
                                                }}
                                            >
                                                <LogOut className="h-4 w-4 mr-2" />
                                                Sign Out
                                            </button>
                                        </div>
                                    </div>
                                )}
                            </div>
                        </div>
                    )}
                </div>
            </GlassCard>
        </header>
    );
}
