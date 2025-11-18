'use client'

import { ThemeProvider } from '@/components/ThemeProvider'
import { AuthProvider } from '@/components/Auth/AuthProvider'
import { ErrorBoundary } from '@/components/ErrorBoundary'
import { ReactNode } from 'react'

export function Providers({ children }: { children: ReactNode }) {
  return (
    <ErrorBoundary>
      <ThemeProvider>
        <AuthProvider>
          {children}
        </AuthProvider>
      </ThemeProvider>
    </ErrorBoundary>
  )
}

