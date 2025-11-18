import { initializeApp, getApps } from 'firebase/app'
import { getAuth } from 'firebase/auth'
import { getFirestore } from 'firebase/firestore'

const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
}

// Validate Firebase config
if (typeof window !== 'undefined') {
  const missingConfig = []
  if (!firebaseConfig.apiKey || firebaseConfig.apiKey === 'your_api_key_here') {
    missingConfig.push('NEXT_PUBLIC_FIREBASE_API_KEY')
  }
  if (!firebaseConfig.authDomain || firebaseConfig.authDomain.includes('your-project-id')) {
    missingConfig.push('NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN')
  }
  if (!firebaseConfig.projectId || firebaseConfig.projectId === 'your_project_id') {
    missingConfig.push('NEXT_PUBLIC_FIREBASE_PROJECT_ID')
  }
  
  if (missingConfig.length > 0) {
    console.error('❌ Firebase configuration is missing or incorrect:', missingConfig.join(', '))
    console.error('Please check your .env.local file and ensure all Firebase config values are set correctly.')
  } else {
    console.log('✅ Firebase configuration loaded successfully')
  }
}

// Initialize Firebase
const app = getApps().length === 0 ? initializeApp(firebaseConfig) : getApps()[0]

export const auth = getAuth(app)
export const db = getFirestore(app)
export default app

