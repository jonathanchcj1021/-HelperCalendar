import { db } from './config'
import {
  collection,
  addDoc,
  updateDoc,
  deleteDoc,
  doc,
  getDocs,
  query,
  where,
  Timestamp,
  getDoc,
} from 'firebase/firestore'
import type { Task } from '@/types/task'

export async function createTask(task: Omit<Task, 'id'>, employerId: string, assignedTo?: string): Promise<string> {
  const taskData: any = {
    title: task.title,
    description: task.description,
    startDateTime: Timestamp.fromDate(task.startDateTime),
    endDateTime: Timestamp.fromDate(task.endDateTime),
    completed: task.completed || false,
    employerId,
    assignedTo: assignedTo || null,
    createdAt: Timestamp.now(),
    updatedAt: Timestamp.now(),
  }

  // Only include optional fields if they are defined
  if (task.completedDates !== undefined && task.completedDates !== null) {
    taskData.completedDates = task.completedDates
  }
  if (task.repeatDays !== undefined && task.repeatDays !== null) {
    taskData.repeatDays = task.repeatDays
  }

  const docRef = await addDoc(collection(db, 'tasks'), taskData)
  return docRef.id
}

export async function updateTask(taskId: string, task: Partial<Omit<Task, 'id'>>): Promise<void> {
  const taskData: any = {
    updatedAt: Timestamp.now(),
  }

  // Only include fields that are defined
  if (task.title !== undefined) taskData.title = task.title
  if (task.description !== undefined) taskData.description = task.description
  if (task.completed !== undefined) taskData.completed = task.completed
  if (task.completedDates !== undefined) taskData.completedDates = task.completedDates
  if (task.repeatDays !== undefined) taskData.repeatDays = task.repeatDays
  if (task.assignedTo !== undefined) taskData.assignedTo = task.assignedTo || null

  if (task.startDateTime) {
    taskData.startDateTime = Timestamp.fromDate(task.startDateTime)
  }
  if (task.endDateTime) {
    taskData.endDateTime = Timestamp.fromDate(task.endDateTime)
  }

  await updateDoc(doc(db, 'tasks', taskId), taskData)
}

export async function deleteTask(taskId: string): Promise<void> {
  await deleteDoc(doc(db, 'tasks', taskId))
}

export async function getTasks(employerId: string, assignedTo?: string): Promise<Task[]> {
  let q
  if (assignedTo) {
    // Helper view: get tasks assigned to them
    q = query(
      collection(db, 'tasks'),
      where('assignedTo', '==', assignedTo)
    )
  } else {
    // Employer view: get all tasks they created
    q = query(
      collection(db, 'tasks'),
      where('employerId', '==', employerId)
    )
  }

  const querySnapshot = await getDocs(q)
  const tasks: Task[] = []

  querySnapshot.forEach((docSnapshot) => {
    const data = docSnapshot.data()
    tasks.push({
      id: docSnapshot.id,
      title: data.title,
      description: data.description,
      startDateTime: data.startDateTime.toDate(),
      endDateTime: data.endDateTime.toDate(),
      completed: data.completed || false,
      completedDates: data.completedDates || undefined,
      repeatDays: data.repeatDays || undefined,
    })
  })

  return tasks
}

export async function getTask(taskId: string): Promise<Task | null> {
  const taskDoc = await getDoc(doc(db, 'tasks', taskId))
  if (taskDoc.exists()) {
    const data = taskDoc.data()
    return {
      id: taskDoc.id,
      title: data.title,
      description: data.description,
      startDateTime: data.startDateTime.toDate(),
      endDateTime: data.endDateTime.toDate(),
      completed: data.completed || false,
      completedDates: data.completedDates || undefined,
      repeatDays: data.repeatDays || undefined,
    }
  }
  return null
}

