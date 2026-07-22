import { createContext, useContext, useState, useEffect } from 'react'
import { auth } from '../firebase/config'
import {
  onAuthStateChanged,
  signOut,
} from 'firebase/auth'
import { getDoc, doc, updateDoc, serverTimestamp } from 'firebase/firestore'
import { db } from '../firebase/config'
import { setupPresence, cleanupPresence } from '../firebase/presence'

const AuthContext = createContext()

export const useAuth = () => {
  const context = useContext(AuthContext)
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return context
}

export const AuthProvider = ({ children }) => {
  const [currentUser, setCurrentUser] = useState(null)
  const [userProfile, setUserProfile] = useState(null)
  const [loading, setLoading] = useState(true)
  const [profileLoading, setProfileLoading] = useState(true)

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      setLoading(true)
      
      if (user) {
        setCurrentUser(user)
        
        // Fetch user profile from Firestore
        try {
          const userDoc = await getDoc(doc(db, 'users', user.uid))
          if (userDoc.exists()) {
            const profileData = userDoc.data()
            setUserProfile(profileData)
            
            // Setup presence system
            setupPresence(user.uid)
            
            // Update last active
            await updateDoc(doc(db, 'users', user.uid), {
              lastActive: serverTimestamp(),
            })
          }
        } catch (error) {
          console.error('Error fetching user profile:', error)
        }
        
        setProfileLoading(false)
      } else {
        setCurrentUser(null)
        setUserProfile(null)
      }
      
      setLoading(false)
    })

    return unsubscribe
  }, [])

  const logout = async () => {
    try {
      if (currentUser) {
        // Cleanup presence
        await cleanupPresence(currentUser.uid)
        
        // Sign out
        await signOut(auth)
        
        setCurrentUser(null)
        setUserProfile(null)
      }
    } catch (error) {
      console.error('Logout error:', error)
    }
  }

  const value = {
    currentUser,
    userProfile,
    setUserProfile,
    loading,
    profileLoading,
    logout,
    isAuthenticated: !!currentUser,
    isProfileComplete: userProfile?.profileCompleted || false,
  }

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}
