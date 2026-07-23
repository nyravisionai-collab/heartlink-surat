/**
 * Phase 04: Call Timer
 */
import React, { useState, useEffect } from 'react'

const formatDuration = (ms) => {
  if (!ms || ms < 0) return "00:00"
  const totalSeconds = Math.floor(ms / 1000)
  const hours = Math.floor(totalSeconds / 3600)
  const minutes = Math.floor((totalSeconds % 3600) / 60)
  const seconds = totalSeconds % 60
  const pad = (n) => String(n).padStart(2, '0')
  if (hours > 0) return `${pad(hours)}:${pad(minutes)}:${pad(seconds)}`
  return `${pad(minutes)}:${pad(seconds)}`
}

const CallTimer = ({ startTime, paused = false, className = '' }) => {
  const [elapsed, setElapsed] = useState(0)

  useEffect(() => {
    if (!startTime || paused) return
    const update = () => {
      setElapsed(Date.now() - startTime)
    }
    update()
    const interval = setInterval(update, 1000)
    return () => clearInterval(interval)
  }, [startTime, paused])

  return (
    <span className={`font-mono text-sm tracking-wider ${className}`} aria-label="Call duration">
      {formatDuration(elapsed)}
    </span>
  )
}

export default CallTimer
