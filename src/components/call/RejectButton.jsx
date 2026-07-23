/**
 * Phase 04: Reject Button
 */
import React from 'react'

const RejectButton = ({ onClick, disabled = false }) => {
  return (
    <button
      onClick={onClick}
      disabled={disabled}
      className={`w-16 h-16 rounded-full bg-red-600 hover:bg-red-700 flex items-center justify-center transition-all duration-200 active:scale-95 focus:outline-none focus:ring-2 focus:ring-red-400/50 shadow-lg shadow-red-900/30 ${
        disabled ? 'opacity-50 cursor-not-allowed' : ''
      }`}
      aria-label="Reject call"
    >
      <svg className="w-7 h-7 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M6 18L18 6M6 6l12 12" />
      </svg>
    </button>
  )
}

export default RejectButton
