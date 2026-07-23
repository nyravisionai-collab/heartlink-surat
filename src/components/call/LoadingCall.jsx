/**
 * Phase 04: Loading Call
 */
import React from 'react'

const LoadingCall = ({ message = 'Connecting...' }) => {
  return (
    <div className="flex flex-col items-center justify-center gap-4 min-h-[200px]">
      <div className="w-12 h-12 border-4 border-primary-500 border-t-transparent rounded-full animate-rotate"></div>
      <p className="text-white font-medium">{message}</p>
    </div>
  )
}

export default LoadingCall
