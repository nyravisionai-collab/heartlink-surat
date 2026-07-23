/**
 * Phase 03: PeerConnection Manager
 * Wraps native RTCPeerConnection with error handling and ICE management.
 */

// STUN is enough only when at least one peer is not behind a symmetric NAT.
// For reliable connectivity (mobile carriers, CGNAT, office Wi-Fi), configure a
// TURN relay via VITE_TURN_URL / VITE_TURN_USERNAME / VITE_TURN_CREDENTIAL.
const TURN_URL = import.meta.env.VITE_TURN_URL
const TURN_USERNAME = import.meta.env.VITE_TURN_USERNAME
const TURN_CREDENTIAL = import.meta.env.VITE_TURN_CREDENTIAL

const ICE_SERVERS = [
  { urls: 'stun:stun.l.google.com:19302' },
  { urls: 'stun:stun1.l.google.com:19302' },
  { urls: 'stun:stun2.l.google.com:19302' },
  { urls: 'stun:stun3.l.google.com:19302' },
  { urls: 'stun:stun4.l.google.com:19302' },
  ...(TURN_URL
    ? [
        {
          urls: TURN_URL,
          ...(TURN_USERNAME ? { username: TURN_USERNAME } : {}),
          ...(TURN_CREDENTIAL ? { credential: TURN_CREDENTIAL } : {}),
        },
      ]
    : []),
]

export class PeerConnectionManager {
  constructor() {
    this.peerConnection = null;
    this.onTrack = null;
    this.onIceCandidate = null;
    this.onConnectionStateChange = null;
    this.onIceConnectionStateChange = null;
  }

  create(config = {}) {
    if (this.peerConnection) {
      this.destroy();
    }

    const rtcConfig = {
      iceServers: ICE_SERVERS,
      iceCandidatePoolSize: 10,
      ...config,
    };

    try {
      this.peerConnection = new RTCPeerConnection(rtcConfig);
      this.setupEventListeners();
      return this.peerConnection;
    } catch (err) {
      console.error('Failed to create RTCPeerConnection:', err);
      throw new Error('WebRTC not supported in this browser');
    }
  }

  setupEventListeners() {
    if (!this.peerConnection) return;

    this.peerConnection.ontrack = (event) => {
      if (this.onTrack) {
        this.onTrack(event);
      }
    };

    this.peerConnection.onicecandidate = (event) => {
      if (this.onIceCandidate && event.candidate) {
        this.onIceCandidate(event.candidate);
      }
    };

    this.peerConnection.onconnectionstatechange = () => {
      if (this.onConnectionStateChange) {
        this.onConnectionStateChange(this.peerConnection.connectionState);
      }
    };

    this.peerConnection.oniceconnectionstatechange = () => {
      if (this.onIceConnectionStateChange) {
        this.onIceConnectionStateChange(this.peerConnection.iceConnectionState);
      }
    };
  }

  addLocalStream(stream) {
    if (!this.peerConnection) {
      throw new Error('PeerConnection not initialized');
    }
    if (!stream) return;

    stream.getTracks().forEach((track) => {
      this.peerConnection.addTrack(track, stream);
    });
  }

  removeLocalStream(stream) {
    if (!this.peerConnection || !stream) return;

    const senders = this.peerConnection.getSenders();
    senders.forEach((sender) => {
      if (sender.track && stream.getTracks().includes(sender.track)) {
        this.peerConnection.removeTrack(sender);
      }
    });
  }

  async createOffer() {
    if (!this.peerConnection) {
      throw new Error('PeerConnection not initialized');
    }
    try {
      const offer = await this.peerConnection.createOffer();
      await this.peerConnection.setLocalDescription(offer);
      return this.peerConnection.localDescription;
    } catch (err) {
      console.error('Failed to create offer:', err);
      throw err;
    }
  }

  async createAnswer() {
    if (!this.peerConnection) {
      throw new Error('PeerConnection not initialized');
    }
    try {
      const answer = await this.peerConnection.createAnswer();
      await this.peerConnection.setLocalDescription(answer);
      return this.peerConnection.localDescription;
    } catch (err) {
      console.error('Failed to create answer:', err);
      throw err;
    }
  }

  async setRemoteDescription(desc) {
    if (!this.peerConnection) {
      throw new Error('PeerConnection not initialized');
    }
    try {
      await this.peerConnection.setRemoteDescription(new RTCSessionDescription(desc));
    } catch (err) {
      console.error('Failed to set remote description:', err);
      throw err;
    }
  }

  async addIceCandidate(candidate) {
    if (!this.peerConnection) {
      throw new Error('PeerConnection not initialized');
    }
    if (!candidate) return;
    try {
      await this.peerConnection.addIceCandidate(new RTCIceCandidate(candidate));
    } catch (err) {
      console.error('Failed to add ICE candidate:', err);
    }
  }

  close() {
    if (this.peerConnection) {
      this.peerConnection.close();
      this.peerConnection = null;
    }
  }

  destroy() {
    this.close();
    this.onTrack = null;
    this.onIceCandidate = null;
    this.onConnectionStateChange = null;
    this.onIceConnectionStateChange = null;
  }

  getConnectionState() {
    return this.peerConnection ? this.peerConnection.connectionState : 'new';
  }

  getIceConnectionState() {
    return this.peerConnection ? this.peerConnection.iceConnectionState : 'new';
  }

  getLocalDescription() {
    return this.peerConnection ? this.peerConnection.localDescription : null;
  }

  getRemoteDescription() {
    return this.peerConnection ? this.peerConnection.remoteDescription : null;
  }
}

export default PeerConnectionManager;
