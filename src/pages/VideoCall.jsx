/**
 * Phase 04: Video Call Page
 */
import React, { useEffect, useState } from 'react'
import { useNavigate, useLocation } from 'react-router-dom'
import { useCall } from '../contexts/CallContext'
import RemoteVideo from '../components/call/RemoteVideo'
import RemoteAudio from '../components/call/RemoteAudio'
import LocalVideo from '../components/call/LocalVideo'
import CallControls from '../components/call/CallControls'
import ConnectionStatus from '../components/call/ConnectionStatus'
import CallTimer from '../components/call/CallTimer'
import IncomingCallModal from '../components/call/IncomingCallModal'
import OutgoingCallModal from '../components/call/OutgoingCallModal'
import LoadingCall from '../components/call/LoadingCall'
import AvatarView from '../components/call/AvatarView'
import ReconnectIndicator from '../components/call/ReconnectIndicator'
import CallQualityIndicator from '../components/call/CallQualityIndicator'
import MinimizedOverlay from '../components/call/MinimizedOverlay'
import FullscreenButton from '../components/call/FullscreenButton'
import DeviceSelector from '../components/call/DeviceSelector'
import audioFeedback from '../services/call/AudioFeedback'
import { useAppLifecycle } from '../hooks/useAppLifecycle'
import Logger from '../utils/Logger'

