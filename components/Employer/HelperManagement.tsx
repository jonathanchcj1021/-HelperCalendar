'use client'

import { useState, useEffect } from 'react'
import {
  Box,
  Paper,
  Typography,
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  List,
  ListItem,
  ListItemText,
  IconButton,
  Chip,
  Alert,
} from '@mui/material'
import { Add, Delete } from '@mui/icons-material'
import { registerUser, type UserData } from '@/lib/firebase/auth'
import { getHelpersByEmployer } from '@/lib/firebase/users'
import { useAuth } from '@/components/Auth/AuthProvider'

export function HelperManagement() {
  const { userData } = useAuth()
  const [helpers, setHelpers] = useState<UserData[]>([])
  const [open, setOpen] = useState(false)
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [displayName, setDisplayName] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    if (userData?.role === 'employer') {
      loadHelpers()
    }
  }, [userData])

  const loadHelpers = async () => {
    if (!userData?.uid) return
    const helpersList = await getHelpersByEmployer(userData.uid)
    setHelpers(helpersList)
  }

  const handleCreateHelper = async () => {
    if (!email || !password || !displayName) {
      setError('Please fill in all fields')
      return
    }
    if (!userData?.uid) return

    setError('')
    setLoading(true)
    try {
      await registerUser(email, password, displayName, 'helper', userData.uid)
      setEmail('')
      setPassword('')
      setDisplayName('')
      setOpen(false)
      loadHelpers()
    } catch (err: any) {
      setError(err.message || 'Failed to create helper account')
    } finally {
      setLoading(false)
    }
  }

  if (userData?.role !== 'employer') {
    return null
  }

  return (
    <Paper elevation={3} sx={{ p: 3, mb: 3 }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
        <Typography variant="h5" component="h2">
          Helper Management
        </Typography>
        <Button
          variant="contained"
          startIcon={<Add />}
          onClick={() => setOpen(true)}
        >
          Create Helper Account
        </Button>
      </Box>

      <List>
        {helpers.length === 0 ? (
          <Typography variant="body2" color="text.secondary" sx={{ p: 2, textAlign: 'center' }}>
            No helpers yet. Create a helper account to assign tasks.
          </Typography>
        ) : (
          helpers.map((helper) => (
            <ListItem
              key={helper.uid}
              sx={{
                border: '1px solid',
                borderColor: 'divider',
                borderRadius: 1,
                mb: 1,
              }}
            >
              <ListItemText
                primary={helper.displayName}
                secondary={helper.email}
              />
              <Chip label="Helper" size="small" color="primary" />
            </ListItem>
          ))
        )}
      </List>

      <Dialog open={open} onClose={() => setOpen(false)} maxWidth="sm" fullWidth>
        <DialogTitle>Create Helper Account</DialogTitle>
        <DialogContent>
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, pt: 1 }}>
            {error && (
              <Alert severity="error">{error}</Alert>
            )}
            <TextField
              label="Display Name"
              fullWidth
              value={displayName}
              onChange={(e) => setDisplayName(e.target.value)}
            />
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
          <Button onClick={() => setOpen(false)}>Cancel</Button>
          <Button onClick={handleCreateHelper} variant="contained" disabled={loading}>
            Create
          </Button>
        </DialogActions>
      </Dialog>
    </Paper>
  )
}

