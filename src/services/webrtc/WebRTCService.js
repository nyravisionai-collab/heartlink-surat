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
  }

  async initialize(userId) {
    this.userId = userId || this.userId;
    if (this.userId && !this.signaling) {
      this.signaling = new FirebaseSignaling(this.userId);
    }
  }

  /**
   * Acquire local media (reusing a pre-granted permission stream when present).
   * Returns true on success. Used by both startCall and answerCall.
   */
  async _acquireMedia(callType) {
    const permResult = await this.permissions.requestPermissions({
      audio: true,
      video: callType === CallType.VIDEO,
    });

    if (!permResult.audio && (callType === CallType.AUDIO || callType === CallType.VIDEO)) {
      throw new Error('Microphone permission denied');
    }
    if (callType === CallType.VIDEO && !permResult.video) {
      throw new Error('Camera permission denied');
    }

    const preStream = this.permissions.consumePreGrantedStream();
    if (!(preStream && this.mediaManager.reuseStream(preStream))) {
      if (callType === CallType.VIDEO) {
        await this.mediaManager.startMediaStream();
      } else {
        await this.mediaManager.startAudioOnly();
      }
    }
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

    this.callState.setType(callType);
    this.callState.setRemoteUser(remoteUser);
    this.callState.setInitiator(true);
    this.callState.startCall();

    try {
      await this._acquireMedia(callType);

      // Initialize peer connection
      this.peerConnection.create();
      this.peerConnection.addLocalStream(this.mediaManager.getLocalStream());

      // Setup event handlers + signaling
      this.setupPeerEvents();
      this.setupSignaling('caller');

      // Create and send offer
      await this.peerConnection.createOffer();
      await this.signaling.sendOffer(this.currentCallId, this.peerConnection.getLocalDescription());

      // Create call record (written AFTER the offer so the receiver can fetch it)
      await this.signaling.createCallRecord(this.currentCallId, {
        callerId: this.userId,
        receiverId: remoteUser.uid,
        callType,
        status: 'calling',
      });

      // Detect when the callee answers / rejects / ends the call
      this._subscribeCallStatus((status) => {
        const current = this.callState.status;
        if (status === 'rejected' && current !== CallStatus.CONNECTED) {
          this.callState.fail('Call rejected');
          this.dispose();
        } else if (status === 'ended' && current !== CallStatus.CONNECTED) {
          this.callState.end();
          this.dispose();
        }
      });
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

      // Apply the caller's stored offer (then flush any buffered candidates)
      const offer = this.pendingOffer;
      this.pendingOffer = null;
      if (offer) {
        await this.peerConnection.setRemoteDescription(offer);
        this._flushPendingCandidates();
      }

      // Create and send the answer
      await this.peerConnection.createAnswer();
      await this.signaling.sendAnswer(this.currentCallId, this.peerConnection.getLocalDescription());

      // Let the caller know the call was picked up
      await this.signaling.updateCallStatus(this.currentCallId, 'answered');
    } catch (err) {
      console.error('Failed to answer call:', err);
      this.callState.fail(err.message || 'Failed to answer call');
      this.cleanup.cleanupAll();
      throw err;
    }
  }

  setupPeerEvents() {
    this.peerConnection.onTrack = (event) => {
      const stream = event.streams?.[0];
      if (stream) {
        this.mediaManager.setRemoteStream(stream);
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
        this.callState.connect();
      } else if (state === 'disconnected' || state === 'failed' || state === 'closed') {
        this.callState.disconnect();
      }
    };

    this.peerConnection.onIceConnectionStateChange = (state) => {
      if (state === 'failed') {
        console.warn('ICE connection failed');
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
        onAnswer: async (answer) => {
          // Caller receives the answer
          try {
            await this.peerConnection.setRemoteDescription(answer);
            this._flushPendingCandidates();
          } catch (e) {
            console.error('Failed to apply remote answer:', e);
          }
        },
        onCandidate: (candidate) => {
          this._handleRemoteCandidate(candidate);
        },
      },
      role
    );

    this.unsubscribers.push(unsubscribe);
  }

  /** Buffer candidates that arrive before the remote description is set. */
  async _handleRemoteCandidate(candidate) {
    if (!candidate) return;
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

  _subscribeCallStatus(onStatus) {
    if (!this.signaling || !this.currentCallId) return;
    const unsubscribe = this.signaling.subscribeToCallStatus(this.currentCallId, onStatus);
    this.unsubscribers.push(unsubscribe);
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

  dispose() {
    // Stop media
    this.mediaManager.dispose();

    // Close peer connection
    this.peerConnection.destroy();

    // Unsubscribe signaling listeners
    this.unsubscribers.forEach((unsub) => {
      if (typeof unsub === 'function') unsub();
    });
    this.unsubscribers = [];

    if (this.signaling) {
      this.signaling.unsubscribeAll();
    }

    // Cleanup resources
    this.cleanup.cleanupAll();

    // Reset state
    this.currentCallId = null;
    this.remoteUserId = null;
    this.pendingOffer = null;
    this._pendingCandidates = [];
    this.callState.reset();
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
