/**
 * Phase 04: End Call Button
 */
import React from 'react'

const EndCallButton = ({ onClick, disabled = false }) => {
  return (
    <button
      onClick={onClick}
      disabled={disabled}
      className={`w-14 h-14 rounded-full bg-red-600 hover:bg-red-700 flex items-center justify-center transition-all duration-200 active:scale-95 focus:outline-none focus:ring-2 focus:ring-red-400/50 shadow-lg shadow-red-900/30 ${
        disabled ? 'opacity-50 cursor-not-allowed' : ''
      }`}
      aria-label="End call"
    >
      <svg className="w-7 h-7 text-white rotate-[135deg]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
      </svg>
    </button>
  )
}

export default EndCallButton
