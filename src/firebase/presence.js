import { ref, set, onDisconnect, onValue, off, serverTimestamp } from 'firebase/database'
import { rtdb } from './config'

// Setup presence system for a user
export const setupPresence = (uid) => {
  if (!uid) return () => {}

  const userStatusRef = ref(rtdb, `/status/${uid}`)
  const connectedRef = ref(rtdb, '.info/connected')

  // Listen for connection state changes
  const unsubscribe = onValue(connectedRef, (snapshot) => {
    if (snapshot.val() === false) {
      return
    }

    // When the client connects, setup onDisconnect
    onDisconnect(userStatusRef)
      .set({
        isOnline: false,
        lastSeen: serverTimestamp(),
      })
      .then(() => {
        // Set the user as online
        set(userStatusRef, {
          isOnline: true,
          lastSeen: serverTimestamp(),
        })
      })
  })

  // Return cleanup function
  return () => {
    off(connectedRef)
    // Set user as offline when cleaning up
    set(userStatusRef, {
      isOnline: false,
      lastSeen: serverTimestamp(),
    })
  }
}

// Get user's online status
export const getUserStatus = (uid, callback) => {
  if (!uid) return () => {}

  const userStatusRef = ref(rtdb, `/status/${uid}`)
  
  const unsubscribe = onValue(userStatusRef, (snapshot) => {
    const data = snapshot.val()
    callback(data || { isOnline: false, lastSeen: null })
  })

  return unsubscribe
}

// Update last active timestamp in Firestore
export const updateLastActive = async (uid, db) => {
  try {
    const { updateDoc, doc, serverTimestamp: serverTS } = await import('firebase/firestore')
    await updateDoc(doc(db, 'users', uid), {
      lastActive: serverTS(),
    })
  } catch (error) {
    console.error('Error updating last active:', error)
  }
}

// Cleanup presence on logout
export const cleanupPresence = (uid) => {
  if (!uid) return Promise.resolve()

  const userStatusRef = ref(rtdb, `/status/${uid}`)
  
  return set(userStatusRef, {
    isOnline: false,
    lastSeen: serverTimestamp(),
  })
}
