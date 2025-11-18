'use client'

import { useState } from 'react'
import {
  Box,
  Paper,
  Typography,
  Grid,
  Chip,
  IconButton,
  Card,
  CardContent,
  Checkbox,
  Tooltip,
} from '@mui/material'
import {
  ChevronLeft,
  ChevronRight,
  CheckCircle,
  RadioButtonUnchecked,
} from '@mui/icons-material'
import { format, startOfWeek, addDays, addWeeks, isSameDay } from 'date-fns'
import { enUS } from 'date-fns/locale'
import type { Task } from '@/types/task'

interface WeeklyCalendarProps {
  tasks: Task[]
  onTaskToggle: (taskId: string) => void
}

export function WeeklyCalendar({ tasks, onTaskToggle }: WeeklyCalendarProps) {
  const [currentWeek, setCurrentWeek] = useState(new Date())

  const weekStart = startOfWeek(currentWeek, { weekStartsOn: 1 }) // Monday start
  const weekDays = Array.from({ length: 7 }, (_, i) => addDays(weekStart, i))

  const handlePreviousWeek = () => {
    setCurrentWeek(addWeeks(currentWeek, -1))
  }

  const handleNextWeek = () => {
    setCurrentWeek(addWeeks(currentWeek, 1))
  }

  const getTasksForDay = (day: Date) => {
    const dayTasks = tasks.filter(task => isSameDay(task.date, day))
    // Sort by time, tasks without time go to the end
    return dayTasks.sort((a, b) => {
      if (!a.time && !b.time) return 0
      if (!a.time) return 1
      if (!b.time) return -1
      return a.time.localeCompare(b.time)
    })
  }

  const dayNames = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun']

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

      <Grid container spacing={2}>
        {weekDays.map((day, index) => {
          const dayTasks = getTasksForDay(day)
          const isToday = isSameDay(day, new Date())
          
          return (
            <Grid item xs={12} sm={6} md={12/7} key={day.toISOString()}>
              <Card 
                variant="outlined"
                sx={{
                  height: '100%',
                  border: isToday ? 2 : 1,
                  borderColor: isToday ? 'primary.main' : 'divider',
                  bgcolor: isToday ? 'action.selected' : 'background.paper',
                }}
              >
                <CardContent>
                  <Typography 
                    variant="subtitle1" 
                    fontWeight="bold"
                    gutterBottom
                    color={isToday ? 'primary.main' : 'text.primary'}
                  >
                    {dayNames[index]}
                  </Typography>
                  <Typography variant="caption" color="text.secondary" display="block" sx={{ mb: 2 }}>
                    {format(day, 'MM/dd')}
                  </Typography>

                  <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
                    {dayTasks.length === 0 ? (
                      <Typography variant="body2" color="text.secondary" sx={{ fontStyle: 'italic' }}>
                        No tasks
                      </Typography>
                    ) : (
                      dayTasks.map(task => (
                        <Tooltip key={task.id} title={task.description} arrow>
                          <Box
                            sx={{
                              display: 'flex',
                              alignItems: 'center',
                              gap: 1,
                              p: 1,
                              borderRadius: 1,
                              bgcolor: task.completed ? 'action.hover' : 'background.default',
                              cursor: 'pointer',
                              '&:hover': {
                                bgcolor: 'action.selected',
                              },
                            }}
                            onClick={() => onTaskToggle(task.id)}
                          >
                            <Checkbox
                              checked={task.completed}
                              icon={<RadioButtonUnchecked />}
                              checkedIcon={<CheckCircle />}
                              size="small"
                              sx={{ p: 0.5 }}
                            />
                            <Box sx={{ flex: 1, minWidth: 0 }}>
                              <Typography
                                variant="body2"
                                sx={{
                                  textDecoration: task.completed ? 'line-through' : 'none',
                                  color: task.completed ? 'text.secondary' : 'text.primary',
                                  overflow: 'hidden',
                                  textOverflow: 'ellipsis',
                                  whiteSpace: 'nowrap',
                                }}
                              >
                                {task.title}
                              </Typography>
                              {task.time && (
                                <Typography
                                  variant="caption"
                                  sx={{
                                    color: 'text.secondary',
                                    display: 'block',
                                    mt: 0.25,
                                  }}
                                >
                                  {task.time}
                                </Typography>
                              )}
                            </Box>
                          </Box>
                        </Tooltip>
                      ))
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

