/**
 * Phase 03: WebRTC Service
 * Main service integrating PeerConnection, Media, Signaling, and Call State.
 */

import PeerConnectionManager from './PeerConnection.js';
import MediaManager from './MediaManager.js';
import CallState, { CallStatus, CallType } from './CallState.js';
import FirebaseSignaling from './FirebaseSignaling.js';
import PermissionManager from './PermissionManager.js';
import CleanupManager from './CleanupManager.js';

const CALL_TIMEOUT_MS = 60 * 1000;
const ICE_RESTART_COOLDOWN_MS = 10 * 1000;

export class WebRTCService {
  constructor(userId) {
    this.userId = userId || null;
    this.peerConnection = new PeerConnectionManager();
    this.mediaManager = new MediaManager();
    this.callState = new CallState();
    this.signaling = userId ? new FirebaseSignaling(userId) : null;
    this.permissions = new PermissionManager();
    this.cleanup = new CleanupManager();
    this.currentCallId = null;
    this.remoteUserId = null;
    this.unsubscribers = [];

    // Incoming call: offer stored until the user accepts.
    this.pendingOffer = null;
    // Remote ICE candidates that arrive before remote description is set.
    this._pendingCandidates = [];
    this._seenRemoteCandidateKeys = new Set();
    this._callTimeoutId = null;
    this._iceRestarting = false;
    this._lastIceRestartAt = 0;
  }

  async initialize(userId) {
    const nextUserId = userId || this.userId;
    if (!nextUserId) return;

    this.userId = nextUserId;
    if (!this.signaling || this.signaling.userId !== nextUserId) {
      this.signaling = new FirebaseSignaling(nextUserId);
    }
  }

  /**
   * Acquire local media (reusing a pre-granted permission stream when present).
   * Returns true on success. Used by both startCall and answerCall.
   */
  async _acquireMedia(callType) {
    const needsVideo = callType === CallType.VIDEO;
    this.mediaManager.setMediaMode({ audio: true, video: needsVideo });

    const permResult = await this.permissions.requestPermissions({
      audio: true,
      video: needsVideo,
    });

    if (!permResult.audio && (callType === CallType.AUDIO || callType === CallType.VIDEO)) {
      throw new Error('Microphone permission denied');
    }
    if (needsVideo && !permResult.video) {
      throw new Error('Camera permission denied');
    }

    const requirements = { audio: true, video: needsVideo };
    const preStream = this.permissions.consumePreGrantedStream();
    if (!(preStream && this.mediaManager.reuseStream(preStream, requirements))) {
      if (needsVideo) {
        await this.mediaManager.startMediaStream();
      } else {
        await this.mediaManager.startAudioOnly();
      }
    }

    const localStream = this.mediaManager.getLocalStream();
    const hasAudio = localStream?.getAudioTracks?.().some((track) => track.readyState !== 'ended');
    const hasVideo = localStream?.getVideoTracks?.().some((track) => track.readyState !== 'ended');

    if (!hasAudio) {
      throw new Error('Microphone stream unavailable');
    }
    if (needsVideo && !hasVideo) {
      throw new Error('Camera stream unavailable');
    }

    this._notifyMediaUpdate();
  }

  async startCall(remoteUser, callType = CallType.AUDIO, callId = null) {
    if (!this.userId) {
      throw new Error('WebRTCService: User not initialized');
    }
    if (!remoteUser || !remoteUser.uid) {
      throw new Error('WebRTCService: Invalid remote user');
    }

    this.currentCallId = callId || `call_${this.userId}_${remoteUser.uid}_${Date.now()}`;
    this.remoteUserId = remoteUser.uid;
    this.pendingOffer = null;
    this._pendingCandidates = [];
    this._seenRemoteCandidateKeys = new Set();

    this.callState.setType(callType);
    this.callState.setRemoteUser(remoteUser);
    this.callState.setInitiator(true);
    this.callState.startCall();

    try {
      await this._acquireMedia(callType);

      // Initialize peer connection
      this.peerConnection.create();
      this.peerConnection.addLocalStream(this.mediaManager.getLocalStream());

      // Setup peer event handlers before creating the offer so local ICE
      // candidates are captured as soon as gathering starts. Signaling
      // subscriptions are attached after the call record exists because RTDB
      // rules authorize /signals/$callId by checking /calls/$callId.
      this.setupPeerEvents();

      // Create the call record before writing signaling data. RTDB security
      // rules authorize /signals/$callId reads/writes by looking up
      // /calls/$callId, so the room must exist before offer/candidates are
      // written. Keep the status as "calling" while the offer is prepared,
      // then flip to "ringing" to notify the receiver once the offer exists.
      await this.signaling.createCallRecord(this.currentCallId, {
        callerId: this.userId,
        receiverId: remoteUser.uid,
        callType,
        status: 'calling',
      });

      this.setupSignaling('caller');

      // Create and send offer
      await this.peerConnection.createOffer();
      await this.signaling.sendOffer(this.currentCallId, this.peerConnection.getLocalDescription());
      await this.signaling.updateCallStatus(this.currentCallId, 'ringing');
      this.callState.setStatus(CallStatus.RINGING);
      this._startCallTimeout();

      // Detect when the callee rejects / ends the call.
      this._subscribeCallStatus((status) => this._handleLifecycleStatus(status));
    } catch (err) {
      console.error('Failed to start call:', err);
      this.callState.fail(err.message || 'Failed to start call');
      this.cleanup.cleanupAll();
      throw err;
    }
  }

