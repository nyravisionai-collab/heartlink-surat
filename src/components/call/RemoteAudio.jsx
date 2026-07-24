/**
 * Remote Audio
 *
 * Keeps remote audio tracks attached for voice calls and for video calls where
 * no remote video element is mounted. Without this, RTCPeerConnection may be
 * connected but users cannot hear each other.
 */
import React, { useEffect, useRef, useState } from 'react'

const RemoteAudio = ({ stream, enabled = true }) => {
  const audioRef = useRef(null)
  const [playbackBlocked, setPlaybackBlocked] = useState(false)

  const playAudio = () => {
    const audioEl = audioRef.current
    if (!audioEl || !enabled || !stream) return

    const playPromise = audioEl.play?.()
    if (playPromise && typeof playPromise.then === 'function') {
      playPromise
        .then(() => setPlaybackBlocked(false))
        .catch((error) => {
          setPlaybackBlocked(true)
          console.warn('Remote audio playback was blocked:', error)
        })
    }
  }

  useEffect(() => {
    const audioEl = audioRef.current
    if (!audioEl) return

    setPlaybackBlocked(false)
    audioEl.srcObject = enabled && stream ? stream : null

    if (enabled && stream) {
      playAudio()
    }

    return () => {
      audioEl.srcObject = null
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [stream, enabled])

  return (
    <>
      <audio ref={audioRef} autoPlay playsInline className="hidden" aria-hidden="true" />
      {playbackBlocked && enabled && stream && (
        <button
          type="button"
          onClick={playAudio}
          className="fixed left-1/2 top-6 z-[100] -translate-x-1/2 rounded-full bg-primary-600 px-4 py-2 text-sm font-semibold text-white shadow-lg shadow-black/30 active:scale-95"
        >
          Tap to enable audio
        </button>
      )}
    </>
  )
}

export default RemoteAudio
