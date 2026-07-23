import { doc, getDoc, setDoc, updateDoc, serverTimestamp } from 'firebase/firestore'
import { db } from './config'

// Get user profile
export const getUserProfile = async (uid) => {
  try {
    const userDoc = await getDoc(doc(db, 'users', uid))
    if (userDoc.exists()) {
      return { success: true, data: userDoc.data() }
    }
    return { success: false, error: 'User profile not found' }
  } catch (error) {
    return { success: false, error: error.message }
  }
}

// Update user profile
export const updateUserProfile = async (uid, data) => {
  try {
    await updateDoc(doc(db, 'users', uid), {
      ...data,
      lastActive: serverTimestamp(),
    })
    return { success: true }
  } catch (error) {
    return { success: false, error: error.message }
  }
}

// Create user profile (for initial setup)
export const createUserProfile = async (uid, data) => {
  try {
    await setDoc(doc(db, 'users', uid), {
      ...data,
      createdAt: serverTimestamp(),
      lastActive: serverTimestamp(),
    })
    return { success: true }
  } catch (error) {
    return { success: false, error: error.message }
  }
}

// Check if profile is complete
export const checkProfileComplete = async (uid) => {
  try {
    const userDoc = await getDoc(doc(db, 'users', uid))
    if (userDoc.exists()) {
      const data = userDoc.data()
      return {
        success: true,
        isComplete: data.profileCompleted === true,
      }
    }
    return { success: false, isComplete: false }
  } catch (error) {
    return { success: false, isComplete: false, error: error.message }
  }
}