  /**
   * Record an incoming call without touching media / peer connection yet.
   * The actual media + WebRTC setup happens in answerCall() once the user accepts.
   */
  setIncomingCall(callId, offer, callType = CallType.AUDIO, callerId = null) {
    this.currentCallId = callId;
    this.remoteUserId = callerId;
    this.pendingOffer = offer;
    this._pendingCandidates = [];
    this._seenRemoteCandidateKeys = new Set();

    this.callState.setType(callType);
    this.callState.setInitiator(false);
    this.callState.setRemoteUser(null);
    this.callState.setStatus(CallStatus.RINGING);
  }

  async answerCall(remoteUser, callType = CallType.AUDIO, callId = null) {
    if (!this.userId) {
      throw new Error('WebRTCService: User not initialized');
    }

    this.currentCallId = callId || this.currentCallId;
    this.remoteUserId = remoteUser.uid;

    this.callState.setType(callType);
    this.callState.setRemoteUser(remoteUser);
    this.callState.setInitiator(false);
    this.callState.setStatus(CallStatus.RINGING);

    try {
      await this._acquireMedia(callType);

      this.peerConnection.create();
      this.peerConnection.addLocalStream(this.mediaManager.getLocalStream());

      this.setupPeerEvents();
      this.setupSignaling('answerer');

      // Apply the caller's stored offer (then flush any buffered candidates).
      // The normal incoming watcher stores this in pendingOffer; the fallback
      // fetch keeps answerCall robust if the page is restored/reloaded mid-ring.
      const offer = this.pendingOffer || await this.signaling.getOffer(this.currentCallId);
      this.pendingOffer = null;
      if (!offer) {
        throw new Error('Incoming call offer unavailable');
      }
      await this.peerConnection.setRemoteDescription(offer);
      this._flushPendingCandidates();

      // Create and send the answer
      await this.peerConnection.createAnswer();
      await this.signaling.sendAnswer(this.currentCallId, this.peerConnection.getLocalDescription());

      // Let the caller know the call was picked up, then watch for a
      // later hang-up from either side.
      this._clearCallTimeout();
      await this.signaling.updateCallStatus(this.currentCallId, 'answered');
      this._subscribeCallStatus((status) => this._handleLifecycleStatus(status));
    } catch (err) {
      console.error('Failed to answer call:', err);
      this.callState.fail(err.message || 'Failed to answer call');
      this.cleanup.cleanupAll();
      throw err;
    }
  }

  setupPeerEvents() {
    this.peerConnection.onTrack = (event) => {
      const aggregateStream = new MediaStream(
        this.mediaManager.getRemoteStream()?.getTracks?.() || []
      );

      // Some browsers deliver a stream in event.streams[0], while others only
      // deliver event.track. Build our own aggregate stream and replace the
      // object on every track event so React receives a new reference and
      // re-renders when audio/video tracks arrive at different times.
      const sourceTracks = event.streams?.[0]?.getTracks?.() || [];
      [...sourceTracks, event.track].filter(Boolean).forEach((track) => {
        if (!aggregateStream.getTracks().some((existing) => existing.id === track.id)) {
          aggregateStream.addTrack(track);
        }
      });

      if (aggregateStream.getTracks().length > 0) {
        this.mediaManager.setRemoteStream(aggregateStream);
        this._notifyMediaUpdate();
      }
    };

    this.peerConnection.onIceCandidate = async (candidate) => {
      if (this.signaling && this.currentCallId) {
        await this.signaling.sendIceCandidate(
          this.currentCallId,
          candidate.toJSON ? candidate.toJSON() : candidate
        );
      }
    };

    this.peerConnection.onConnectionStateChange = (state) => {
      if (state === 'connected' || state === 'completed') {
        this._clearCallTimeout();
        this._iceRestarting = false;
        this.callState.connect();
      } else if (state === 'disconnected' || state === 'failed' || state === 'closed') {
        this.callState.disconnect();
      }
    };

    this.peerConnection.onIceConnectionStateChange = (state) => {
      if (state === 'connected' || state === 'completed') {
        this._clearCallTimeout();
        this._iceRestarting = false;
      }
      if (state === 'failed') {
        console.warn('ICE connection failed');
        this._attemptIceRestart();
      }
    };
  }

