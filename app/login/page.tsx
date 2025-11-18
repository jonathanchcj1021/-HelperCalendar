'use client'

import { useState } from 'react'
import { Container, Box, Typography } from '@mui/material'
import { LoginDialog } from '@/components/Auth/LoginDialog'
import { useAuth } from '@/components/Auth/AuthProvider'
import { useRouter } from 'next/navigation'
import { useEffect } from 'react'

export default function LoginPage() {
  const { user, userData, loading } = useAuth()
  const router = useRouter()
  const [loginOpen, setLoginOpen] = useState(false)

  useEffect(() => {
    if (!loading && user && userData) {
      // User is authenticated and userData is loaded, redirect to home
      router.push('/')
    } else if (!loading && !user) {
      setLoginOpen(true)
    }
  }, [user, userData, loading, router])

  const handleLoginSuccess = () => {
    // Wait a bit for AuthProvider to update, then redirect will happen automatically
    // The useEffect above will handle the redirect when userData is ready
  }

  if (loading) {
    return (
      <Container>
        <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '100vh' }}>
          <Typography>Loading...</Typography>
        </Box>
      </Container>
    )
  }

  return (
    <Container>
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '100vh' }}>
        <LoginDialog
          open={loginOpen}
          onClose={() => setLoginOpen(false)}
          onSuccess={handleLoginSuccess}
        />
      </Box>
    </Container>
  )
}

