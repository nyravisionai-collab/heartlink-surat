/**
 * Phase 04: Local Video
 */
import React from 'react'
import VideoView from './VideoView'

const LocalVideo = ({ stream, visible = true }) => {
  if (!visible || !stream) return null
  return (
    <div className="absolute bottom-20 right-4 w-28 h-[140px] md:w-36 md:h-[200px] rounded-2xl overflow-hidden shadow-2xl shadow-black/40 border-2 border-white/20 z-10 transition-all duration-300 hover:scale-105 hover:border-white/40">
      <VideoView stream={stream} muted={true} mirror={true} />
    </div>
  )
}

export default LocalVideo