  /**
   * Subscribe to signaling for the current call.
   * @param {'caller'|'answerer'} role
   */
  setupSignaling(role = 'caller') {
    if (!this.signaling || !this.currentCallId) return;

    const unsubscribe = this.signaling.subscribeToSignals(
      this.currentCallId,
      {
        onOffer: async (offer) => {
          try {
            await this._handleRemoteOffer(offer);
          } catch (e) {
            console.error('Failed to apply remote offer:', e);
          }
        },
        onAnswer: async (answer) => {
          // Caller receives the initial answer and any later ICE-restart answer.
          try {
            const signalingState = this.peerConnection.getSignalingState();
            const hasRemoteDescription = Boolean(this.peerConnection.getRemoteDescription());
            if (hasRemoteDescription && signalingState !== 'have-local-offer') return;
            await this.peerConnection.setRemoteDescription(answer);
            this._iceRestarting = false;
            this._clearCallTimeout();
            this._flushPendingCandidates();
          } catch (e) {
            console.error('Failed to apply remote answer:', e);
          }
        },
        onCandidate: (candidate, key) => {
          this._handleRemoteCandidate(candidate, key);
        },
      },
      role
    );

    this.unsubscribers.push(unsubscribe);
  }

  async _handleRemoteOffer(offer) {
    if (!offer || !this.peerConnection?.peerConnection) return;

    const remoteDescription = this.peerConnection.getRemoteDescription();
    if (!remoteDescription) return; // initial offer is applied directly by answerCall()
    if (remoteDescription.sdp === offer.sdp) return; // duplicate value event

    const signalingState = this.peerConnection.getSignalingState();
    if (signalingState !== 'stable') {
      console.warn('Ignoring remote offer while signaling state is:', signalingState);
      return;
    }

    await this.peerConnection.setRemoteDescription(offer);
    this._flushPendingCandidates();
    await this.peerConnection.createAnswer();
    await this.signaling.sendAnswer(this.currentCallId, this.peerConnection.getLocalDescription());
  }

  async _attemptIceRestart() {
    const state = this.callState.status;
    if (state !== CallStatus.CONNECTED && state !== CallStatus.DISCONNECTED) return;
    if (!this.callState.initiator) return; // keep one side authoritative to avoid offer glare
    if (!this.signaling || !this.currentCallId || !this.peerConnection?.peerConnection) return;
    if (this._iceRestarting) return;

    const now = Date.now();
    if (now - this._lastIceRestartAt < ICE_RESTART_COOLDOWN_MS) return;

    try {
      this._iceRestarting = true;
      this._lastIceRestartAt = now;
      this.peerConnection.restartIce();
      await this.peerConnection.createOffer({ iceRestart: true });
      await this.signaling.sendOffer(this.currentCallId, this.peerConnection.getLocalDescription());
    } catch (err) {
      this._iceRestarting = false;
      console.warn('ICE restart failed:', err);
    }
  }

  /** Buffer candidates that arrive before the remote description is set. */
  async _handleRemoteCandidate(candidate, key = null) {
    if (!candidate) return;

    const candidateKey = key || this._candidateFingerprint(candidate);
    if (candidateKey && this._seenRemoteCandidateKeys.has(candidateKey)) return;
    if (candidateKey) this._seenRemoteCandidateKeys.add(candidateKey);

    try {
      const remoteDesc = this.peerConnection.getRemoteDescription();
      if (!remoteDesc) {
        this._pendingCandidates.push(candidate);
        return;
      }
      await this.peerConnection.addIceCandidate(candidate);
    } catch (e) {
      console.warn('addIceCandidate error:', e);
    }
  }

  _flushPendingCandidates() {
    const pending = this._pendingCandidates.splice(0);
    pending.forEach((candidate) => {
      this.peerConnection.addIceCandidate(candidate).catch((e) => {
        console.warn('flush addIceCandidate error:', e);
      });
    });
  }

