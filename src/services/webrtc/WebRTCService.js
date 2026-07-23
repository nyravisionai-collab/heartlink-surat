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
  }

  async initialize(userId) {
    this.userId = userId || this.userId;
    if (this.userId && !this.signaling) {
      this.signaling = new FirebaseSignaling(this.userId);
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

    this.callState.setType(callType);
    this.callState.setRemoteUser(remoteUser);
    this.callState.setInitiator(true);
    this.callState.startCall();

    try {
      // Request permissions
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

      // Start media stream
      if (callType === CallType.VIDEO) {
        await this.mediaManager.startMediaStream();
      } else {
        await this.mediaManager.startAudioOnly();
      }

      // Initialize peer connection
      this.peerConnection.create();
      this.peerConnection.addLocalStream(this.mediaManager.getLocalStream());

      // Setup event handlers
      this.setupPeerEvents();

      // Setup signaling
      this.setupSignaling();

      // Create and send offer
      await this.peerConnection.createOffer();
      await this.signaling.sendOffer(this.currentCallId, this.peerConnection.getLocalDescription());

      // Create call record
      await this.signaling.createCallRecord(this.currentCallId, {
        callerId: this.userId,
        receiverId: remoteUser.uid,
        callType,
        status: 'calling',
      });
    } catch (err) {
      console.error('Failed to start call:', err);
      this.callState.fail(err.message || 'Failed to start call');
      this.cleanup.cleanupAll();
      throw err;
    }
  }

  async answerCall(remoteUser, callType = CallType.AUDIO, callId = null) {
    if (!this.userId) {
      throw new Error('WebRTCService: User not initialized');
    }

    this.currentCallId = callId || `call_${remoteUser.uid}_${this.userId}_${Date.now()}`;
    this.remoteUserId = remoteUser.uid;

    this.callState.setType(callType);
    this.callState.setRemoteUser(remoteUser);
    this.callState.setInitiator(false);
    this.callState.setStatus(CallStatus.RINGING);

    try {
      const permResult = await this.permissions.requestPermissions({
        audio: true,
        video: callType === CallType.VIDEO,
      });

      if (callType === CallType.VIDEO) {
        await this.mediaManager.startMediaStream();
      } else {
        await this.mediaManager.startAudioOnly();
      }

      this.peerConnection.create();
      this.peerConnection.addLocalStream(this.mediaManager.getLocalStream());

      this.setupPeerEvents();
      this.setupSignaling();

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
        await this.signaling.sendIceCandidate(this.currentCallId, candidate.toJSON ? candidate.toJSON() : candidate);
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

  setupSignaling() {
    if (!this.signaling || !this.currentCallId) return;

    const unsubscribe = this.signaling.subscribeToSignals(this.currentCallId, {
      onOffer: async (offer) => {
        // Received offer when answering
        await this.peerConnection.setRemoteDescription(offer);
        await this.peerConnection.createAnswer();
        await this.signaling.sendAnswer(this.currentCallId, this.peerConnection.getLocalDescription());
      },
      onAnswer: async (answer) => {
        // Received answer when initiating
        await this.peerConnection.setRemoteDescription(answer);
      },
      onCandidate: async (candidate) => {
        await this.peerConnection.addIceCandidate(candidate);
      },
    });

    this.unsubscribers.push(unsubscribe);
  }

  async handleRemoteOffer(offer, callId) {
    this.currentCallId = callId;
    this.callState.setStatus(CallStatus.RINGING);

    // Ensure peer connection exists
    if (!this.peerConnection || !this.peerConnection.getConnectionState || this.peerConnection.getConnectionState() === 'new') {
      this.peerConnection.create();
    }

    await this.peerConnection.setRemoteDescription(offer);
    await this.peerConnection.createAnswer();
    await this.signaling.sendAnswer(this.currentCallId, this.peerConnection.getLocalDescription());
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
        await this.signaling.endCall(this.currentCallId);
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

    // Unsubscribe signaling
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
