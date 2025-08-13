'use client'

import { ReactNode } from 'react'
import { Header } from './header'
import { Footer } from './footer'

interface PageLayoutProps {
  children: ReactNode
  title?: string
  showBackButton?: boolean
  backTo?: string
  showHeader?: boolean
  showFooter?: boolean
  className?: string
  containerClassName?: string
}

export function PageLayout({ 
  children, 
  title, 
  showBackButton = false, 
  backTo = '/',
  showHeader = true,
  showFooter = true,
  className = '',
  containerClassName = ''
}: PageLayoutProps) {
  return (
    <div className={`min-h-screen flex flex-col bg-gradient-to-br from-blue-50 via-white to-purple-50 dark:from-gray-900 dark:via-blue-900 dark:to-purple-900 ${className}`}>
      {showHeader && (
        <Header 
          title={title}
          showBackButton={showBackButton}
          backTo={backTo}
        />
      )}
      
      <main className={`flex-1 ${containerClassName}`}>
        {children}
      </main>
      
      {showFooter && <Footer />}
    </div>
  )
}
