/**
 * Phase 04: Video View
 */
import React, { useRef, useEffect } from 'react'

const VideoView = ({ stream, muted = false, mirror = true, className = '' }) => {
  const videoRef = useRef(null)

  useEffect(() => {
    if (videoRef.current && stream) {
      videoRef.current.srcObject = stream
    }
  }, [stream])

  return (
    <video
      ref={videoRef}
      autoPlay
      playsInline
      muted={muted}
      className={`w-full h-full object-cover rounded-3xl bg-dark-900 ${mirror ? 'scale-x-[-1]' : ''} ${className}`}
      aria-label="Video stream"
    />
  )
}

export default VideoView
