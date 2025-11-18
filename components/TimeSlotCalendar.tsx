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
import { format, startOfWeek, addDays, addWeeks, isSameDay, getDay } from 'date-fns'
import { enUS } from 'date-fns/locale'
import type { Task } from '@/types/task'

interface TimeSlotCalendarProps {
  tasks: Task[]
  onTaskClick: (task: Task, date?: Date) => void
  onTaskEdit?: (task: Task) => void
  onTaskDelete?: (taskId: string) => void
  onTaskToggleComplete?: (taskId: string, date: Date) => void
}

// Generate time slots from 00:00 to 23:30 (30-minute intervals)
const generateTimeSlots = () => {
  const slots = []
  for (let hour = 0; hour < 24; hour++) {
    for (let minute = 0; minute < 60; minute += 30) {
      const time = `${hour.toString().padStart(2, '0')}:${minute.toString().padStart(2, '0')}`
      slots.push(time)
    }
  }
  return slots
}

const timeSlots = generateTimeSlots()
const dayNames = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun']

export function TimeSlotCalendar({ tasks, onTaskClick, onTaskEdit, onTaskDelete, onTaskToggleComplete }: TimeSlotCalendarProps) {
  const [currentWeek, setCurrentWeek] = useState(new Date())

  const weekStart = startOfWeek(currentWeek, { weekStartsOn: 1 }) // Monday start
  const weekDays = Array.from({ length: 7 }, (_, i) => addDays(weekStart, i))

  const handlePreviousWeek = () => {
    setCurrentWeek(addWeeks(currentWeek, -1))
  }

  const handleNextWeek = () => {
    setCurrentWeek(addWeeks(currentWeek, 1))
  }

  // Helper function to round time down to nearest 30-minute slot
  const roundToTimeSlot = (date: Date): string => {
    const hours = date.getHours()
    const minutes = date.getMinutes()
    const roundedMinutes = Math.floor(minutes / 30) * 30
    return `${String(hours).padStart(2, '0')}:${String(roundedMinutes).padStart(2, '0')}`
  }

  // Get tasks for a specific day and time slot
  const getTasksForSlot = (day: Date, timeSlot: string) => {
    const dayOfWeek = (getDay(day) + 6) % 7 // Convert to Monday=0, Sunday=6
    
    return tasks.filter(task => {
      // Ensure startDateTime is a Date object
      const startDate = task.startDateTime instanceof Date 
        ? task.startDateTime 
        : new Date(task.startDateTime)
      
      // Round task time to nearest 30-minute slot
      const taskTimeSlot = roundToTimeSlot(startDate)
      
      // Must have matching time slot
      if (taskTimeSlot !== timeSlot) return false
      
      // Check if task is on this specific date (one-time task)
      if (isSameDay(startDate, day)) {
        return true
      }
      
      // Check if task repeats on this day of week
      if (task.repeatDays && task.repeatDays[dayOfWeek]) {
        // Task repeats on this day of week
        return true
      }
      
      return false
    })
  }

  const formatTime = (time: string) => {
    const [hours, minutes] = time.split(':')
    const hour = parseInt(hours)
    const ampm = hour >= 12 ? 'PM' : 'AM'
    const displayHour = hour % 12 || 12
    return `${displayHour}:${minutes} ${ampm}`
  }

  return (
    <Paper elevation={3} sx={{ p: 3 }}>
      <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 3 }}>
        <IconButton onClick={handlePreviousWeek}>
          <ChevronLeft />
        </IconButton>
        
        <Typography variant="h5" component="h2">
          {format(weekStart, 'MMM dd, yyyy', { locale: enUS })} - {format(addDays(weekStart, 6), 'MMM dd, yyyy', { locale: enUS })}
        </Typography>
        
        <IconButton onClick={handleNextWeek}>
          <ChevronRight />
        </IconButton>
      </Box>

      <Box sx={{ overflowX: 'auto' }}>
        <Grid container spacing={1}>
          {/* Time column */}
          <Grid item xs={1}>
            <Box sx={{ minHeight: '40px' }} />
            {timeSlots.map((time, index) => (
              <Box
                key={time}
                sx={{
                  height: '60px',
                  borderRight: '1px solid',
                  borderColor: 'divider',
                  display: 'flex',
                  alignItems: 'flex-start',
                  pt: 0.5,
                  pr: 1,
                }}
              >
                {index % 2 === 0 && (
                  <Typography variant="caption" color="text.secondary">
                    {formatTime(time)}
                  </Typography>
                )}
              </Box>
            ))}
          </Grid>

          {/* Day columns */}
          {weekDays.map((day, dayIndex) => {
            const isToday = isSameDay(day, new Date())
            
            return (
              <Grid item xs={11/7} key={day.toISOString()}>
                {/* Day header */}
                <Card
                  variant="outlined"
                  sx={{
                    border: isToday ? 2 : 1,
                    borderColor: isToday ? 'primary.main' : 'divider',
                    bgcolor: isToday ? 'action.selected' : 'background.paper',
                    mb: 1,
                  }}
                >
                  <CardContent sx={{ p: 1.5, '&:last-child': { pb: 1.5 } }}>
                    <Typography variant="subtitle2" fontWeight="bold" align="center">
                      {dayNames[dayIndex]}
                    </Typography>
                    <Typography variant="caption" color="text.secondary" align="center" display="block">
                      {format(day, 'MM/dd')}
                    </Typography>
                  </CardContent>
                </Card>

                {/* Time slots for this day */}
                <Box>
                  {timeSlots.map((timeSlot) => {
                    const slotTasks = getTasksForSlot(day, timeSlot)
                    
                    return (
                      <Box
                        key={timeSlot}
                        sx={{
                          height: '60px',
                          border: '1px solid',
                          borderColor: 'divider',
                          borderTop: 'none',
                          position: 'relative',
                          '&:hover': {
                            bgcolor: 'action.hover',
                          },
                        }}
                      >
                        {slotTasks.map((task, taskIndex) => {
                          // Check if this specific date instance is completed
                          const dateString = format(day, 'yyyy-MM-dd')
                          const isCompleted = task.repeatDays 
                            ? (task.completedDates || []).includes(dateString)
                            : task.completed
                          
                          return (
                          <Box
                            key={`${task.id}-${day.toISOString()}-${timeSlot}`}
                            sx={{
                              position: 'absolute',
                              top: `${taskIndex * 28}px`,
                              left: '2px',
                              right: '2px',
                              display: 'flex',
                              gap: 0.5,
                            }}
                          >
                            <IconButton
                              size="small"
                              sx={{
                                width: '26px',
                                height: '26px',
                                p: 0.5,
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
                                <CheckCircle fontSize="small" />
                              ) : (
                                <RadioButtonUnchecked fontSize="small" />
                              )}
                            </IconButton>
                            <Tooltip title={task.description || task.title} arrow>
                              <Chip
                                label={task.title}
                                size="small"
                                color={isCompleted ? 'default' : 'primary'}
                                sx={{
                                  flex: 1,
                                  height: '26px',
                                  fontSize: '0.7rem',
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
                            {onTaskEdit && (
                              <IconButton
                                size="small"
                                sx={{
                                  width: '26px',
                                  height: '26px',
                                  p: 0.5,
                                }}
                                onClick={(e) => {
                                  e.stopPropagation()
                                  onTaskEdit(task)
                                }}
                              >
                                <Edit fontSize="small" />
                              </IconButton>
                            )}
                            {onTaskDelete && (
                              <IconButton
                                size="small"
                                color="error"
                                sx={{
                                  width: '26px',
                                  height: '26px',
                                  p: 0.5,
                                }}
                                onClick={(e) => {
                                  e.stopPropagation()
                                  if (window.confirm('Are you sure you want to delete this task?')) {
                                    onTaskDelete(task.id)
                                  }
                                }}
                              >
                                <Delete fontSize="small" />
                              </IconButton>
                            )}
                          </Box>
                        )})}
                      </Box>
                    )
                  })}
                </Box>
              </Grid>
            )
          })}
        </Grid>
      </Box>
    </Paper>
  )
}

