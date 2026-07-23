import React, { useState, useRef, useEffect } from 'react'
import Modal from './Modal'
import Button from './Button'

const ImageCropModal = ({ isOpen, imageSrc, onCrop, onClose }) => {
  const [crop, setCrop] = useState({ x: 0, y: 0 })
  const [zoom, setZoom] = useState(1)
  const [croppedArea, setCroppedArea] = useState(null)
  const imageRef = useRef(null)

  const handleCropComplete = (croppedAreaPixels) => {
    setCroppedArea(croppedAreaPixels)
  }

  const handleCrop = async () => {
    if (!croppedArea || !imageRef.current) return

    const canvas = document.createElement('canvas')
    const ctx = canvas.getContext('2d')
    const image = imageRef.current

    const { x, y, width, height } = croppedArea

    canvas.width = width
    canvas.height = height

    ctx.drawImage(image, -x, -y, width * zoom, height * zoom)

    canvas.toBlob(
      (blob) => {
        const file = new File([blob], 'cropped-image.jpg', {
          type: 'image/jpeg',
          lastModified: Date.now(),
        })
        onCrop(file)
      },
      'image/jpeg',
      0.9
    )
  }

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Crop Profile Photo"
      size="lg"
    >
      <div className="space-y-4">
        {/* Image Preview */}
        <div className="relative w-full h-64 bg-dark-800 rounded-2xl overflow-hidden">
          <img
            ref={imageRef}
            src={imageSrc}
            alt="Crop preview"
            className="absolute inset-0 w-full h-full object-contain"
            style={{
              transform: `scale(${zoom})`,
              transformOrigin: `${crop.x}px ${crop.y}px`,
            }}
          />
        </div>

        {/* Zoom Control */}
        <div>
          <label className="block text-sm font-medium text-dark-200 mb-2">
            Zoom
          </label>
          <input
            type="range"
            min="1"
            max="3"
            step="0.1"
            value={zoom}
            onChange={(e) => setZoom(parseFloat(e.target.value))}
            className="w-full"
          />
        </div>

        {/* Action Buttons */}
        <div className="flex gap-3">
          <Button
            variant="secondary"
            size="lg"
            fullWidth
            onClick={onClose}
          >
            Cancel
          </Button>
          
          <Button
            variant="primary"
            size="lg"
            fullWidth
            onClick={handleCrop}
          >
            Crop & Save
          </Button>
        </div>
      </div>
    </Modal>
  )
}

export default ImageCropModal
