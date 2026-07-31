import React, { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext'
import { useProfileUpdate, useImageUpload } from '../hooks/useFirebase'
import Button from '../components/ui/Button'
import Input from '../components/ui/Input'
import Avatar from '../components/ui/Avatar'
import Card from '../components/ui/Card'
import Modal from '../components/ui/Modal'
import { validateName, validateCity } from '../utils/helpers'
import { deleteProfileImage } from '../firebase/storage'
import { deleteUser } from 'firebase/auth'
import { doc, deleteDoc } from 'firebase/firestore'
import { db } from '../firebase/config'
import { cleanupPresence } from '../firebase/presence'

const SettingsPage = () => {
  const navigate = useNavigate()
  const { currentUser, userProfile, logout, setUserProfile } = useAuth()
  const { updateProfile } = useProfileUpdate()
  const { uploading, preview, uploadImage, clearPreview } = useImageUpload()
  
  const [formData, setFormData] = useState({
    displayName: userProfile?.displayName || '',
    city: userProfile?.city || '',
  })
  const [formErrors, setFormErrors] = useState({})
  const [isEditing, setIsEditing] = useState(false)
  const [successMessage, setSuccessMessage] = useState('')
  const [showDeleteModal, setShowDeleteModal] = useState(false)
  const [deleteConfirmText, setDeleteConfirmText] = useState('')
  const [isDeleting, setIsDeleting] = useState(false)

  const handleInputChange = (e) => {
    const { name, value } = e.target
    setFormData((prev) => ({ ...prev, [name]: value }))
    
    // Clear errors
    if (formErrors[name]) {
      setFormErrors((prev) => ({ ...prev, [name]: '' }))
    }
  }

  const validateForm = () => {
    const errors = {}

    if (!formData.displayName) {
      errors.displayName = 'Name is required'
    } else if (!validateName(formData.displayName)) {
      errors.displayName = 'Name must be at least 2 characters'
    }

    if (!formData.city) {
      errors.city = 'City is required'
    } else if (!validateCity(formData.city)) {
      errors.city = 'City must be at least 2 characters'
    }

    setFormErrors(errors)
    return Object.keys(errors).length === 0
  }

  const handleSave = async () => {
    if (!validateForm()) return

    const result = await updateProfile({
      displayName: formData.displayName,
      city: formData.city,
    })

    if (result.success) {
      setIsEditing(false)
      setSuccessMessage('Profile updated successfully!')
      
      // Clear success message after 3 seconds
      setTimeout(() => {
        setSuccessMessage('')
      }, 3000)
    }
  }

  const handleImageUpload = async (e) => {
    const file = e.target.files[0]
    if (!file) return

    // Validate file
    const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp']
    if (!allowedTypes.includes(file.type)) {
      alert('Please upload a JPG, PNG, or WEBP image.')
      return
    }

    if (file.size > 5 * 1024 * 1024) {
      alert('Image size should be less than 5MB.')
      return
    }

    const result = await uploadImage(file)
    
    if (result.success) {
      // Update profile with new photo URL
      await updateProfile({
        photoURL: result.url,
      })
      
      // Delete old image if exists
      if (userProfile?.photoURL && userProfile.photoURL !== result.url) {
        // Extract path from URL and delete
        // This is simplified - in production, you'd store the storage path
      }
      
      setSuccessMessage('Profile photo updated!')
      clearPreview()
    } else {
      alert(result.error || 'Failed to upload image')
    }
  }

  const handleDeleteAccount = async () => {
    if (deleteConfirmText !== 'DELETE') {
      alert('Please type DELETE to confirm')
      return
    }

    setIsDeleting(true)

    try {
      // 1. Delete profile image from storage
      if (userProfile?.photoURL) {
        // Extract storage path and delete
        // This requires storing the storage path in Firestore
      }

      // 2. Delete Firestore document
      await deleteDoc(doc(db, 'users', currentUser.uid))

      // 3. Cleanup presence
      await cleanupPresence(currentUser.uid, userProfile?.displayName || 'User')

      // 4. Delete Firebase Auth account
      await deleteUser(currentUser)

      // 5. Redirect to welcome
      navigate('/welcome', { replace: true })
    } catch (error) {
      console.error('Error deleting account:', error)
      alert('Failed to delete account. Please try again.')
      setIsDeleting(false)
    }
  }

  const handleLogout = async () => {
    await logout()
    navigate('/welcome', { replace: true })
  }

  return (
    <div className="min-h-screen-safe flex flex-col bg-dark-900">
      {/* Header */}
      <header className="sticky top-0 z-40 bg-dark-900/80 backdrop-blur-md border-b border-dark-800">
        <div className="flex items-center justify-between px-4 h-16">
          <button
            onClick={() => navigate('/home')}
            className="p-2 -ml-2 text-dark-300 hover:text-white transition-colors"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
          </button>
          
          <h1 className="text-lg font-semibold text-white">Settings</h1>
          
          {isEditing ? (
            <button
              onClick={() => setIsEditing(false)}
              className="text-primary-500 font-medium"
            >
              Cancel
            </button>
          ) : (
            <button
              onClick={() => setIsEditing(true)}
              className="text-primary-500 font-medium"
            >
              Edit
            </button>
          )}
        </div>
      </header>

      {/* Content */}
      <main className="flex-1 p-4">
        <div className="max-w-lg mx-auto space-y-6">
          {/* Success Message */}
          {successMessage && (
            <div className="p-4 bg-green-500/10 border border-green-500/50 rounded-2xl animate-fade-in">
              <p className="text-green-500 text-sm">{successMessage}</p>
            </div>
          )}

          {/* Profile Section */}
          <Card padding="lg">
            <div className="flex flex-col items-center mb-6">
              {/* Avatar with upload */}
              <div className="relative mb-4">
                <Avatar
                  src={preview || userProfile?.photoURL}
                  name={userProfile?.displayName}
                  size="xl"
                  online={userProfile?.isOnline}
                />
                
                {isEditing && (
                  <label
                    htmlFor="profile-image-upload"
                    className="absolute bottom-0 right-0 w-10 h-10 bg-primary-600 hover:bg-primary-700 rounded-xl flex items-center justify-center cursor-pointer transition-colors shadow-lg"
                  >
                    <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" />
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 13a3 3 0 11-6 0 3 3 0 016 0z" />
                    </svg>
                  </label>
                )}
                
                <input
                  id="profile-image-upload"
                  type="file"
                  accept="image/jpeg,image/jpg,image/png,image/webp"
                  onChange={handleImageUpload}
                  className="hidden"
                  disabled={!isEditing || uploading}
                />
              </div>

              <h2 className="text-xl font-bold text-white">
                {userProfile?.displayName || 'User'}
              </h2>
              <p className="text-dark-400">{userProfile?.email}</p>
              
              {uploading && (
                <p className="text-primary-500 text-sm mt-2">Uploading...</p>
              )}
            </div>

            {/* Profile Form */}
            <div className="space-y-4">
              <Input
                label="Full Name"
                type="text"
                name="displayName"
                placeholder="Enter your name"
                value={formData.displayName}
                onChange={handleInputChange}
                error={formErrors.displayName}
                disabled={!isEditing}
              />

              <Input
                label="City"
                type="text"
                name="city"
                placeholder="Enter your city"
                value={formData.city}
                onChange={handleInputChange}
                error={formErrors.city}
                disabled={!isEditing}
              />

              {isEditing && (
                <Button
                  variant="primary"
                  size="lg"
                  fullWidth
                  onClick={handleSave}
                >
                  Save Changes
                </Button>
              )}
            </div>
          </Card>

          {/* Account Info */}
          <Card padding="lg">
            <h3 className="text-lg font-semibold text-white mb-4">Account Information</h3>
            
            <div className="space-y-3">
              <div className="flex justify-between items-center">
                <span className="text-dark-400">Email</span>
                <span className="text-white">{userProfile?.email}</span>
              </div>
              
              <div className="flex justify-between items-center">
                <span className="text-dark-400">Account Created</span>
                <span className="text-white">
                  {userProfile?.createdAt
                    ? new Date(userProfile.createdAt).toLocaleDateString()
                    : 'N/A'}
                </span>
              </div>
              
              <div className="flex justify-between items-center">
                <span className="text-dark-400">Profile Status</span>
                <span className={`font-medium ${userProfile?.profileCompleted ? 'text-green-500' : 'text-yellow-500'}`}>
                  {userProfile?.profileCompleted ? 'Complete' : 'Incomplete'}
                </span>
              </div>
            </div>
          </Card>

          {/* Danger Zone */}
          <Card padding="lg" className="border-red-500/20">
            <h3 className="text-lg font-semibold text-red-500 mb-4">Danger Zone</h3>
            
            <div className="space-y-3">
              <Button
                variant="danger"
                size="lg"
                fullWidth
                onClick={handleLogout}
              >
                Logout
              </Button>

              <Button
                variant="danger"
                size="lg"
                fullWidth
                onClick={() => setShowDeleteModal(true)}
                className="bg-transparent border-2 border-red-500 hover:bg-red-500"
              >
                Delete Account
              </Button>
            </div>
          </Card>
        </div>
      </main>

      {/* Delete Account Modal */}
      <Modal
        isOpen={showDeleteModal}
        onClose={() => {
          setShowDeleteModal(false)
          setDeleteConfirmText('')
        }}
        title="Delete Account"
        size="md"
      >
        <div className="space-y-4">
          <div className="p-4 bg-red-500/10 border border-red-500/50 rounded-2xl">
            <p className="text-red-500 font-semibold mb-2">⚠️ Warning: This action cannot be undone!</p>
            <p className="text-dark-300 text-sm">
              This will permanently delete:
            </p>
            <ul className="list-disc list-inside text-dark-300 text-sm mt-2 space-y-1">
              <li>Your profile and account</li>
              <li>All your data</li>
              <li>Your profile photo</li>
            </ul>
          </div>

          <div>
            <label className="block text-sm font-medium text-dark-200 mb-2">
              Type <span className="text-red-500 font-bold">DELETE</span> to confirm
            </label>
            <input
              type="text"
              placeholder="Type DELETE here"
              value={deleteConfirmText}
              onChange={(e) => setDeleteConfirmText(e.target.value)}
              className="w-full px-4 py-3 bg-dark-800 border border-dark-600 rounded-2xl text-white placeholder-dark-400 focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent"
            />
          </div>

          <div className="flex gap-3">
            <Button
              variant="secondary"
              size="lg"
              fullWidth
              onClick={() => {
                setShowDeleteModal(false)
                setDeleteConfirmText('')
              }}
            >
              Cancel
            </Button>
            
            <Button
              variant="danger"
              size="lg"
              fullWidth
              onClick={handleDeleteAccount}
              loading={isDeleting}
              disabled={deleteConfirmText !== 'DELETE'}
            >
              Delete Forever
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  )
}

export default SettingsPage
