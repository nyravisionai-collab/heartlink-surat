/**
 * Phase 05: Reconnect Indicator
 */
import React from 'react'

const ReconnectIndicator = ({ status, className = '' }) => {
  if (!status || status === 'idle') return null

  const text = status === 'reconnecting' ? 'Reconnecting...' : status === 'recovered' ? 'Connection recovered' : status === 'failed' ? 'Connection failed' : 'Connection issue'

  return (
    <div className={`flex items-center gap-2 px-3 py-1.5 bg-yellow-500/10 border border-yellow-500/20 rounded-full ${className}`} aria-live="polite">
      <span className={`w-2 h-2 rounded-full ${status === 'reconnecting' ? 'bg-yellow-500 animate-pulse' : status === 'recovered' ? 'bg-green-500' : 'bg-red-500'}`}></span>
      <span className="text-xs font-medium text-yellow-400">{text}</span>
    </div>
  )
}

export default ReconnectIndicator
