'use client'

import { useState, useEffect } from 'react'
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  TextField,
  Box,
  FormControlLabel,
  Checkbox,
  FormGroup,
  IconButton,
  Typography,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
} from '@mui/material'
import { Delete } from '@mui/icons-material'
import { format } from 'date-fns'
import { MarkdownEditor } from '@/components/MarkdownEditor'
import type { Task } from '@/types/task'

interface TaskDialogProps {
  open: boolean
  task: Task | null
  mode: 'create' | 'edit' | 'view'
  onClose: () => void
  onSave: (task: Omit<Task, 'id'>) => void
  onDelete?: (taskId: string) => void
  onModeChange?: (mode: 'create' | 'edit' | 'view') => void
  helpers?: Array<{ uid: string; displayName: string; email: string }>
  assignedTo?: string
  isEmployer?: boolean
}

const dayLabels = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday']

// Helper function to format date for datetime-local input
const formatDateTimeLocal = (date: Date): string => {
  const year = date.getFullYear()
  const month = String(date.getMonth() + 1).padStart(2, '0')
  const day = String(date.getDate()).padStart(2, '0')
  const hours = String(date.getHours()).padStart(2, '0')
  const minutes = String(date.getMinutes()).padStart(2, '0')
  return `${year}-${month}-${day}T${hours}:${minutes}`
}

// Helper function to parse datetime-local input to Date
const parseDateTimeLocal = (dateTimeString: string): Date => {
  return new Date(dateTimeString)
}

