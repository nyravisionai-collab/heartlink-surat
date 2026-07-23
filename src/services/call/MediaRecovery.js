/**
 * Phase 06: Media Recovery
 * Handles camera/microphone disconnection, track recovery, and automatic restoration.
 */
import Logger from '../utils/Logger.js'

export const recoverMediaTracks = async (service) => {
  try {
    const currentStream = service.getLocalStream()
    if (!currentStream) {
      Logger.info('No local stream to recover')
      return false
    }

    const audioTracks = currentStream.getAudioTracks()
    const videoTracks = currentStream.getVideoTracks()

    let audioRecovered = true
    let videoRecovered = true

    if (audioTracks.length === 0 || audioTracks.some(t => t.readyState === 'ended')) {
      const newAudio = await navigator.mediaDevices.getUserMedia({ audio: true })
      audioTracks.forEach(t => {
        if (t.readyState !== 'ended') {
          service.peerConnection.peerConnection?.getSenders?.().forEach(sender => {
            if (sender.track === t && sender.track.kind === 'audio') {
              sender.replaceTrack(newAudio.getAudioTracks()[0])
            }
          })
        }
      })
      audioRecovered = true
    }

    if (videoTracks.length === 0 || videoTracks.some(t => t.readyState === 'ended')) {
      const newVideo = await navigator.mediaDevices.getUserMedia({ video: true })
      videoTracks.forEach(t => {
        if (t.readyState !== 'ended') {
          service.peerConnection.peerConnection?.getSenders?.().forEach(sender => {
            if (sender.track === t && sender.track.kind === 'video') {
              sender.replaceTrack(newVideo.getVideoTracks()[0])
            }
          })
        }
      })
      videoRecovered = true
    }

    Logger.info('Media recovery completed', { audioRecovered, videoRecovered })
    return audioRecovered || videoRecovered
  } catch (err) {
    Logger.error('Media recovery failed', { error: err.message })
    return false
  }
}

export const monitorMediaTracks = (service, onTrackLost, onTrackRecovered) => {
  const checkInterval = setInterval(async () => {
    const stream = service.getLocalStream()
    if (!stream) return
    const audioTracks = stream.getAudioTracks()
    const videoTracks = stream.getVideoTracks()
    const hasLostAudio = audioTracks.some(t => t.readyState === 'ended')
    const hasLostVideo = videoTracks.some(t => t.readyState === 'ended')
    if (hasLostAudio || hasLostVideo) {
      onTrackLost?.({ audio: hasLostAudio, video: hasLostVideo })
      const recovered = await recoverMediaTracks(service)
      if (recovered) {
        onTrackRecovered?.({ audio: hasLostAudio, video: hasLostVideo })
      }
    }
  }, 2000)
  return () => clearInterval(checkInterval)
}
