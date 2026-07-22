import { ref, uploadBytes, getDownloadURL, deleteObject } from 'firebase/storage'
import { storage } from './config'

// Upload profile image
export const uploadProfileImage = async (uid, file) => {
  try {
    // Validate file type
    const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp']
    if (!allowedTypes.includes(file.type)) {
      return { success: false, error: 'Please upload a JPG, PNG, or WEBP image.' }
    }

    // Validate file size (5MB max)
    const maxSize = 5 * 1024 * 1024 // 5MB
    if (file.size > maxSize) {
      return { success: false, error: 'Image size should be less than 5MB.' }
    }

    // Create storage reference
    const fileName = `profile_${Date.now()}.${file.name.split('.').pop()}`
    const storageRef = ref(storage, `users/${uid}/profile/${fileName}`)

    // Upload file
    const snapshot = await uploadBytes(storageRef, file)
    
    // Get download URL
    const downloadURL = await getDownloadURL(snapshot.ref)

    return { success: true, url: downloadURL, path: `users/${uid}/profile/${fileName}` }
  } catch (error) {
    return { success: false, error: error.message }
  }
}

// Delete old profile image
export const deleteProfileImage = async (imagePath) => {
  try {
    if (!imagePath) return { success: true }
    
    const imageRef = ref(storage, imagePath)
    await deleteObject(imageRef)
    return { success: true }
  } catch (error) {
    // Ignore errors if file doesn't exist
    return { success: true }
  }
}

// Compress image before upload
export const compressImage = (file, maxWidth = 800, quality = 0.8) => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader()
    reader.readAsDataURL(file)
    reader.onload = (event) => {
      const img = new Image()
      img.src = event.target.result
      img.onload = () => {
        const canvas = document.createElement('canvas')
        let width = img.width
        let height = img.height

        // Resize if needed
        if (width > maxWidth) {
          height = (height * maxWidth) / width
          width = maxWidth
        }

        canvas.width = width
        canvas.height = height

        const ctx = canvas.getContext('2d')
        ctx.drawImage(img, 0, 0, width, height)

        canvas.toBlob(
          (blob) => {
            resolve(
              new File([blob], file.name, {
                type: 'image/jpeg',
                lastModified: Date.now(),
              })
            )
          },
          'image/jpeg',
          quality
        )
      }
      img.onerror = reject
    }
    reader.onerror = reject
  })
}
