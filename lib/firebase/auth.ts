import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut,
  User,
  updateProfile,
} from 'firebase/auth'
import { auth, db } from './config'
import { doc, setDoc, getDoc, Timestamp } from 'firebase/firestore'

export type UserRole = 'employer' | 'helper'

export interface UserData {
  uid: string
  email: string
  displayName: string
  role: UserRole
  employerId?: string // For helpers, the ID of their employer
  createdAt: Date
}

export async function registerUser(
  email: string,
  password: string,
  displayName: string,
  role: UserRole,
  employerId?: string
): Promise<User> {
  const userCredential = await createUserWithEmailAndPassword(auth, email, password)
  const user = userCredential.user

  // Update display name
  await updateProfile(user, { displayName })

  // Save user data to Firestore
  try {
    const userData: any = {
      uid: user.uid,
      email: user.email || '',
      displayName,
      role,
      createdAt: Timestamp.now(), // Use Firestore Timestamp instead of Date
    }

    // Only include employerId if it exists (for helpers)
    if (role === 'helper' && employerId) {
      userData.employerId = employerId
    }

    await setDoc(doc(db, 'users', user.uid), userData)
    console.log('✅ User data saved to Firestore:', user.uid)
  } catch (error: any) {
    console.error('❌ Error saving user data to Firestore:', error)
    // Don't throw - authentication succeeded, just log the error
    // The user can still use the app, we'll try to save again later if needed
    if (error.code === 'permission-denied') {
      console.error('⚠️ Firestore permission denied. Please check your Firestore security rules.')
    }
  }

  return user
}

export async function loginUser(email: string, password: string): Promise<User> {
  const userCredential = await signInWithEmailAndPassword(auth, email, password)
  return userCredential.user
}

export async function logoutUser(): Promise<void> {
  await signOut(auth)
}

export async function getUserData(uid: string): Promise<UserData | null> {
  try {
    const userDoc = await getDoc(doc(db, 'users', uid))
    if (userDoc.exists()) {
      const data = userDoc.data()
      return {
        ...data,
        createdAt: data.createdAt?.toDate() || new Date(),
      } as UserData
    }
    return null
  } catch (error) {
    console.error('Error getting user data:', error)
    return null
  }
}

