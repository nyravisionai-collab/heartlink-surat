/**
 * Phase 05: Minimized Call Overlay
 */
import React from 'react'
import Avatar from '../ui/Avatar'
import CallTimer from './CallTimer'
import MuteButton from './MuteButton'
import EndCallButton from './EndCallButton'

const MinimizedOverlay = ({ visible, remoteUser, startTime, isConnected, muted, videoOff, onToggleMute, onEndCall, onRestore }) => {
  if (!visible) return null

  return (
    <div className="fixed bottom-4 right-4 z-[80] w-[280px] bg-dark-800/90 backdrop-blur-xl border border-dark-700 rounded-3xl shadow-2xl shadow-black/40 p-3 animate-slide-up">
      <div className="flex items-center gap-3 mb-3">
        <Avatar
          src={remoteUser?.photoURL}
          name={remoteUser?.displayName || 'Unknown'}
          size="sm"
          online={false}
        />
        <div className="flex-1 min-w-0">
          <h4 className="font-semibold text-white text-sm truncate">{remoteUser?.displayName || 'Unknown'}</h4>
          <CallTimer startTime={startTime} paused={!isConnected} className="text-xs text-dark-400" />
        </div>
      </div>
      <div className="flex items-center justify-between">
        <div className="flex gap-2">
          <MuteButton muted={muted} onToggle={onToggleMute} disabled={false} />
        </div>
        <div className="flex gap-2">
          <button
            onClick={onRestore}
            className="px-3 py-1.5 bg-primary-600 hover:bg-primary-700 text-white text-xs rounded-xl font-medium transition-colors"
          >
            Restore
          </button>
          <EndCallButton onClick={onEndCall} disabled={false} />
        </div>
      </div>
    </div>
  )
}

export default MinimizedOverlay
