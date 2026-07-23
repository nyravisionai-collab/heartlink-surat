/**
 * Phase 04: Mute Button
 */
import React from 'react'

const MuteButton = ({ muted, onToggle, disabled = false }) => {
  return (
    <button
      onClick={onToggle}
      disabled={disabled}
      className={`w-14 h-14 rounded-full flex items-center justify-center transition-all duration-200 active:scale-95 focus:outline-none focus:ring-2 focus:ring-white/40 ${
        muted ? 'bg-red-600 hover:bg-red-700 shadow-lg shadow-red-900/30' : 'bg-dark-800 hover:bg-dark-700 shadow-lg shadow-black/20'
      } ${disabled ? 'opacity-50 cursor-not-allowed' : ''}`}
      aria-label={muted ? 'Unmute' : 'Mute'}
      aria-pressed={muted}
    >
      {muted ? (
        <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5.586 15H4a1 1 0 01-1-1v-4a1 1 0 011-1h1.586l4.707-4.707C10.923 4.082 12 4.882 12 6v12c0 1.118-1.077 1.918-1.707 1.293L5.586 15z" />
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 14l2-2m0 0l2-2m-2 2l-2 2m2-2l2 2" />
        </svg>
      ) : (
        <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4m-4-8a3 3 0 01-3-3V5a3 3 0 016 0v6a3 3 0 01-3 3z" />
        </svg>
      )}
    </button>
  )
}

export default MuteButton
