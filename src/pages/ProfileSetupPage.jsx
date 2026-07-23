import React, { useState, useCallback } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext'
import { useImageUpload, useProfileUpdate } from '../hooks/useFirebase'
import Button from '../components/ui/Button'
import Input from '../components/ui/Input'
import Avatar from '../components/ui/Avatar'
import { validateName, validateCity } from '../utils/helpers'

const ProfileSetupPage = () => {
  const navigate = useNavigate()
  const { currentUser, setUserProfile } = useAuth()
  const { uploading, preview, uploadImage, clearPreview } = useImageUpload()
  const { updating, updateProfile } = useProfileUpdate()
  
  const [formData, setFormData] = useState({
    displayName: currentUser?.displayName || '',
    city: '',
  })
  const [formErrors, setFormErrors] = useState({})
  const [selectedImage, setSelectedImage] = useState(null)
  const [isCompleted, setIsCompleted] = useState(false)

  const handleInputChange = (e) => {
    const { name, value } = e.target
    setFormData((prev) => ({ ...prev, [name]: value }))
    
    // Clear errors
    if (formErrors[name]) {
      setFormErrors((prev) => ({ ...prev, [name]: '' }))
    }
  }

  const handleImageSelect = useCallback(
    async (e) => {
      const file = e.target.files[0]
      if (!file) return

      // Validate file type
      const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp']
      if (!allowedTypes.includes(file.type)) {
        alert('Please upload a JPG, PNG, or WEBP image.')
        return
      }

      // Validate file size (5MB)
      if (file.size > 5 * 1024 * 1024) {
        alert('Image size should be less than 5MB.')
        return
      }

      setSelectedImage(file)
      await uploadImage(file)
    },
    [uploadImage]
  )

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

  const handleSubmit = async (e) => {
    e.preventDefault()
    
    if (!validateForm()) return

    // Upload image if selected
    let photoURL = currentUser?.photoURL || null
    
    if (selectedImage) {
      const uploadResult = await uploadImage(selectedImage)
      if (uploadResult.success) {
        photoURL = uploadResult.url
      } else {
        alert(uploadResult.error || 'Failed to upload image')
        return
      }
    }

    // Update profile
    const result = await updateProfile({
      displayName: formData.displayName,
      city: formData.city,
      photoURL,
      profileCompleted: true,
    })

    if (result.success) {
      setIsCompleted(true)
      
      // Navigate to home after a brief delay
      setTimeout(() => {
        navigate('/home', { replace: true })
      }, 1000)
    }
  }

  if (isCompleted) {
    return (
      <div className="min-h-screen-safe flex items-center justify-center bg-dark-900 p-4">
        <div className="text-center animate-fade-in">
          <div className="w-20 h-20 bg-green-500/10 rounded-full flex items-center justify-center mx-auto mb-6">
            <svg className="w-10 h-10 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </svg>
          </div>
          <h2 className="text-2xl font-bold text-white mb-2">Profile Complete!</h2>
          <p className="text-dark-400">Redirecting to home...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen-safe flex flex-col bg-dark-900">
      {/* Header */}
      <div className="p-6 pt-12">
        <h1 className="text-2xl font-bold text-white">Complete Your Profile</h1>
        <p className="text-dark-400 mt-1">Tell us about yourself</p>
      </div>

      {/* Content */}
      <div className="flex-1 flex items-center justify-center p-6">
        <div className="max-w-sm mx-auto w-full">
          {/* Profile Image Upload */}
          <div className="flex flex-col items-center mb-8">
            <div className="relative mb-4">
              <Avatar
                src={preview || currentUser?.photoURL}
                name={formData.displayName || currentUser?.displayName}
                size="xl"
              />
              
              {/* Upload Button */}
              <label
                htmlFor="profile-image"
                className="absolute bottom-0 right-0 w-10 h-10 bg-primary-600 hover:bg-primary-700 rounded-xl flex items-center justify-center cursor-pointer transition-colors shadow-lg"
              >
                <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 13a3 3 0 11-6 0 3 3 0 016 0z" />
                </svg>
              </label>
              
              <input
                id="profile-image"
                type="file"
                accept="image/jpeg,image/jpg,image/png,image/webp"
                onChange={handleImageSelect}
                className="hidden"
                disabled={uploading}
              />
            </div>
            
            {uploading && (
              <p className="text-primary-500 text-sm">Uploading...</p>
            )}
            
            <p className="text-dark-400 text-sm">
              Click to upload profile photo
            </p>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-5">
            <Input
              label="Full Name"
              type="text"
              name="displayName"
              placeholder="Enter your full name"
              value={formData.displayName}
              onChange={handleInputChange}
              error={formErrors.displayName}
              required
            />

            <Input
              label="City"
              type="text"
              name="city"
              placeholder="Enter your city"
              value={formData.city}
              onChange={handleInputChange}
              error={formErrors.city}
              required
            />

            <Button
              type="submit"
              variant="primary"
              size="lg"
              fullWidth
              loading={updating || uploading}
              disabled={uploading}
            >
              Complete Profile
            </Button>
          </form>
        </div>
      </div>
    </div>
  )
}

export default ProfileSetupPage