  _candidateFingerprint(candidate) {
    if (!candidate) return '';
    return [
      candidate.candidate || '',
      candidate.sdpMid ?? '',
      candidate.sdpMLineIndex ?? '',
      candidate.usernameFragment ?? '',
    ].join('|');
  }

  _notifyMediaUpdate() {
    // CallContext synchronizes streams from the service when CallState emits.
    // Media track events do not always coincide with a call-state transition,
    // so force a no-op state notification when local/remote streams change.
    this.callState.notify();
  }

  _startCallTimeout() {
    this._clearCallTimeout();
    this._callTimeoutId = window.setTimeout(async () => {
      const status = this.callState.status;
      if (status !== CallStatus.CALLING && status !== CallStatus.RINGING) return;

      const callId = this.currentCallId;
      this.callState.fail('Call timed out');
      try {
        if (this.signaling && callId) {
          await this.signaling.endCall(callId);
          await this.signaling.cleanSignals(callId);
        }
      } catch (err) {
        console.warn('Failed to mark timed-out call as ended:', err);
      } finally {
        this._releaseResources({ resetState: false });
      }
    }, CALL_TIMEOUT_MS);
  }

  _clearCallTimeout() {
    if (this._callTimeoutId) {
      window.clearTimeout(this._callTimeoutId);
      this._callTimeoutId = null;
    }
  }

  _subscribeCallStatus(onStatus) {
    if (!this.signaling || !this.currentCallId) return;
    const unsubscribe = this.signaling.subscribeToCallStatus(this.currentCallId, onStatus);
    this.unsubscribers.push(unsubscribe);
  }

  _handleLifecycleStatus(status) {
    const current = this.callState.status;
    if (status === 'answered') {
      this._clearCallTimeout();
      return;
    }

    if (current === CallStatus.IDLE || current === CallStatus.ENDED || current === CallStatus.FAILED) {
      return;
    }

    if (status === 'rejected') {
      this.callState.fail('Call rejected');
      this._cleanSignalsForCurrentCall();
      this._releaseResources({ resetState: false });
    } else if (status === 'ended') {
      this.callState.end();
      this._cleanSignalsForCurrentCall();
      this._releaseResources({ resetState: false });
    }
  }

  _cleanSignalsForCurrentCall() {
    const callId = this.currentCallId;
    if (this.signaling && callId) {
      this.signaling.cleanSignals(callId).catch((err) => {
        console.warn('Failed to clean signaling room:', err);
      });
    }
  }

  async endCall() {
    try {
      this.callState.end();
      if (this.signaling && this.currentCallId) {
        await this.signaling.endCall(this.currentCallId);
        await this.signaling.cleanSignals(this.currentCallId);
      }
    } catch (err) {
      console.error('Failed to end call cleanly:', err);
    } finally {
      this.dispose();
    }
  }

  async rejectCall() {
    this.callState.setStatus(CallStatus.ENDED);
    try {
      if (this.signaling && this.currentCallId) {
        await this.signaling.rejectCall(this.currentCallId);
        await this.signaling.cleanSignals(this.currentCallId);
      }
    } catch (err) {
      console.error('Failed to reject call cleanly:', err);
    } finally {
      this.dispose();
    }
  }

  _releaseResources({ resetState = true } = {}) {
    this._clearCallTimeout();

    // Stop media
    this.mediaManager.dispose();

    // Close peer connection
    this.peerConnection.destroy();

    // Unsubscribe signaling listeners
    this.unsubscribers.forEach((unsub) => {
      if (typeof unsub === 'function') unsub();
    });
    this.unsubscribers = [];

    // Do not call signaling.unsubscribeAll() here: the shared signaling
    // instance also owns global listeners such as IncomingCallWatcher. Call
    // specific subscriptions are tracked in this.unsubscribers above.

    // Cleanup resources
    this.cleanup.cleanupAll();

    // Reset volatile call identifiers / buffers
    this.currentCallId = null;
    this.remoteUserId = null;
    this.pendingOffer = null;
    this._pendingCandidates = [];
    this._seenRemoteCandidateKeys = new Set();
    this._iceRestarting = false;
    this._lastIceRestartAt = 0;

    if (resetState) {
      this.callState.reset();
    }
  }

  dispose() {
    this._releaseResources({ resetState: true });
  }

  getStateSnapshot() {
    return this.callState.getSnapshot();
  }

  subscribeToState(callback) {
    return this.callState.subscribe(callback);
  }

  getLocalStream() {
    return this.mediaManager.getLocalStream();
  }

  getRemoteStream() {
    return this.mediaManager.getRemoteStream();
  }
}

export { CallStatus, CallType };
export default WebRTCService;
