'use client'

import { useState } from 'react'
import {
  Box,
  Paper,
  Typography,
  Grid,
  IconButton,
  Card,
  CardContent,
  Chip,
  Tooltip,
} from '@mui/material'
import {
  ChevronLeft,
  ChevronRight,
  Edit,
  Delete,
  CheckCircle,
  RadioButtonUnchecked,
} from '@mui/icons-material'
import { format, startOfMonth, endOfMonth, startOfWeek, addDays, addMonths, isSameDay, isSameMonth, getDay } from 'date-fns'
import { enUS } from 'date-fns/locale'
import type { Task } from '@/types/task'

interface MonthViewProps {
  tasks: Task[]
  onTaskClick: (task: Task, date?: Date) => void
  onTaskEdit?: (task: Task) => void
  onTaskDelete?: (taskId: string) => void
  onTaskToggleComplete?: (taskId: string, date: Date) => void
}

export function MonthView({ tasks, onTaskClick, onTaskEdit, onTaskDelete, onTaskToggleComplete }: MonthViewProps) {
  const [currentMonth, setCurrentMonth] = useState(new Date())

  const monthStart = startOfMonth(currentMonth)
  const monthEnd = endOfMonth(currentMonth)
  const startDate = startOfWeek(monthStart, { weekStartsOn: 1 })
  const endDate = startOfWeek(monthEnd, { weekStartsOn: 1 })
  
  const calendarDays = []
  let day = startDate
  while (day <= endDate) {
    calendarDays.push(day)
    day = addDays(day, 1)
  }

  const handlePreviousMonth = () => {
    setCurrentMonth(addMonths(currentMonth, -1))
  }

  const handleNextMonth = () => {
    setCurrentMonth(addMonths(currentMonth, 1))
  }

  const getTasksForDay = (day: Date) => {
    const dayOfWeek = (getDay(day) + 6) % 7
    
    return tasks.filter(task => {
      const startDate = task.startDateTime instanceof Date 
        ? task.startDateTime 
        : new Date(task.startDateTime)
      
      // Check if task is on this specific date (one-time task)
      if (isSameDay(startDate, day)) {
        return true
      }
      
      // Check if task repeats on this day of week
      if (task.repeatDays && task.repeatDays[dayOfWeek]) {
        return true
      }
      
      return false
    })
  }

  const dayNames = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun']

  return (
    <Paper elevation={3} sx={{ p: 3 }}>
      <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 3 }}>
        <IconButton onClick={handlePreviousMonth}>
          <ChevronLeft />
        </IconButton>
        
        <Typography variant="h5" component="h2">
          {format(currentMonth, 'MMMM yyyy', { locale: enUS })}
        </Typography>
        
        <IconButton onClick={handleNextMonth}>
          <ChevronRight />
        </IconButton>
      </Box>

      <Grid container spacing={1}>
        {/* Day headers */}
        {dayNames.map((dayName) => (
          <Grid item xs={12/7} key={dayName}>
            <Typography variant="subtitle2" fontWeight="bold" align="center" sx={{ p: 1 }}>
              {dayName}
            </Typography>
          </Grid>
        ))}

        {/* Calendar days */}
        {calendarDays.map((day, index) => {
          const dayTasks = getTasksForDay(day)
          const isToday = isSameDay(day, new Date())
          const isCurrentMonth = isSameMonth(day, currentMonth)
          
          return (
            <Grid item xs={12/7} key={day.toISOString()}>
              <Card
                variant="outlined"
                sx={{
                  minHeight: '120px',
                  border: isToday ? 2 : 1,
                  borderColor: isToday ? 'primary.main' : 'divider',
                  bgcolor: isToday ? 'action.selected' : isCurrentMonth ? 'background.paper' : 'action.hover',
                  opacity: isCurrentMonth ? 1 : 0.5,
                }}
              >
                <CardContent sx={{ p: 1, '&:last-child': { pb: 1 } }}>
                  <Typography
                    variant="body2"
                    fontWeight={isToday ? 'bold' : 'normal'}
                    color={isToday ? 'primary.main' : 'text.primary'}
                    sx={{ mb: 0.5 }}
                  >
                    {format(day, 'd')}
                  </Typography>
                  
                  <Box sx={{ display: 'flex', flexDirection: 'column', gap: 0.5 }}>
                    {dayTasks.slice(0, 3).map((task) => {
                      const dateString = format(day, 'yyyy-MM-dd')
                      const isCompleted = task.repeatDays 
                        ? (task.completedDates || []).includes(dateString)
                        : task.completed
                      
                      return (
                        <Box
                          key={`${task.id}-${day.toISOString()}`}
                          sx={{
                            display: 'flex',
                            alignItems: 'center',
                            gap: 0.5,
                          }}
                        >
                          <IconButton
                            size="small"
                            sx={{
                              width: '18px',
                              height: '18px',
                              p: 0,
                              color: isCompleted ? 'success.main' : 'action.disabled',
                            }}
                            onClick={(e) => {
                              e.stopPropagation()
                              if (onTaskToggleComplete) {
                                onTaskToggleComplete(task.id, day)
                              }
                            }}
                          >
                            {isCompleted ? (
                              <CheckCircle sx={{ fontSize: '14px' }} />
                            ) : (
                              <RadioButtonUnchecked sx={{ fontSize: '14px' }} />
                            )}
                          </IconButton>
                          <Tooltip title={task.description || task.title} arrow>
                            <Chip
                              label={task.title}
                              size="small"
                              color={isCompleted ? 'default' : 'primary'}
                              sx={{
                                fontSize: '0.65rem',
                                height: '20px',
                                flex: 1,
                                cursor: 'pointer',
                                textDecoration: isCompleted ? 'line-through' : 'none',
                                '&:hover': {
                                  opacity: 0.8,
                                },
                              }}
                              onClick={(e) => {
                                e.stopPropagation()
                                onTaskClick(task, day)
                              }}
                            />
                          </Tooltip>
                        </Box>
                      )
                    })}
                    {dayTasks.length > 3 && (
                      <Typography variant="caption" color="text.secondary">
                        +{dayTasks.length - 3} more
                      </Typography>
                    )}
                  </Box>
                </CardContent>
              </Card>
            </Grid>
          )
        })}
      </Grid>
    </Paper>
  )
}

