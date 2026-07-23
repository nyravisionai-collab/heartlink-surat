/**
 * Phase 03: Firebase Signaling
 * Uses Firebase Realtime Database for call signaling (offer/answer/ICE candidates).
 */

import { rtdb } from '../../firebase/config.js';
import { ref, set, onValue, off, push, serverTimestamp } from 'firebase/database';

export class FirebaseSignaling {
  constructor(userId) {
    this.userId = userId;
    this.signalRef = null;
    this.callRef = null;
    this.onOffer = null;
    this.onAnswer = null;
    this.onCandidate = null;
    this.onCallEnd = null;
  }

  initializeSignalRoom(callId) {
    this.signalRef = ref(rtdb, `signals/${callId}`);
    this.callRef = ref(rtdb, `calls/${callId}`);
    return { signalRef: this.signalRef, callRef: this.callRef };
  }

  async sendOffer(callId, offer) {
    const offerRef = ref(rtdb, `signals/${callId}/offer`);
    await set(offerRef, {
      ...offer,
      timestamp: serverTimestamp(),
      senderId: this.userId,
    });
  }

  async sendAnswer(callId, answer) {
    const answerRef = ref(rtdb, `signals/${callId}/answer`);
    await set(answerRef, {
      ...answer,
      timestamp: serverTimestamp(),
      senderId: this.userId,
    });
  }

  async sendIceCandidate(callId, candidate) {
    const candidatesRef = ref(rtdb, `signals/${callId}/candidates`);
    const newCandidateRef = push(candidatesRef);
    await set(newCandidateRef, {
      ...candidate,
      timestamp: serverTimestamp(),
      senderId: this.userId,
    });
  }

  subscribeToSignals(callId, callbacks = {}) {
    if (!this.signalRef) {
      this.initializeSignalRoom(callId);
    }

    const offerRef = ref(rtdb, `signals/${callId}/offer`);
    const answerRef = ref(rtdb, `signals/${callId}/answer`);
    const candidatesRef = ref(rtdb, `signals/${callId}/candidates`);

    if (callbacks.onOffer) {
      onValue(offerRef, (snapshot) => {
        const data = snapshot.val();
        if (data && data.senderId !== this.userId) {
          callbacks.onOffer(data);
        }
      });
    }

    if (callbacks.onAnswer) {
      onValue(answerRef, (snapshot) => {
        const data = snapshot.val();
        if (data && data.senderId !== this.userId) {
          callbacks.onAnswer(data);
        }
      });
    }

    if (callbacks.onCandidate) {
      onValue(candidatesRef, (snapshot) => {
        const data = snapshot.val();
        if (!data) return;
        Object.entries(data).forEach(([key, candidate]) => {
          if (candidate && candidate.senderId !== this.userId) {
            callbacks.onCandidate({ ...candidate, id: key });
          }
        });
      });
    }

    return () => {
      off(offerRef);
      off(answerRef);
      off(candidatesRef);
    };
  }

  async createCallRecord(callId, data) {
    if (!this.callRef) {
      this.initializeSignalRoom(callId);
    }
    await set(this.callRef, {
      ...data,
      createdAt: serverTimestamp(),
    });
  }

  async endCall(callId) {
    const callEndRef = ref(rtdb, `calls/${callId}/endedAt`);
    await set(callEndRef, serverTimestamp());
    await set(ref(rtdb, `calls/${callId}/status`), 'ended');
  }

  async cleanSignals(callId) {
    await set(ref(rtdb, `signals/${callId}`), null);
  }

  unsubscribeAll() {
    if (this.signalRef) {
      off(this.signalRef);
    }
  }
}

export default FirebaseSignaling;
