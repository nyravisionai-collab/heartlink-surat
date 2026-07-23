/**
 * Phase 04: Call Controls
 */
import React from 'react'
import MuteButton from './MuteButton'
import CameraButton from './CameraButton'
import EndCallButton from './EndCallButton'

const CallControls = ({
  muted,
  videoOff,
  onToggleMute,
  onToggleCamera,
  onEndCall,
  disabled = false,
  className = ''
}) => {
  return (
    <div className={`flex items-center justify-center gap-4 md:gap-6 ${className}`}>
      <MuteButton muted={muted} onToggle={onToggleMute} disabled={disabled} />
      <EndCallButton onClick={onEndCall} disabled={disabled} />
      <CameraButton videoOff={videoOff} onToggle={onToggleCamera} disabled={disabled} />
    </div>
  )
}

export default CallControls
