/**
 * Phase 04: Call Context
 * Bridges presentation layer with existing Phase 03 WebRTC engine.
 * Never duplicates WebRTC logic.
 */
import React, { createContext, useContext, useState, useEffect, useCallback, useRef } from 'react'
import { WebRTCService, CallStatus, CallType } from '../services/webrtc/index.js'
import { useAuth } from './AuthContext'

const CallContext = createContext()

export const useCall = () => {
  const context = useContext(CallContext)
  if (!context) {
    throw new Error('useCall must be used within CallProvider')
  }
  return context
}

export const CallProvider = ({ children }) => {
  const { currentUser } = useAuth()
  const [service] = useState(() => new WebRTCService())

  // Initialize WebRTCService with current user ID
  useEffect(() => {
    if (currentUser?.uid) {
      service.initialize(currentUser.uid)
    }
  }, [currentUser, service])
  const [callState, setCallState] = useState(service.getStateSnapshot())
  const [localStream, setLocalStream] = useState(null)
  const [remoteStream, setRemoteStream] = useState(null)
  const [isIncoming, setIsIncoming] = useState(false)
  const [remoteUser, setRemoteUser] = useState(null)
  const [isMuted, setIsMuted] = useState(false)
  const [isVideoOff, setIsVideoOff] = useState(true)
  const [devices, setDevices] = useState({ video: [], audio: [] })
  const [connectionQuality, setConnectionQuality] = useState('good')
  const [reconnectStatus, setReconnectStatus] = useState('idle')
  const unsubscribeRef = useRef(null)
  const reconnectTimerRef = useRef(null)
  const qualityIntervalRef = useRef(null)

  useEffect(() => {
    unsubscribeRef.current = service.subscribeToState((state) => {
      setCallState(state)
      setLocalStream(service.getLocalStream())
      setRemoteStream(service.getRemoteStream())

      // Integrated reconnect monitoring within main subscription
      const status = typeof state === 'object' ? state.status : state
      if (status === 'disconnected' || status === 'reconnecting') {
        setReconnectStatus('reconnecting')
        setConnectionQuality('poor')
        reconnectTimerRef.current = setTimeout(() => {
          setReconnectStatus('recovered')
          setConnectionQuality('good')
        }, 3000)
      } else if (status === 'connected' || status === 'completed') {
        setReconnectStatus('idle')
        setConnectionQuality('good')
        if (reconnectTimerRef.current) clearTimeout(reconnectTimerRef.current)
      } else if (status === 'failed') {
        setReconnectStatus('failed')
        setConnectionQuality('poor')
      }
    })
    return () => {
      if (unsubscribeRef.current) unsubscribeRef.current()
      if (reconnectTimerRef.current) clearTimeout(reconnectTimerRef.current)
    }
  }, [service])

  // Sync mute/video state with MediaStream
  useEffect(() => {
    const syncState = () => {
      const stream = service.getLocalStream()
      if (!stream) {
        setIsMuted(true)
        setIsVideoOff(true)
        return
      }
      const audioTracks = stream.getAudioTracks()
      const videoTracks = stream.getVideoTracks()
      setIsMuted(audioTracks.length > 0 ? !audioTracks[0].enabled : true)
      setIsVideoOff(videoTracks.length > 0 ? !videoTracks[0].enabled : true)
    }
    syncState()
    const interval = setInterval(syncState, 500)
    return () => clearInterval(interval)
  }, [service, localStream])

  const startCall = useCallback(async (user, type = CallType.AUDIO) => {
    setIsIncoming(false)
    setRemoteUser(user)
    await service.startCall(user, type)
  }, [service])

  const answerCall = useCallback(async (user, type = CallType.AUDIO) => {
    setIsIncoming(false)
    setRemoteUser(user)
    await service.answerCall(user, type)
  }, [service])

  const receiveIncoming = useCallback((offerData, user, callId) => {
    setIsIncoming(true)
    setRemoteUser(user)
    // Handle incoming offer through service
    service.handleRemoteOffer(offerData, callId)
  }, [service])

  const endCall = useCallback(async () => {
    await service.endCall()
    setRemoteUser(null)
    setIsIncoming(false)
  }, [service])

  const rejectCall = useCallback(async () => {
    await service.rejectCall()
    setRemoteUser(null)
    setIsIncoming(false)
  }, [service])

  const toggleMute = useCallback(() => {
    const current = service.mediaManager.getLocalStream()
    if (current) {
      const audioTracks = current.getAudioTracks()
      audioTracks.forEach((track) => {
        track.enabled = !track.enabled
      })
      setIsMuted(current.getAudioTracks().every(t => !t.enabled))
    }
  }, [service])

  const toggleCamera = useCallback(() => {
    const current = service.mediaManager.getLocalStream()
    if (current) {
      const videoTracks = current.getVideoTracks()
      videoTracks.forEach((track) => {
        track.enabled = !track.enabled
      })
      setIsVideoOff(current.getVideoTracks().every(t => !t.enabled))
    }
  }, [service])

  // Quality monitoring using ICE connection state
  useEffect(() => {
    if (!service.peerConnection || !service.peerConnection.peerConnection) return
    const pc = service.peerConnection.peerConnection
    if (!pc) return
    const checkQuality = () => {
      const iceState = pc.iceConnectionState || 'new'
      const connState = pc.connectionState || 'new'
      if (iceState === 'connected' || iceState === 'completed') {
        setConnectionQuality('good')
      } else if (iceState === 'checking' || connState === 'connecting') {
        setConnectionQuality('good')
      } else if (iceState === 'disconnected') {
        setConnectionQuality('poor')
      } else if (iceState === 'failed') {
        setConnectionQuality('poor')
      }
    }
    qualityIntervalRef.current = setInterval(checkQuality, 1000)
    return () => {
      if (qualityIntervalRef.current) clearInterval(qualityIntervalRef.current)
    }
  }, [service])

  const switchVideoDevice = useCallback(async (deviceId) => {
    service.mediaManager.selectVideoDevice(deviceId)
    const current = service.getLocalStream()
    if (current) {
      try {
        const newConstraints = { video: { deviceId: { exact: deviceId } }, audio: false }
        const newStream = await navigator.mediaDevices.getUserMedia(newConstraints)
        const newVideoTrack = newStream.getVideoTracks()[0]
        
        if (newVideoTrack) {
          // Stop old video tracks to prevent hardware light and resource leaks
          current.getVideoTracks().forEach(track => track.stop())
          
          // Replace video track in peer connection
          const senders = service.peerConnection.peerConnection?.getSenders?.()
          if (senders) {
            senders.forEach(sender => {
              if (sender.track && sender.track.kind === 'video') {
                sender.replaceTrack(newVideoTrack)
              }
            })
          }
          
          // Combine existing audio tracks with the new video track
          const combinedStream = new MediaStream([
            ...current.getAudioTracks(),
            newVideoTrack
          ])
          
          service.mediaManager.localStream = combinedStream
          setLocalStream(combinedStream)
        }
      } catch (err) {
        console.error('Failed to switch video device:', err)
      }
    }
  }, [service])

  const switchAudioDevice = useCallback(async (deviceId) => {
    service.mediaManager.selectAudioDevice(deviceId)
    const current = service.getLocalStream()
    if (current) {
      try {
        const newConstraints = { audio: { deviceId: { exact: deviceId } }, video: false }
        const newStream = await navigator.mediaDevices.getUserMedia(newConstraints)
        const newAudioTrack = newStream.getAudioTracks()[0]
        
        if (newAudioTrack) {
          // Stop old audio tracks to prevent leaks
          current.getAudioTracks().forEach(track => track.stop())
          
          // Replace audio track in peer connection
          const senders = service.peerConnection.peerConnection?.getSenders?.()
          if (senders) {
            senders.forEach(sender => {
              if (sender.track && sender.track.kind === 'audio') {
                sender.replaceTrack(newAudioTrack)
              }
            })
          }
          
          // Combine the new audio track with existing video tracks
          const combinedStream = new MediaStream([
            newAudioTrack,
            ...current.getVideoTracks()
          ])
          
          service.mediaManager.localStream = combinedStream
          setLocalStream(combinedStream)
        }
      } catch (err) {
        console.error('Failed to switch audio device:', err)
      }
    }
  }, [service])

  const getDevices = useCallback(async () => {
    const result = await service.mediaManager.getDevices()
    setDevices(result)
    return result
  }, [service])

  // Permission recovery monitoring (uses Permissions API, not getUserMedia)
  useEffect(() => {
    const checkPermissions = async () => {
      if (!navigator.permissions || !navigator.permissions.query) return
      try {
        const micStatus = await navigator.permissions.query({ name: 'microphone' })
        const camStatus = await navigator.permissions.query({ name: 'camera' })
        if (micStatus.state === 'denied') {
          service.permissions.audioPermission = 'denied'
        }
        if (camStatus.state === 'denied') {
          service.permissions.videoPermission = 'denied'
        }
      } catch (e) {
        // Permissions API may not support these queries; silently ignore
      }
    }
    const interval = setInterval(checkPermissions, 15000)
    return () => clearInterval(interval)
  }, [service])

  const value = {
    service,
    callState,
    isIncoming,
    remoteUser,
    localStream,
    remoteStream,
    isMuted,
    isVideoOff,
    devices,
    connectionQuality,
    reconnectStatus,
    startCall,
    answerCall,
    receiveIncoming,
    endCall,
    rejectCall,
    toggleMute,
    toggleCamera,
    switchVideoDevice,
    switchAudioDevice,
    getDevices,
    CallStatus,
    CallType,
  }

  return <CallContext.Provider value={value}>{children}</CallContext.Provider>
}

export default CallContext
