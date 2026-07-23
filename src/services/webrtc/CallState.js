/**
 * Phase 03: Call State Management
 * Manages call lifecycle states for WebRTC audio/video calls.
 */

export const CallStatus = {
  IDLE: 'idle',
  CALLING: 'calling',
  RINGING: 'ringing',
  CONNECTED: 'connected',
  DISCONNECTED: 'disconnected',
  FAILED: 'failed',
  ENDED: 'ended',
};

export const CallType = {
  AUDIO: 'audio',
  VIDEO: 'video',
};

export class CallState {
  constructor() {
    this.status = CallStatus.IDLE;
    this.type = null;
    this.initiator = false;
    this.remoteUser = null;
    this.startTime = null;
    this.duration = 0;
    this.error = null;
    this.listeners = new Set();
  }

  setStatus(status) {
    this.status = status;
    this.notify();
  }

  setType(type) {
    this.type = type;
    this.notify();
  }

  setInitiator(initiator) {
    this.initiator = initiator;
    this.notify();
  }

  setRemoteUser(user) {
    this.remoteUser = user;
    this.notify();
  }

  startCall() {
    this.status = CallStatus.CALLING;
    this.startTime = Date.now();
    this.error = null;
    this.notify();
  }

  connect() {
    this.status = CallStatus.CONNECTED;
    this.startTime = Date.now();
    this.notify();
  }

  disconnect() {
    this.status = CallStatus.DISCONNECTED;
    this.duration = this.startTime ? Date.now() - this.startTime : 0;
    this.notify();
  }

  end() {
    this.status = CallStatus.ENDED;
    this.duration = this.startTime ? Date.now() - this.startTime : 0;
    this.startTime = null;
    this.notify();
  }

  fail(errorMessage) {
    this.status = CallStatus.FAILED;
    this.error = errorMessage || 'Call failed';
    this.duration = this.startTime ? Date.now() - this.startTime : 0;
    this.notify();
  }

  reset() {
    this.status = CallStatus.IDLE;
    this.type = null;
    this.initiator = false;
    this.remoteUser = null;
    this.startTime = null;
    this.duration = 0;
    this.error = null;
    this.notify();
  }

  subscribe(callback) {
    this.listeners.add(callback);
    return () => this.listeners.delete(callback);
  }

  notify() {
    const state = this.getSnapshot();
    this.listeners.forEach((cb) => {
      try {
        cb(state);
      } catch (e) {
        console.error('CallState listener error:', e);
      }
    });
  }

  getSnapshot() {
    return {
      status: this.status,
      type: this.type,
      initiator: this.initiator,
      remoteUser: this.remoteUser,
      startTime: this.startTime,
      duration: this.duration,
      error: this.error,
    };
  }
}

export default CallState;
