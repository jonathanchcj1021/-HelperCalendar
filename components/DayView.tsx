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
import { format, addDays, isSameDay, getDay } from 'date-fns'
import { enUS } from 'date-fns/locale'
import type { Task } from '@/types/task'

interface DayViewProps {
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

export function DayView({ tasks, onTaskClick, onTaskEdit, onTaskDelete, onTaskToggleComplete }: DayViewProps) {
  const [currentDate, setCurrentDate] = useState(new Date())

  const handlePrevious = () => {
    setCurrentDate(addDays(currentDate, -1))
  }

  const handleNext = () => {
    setCurrentDate(addDays(currentDate, 1))
  }

  const roundToTimeSlot = (date: Date): string => {
    const hours = date.getHours()
    const minutes = date.getMinutes()
    const roundedMinutes = Math.floor(minutes / 30) * 30
    return `${String(hours).padStart(2, '0')}:${String(roundedMinutes).padStart(2, '0')}`
  }

  const getTasksForSlot = (day: Date, timeSlot: string) => {
    const dayOfWeek = (getDay(day) + 6) % 7
    
    return tasks.filter(task => {
      const startDate = task.startDateTime instanceof Date 
        ? task.startDateTime 
        : new Date(task.startDateTime)
      
      const taskTimeSlot = roundToTimeSlot(startDate)
      
      if (taskTimeSlot !== timeSlot) return false
      
      if (isSameDay(startDate, day)) {
        return true
      }
      
      if (task.repeatDays && task.repeatDays[dayOfWeek]) {
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

  const isToday = isSameDay(currentDate, new Date())

  return (
    <Paper elevation={3} sx={{ p: 3 }}>
      <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 3 }}>
        <IconButton onClick={handlePrevious}>
          <ChevronLeft />
        </IconButton>
        
        <Typography variant="h5" component="h2">
          {format(currentDate, 'EEEE, MMMM dd, yyyy', { locale: enUS })}
        </Typography>
        
        <IconButton onClick={handleNext}>
          <ChevronRight />
        </IconButton>
      </Box>

      <Box sx={{ overflowX: 'auto' }}>
        <Grid container spacing={1}>
          {/* Time column */}
          <Grid item xs={2}>
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

          {/* Day column */}
          <Grid item xs={10}>
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
                <Typography variant="subtitle1" fontWeight="bold" align="center">
                  {format(currentDate, 'EEEE', { locale: enUS })}
                </Typography>
                <Typography variant="caption" color="text.secondary" align="center" display="block">
                  {format(currentDate, 'MMM dd, yyyy', { locale: enUS })}
                </Typography>
              </CardContent>
            </Card>

            {/* Time slots */}
            <Box>
              {timeSlots.map((timeSlot) => {
                const slotTasks = getTasksForSlot(currentDate, timeSlot)
                
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
                      const dateString = format(currentDate, 'yyyy-MM-dd')
                      const isCompleted = task.repeatDays 
                        ? (task.completedDates || []).includes(dateString)
                        : task.completed
                      
                      return (
                        <Box
                          key={`${task.id}-${currentDate.toISOString()}-${timeSlot}`}
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
                                onTaskToggleComplete(task.id, currentDate)
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
                                onTaskClick(task, currentDate)
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
                      )
                    })}
                  </Box>
                )
              })}
            </Box>
          </Grid>
        </Grid>
      </Box>
    </Paper>
  )
}

