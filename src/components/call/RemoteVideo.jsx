/**
 * Phase 04: Remote Video
 */
import React from 'react'
import VideoView from './VideoView'
import Avatar from '../ui/Avatar'

const RemoteVideo = ({ stream, caller, className = '' }) => {
  const hasVideo = stream && stream.getVideoTracks && stream.getVideoTracks().length > 0
  const videoActive = hasVideo && stream.getVideoTracks()[0]?.enabled

  return (
    <div className={`relative w-full h-full bg-dark-950 overflow-hidden ${className}`}>
      {videoActive ? (
        <VideoView stream={stream} muted={false} mirror={false} className="absolute inset-0" />
      ) : (
        <div className="absolute inset-0 flex flex-col items-center justify-center bg-gradient-to-br from-dark-800 to-dark-950">
          <Avatar
            src={caller?.photoURL}
            name={caller?.displayName || 'Unknown'}
            size="xl"
            online={false}
            className="w-32 h-32 md:w-48 md:h-48 text-5xl md:text-7xl mb-6"
          />
          <h3 className="text-xl md:text-3xl font-bold text-white mb-2">{caller?.displayName || 'Unknown'}</h3>
          <p className="text-dark-400">Camera off</p>
        </div>
      )}
    </div>
  )
}

export default RemoteVideo
