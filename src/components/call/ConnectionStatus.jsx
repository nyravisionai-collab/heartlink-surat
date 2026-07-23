/**
 * Phase 04: Connection Status
 */
import React from 'react'

const statusMap = {
  ["idle"]: { text: "Ready", color: "text-dark-400" },
  ["calling"]: { text: "Calling...", color: "text-blue-400" },
  ["ringing"]: { text: "Ringing...", color: "text-yellow-400" },
  ["connected"]: { text: "Connected", color: "text-green-400" },
  ["connecting"]: { text: "Connecting...", color: "text-blue-400" },
  ["disconnected"]: { text: "Disconnected", color: "text-red-400" },
  ["reconnecting"]: { text: "Reconnecting...", color: "text-yellow-400" },
  ["failed"]: { text: "Failed", color: "text-red-400" },
  ["ended"]: { text: "Call Ended", color: "text-dark-400" },
}

const ConnectionStatus = ({ status, className = '' }) => {
  const info = statusMap[status] || statusMap.idle
  return (
    <span className={`text-xs font-medium uppercase tracking-wider ${info.color} ${className}`} aria-live="polite">
      {info.text}
    </span>
  )
}

export default ConnectionStatus
