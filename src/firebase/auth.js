import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signInWithPopup,
  GoogleAuthProvider,
  signOut,
  sendPasswordResetEmail,
  updateProfile,
  onAuthStateChanged,
} from 'firebase/auth'
import { doc, setDoc, getDoc } from 'firebase/firestore'
import { auth, db } from './config'

// Google Auth Provider
const googleProvider = new GoogleAuthProvider()
googleProvider.setCustomParameters({
  prompt: 'select_account',
})

// Register with email and password
export const registerWithEmail = async (email, password, displayName) => {
  try {
    const userCredential = await createUserWithEmailAndPassword(auth, email, password)
    const user = userCredential.user

    // Update Firebase Auth profile
    await updateProfile(user, { displayName })

    // Create user document in Firestore
    await setDoc(doc(db, 'users', user.uid), {
      uid: user.uid,
      email: user.email,
      displayName,
      photoURL: null,
      city: '',
      createdAt: new Date().toISOString(),
      lastActive: new Date().toISOString(),
      isOnline: true,
      profileCompleted: false,
    })

    return { success: true, user }
  } catch (error) {
    return { success: false, error: mapAuthError(error) }
  }
}

// Login with email and password
export const loginWithEmail = async (email, password) => {
  try {
    const userCredential = await signInWithEmailAndPassword(auth, email, password)
    return { success: true, user: userCredential.user }
  } catch (error) {
    return { success: false, error: mapAuthError(error) }
  }
}

// Login with Google
export const loginWithGoogle = async () => {
  try {
    const userCredential = await signInWithPopup(auth, googleProvider)
    const user = userCredential.user

    // Check if user document exists
    const userDoc = await getDoc(doc(db, 'users', user.uid))

    if (!userDoc.exists()) {
      // Create user document for Google sign-in
      await setDoc(doc(db, 'users', user.uid), {
        uid: user.uid,
        email: user.email,
        displayName: user.displayName || 'User',
        photoURL: user.photoURL,
        city: '',
        createdAt: new Date().toISOString(),
        lastActive: new Date().toISOString(),
        isOnline: true,
        profileCompleted: false,
      })
    }

    return { success: true, user }
  } catch (error) {
    return { success: false, error: mapAuthError(error) }
  }
}

// Logout
export const logoutUser = async () => {
  try {
    await signOut(auth)
    return { success: true }
  } catch (error) {
    return { success: false, error: mapAuthError(error) }
  }
}

// Reset password
export const resetPassword = async (email) => {
  try {
    await sendPasswordResetEmail(auth, email)
    return { success: true }
  } catch (error) {
    return { success: false, error: mapAuthError(error) }
  }
}

// Subscribe to auth state changes
export const subscribeToAuthChanges = (callback) => {
  return onAuthStateChanged(auth, callback)
}

// Map Firebase auth errors to user-friendly messages
const mapAuthError = (error) => {
  const errorCode = error.code || error.message

  const errorMap = {
    'auth/email-already-in-use': 'This email is already registered. Please login instead.',
    'auth/invalid-email': 'Please enter a valid email address.',
    'auth/operation-not-allowed': 'This authentication method is not enabled.',
    'auth/weak-password': 'Password should be at least 6 characters long.',
    'auth/user-disabled': 'This account has been disabled.',
    'auth/user-not-found': 'No account found with this email address.',
    'auth/wrong-password': 'Incorrect password. Please try again.',
    'auth/too-many-requests': 'Too many failed attempts. Please try again later.',
    'auth/popup-closed-by-user': 'Sign-in was cancelled.',
    'auth/cancelled-popup-request': 'Sign-in was cancelled.',
    'auth/network-request-failed': 'Network error. Please check your connection.',
  }

  return errorMap[errorCode] || 'An error occurred. Please try again.'
}

export { auth }
