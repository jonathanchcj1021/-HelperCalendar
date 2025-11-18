'use client'

import { useState } from 'react'
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  TextField,
  Box,
  Typography,
  Tabs,
  Tab,
  Alert,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
} from '@mui/material'
import { loginUser, registerUser, type UserRole } from '@/lib/firebase/auth'

interface LoginDialogProps {
  open: boolean
  onClose: () => void
  onSuccess: () => void
}

export function LoginDialog({ open, onClose, onSuccess }: LoginDialogProps) {
  const [tabValue, setTabValue] = useState(0)
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [displayName, setDisplayName] = useState('')
  const [role, setRole] = useState<UserRole>('employer')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  const handleLogin = async () => {
    setError('')
    setLoading(true)
    try {
      await loginUser(email, password)
      onSuccess()
      handleClose()
    } catch (err: any) {
      let errorMessage = 'Login failed'
      
      if (err.code === 'auth/user-not-found') {
        errorMessage = 'No account found with this email. Please register first.'
      } else if (err.code === 'auth/wrong-password') {
        errorMessage = 'Incorrect password. Please try again.'
      } else if (err.code === 'auth/invalid-email') {
        errorMessage = 'Invalid email address. Please check your email format.'
      } else if (err.code === 'auth/network-request-failed') {
        errorMessage = 'Network error. Please check your internet connection.'
      } else if (err.message?.includes('404') || err.message?.includes('signIn')) {
        errorMessage = 'Firebase Authentication is not enabled. Please enable Email/Password authentication in Firebase Console.'
      } else if (err.message) {
        errorMessage = err.message
      }
      
      setError(errorMessage)
    } finally {
      setLoading(false)
    }
  }

  const handleRegister = async () => {
    setError('')
    if (!email || !password || !displayName) {
      setError('Please fill in all fields')
      return
    }
    setLoading(true)
    try {
      await registerUser(email, password, displayName, role)
      // Wait a bit for user data to be saved and AuthProvider to update
      await new Promise(resolve => setTimeout(resolve, 1000))
      onSuccess()
      handleClose()
    } catch (err: any) {
      let errorMessage = 'Registration failed'
      
      if (err.code === 'auth/network-request-failed') {
        errorMessage = 'Network error. Please check your internet connection.'
      } else if (err.code === 'auth/email-already-in-use') {
        errorMessage = 'This email is already registered. Please use a different email or login instead.'
      } else if (err.code === 'auth/weak-password') {
        errorMessage = 'Password is too weak. Please use at least 6 characters.'
      } else if (err.code === 'auth/invalid-email') {
        errorMessage = 'Invalid email address. Please check your email format.'
      } else if (err.message?.includes('404') || err.message?.includes('signUp')) {
        errorMessage = 'Firebase Authentication is not enabled. Please enable Email/Password authentication in Firebase Console.'
      } else if (err.message) {
        errorMessage = err.message
      }
      
      setError(errorMessage)
      setLoading(false)
    }
  }

  const handleClose = () => {
    setEmail('')
    setPassword('')
    setDisplayName('')
    setRole('employer')
    setError('')
    setTabValue(0)
    onClose()
  }

  return (
    <Dialog open={open} onClose={handleClose} maxWidth="sm" fullWidth>
      <DialogTitle>Login / Register</DialogTitle>
      <DialogContent>
        <Tabs value={tabValue} onChange={(_, newValue) => setTabValue(newValue)} sx={{ mb: 2 }}>
          <Tab label="Login" />
          <Tab label="Register" />
        </Tabs>

        {error && (
          <Alert severity="error" sx={{ mb: 2 }}>
            {error}
          </Alert>
        )}

        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
          {tabValue === 1 && (
            <>
              <TextField
                label="Display Name"
                fullWidth
                value={displayName}
                onChange={(e) => setDisplayName(e.target.value)}
              />
              <FormControl fullWidth>
                <InputLabel>Role</InputLabel>
                <Select
                  value={role}
                  label="Role"
                  onChange={(e) => setRole(e.target.value as UserRole)}
                >
                  <MenuItem value="employer">Employer</MenuItem>
                  <MenuItem value="helper">Helper</MenuItem>
                </Select>
              </FormControl>
            </>
          )}
          <TextField
            label="Email"
            type="email"
            fullWidth
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />
          <TextField
            label="Password"
            type="password"
            fullWidth
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />
        </Box>
      </DialogContent>
      <DialogActions>
        <Button onClick={handleClose}>Cancel</Button>
        <Button
          onClick={tabValue === 0 ? handleLogin : handleRegister}
          variant="contained"
          disabled={loading}
        >
          {tabValue === 0 ? 'Login' : 'Register'}
        </Button>
      </DialogActions>
    </Dialog>
  )
}

