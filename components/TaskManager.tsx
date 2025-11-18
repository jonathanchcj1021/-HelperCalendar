'use client'

import { useState } from 'react'
import {
  Box,
  Paper,
  Typography,
  List,
  ListItem,
  ListItemText,
  Checkbox,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  TextField,
  Chip,
  Divider,
} from '@mui/material'
import {
  Add,
  CheckCircle,
  RadioButtonUnchecked,
} from '@mui/icons-material'
import { format } from 'date-fns'
import { enUS } from 'date-fns/locale'
import type { Task } from '@/types/task'

interface TaskManagerProps {
  tasks: Task[]
  onTaskAdd: (task: Omit<Task, 'id'>) => void
  onTaskToggle: (taskId: string) => void
}

export function TaskManager({ tasks, onTaskAdd, onTaskToggle }: TaskManagerProps) {
  const [open, setOpen] = useState(false)
  const [newTask, setNewTask] = useState({
    title: '',
    description: '',
    date: format(new Date(), 'yyyy-MM-dd'),
    time: '',
  })

  const handleOpen = () => setOpen(true)
  const handleClose = () => {
    setOpen(false)
    setNewTask({ title: '', description: '', date: format(new Date(), 'yyyy-MM-dd'), time: '' })
  }

  const handleSubmit = () => {
    if (newTask.title.trim()) {
      onTaskAdd({
        title: newTask.title,
        description: newTask.description,
        date: new Date(newTask.date),
        time: newTask.time || undefined,
        completed: false,
      })
      handleClose()
    }
  }

  const sortedTasks = [...tasks].sort((a, b) => {
    const dateDiff = a.date.getTime() - b.date.getTime()
    if (dateDiff !== 0) return dateDiff
    // If same date, sort by time
    const timeA = a.time || '23:59'
    const timeB = b.time || '23:59'
    return timeA.localeCompare(timeB)
  })

  return (
    <Paper elevation={3} sx={{ p: 3 }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
        <Typography variant="h5" component="h2">
          Task List
        </Typography>
        <Button
          variant="contained"
          startIcon={<Add />}
          onClick={handleOpen}
        >
          Add Task
        </Button>
      </Box>

      <Divider sx={{ mb: 2 }} />

      <List>
        {sortedTasks.length === 0 ? (
          <Typography variant="body2" color="text.secondary" sx={{ p: 2, textAlign: 'center' }}>
            No tasks yet. Click the button above to add a task.
          </Typography>
        ) : (
          sortedTasks.map(task => (
            <ListItem
              key={task.id}
              sx={{
                bgcolor: task.completed ? 'action.hover' : 'background.paper',
                mb: 1,
                borderRadius: 1,
                '&:hover': {
                  bgcolor: 'action.selected',
                },
              }}
            >
              <Checkbox
                checked={task.completed}
                onChange={() => onTaskToggle(task.id)}
                icon={<RadioButtonUnchecked />}
                checkedIcon={<CheckCircle />}
              />
              <ListItemText
                primary={
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }} component="div">
                    <Typography
                      variant="body1"
                      component="span"
                      sx={{
                        textDecoration: task.completed ? 'line-through' : 'none',
                        color: task.completed ? 'text.secondary' : 'text.primary',
                      }}
                    >
                      {task.title}
                    </Typography>
                    {task.completed && (
                      <Chip label="Completed" size="small" color="success" />
                    )}
                  </Box>
                }
                primaryTypographyProps={{ component: 'div' }}
                secondary={
                  <Box component="div">
                    <Typography variant="body2" color="text.secondary" component="div">
                      {task.description || 'No description'}
                    </Typography>
                    <Typography variant="caption" color="text.secondary" component="div">
                      {format(task.date, 'EEEE, MMMM dd, yyyy', { locale: enUS })}
                      {task.time && ` at ${task.time}`}
                    </Typography>
                  </Box>
                }
                secondaryTypographyProps={{ component: 'div' }}
              />
            </ListItem>
          ))
        )}
      </List>

      <Dialog open={open} onClose={handleClose} maxWidth="sm" fullWidth>
        <DialogTitle>Add New Task</DialogTitle>
        <DialogContent>
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, pt: 1 }}>
            <TextField
              label="Task Title"
              fullWidth
              required
              value={newTask.title}
              onChange={(e) => setNewTask({ ...newTask, title: e.target.value })}
            />
            <TextField
              label="Task Description"
              fullWidth
              multiline
              rows={3}
              value={newTask.description}
              onChange={(e) => setNewTask({ ...newTask, description: e.target.value })}
            />
            <TextField
              label="Task Date"
              type="date"
              fullWidth
              required
              value={newTask.date}
              onChange={(e) => setNewTask({ ...newTask, date: e.target.value })}
              InputLabelProps={{
                shrink: true,
              }}
            />
            <TextField
              label="Task Time (Optional)"
              type="time"
              fullWidth
              value={newTask.time}
              onChange={(e) => setNewTask({ ...newTask, time: e.target.value })}
              InputLabelProps={{
                shrink: true,
              }}
            />
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleClose}>Cancel</Button>
          <Button onClick={handleSubmit} variant="contained" disabled={!newTask.title.trim()}>
            Add
          </Button>
        </DialogActions>
      </Dialog>
    </Paper>
  )
}

