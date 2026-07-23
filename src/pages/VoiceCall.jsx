/**
 * Phase 04: Voice Call Page
 */
import React, { useEffect, useState } from 'react'
import { useNavigate, useLocation } from 'react-router-dom'
import { useCall } from '../contexts/CallContext'
import AvatarView from '../components/call/AvatarView'
import CallControls from '../components/call/CallControls'
import ConnectionStatus from '../components/call/ConnectionStatus'
import CallTimer from '../components/call/CallTimer'
import IncomingCallModal from '../components/call/IncomingCallModal'
import OutgoingCallModal from '../components/call/OutgoingCallModal'
import ReconnectIndicator from '../components/call/ReconnectIndicator'
import CallQualityIndicator from '../components/call/CallQualityIndicator'
import MinimizedOverlay from '../components/call/MinimizedOverlay'
import FullscreenButton from '../components/call/FullscreenButton'
import DeviceSelector from '../components/call/DeviceSelector'
import audioFeedback from '../services/call/AudioFeedback'
import { useAppLifecycle } from '../hooks/useAppLifecycle'
import Logger from '../utils/Logger'

const VoiceCall = () => {
  const navigate = useNavigate()
  const location = useLocation()
  const {
    callState, remoteUser, isIncoming, startCall, answerCall, endCall, rejectCall,
    toggleMute, toggleCamera, CallStatus, connectionQuality, reconnectStatus, service,
    switchVideoDevice, switchAudioDevice
  } = useCall()
  const [muted, setMuted] = useState(false)
  const [videoOff, setVideoOff] = useState(true)
  const [initialized, setInitialized] = useState(false)
  const [minimized, setMinimized] = useState(false)
  const [isFullscreen, setIsFullscreen] = useState(false)
  const [audioFeedbackInit, setAudioFeedbackInit] = useState(false)

  const isConnected = callState?.status === CallStatus?.CONNECTED || callState?.status === 'connected'
  const isCalling = callState?.status === CallStatus?.CALLING || callState?.status === 'calling'
  const isRinging = callState?.status === CallStatus?.RINGING || callState?.status === 'ringing'
  const isFailed = callState?.status === CallStatus?.FAILED || callState?.status === 'failed'
  const isEnded = callState?.status === CallStatus?.ENDED || callState?.status === 'ended'

  useEffect(() => {
    const params = new URLSearchParams(location.search)
    const callType = params.get('type') || 'audio'
    const userId = params.get('userId')
    const callerData = location.state?.caller || { uid: userId, displayName: 'Unknown', photoURL: null, city: 'Unknown' }

    if (!initialized) {
      setInitialized(true)
      if (isIncoming) {
        // Incoming call handled by context
      } else if (userId) {
        startCall({ ...callerData, uid: userId }, callType === 'video' ? 'video' : 'audio')
      }
    }
  }, [location, initialized, isIncoming, startCall, remoteUser])

  useAppLifecycle(
    () => Logger.info('VoiceCall hidden'),
    () => Logger.info('VoiceCall visible'),
    () => Logger.info('VoiceCall resumed'),
    () => Logger.info('VoiceCall backgrounded')
  )
  // Initialize audio feedback on user interaction
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

  // Play audio feedback based on call state changes
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
    await answerCall(remoteUser, 'audio')
  }

  if (isIncoming && remoteUser && !isConnected && !isEnded) {
    return (
      <IncomingCallModal
        visible={true}
        caller={remoteUser}
        callType="audio"
        onAccept={handleAccept}
        onReject={handleReject}
      />
    )
  }

  return (
    <div className="fixed inset-0 bg-gradient-to-b from-dark-900 via-dark-950 to-dark-900 z-50 flex flex-col items-center justify-between min-h-screen-safe pb-16 pt-12 px-6">
      {/* Status Bar */}
      <div className="absolute top-4 left-4 right-4 flex justify-between items-center z-10">
        <div className="flex items-center gap-3">
          <ConnectionStatus status={callState?.status} className="text-xs" />
          <CallQualityIndicator quality={connectionQuality || 'good'} className="text-xs" />
        </div>
        <div className="flex items-center gap-3">
          <ReconnectIndicator status={reconnectStatus || 'idle'} className="text-xs" />
          <CallTimer startTime={callState?.startTime} paused={!isConnected} className="text-white/80" />
          <FullscreenButton isFullscreen={isFullscreen} onEnter={() => setIsFullscreen(true)} onExit={() => setIsFullscreen(false)} />
        </div>
      </div>

      {/* Main Content */}
      <main className="flex-1 flex flex-col items-center justify-center w-full max-w-md gap-8">
        <div className="relative">
          <AvatarView
            user={remoteUser}
            size="xl"
            online={false}
            className="w-40 h-40 md:w-56 md:h-56 text-5xl md:text-7xl shadow-2xl shadow-black/30"
          />
          <span className={`absolute bottom-3 right-3 w-5 h-5 rounded-full border-2 border-dark-900 ${isConnected ? 'bg-green-500 animate-pulse-slow' : isFailed ? 'bg-red-500' : 'bg-yellow-500 animate-pulse-slow'}`}></span>
        </div>
        <div className="text-center">
          <h1 className="text-3xl md:text-4xl font-bold text-white mb-2">{remoteUser?.displayName || 'Unknown'}</h1>
          <p className="text-dark-400 mb-1">{remoteUser?.city || 'Unknown location'}</p>
          <ConnectionStatus status={callState?.status} className="text-sm" />
        </div>
      </main>

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

      {/* Controls */}
      <div className="w-full max-w-md">
        <CallControls
          muted={muted}
          videoOff={videoOff}
          onToggleMute={handleToggleMute}
          onToggleCamera={handleToggleCamera}
          onEndCall={handleEnd}
          disabled={isFailed || isEnded}
          className="mb-4"
        />
        <div className="flex justify-center">
          <button
            onClick={() => setMinimized(true)}
            className="mr-3 px-4 py-3 bg-dark-700 hover:bg-dark-600 text-white rounded-full font-medium text-sm transition-colors active:scale-95"
            aria-label="Minimize call"
          >
            Minimize
          </button>
          <button
            onClick={handleEnd}
            className="px-8 py-3 bg-red-600 hover:bg-red-700 text-white rounded-full font-semibold transition-colors active:scale-95"
            aria-label="End call"
          >
            End Call
          </button>
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

      {/* Modals */}
      {(isCalling || isRinging) && (
        <OutgoingCallModal
          visible={true}
          caller={remoteUser}
          callType="audio"
          statusText={isRinging ? 'Ringing...' : 'Calling...'}
          onCancel={handleEnd}
        />
      )}

      {(isFailed || isEnded) && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/70 backdrop-blur-md animate-fade-in">
          <div className="bg-dark-800/90 border border-dark-700 rounded-3xl p-8 max-w-sm mx-4 text-center shadow-2xl">
            <h3 className="text-xl font-bold text-white mb-2">{isFailed ? 'Call Failed' : 'Call Ended'}</h3>
            <p className="text-dark-400 mb-6">{isFailed ? 'Could not connect. Please try again.' : 'Thanks for connecting.'}</p>
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

export default VoiceCall