const VideoCall = () => {
  const navigate = useNavigate()
  const location = useLocation()
  const {
    callState, remoteUser, isIncoming, localStream, remoteStream, startCall, answerCall,
    endCall, rejectCall, toggleMute, toggleCamera, CallStatus, connectionQuality, reconnectStatus, service,
    switchVideoDevice, switchAudioDevice
  } = useCall()
  const [muted, setMuted] = useState(false)
  const [videoOff, setVideoOff] = useState(false)
  useAppLifecycle(
    () => Logger.info('VideoCall hidden'),
    () => Logger.info('VideoCall visible'),
    () => Logger.info('VideoCall resumed'),
    () => Logger.info('VideoCall backgrounded')
  )
  const [minimized, setMinimized] = useState(false)
  const [isFullscreen, setIsFullscreen] = useState(false)
  const [audioFeedbackInit, setAudioFeedbackInit] = useState(false)
  const [initialized, setInitialized] = useState(false)

  const isConnected = callState?.status === CallStatus?.CONNECTED || callState?.status === 'connected'
  const isCalling = callState?.status === CallStatus?.CALLING || callState?.status === 'calling'
  const isRinging = callState?.status === CallStatus?.RINGING || callState?.status === 'ringing'
  const isFailed = callState?.status === CallStatus?.FAILED || callState?.status === 'failed'
  const isEnded = callState?.status === CallStatus?.ENDED || callState?.status === 'ended'

  useEffect(() => {
    const params = new URLSearchParams(location.search)
    const callerData = location.state?.caller
    const userId = params.get('userId') || callerData?.uid

    if (!initialized) {
      setInitialized(true)
      if (!isIncoming && (callerData || userId)) {
        const remoteUser = callerData
          ? { ...callerData, uid: callerData.uid || userId }
          : { uid: userId, displayName: 'Unknown', photoURL: null, city: 'Unknown' }
        startCall(remoteUser, 'video')
      }
    }
  }, [location, initialized, isIncoming, startCall])

  // Initialize audio feedback
  useEffect(() => {
    const initAudio = () => {
      if (!audioFeedbackInit) {
        audioFeedback.init()
        setAudioFeedbackInit(true)
      }
    }
    window.addEventListener('click', initAudio, { once: true })
    return () => window.removeEventListener('click', initAudio)
  }, [audioFeedbackInit])

  // Audio feedback for state changes
  useEffect(() => {
    if (!audioFeedbackInit) return
    if (isRinging) audioFeedback.playTone('ringtone', 0.5)
    if (isConnected) audioFeedback.playTone('ringtone', 0.2)
    if (isFailed) audioFeedback.playTone('busy', 0.8)
    if (isEnded) audioFeedback.playTone('end', 0.5)
  }, [callState?.status, audioFeedbackInit, isRinging, isConnected, isFailed, isEnded])

  const handleToggleMute = () => {
    toggleMute()
    setMuted(!muted)
  }

  const handleToggleCamera = () => {
    toggleCamera()
    setVideoOff(!videoOff)
  }

  const handleEnd = async () => {
    await endCall()
    navigate('/home', { replace: true })
  }

  const handleReject = async () => {
    await rejectCall()
    navigate('/home', { replace: true })
  }

  const handleAccept = async () => {
    await answerCall(remoteUser, 'video')
  }

  if (isIncoming && remoteUser && !isConnected && !isEnded) {
    return (
      <IncomingCallModal
        visible={true}
        caller={remoteUser}
        callType="video"
        onAccept={handleAccept}
        onReject={handleReject}
      />
    )
  }

  return (
    <div className="fixed inset-0 bg-dark-950 z-50 overflow-hidden">
      {/* Remote media */}
      <RemoteVideo stream={remoteStream} caller={remoteUser} className="absolute inset-0" />
      <RemoteAudio stream={remoteStream} enabled={!remoteStream?.getVideoTracks?.().length} />

      {/* Local Video PIP */}
      <LocalVideo stream={localStream} visible={true} />

      {/* Header Info */}
      <div className="absolute top-0 left-0 right-0 z-20 pt-safe-top px-4 py-3 flex justify-between items-start">
        <div className="bg-black/30 backdrop-blur-md rounded-2xl px-4 py-2 border border-white/10">
          <h2 className="font-bold text-white text-sm md:text-base">{remoteUser?.displayName || 'Unknown'}</h2>
          <div className="flex items-center gap-2">
            <ConnectionStatus status={callState?.status} className="text-xs" />
            <CallQualityIndicator quality={connectionQuality || 'good'} className="text-xs" />
          </div>
        </div>
        <div className="flex items-center gap-2">
          <ReconnectIndicator status={reconnectStatus || 'idle'} className="text-xs" />
          <CallTimer startTime={callState?.startTime} paused={!isConnected} className="text-xs text-white/80" />
          <FullscreenButton isFullscreen={isFullscreen} onEnter={() => setIsFullscreen(true)} onExit={() => setIsFullscreen(false)} />
        </div>
      </div>

      {/* Device Selector */}
      <div className="absolute bottom-28 left-4 z-10">
        <DeviceSelector
          service={service}
          onSelectVideo={(id) => {
            switchVideoDevice(id)
          }}
          onSelectAudio={(id) => {
            switchAudioDevice(id)
          }}
        />
      </div>

      {/* Controls Bar */}
      <div className="absolute bottom-0 left-0 right-0 z-20 pb-safe-bottom px-6 py-6">
        <div className="flex justify-between items-center gap-6 md:gap-8">
          <button
            onClick={() => setMinimized(true)}
            className="px-4 py-3 bg-dark-700 hover:bg-dark-600 text-white rounded-full font-medium text-sm transition-colors active:scale-95"
            aria-label="Minimize call"
          >
            Minimize
          </button>
          <div className="flex items-center gap-6 md:gap-8">
            <CallControls
              muted={muted}
              videoOff={videoOff}
              onToggleMute={handleToggleMute}
              onToggleCamera={handleToggleCamera}
              onEndCall={handleEnd}
              disabled={isFailed || isEnded}
            />
          </div>
        </div>
      </div>

      {/* Minimized Overlay */}
      <MinimizedOverlay
        visible={minimized}
        remoteUser={remoteUser}
        startTime={callState?.startTime}
        isConnected={isConnected}
        muted={muted}
        videoOff={videoOff}
        onToggleMute={handleToggleMute}
        onEndCall={handleEnd}
        onRestore={() => setMinimized(false)}
      />

      {/* Outgoing Modal */}
      {(isCalling || isRinging) && (
        <OutgoingCallModal
          visible={true}
          caller={remoteUser}
          callType="video"
          statusText={isRinging ? 'Ringing...' : 'Calling...'}
          onCancel={handleEnd}
        />
      )}

      {/* Loading */}
      {(!isConnected && !isFailed && !isEnded && !isIncoming) && (
        <div className="absolute inset-0 z-30 flex items-center justify-center bg-black/40 backdrop-blur-sm">
          <LoadingCall message={isRinging ? 'Ringing...' : 'Connecting...'} />
        </div>
      )}

      {/* Ended / Failed State */}
      {(isFailed || isEnded) && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/70 backdrop-blur-md animate-fade-in">
          <div className="bg-dark-800/90 border border-dark-700 rounded-3xl p-8 max-w-sm mx-4 text-center shadow-2xl">
            <AvatarView user={remoteUser} size="xl" className="w-24 h-24 mx-auto mb-4 text-3xl" />
            <h3 className="text-xl font-bold text-white mb-2">{isFailed ? 'Call Failed' : 'Call Ended'}</h3>
            <p className="text-dark-400 mb-6">{isFailed ? 'Could not connect.' : 'Thanks for connecting.'}</p>
            <button
              onClick={() => navigate('/home', { replace: true })}
              className="w-full py-3 bg-primary-600 hover:bg-primary-700 text-white rounded-2xl font-semibold transition-colors"
            >
              Back to Home
            </button>
          </div>
        </div>
      )}
    </div>
  )
}

export default VideoCall
