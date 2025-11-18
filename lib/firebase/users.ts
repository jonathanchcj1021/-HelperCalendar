import { db } from './config'
import { collection, getDocs, query, where, getDoc, doc } from 'firebase/firestore'
import type { UserData } from './auth'

export async function getHelpersByEmployer(employerId: string): Promise<UserData[]> {
  const q = query(
    collection(db, 'users'),
    where('role', '==', 'helper'),
    where('employerId', '==', employerId)
  )

  const querySnapshot = await getDocs(q)
  const helpers: UserData[] = []

  querySnapshot.forEach((docSnapshot) => {
    const data = docSnapshot.data()
    helpers.push({
      uid: docSnapshot.id,
      email: data.email,
      displayName: data.displayName,
      role: data.role,
      employerId: data.employerId,
      createdAt: data.createdAt?.toDate() || new Date(),
    })
  })

  return helpers
}

export async function getUserById(uid: string): Promise<UserData | null> {
  const userDoc = await getDoc(doc(db, 'users', uid))
  if (userDoc.exists()) {
    const data = userDoc.data()
    return {
      uid: userDoc.id,
      email: data.email,
      displayName: data.displayName,
      role: data.role,
      employerId: data.employerId,
      createdAt: data.createdAt?.toDate() || new Date(),
    }
  }
  return null
}

