export interface Task {
  id: string
  title: string
  description: string
  startDateTime: Date // Start date and time
  endDateTime: Date // End date and time
  completed: boolean // For one-time tasks
  completedDates?: string[] // For repeating tasks: array of date strings (YYYY-MM-DD) that are completed
  repeatDays?: boolean[] // [Monday, Tuesday, Wednesday, Thursday, Friday, Saturday, Sunday]
  employerId?: string // ID of the employer who created the task
  assignedTo?: string // ID of the helper assigned to this task
}

