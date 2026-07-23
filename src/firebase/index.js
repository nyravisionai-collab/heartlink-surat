// Firebase services
export { app, auth, db, storage, rtdb } from './config'

// Auth functions
export {
  registerWithEmail,
  loginWithEmail,
  loginWithGoogle,
  logoutUser,
  resetPassword,
  subscribeToAuthChanges,
} from './auth'

// Firestore functions
export {
  getUserProfile,
  updateUserProfile,
  createUserProfile,
  checkProfileComplete,
} from './firestore'

// Storage functions
export {
  uploadProfileImage,
  deleteProfileImage,
  compressImage,
} from './storage'

// Presence functions
export {
  setupPresence,
  getUserStatus,
  updateLastActive,
  cleanupPresence,
} from './presence'

// Users functions
export {
  subscribeToUsers,
  searchUsers,
  updateLastActive as updateUserLastActive,
  getUserById,
} from './users'
