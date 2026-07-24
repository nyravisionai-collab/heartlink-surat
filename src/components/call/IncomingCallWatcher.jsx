/**
 * Global incoming-call watcher.
 *
 * Listens for call records in Firebase RTDB where the current user is the
 * receiver, fetches the caller's profile + SDP offer, and shows the incoming
 * call modal on top of any screen. On accept it answers the call and navigates
 * to the appropriate call page; on reject it tears the call down.
 */
import React, { useEffect, useRef, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useCall } from '../../contexts/CallContext'
import { useAuth } from '../../contexts/AuthContext'
import { getUserById } from '../../firebase'
import IncomingCallModal from './IncomingCallModal'
import Logger from '../../utils/Logger'

const IncomingCallWatcher = () => {
  const navigate = useNavigate()
  const {
    service, prepareIncoming, answerCall, rejectCall, callState, CallStatus,
  } = useCall()
  const { currentUser } = useAuth()

  // { callId, callType, caller } or null
  const [incoming, setIncoming] = useState(null)
  // callId we are currently presenting, to de-dupe re-fires of the listener
  const handlingRef = useRef(null)
  // latest call status (avoids stale closures / constant re-subscriptions)
  const statusRef = useRef('idle')

  useEffect(() => {
    statusRef.current = typeof callState === 'object' ? callState?.status : callState
  }, [callState])

  useEffect(() => {
    if (!currentUser?.uid) return

    // Make sure the signaling layer knows the current user.
    service.initialize(currentUser.uid)
    const signaling = service.signaling
    if (!signaling) return

    let mounted = true

    const handleIncoming = async (callId, call) => {
      if (!mounted) return
      // Already showing a call -> ignore (the busy guard below also rejects).
      if (handlingRef.current) return

      const busyStatus = statusRef.current
      if (busyStatus && busyStatus !== CallStatus.IDLE && busyStatus !== CallStatus.ENDED && busyStatus !== CallStatus.FAILED) {
        // User is already in a call: politely decline the new one.
        try { await signaling.rejectCall(callId) } catch (e) { /* ignore */ }
        return
      }

      handlingRef.current = callId
      try {
        // Resolve the caller's profile for the modal.
        let caller = {
          uid: call.callerId,
          displayName: 'Unknown',
          photoURL: null,
          city: null,
        }
        try {
          const profile = await getUserById(call.callerId)
          if (profile?.success && profile.data) {
            caller = { uid: call.callerId, ...profile.data }
          }
        } catch (e) {
          Logger.warn('Could not load caller profile', { error: e?.message })
        }

        // Pull the caller's SDP offer (the caller creates the record before signaling).
        const offer = await signaling.getOffer(callId)
        if (!offer) {
          handlingRef.current = null
          return
        }

        if (!mounted) return

        const callType = call.callType === 'video' ? 'video' : 'audio'
        prepareIncoming(callId, offer, callType, caller)
        setIncoming({ callId, callType, caller })
      } catch (e) {
        Logger.error('Incoming call handling failed', { error: e?.message })
        handlingRef.current = null
      }
    }

    const unsubscribe = signaling.subscribeToIncomingCalls(handleIncoming)
    return () => {
      mounted = false
      unsubscribe()
    }
  }, [currentUser, service, prepareIncoming])

  const handleAccept = async () => {
    if (!incoming) return
    const { caller, callType } = incoming
    try {
      await answerCall(caller, callType)
      const path = callType === 'video' ? '/call/video' : '/call/voice'
      setIncoming(null)
      handlingRef.current = null
      navigate(path, { replace: true })
    } catch (e) {
      Logger.error('Failed to accept call', { error: e?.message })
      setIncoming(null)
      handlingRef.current = null
    }
  }

  const handleReject = async () => {
    if (!incoming) return
    try {
      await rejectCall()
    } catch (e) {
      Logger.error('Failed to reject call', { error: e?.message })
    }
    setIncoming(null)
    handlingRef.current = null
  }

  // If the call ends/changes from elsewhere, clear the local modal state.
  useEffect(() => {
    const status = typeof callState === 'object' ? callState?.status : callState
    if (incoming && (status === CallStatus.IDLE || status === CallStatus.ENDED || status === CallStatus.FAILED)) {
      setIncoming(null)
      handlingRef.current = null
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [callState])

  if (!incoming) return null

  return (
    <IncomingCallModal
      visible={true}
      caller={incoming.caller}
      callType={incoming.callType}
      onAccept={handleAccept}
      onReject={handleReject}
    />
  )
}

export default IncomingCallWatcher
