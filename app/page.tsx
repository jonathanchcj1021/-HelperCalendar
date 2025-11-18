'use client'

import { useState, useEffect } from 'react'
import { Container, Typography, Box, Button, FormControl, InputLabel, Select, MenuItem, AppBar, Toolbar, Chip } from '@mui/material'
import { Add, Logout } from '@mui/icons-material'
import { format } from 'date-fns'
import { useRouter } from 'next/navigation'
import { TimeSlotCalendar } from '@/components/TimeSlotCalendar'
import { ThreeDayView } from '@/components/ThreeDayView'
import { DayView } from '@/components/DayView'
import { MonthView } from '@/components/MonthView'
import { TaskDialog } from '@/components/TaskDialog'
import { HelperManagement } from '@/components/Employer/HelperManagement'
import { useAuth } from '@/components/Auth/AuthProvider'
import { logoutUser } from '@/lib/firebase/auth'
import { createTask, updateTask, deleteTask, getTasks } from '@/lib/firebase/tasks'
import { getHelpersByEmployer } from '@/lib/firebase/users'
import type { Task } from '@/types/task'
import type { UserData } from '@/lib/firebase/auth'

type ViewType = 'day' | 'threeDay' | 'week' | 'month'

export default function Home() {
  const { user, userData, loading } = useAuth()
  const router = useRouter()
  const [tasks, setTasks] = useState<Task[]>([])
  const [helpers, setHelpers] = useState<UserData[]>([])
  const [dialogOpen, setDialogOpen] = useState(false)
  const [dialogMode, setDialogMode] = useState<'create' | 'edit' | 'view'>('create')
  const [selectedTask, setSelectedTask] = useState<Task | null>(null)
  const [viewType, setViewType] = useState<ViewType>('day')
  const [tasksLoading, setTasksLoading] = useState(true)

  // Redirect to login if not authenticated
  useEffect(() => {
    if (!loading && !user) {
      router.push('/login')
    }
  }, [user, loading, router])

  // Wait for userData to load after authentication
  useEffect(() => {
    if (user && !loading && !userData) {
      // User is authenticated but userData is still loading
      // This happens right after registration
      const checkUserData = async () => {
        let attempts = 0
        const maxAttempts = 10
        while (attempts < maxAttempts && !userData) {
          await new Promise(resolve => setTimeout(resolve, 500))
          attempts++
          // The AuthProvider will update userData when it's ready
        }
      }
      checkUserData()
    }
  }, [user, loading, userData])

  // Load tasks from Firebase
  useEffect(() => {
    if (userData) {
      loadTasks()
      if (userData.role === 'employer') {
        loadHelpers()
      }
    }
  }, [userData])

  const loadTasks = async () => {
    if (!userData) return
    setTasksLoading(true)
    try {
      const tasksList = await getTasks(
        userData.uid,
        userData.role === 'helper' ? userData.uid : undefined
      )
      setTasks(tasksList)
    } catch (error) {
      console.error('Error loading tasks:', error)
    } finally {
      setTasksLoading(false)
    }
  }

  const loadHelpers = async () => {
    if (!userData || userData.role !== 'employer') return
    try {
      const helpersList = await getHelpersByEmployer(userData.uid)
      setHelpers(helpersList)
    } catch (error) {
      console.error('Error loading helpers:', error)
    }
  }

  const handleLogout = async () => {
    await logoutUser()
    router.push('/login')
  }

  const handleCreateTask = () => {
    setSelectedTask(null)
    setDialogMode('create')
    setDialogOpen(true)
  }

  const handleTaskClick = (task: Task, date?: Date) => {
    setSelectedTask(task)
    setDialogMode('view')
    setDialogOpen(true)
  }

  const handleTaskToggleComplete = async (taskId: string, date: Date) => {
    if (!userData) return
    
    const dateString = format(date, 'yyyy-MM-dd')
    const task = tasks.find(t => t.id === taskId)
    if (!task) return

    let updatedTask: Partial<Task> = {}
    
    if (task.repeatDays) {
      // For repeating tasks, toggle completion for this specific date
      const completedDates = task.completedDates || []
      const isCompleted = completedDates.includes(dateString)
      updatedTask.completedDates = isCompleted
        ? completedDates.filter(d => d !== dateString)
        : [...completedDates, dateString]
    } else {
      // For one-time tasks, toggle the completed flag
      updatedTask.completed = !task.completed
    }

    try {
      await updateTask(taskId, updatedTask)
      loadTasks()
    } catch (error) {
      console.error('Error updating task:', error)
    }
  }

  const handleTaskEdit = (task: Task) => {
    setSelectedTask(task)
    setDialogMode('edit')
    setDialogOpen(true)
  }

  const handleTaskSave = async (taskData: Omit<Task, 'id'>) => {
    if (!userData) return

    const taskWithDates: Omit<Task, 'id'> = {
      ...taskData,
      startDateTime: taskData.startDateTime instanceof Date 
        ? taskData.startDateTime 
        : new Date(taskData.startDateTime),
      endDateTime: taskData.endDateTime instanceof Date 
        ? taskData.endDateTime 
        : new Date(taskData.endDateTime),
      employerId: userData.role === 'employer' ? userData.uid : taskData.employerId,
    }

    try {
      if (dialogMode === 'create') {
        await createTask(taskWithDates, userData.uid, taskData.assignedTo)
      } else if (dialogMode === 'edit' && selectedTask) {
        await updateTask(selectedTask.id, taskWithDates)
      }
      loadTasks()
      setDialogOpen(false)
      setSelectedTask(null)
    } catch (error) {
      console.error('Error saving task:', error)
      alert('Failed to save task. Please try again.')
    }
  }

  const handleTaskDelete = async (taskId: string) => {
    try {
      await deleteTask(taskId)
      loadTasks()
      setDialogOpen(false)
      setSelectedTask(null)
    } catch (error) {
      console.error('Error deleting task:', error)
      alert('Failed to delete task. Please try again.')
    }
  }

  const handleDialogClose = () => {
    setDialogOpen(false)
    setSelectedTask(null)
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

  if (!user) {
    return null
  }

  if (!userData) {
    return (
      <Container>
        <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '100vh', flexDirection: 'column', gap: 2 }}>
          <Typography>Loading user data...</Typography>
          <Typography variant="body2" color="text.secondary">
            If this persists, please refresh the page.
          </Typography>
        </Box>
      </Container>
    )
  }

  const isEmployer = userData.role === 'employer'
  const canCreateTask = isEmployer

  return (
    <>
      <AppBar position="static">
        <Toolbar>
          <Typography variant="h6" component="div" sx={{ flexGrow: 1 }}>
            Task Calendar
          </Typography>
          <Chip 
            label={userData.role === 'employer' ? 'Employer' : 'Helper'} 
            color="secondary" 
            sx={{ mr: 2 }} 
          />
          <Typography variant="body2" sx={{ mr: 2 }}>
            {userData.displayName}
          </Typography>
          <Button color="inherit" startIcon={<Logout />} onClick={handleLogout}>
            Logout
          </Button>
        </Toolbar>
      </AppBar>

      <Container maxWidth="xl" sx={{ py: 4 }}>
        {isEmployer && (
          <HelperManagement />
        )}

        <Box sx={{ mb: 4, display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 2 }}>
          <Box>
            <Typography variant="h3" component="h1" gutterBottom>
              Task Calendar
            </Typography>
            <Typography variant="body1" color="text.secondary">
              {isEmployer ? 'Manage and assign tasks to helpers' : 'View your assigned tasks'}
            </Typography>
          </Box>
          <Box sx={{ display: 'flex', gap: 2, alignItems: 'center' }}>
            <FormControl size="small" sx={{ minWidth: 150 }}>
              <InputLabel>View</InputLabel>
              <Select
                value={viewType}
                label="View"
                onChange={(e) => setViewType(e.target.value as ViewType)}
              >
                <MenuItem value="day">Day</MenuItem>
                <MenuItem value="threeDay">3 Days</MenuItem>
                <MenuItem value="week">Week</MenuItem>
                <MenuItem value="month">Month</MenuItem>
              </Select>
            </FormControl>
            {canCreateTask && (
              <Button
                variant="contained"
                startIcon={<Add />}
                onClick={handleCreateTask}
                size="large"
              >
                Create Task
              </Button>
            )}
          </Box>
        </Box>
        
        {viewType === 'day' && (
          <DayView
            tasks={tasks}
            onTaskClick={handleTaskClick}
            onTaskEdit={isEmployer ? handleTaskEdit : undefined}
            onTaskDelete={isEmployer ? handleTaskDelete : undefined}
            onTaskToggleComplete={handleTaskToggleComplete}
          />
        )}
        
        {viewType === 'threeDay' && (
          <ThreeDayView
            tasks={tasks}
            onTaskClick={handleTaskClick}
            onTaskEdit={isEmployer ? handleTaskEdit : undefined}
            onTaskDelete={isEmployer ? handleTaskDelete : undefined}
            onTaskToggleComplete={handleTaskToggleComplete}
          />
        )}
        
        {viewType === 'week' && (
          <TimeSlotCalendar
            tasks={tasks}
            onTaskClick={handleTaskClick}
            onTaskEdit={isEmployer ? handleTaskEdit : undefined}
            onTaskDelete={isEmployer ? handleTaskDelete : undefined}
            onTaskToggleComplete={handleTaskToggleComplete}
          />
        )}
        
        {viewType === 'month' && (
          <MonthView
            tasks={tasks}
            onTaskClick={handleTaskClick}
            onTaskEdit={isEmployer ? handleTaskEdit : undefined}
            onTaskDelete={isEmployer ? handleTaskDelete : undefined}
            onTaskToggleComplete={handleTaskToggleComplete}
          />
        )}

        <TaskDialog
          open={dialogOpen}
          task={selectedTask}
          mode={dialogMode}
          onClose={handleDialogClose}
          onSave={handleTaskSave}
          onDelete={handleTaskDelete}
          onModeChange={(newMode) => setDialogMode(newMode)}
          helpers={helpers.map(h => ({ uid: h.uid, displayName: h.displayName, email: h.email }))}
          isEmployer={isEmployer}
        />
      </Container>
    </>
  )
}
