/**
 * Phase 05: Fullscreen Button
 */
import React, { useState, useCallback } from 'react'

const FullscreenButton = ({ onEnter, onExit, isFullscreen }) => {
  const [supported, setSupported] = useState(() => !!document.fullscreenEnabled || !!document.webkitFullscreenEnabled || !!document.mozFullScreenEnabled || !!document.msFullscreenEnabled)

  const toggleFullscreen = useCallback(async () => {
    if (!supported) return
    try {
      if (!document.fullscreenElement && !document.webkitFullscreenElement && !document.mozFullScreenElement && !document.msFullscreenElement) {
        const el = document.documentElement
        if (el.requestFullscreen) await el.requestFullscreen()
        else if (el.webkitRequestFullscreen) await el.webkitRequestFullscreen()
        else if (el.mozRequestFullScreen) await el.mozRequestFullScreen()
        else if (el.msRequestFullscreen) await el.msRequestFullscreen()
        onEnter?.()
      } else {
        if (document.exitFullscreen) await document.exitFullscreen()
        else if (document.webkitExitFullscreen) await document.webkitExitFullscreen()
        else if (document.mozCancelFullScreen) await document.mozCancelFullScreen()
        else if (document.msExitFullscreen) await document.msExitFullscreen()
        onExit?.()
      }
    } catch (e) {
      console.warn('Fullscreen error:', e)
    }
  }, [supported, onEnter, onExit])

  return (
    <button
      onClick={toggleFullscreen}
      disabled={!supported}
      className={`w-14 h-14 rounded-full flex items-center justify-center transition-all duration-200 active:scale-95 focus:outline-none focus:ring-2 focus:ring-white/40 bg-dark-800 hover:bg-dark-700 shadow-lg shadow-black/20 ${!supported ? 'opacity-30 cursor-not-allowed' : ''}`}
      aria-label={isFullscreen ? 'Exit fullscreen' : 'Enter fullscreen'}
      title={supported ? (isFullscreen ? 'Exit fullscreen' : 'Enter fullscreen') : 'Fullscreen not supported'}
    >
      <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 8V4m0 0h4M4 4l5 5m11-1V4m0 0h-4m4 0l-5 5M4 16v4m0 0h4m-4 0l5-5m11 5l-5-5m5 5v-4m0 4h-4" />
      </svg>
    </button>
  )
}

export default FullscreenButton