export function TaskDialog({ open, task, mode, onClose, onSave, onDelete, onModeChange, helpers, assignedTo, isEmployer = false }: TaskDialogProps) {
  const defaultStart = new Date()
  defaultStart.setMinutes(0, 0, 0) // Set to start of hour
  const defaultEnd = new Date(defaultStart)
  defaultEnd.setHours(defaultStart.getHours() + 1) // 1 hour later

  const [formData, setFormData] = useState({
    title: '',
    description: '',
    startDateTime: formatDateTimeLocal(defaultStart),
    endDateTime: formatDateTimeLocal(defaultEnd),
    completed: false,
    repeatDays: [false, false, false, false, false, false, false] as boolean[],
    assignedTo: '',
  })

  useEffect(() => {
    if (task) {
      setFormData({
        title: task.title,
        description: task.description,
        startDateTime: formatDateTimeLocal(task.startDateTime),
        endDateTime: formatDateTimeLocal(task.endDateTime),
        completed: task.completed,
        repeatDays: task.repeatDays || [false, false, false, false, false, false, false],
        assignedTo: task.assignedTo || '',
      })
    } else {
      const now = new Date()
      now.setMinutes(0, 0, 0)
      const end = new Date(now)
      end.setHours(now.getHours() + 1)
      
      // If there's only one helper, set it as default
      let defaultAssignedTo = assignedTo || ''
      if (isEmployer && helpers && helpers.length === 1 && !assignedTo) {
        defaultAssignedTo = helpers[0].uid
      }
      
      setFormData({
        title: '',
        description: '',
        startDateTime: formatDateTimeLocal(now),
        endDateTime: formatDateTimeLocal(end),
        completed: false,
        repeatDays: [false, false, false, false, false, false, false],
        assignedTo: defaultAssignedTo,
      })
    }
  }, [task, open, assignedTo, isEmployer, helpers])

  const handleSubmit = () => {
    if (!formData.title.trim()) return

    const startDate = parseDateTimeLocal(formData.startDateTime)
    const endDate = parseDateTimeLocal(formData.endDateTime)

    if (endDate <= startDate) {
      alert('End date/time must be after start date/time')
      return
    }

    const taskData: Omit<Task, 'id'> = {
      title: formData.title,
      description: formData.description,
      startDateTime: startDate,
      endDateTime: endDate,
      completed: formData.completed,
      repeatDays: formData.repeatDays.some(d => d) ? formData.repeatDays : undefined,
      assignedTo: formData.assignedTo || undefined,
    }

    onSave(taskData)
    onClose()
  }

  const handleDelete = () => {
    if (task && onDelete && window.confirm('Are you sure you want to delete this task?')) {
      onDelete(task.id)
      onClose()
    }
  }

  const handleRepeatDayChange = (index: number) => {
    const newRepeatDays = [...formData.repeatDays]
    newRepeatDays[index] = !newRepeatDays[index]
    setFormData({ ...formData, repeatDays: newRepeatDays })
  }

  const isReadOnly = mode === 'view'

  return (
    <Dialog open={open} onClose={onClose} maxWidth="md" fullWidth>
      <DialogTitle>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <span>
            {mode === 'create' && 'Create New Task'}
            {mode === 'edit' && 'Edit Task'}
            {mode === 'view' && 'Task Details'}
          </span>
          {mode === 'edit' && task && onDelete && (
            <IconButton
              color="error"
              onClick={handleDelete}
              sx={{ ml: 2 }}
            >
              <Delete />
            </IconButton>
          )}
        </Box>
      </DialogTitle>
      <DialogContent>
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, pt: 1 }}>
          <TextField
            label="Task Title"
            fullWidth
            required
            value={formData.title}
            onChange={(e) => setFormData({ ...formData, title: e.target.value })}
            disabled={isReadOnly}
          />
          <MarkdownEditor
            label="Task Description"
            value={formData.description}
            onChange={(value) => setFormData({ ...formData, description: value })}
            disabled={isReadOnly}
            minHeight={300}
          />
          <TextField
            label="Start Date & Time"
            type="datetime-local"
            fullWidth
            required
            value={formData.startDateTime}
            onChange={(e) => setFormData({ ...formData, startDateTime: e.target.value })}
            disabled={isReadOnly}
            InputLabelProps={{
              shrink: true,
            }}
          />
          <TextField
            label="End Date & Time"
            type="datetime-local"
            fullWidth
            required
            value={formData.endDateTime}
            onChange={(e) => setFormData({ ...formData, endDateTime: e.target.value })}
            disabled={isReadOnly}
            InputLabelProps={{
              shrink: true,
            }}
          />
          
          {isEmployer && helpers && helpers.length > 0 && (
            <FormControl fullWidth disabled={isReadOnly}>
              <InputLabel>Assign to Helper {helpers.length === 1 ? '' : '(Optional)'}</InputLabel>
              <Select
                value={formData.assignedTo}
                label={`Assign to Helper ${helpers.length === 1 ? '' : '(Optional)'}`}
                onChange={(e) => setFormData({ ...formData, assignedTo: e.target.value })}
              >
                {helpers.length > 1 && (
                  <MenuItem value="">None (Unassigned)</MenuItem>
                )}
                {helpers.map((helper) => (
                  <MenuItem key={helper.uid} value={helper.uid}>
                    {helper.displayName} ({helper.email})
                  </MenuItem>
                ))}
              </Select>
              {helpers.length === 1 && (
                <Typography variant="caption" color="text.secondary" sx={{ mt: 0.5 }}>
                  Only one helper available - automatically assigned
                </Typography>
              )}
            </FormControl>
          )}

          <Box>
            <Typography variant="subtitle2" gutterBottom>
              Repeat on Days (Optional)
            </Typography>
            <FormGroup>
              {dayLabels.map((day, index) => (
                <FormControlLabel
                  key={day}
                  control={
                    <Checkbox
                      checked={formData.repeatDays[index]}
                      onChange={() => handleRepeatDayChange(index)}
                      disabled={isReadOnly}
                    />
                  }
                  label={day}
                />
              ))}
            </FormGroup>
          </Box>

          {mode !== 'create' && (
            <FormControlLabel
              control={
                <Checkbox
                  checked={formData.completed}
                  onChange={(e) => setFormData({ ...formData, completed: e.target.checked })}
                  disabled={isReadOnly}
                />
              }
              label="Completed"
            />
          )}
        </Box>
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose}>
          {isReadOnly ? 'Close' : 'Cancel'}
        </Button>
        {!isReadOnly && (
          <Button onClick={handleSubmit} variant="contained" disabled={!formData.title.trim()}>
            {mode === 'create' ? 'Create' : 'Save'}
          </Button>
        )}
        {isReadOnly && mode === 'view' && task && onModeChange && (
          <Button 
            onClick={() => {
              onModeChange('edit')
            }} 
            variant="outlined"
          >
            Edit
          </Button>
        )}
      </DialogActions>
    </Dialog>
  )
}

