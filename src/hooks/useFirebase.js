import { useState, useCallback } from 'react'
import { useAuth } from '../contexts/AuthContext'
import {
  registerWithEmail,
  loginWithEmail,
  loginWithGoogle,
  resetPassword,
} from '../firebase/auth'
import { uploadProfileImage, deleteProfileImage, compressImage } from '../firebase/storage'
import { updateUserProfile } from '../firebase/firestore'

// Hook for authentication
export const useAuthActions = () => {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)

  const register = useCallback(async (email, password, displayName) => {
    setLoading(true)
    setError(null)
    try {
      const result = await registerWithEmail(email, password, displayName)
      if (!result.success) {
        setError(result.error)
      }
      return result
    } catch (err) {
      setError(err.message)
      return { success: false, error: err.message }
    } finally {
      setLoading(false)
    }
  }, [])

  const login = useCallback(async (email, password) => {
    setLoading(true)
    setError(null)
    try {
      const result = await loginWithEmail(email, password)
      if (!result.success) {
        setError(result.error)
      }
      return result
    } catch (err) {
      setError(err.message)
      return { success: false, error: err.message }
    } finally {
      setLoading(false)
    }
  }, [])

  const loginGoogle = useCallback(async () => {
    setLoading(true)
    setError(null)
    try {
      const result = await loginWithGoogle()
      if (!result.success) {
        setError(result.error)
      }
      return result
    } catch (err) {
      setError(err.message)
      return { success: false, error: err.message }
    } finally {
      setLoading(false)
    }
  }, [])

  const forgotPassword = useCallback(async (email) => {
    setLoading(true)
    setError(null)
    try {
      const result = await resetPassword(email)
      if (!result.success) {
        setError(result.error)
      }
      return result
    } catch (err) {
      setError(err.message)
      return { success: false, error: err.message }
    } finally {
      setLoading(false)
    }
  }, [])

  return {
    loading,
    error,
    register,
    login,
    loginGoogle,
    forgotPassword,
    clearError: () => setError(null),
  }
}

// Hook for profile image upload
export const useImageUpload = () => {
  const [uploading, setUploading] = useState(false)
  const [progress, setProgress] = useState(0)
  const [preview, setPreview] = useState(null)
  const { currentUser } = useAuth()

  const uploadImage = useCallback(
    async (file, shouldCompress = true) => {
      if (!currentUser) return { success: false, error: 'Not authenticated' }

      setUploading(true)
      setProgress(0)

      try {
        let fileToUpload = file

        // Compress image
        if (shouldCompress) {
          fileToUpload = await compressImage(file)
        }

        // Create preview
        const reader = new FileReader()
        reader.onloadend = () => {
          setPreview(reader.result)
        }
        reader.readAsDataURL(fileToUpload)

        // Upload to Firebase
        const result = await uploadProfileImage(currentUser.uid, fileToUpload)
        
        setProgress(100)
        return result
      } catch (err) {
        return { success: false, error: err.message }
      } finally {
        setUploading(false)
      }
    },
    [currentUser]
  )

  const clearPreview = useCallback(() => {
    setPreview(null)
    setProgress(0)
  }, [])

  return {
    uploading,
    progress,
    preview,
    uploadImage,
    clearPreview,
  }
}

// Hook for profile update
export const useProfileUpdate = () => {
  const [updating, setUpdating] = useState(false)
  const { currentUser, setUserProfile } = useAuth()

  const updateProfile = useCallback(
    async (data) => {
      if (!currentUser) return { success: false, error: 'Not authenticated' }

      setUpdating(true)
      try {
        const result = await updateUserProfile(currentUser.uid, data)
        
        if (result.success) {
          // Refresh user profile in context
          const profileResult = await getUserProfile(currentUser.uid)
          if (profileResult.success) {
            setUserProfile(profileResult.data)
          }
        }
        
        return result
      } catch (err) {
        return { success: false, error: err.message }
      } finally {
        setUpdating(false)
      }
    },
    [currentUser, setUserProfile]
  )

  return {
    updating,
    updateProfile,
  }
}
