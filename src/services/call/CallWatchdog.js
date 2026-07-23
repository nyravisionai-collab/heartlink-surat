/**
 * Phase 06: Call Watchdog
 * Monitors active calls and attempts automatic recovery when possible.
 */
import { CallStatus } from '../webrtc/CallState.js'

export class CallWatchdog {
  constructor(service, options = {}) {
    this.service = service
    this.interval = options.interval || 3000
    this.timer = null
    this.recoveryAttempts = 0
    this.maxRecoveryAttempts = options.maxRecoveryAttempts || 3
    this.onRecover = options.onRecover || (() => {})
    this.onFail = options.onFail || (() => {})
  }

  start() {
    if (this.timer) return
    this.timer = setInterval(() => {
      this.check()
    }, this.interval)
  }

  stop() {
    if (this.timer) {
      clearInterval(this.timer)
      this.timer = null
    }
    this.recoveryAttempts = 0
  }

  check() {
    const state = this.service.getStateSnapshot()
    const status = state.status

    // Detect frozen connection (connected but no stream updates for too long)
    if (status === 'connected') {
      const remoteStream = this.service.getRemoteStream()
      const hasRemoteTracks = remoteStream && remoteStream.getTracks && remoteStream.getTracks().length > 0
      const remoteTracksActive = hasRemoteTracks && remoteStream.getTracks().every(t => t.readyState === 'live')
      if (!remoteTracksActive && this.recoveryAttempts < this.maxRecoveryAttempts) {
        this.recoveryAttempts++
        this.attemptRecovery()
      } else if (!remoteTracksActive && this.recoveryAttempts >= this.maxRecoveryAttempts) {
        this.onFail?.('Remote video frozen after multiple recovery attempts')
      }
    }

    // Detect unexpected disconnection
    if (status === 'disconnected' && this.recoveryAttempts < this.maxRecoveryAttempts) {
      this.recoveryAttempts++
      this.attemptRecovery()
    }

    // Reset on connected/recovered
    if (status === 'connected') {
      this.recoveryAttempts = 0
    }
  }

  attemptRecovery() {
    const pc = this.service.peerConnection?.peerConnection
    if (!pc) return

    try {
      if (pc.iceConnectionState === 'failed' || pc.connectionState === 'failed') {
        // Request ICE restart by creating new offer
        this.service.peerConnection.createOffer().catch(() => {})
      }
      this.onRecover?.()
    } catch (e) {
      console.warn('Watchdog recovery attempt failed:', e)
    }
  }

  dispose() {
    this.stop()
  }
}

export default CallWatchdog
