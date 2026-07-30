import { collection, query, where, orderBy, onSnapshot, updateDoc, doc } from 'firebase/firestore'
import { db } from './config'

// Subscribe to all users (except current user) with online status merged
export const subscribeToUsers = (currentUserId, callback) => {
  const usersRef = collection(db, 'users')
  const q = query(usersRef, where('profileCompleted', '==', true))
  
  return onSnapshot(q, (snapshot) => {
    const users = []
    snapshot.forEach((docSnap) => {
      const userData = docSnap.data()
      // Exclude current user
      if (docSnap.id !== currentUserId) {
        users.push({
          uid: docSnap.id,
          ...userData,
        })
      }
    })
    
    // Sort: online users first, then alphabetically by displayName
    users.sort((a, b) => {
      const aOnline = a.isOnline ? 1 : 0
      const bOnline = b.isOnline ? 1 : 0
      if (aOnline !== bOnline) return bOnline - aOnline
      const nameA = a.displayName?.toLowerCase() || ''
      const nameB = b.displayName?.toLowerCase() || ''
      return nameA.localeCompare(nameB)
    })
    
    callback(users)
  }, (error) => {
    console.error('Error subscribing to users:', error)
    callback([])
  })
}

// Search users by name or city
export const searchUsers = (users, searchQuery) => {
  if (!searchQuery || searchQuery.trim() === '') {
    return users
  }
  
  const query = searchQuery.toLowerCase().trim()
  
  return users.filter((user) => {
    const name = user.displayName?.toLowerCase() || ''
    const city = user.city?.toLowerCase() || ''
    
    return name.includes(query) || city.includes(query)
  })
}

// Update user's last active timestamp
export const updateLastActive = async (userId) => {
  try {
    const userRef = doc(db, 'users', userId)
    await updateDoc(userRef, {
      lastActive: new Date(),
    })
  } catch (error) {
    console.error('Error updating last active:', error)
  }
}

// Get user by ID
export const getUserById = async (userId) => {
  try {
    const { getDoc } = await import('firebase/firestore')
    const userDoc = await getDoc(doc(db, 'users', userId))
    
    if (userDoc.exists()) {
      return {
        success: true,
        data: { uid: userDoc.id, ...userDoc.data() },
      }
    }
    
    return { success: false, error: 'User not found' }
  } catch (error) {
    return { success: false, error: error.message }
  }
}

// Get user by display name (searches all completed profiles)
export const getUserByName = async (displayName) => {
  try {
    const { getDocs } = await import('firebase/firestore')
    const usersRef = collection(db, 'users')
    const q = query(usersRef, where('profileCompleted', '==', true))
    const snapshot = await getDocs(q)
    
    let foundUser = null
    snapshot.forEach((docSnap) => {
      const data = docSnap.data()
      if (data.displayName === displayName) {
        foundUser = { uid: docSnap.id, ...data }
      }
    })
    
    if (foundUser) {
      return { success: true, data: foundUser }
    }
    return { success: false, error: 'User not found' }
  } catch (error) {
    return { success: false, error: error.message }
  }
}
