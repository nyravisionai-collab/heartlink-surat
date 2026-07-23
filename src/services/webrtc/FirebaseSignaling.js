/**
 * Phase 03: Firebase Signaling
 * Uses Firebase Realtime Database for:
 *   - call signaling (offer / answer / ICE candidates)
 *   - incoming-call detection (where the current user is the receiver)
 *   - call lifecycle status (answered / rejected / ended)
 */
import { rtdb } from '../../firebase/config.js';
import {
  ref, set, get, onValue, off, push,
  serverTimestamp, query, orderByChild, equalTo, limitToLast,
} from 'firebase/database';

/** Strip a signaling envelope down to a pure SDP description for RTCPeerConnection. */
const toSdpDescription = (data) => {
  if (!data) return null;
  return { type: data.type, sdp: data.sdp };
};

/** Strip a signaling envelope down to a pure ICE candidate for RTCIceCandidate. */
const toIceCandidate = (data) => {
  if (!data) return null;
  return {
    candidate: data.candidate,
    sdpMid: data.sdpMid,
    sdpMLineIndex: data.sdpMLineIndex,
    usernameFragment: data.usernameFragment,
  };
};

export class FirebaseSignaling {
  constructor(userId) {
    this.userId = userId;
    this.signalRef = null;
    this.callRef = null;
    this._listenerCleanups = [];
    // Legacy hooks (kept for backwards compatibility, no longer used internally)
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
      type: offer.type,
      sdp: offer.sdp,
      timestamp: serverTimestamp(),
      senderId: this.userId,
    });
  }

  async sendAnswer(callId, answer) {
    const answerRef = ref(rtdb, `signals/${callId}/answer`);
    await set(answerRef, {
      type: answer.type,
      sdp: answer.sdp,
      timestamp: serverTimestamp(),
      senderId: this.userId,
    });
  }

  async sendIceCandidate(callId, candidate) {
    const candidatesRef = ref(rtdb, `signals/${callId}/candidates`);
    const newCandidateRef = push(candidatesRef);
    await set(newCandidateRef, {
      candidate: candidate.candidate,
      sdpMid: candidate.sdpMid ?? null,
      sdpMLineIndex: candidate.sdpMLineIndex ?? null,
      usernameFragment: candidate.usernameFragment ?? null,
      timestamp: serverTimestamp(),
      senderId: this.userId,
    });
  }

  /**
   * Subscribe to signaling messages for an active call.
   * @param {string} callId
   * @param {object} callbacks  { onAnswer, onCandidate }
   * @param {'caller'|'answerer'} role  caller expects the answer; answerer has
   *        already applied the offer directly (no onAnswer subscription needed).
   */
  subscribeToSignals(callId, callbacks = {}, role = 'caller') {
    if (!this.signalRef) {
      this.initializeSignalRoom(callId);
    }

    const cleanups = [];

    // Only the caller subscribes for the answer.
    if (role === 'caller' && callbacks.onAnswer) {
      const answerRef = ref(rtdb, `signals/${callId}/answer`);
      const answerCb = (snapshot) => {
        const data = snapshot.val();
        if (data && data.senderId !== this.userId) {
          callbacks.onAnswer(toSdpDescription(data));
        }
      };
      onValue(answerRef, answerCb);
      cleanups.push(() => off(answerRef, 'value', answerCb));
    }

    if (callbacks.onCandidate) {
      const candidatesRef = ref(rtdb, `signals/${callId}/candidates`);
      const candidateCb = (snapshot) => {
        const data = snapshot.val();
        if (!data) return;
        Object.entries(data).forEach(([key, candidate]) => {
          if (candidate && candidate.senderId !== this.userId) {
            callbacks.onCandidate(toIceCandidate(candidate), key);
          }
        });
      };
      onValue(candidatesRef, candidateCb);
      cleanups.push(() => off(candidatesRef, 'value', candidateCb));
    }

    const unsubscribe = () => cleanups.forEach((fn) => fn && fn());
    this._listenerCleanups.push(unsubscribe);
    return unsubscribe;
  }

  /**
   * Listen for incoming calls where the current user is the receiver.
   * `onIncoming(callId, callRecord)` is invoked for every active call record
   * whose status is 'calling' or 'ringing'. The caller is responsible for
   * de-duplicating (only handle a given callId once).
   */
  subscribeToIncomingCalls(onIncoming) {
    const callsRef = query(
      ref(rtdb, 'calls'),
      orderByChild('receiverId'),
      equalTo(this.userId),
      limitToLast(30)
    );

    const cb = (snapshot) => {
      const calls = snapshot.val() || {};
      Object.entries(calls).forEach(([callId, call]) => {
        if (!call) return;
        if (call.callerId === this.userId) return; // never call ourselves
        const status = call.status;
        if (status === 'calling' || status === 'ringing') {
          onIncoming(callId, call);
        }
      });
    };

    onValue(callsRef, cb);
    const unsubscribe = () => off(callsRef, 'value', cb);
    this._listenerCleanups.push(unsubscribe);
    return unsubscribe;
  }

  /** Fetch the caller's stored SDP offer for a call. */
  async getOffer(callId) {
    const snap = await get(ref(rtdb, `signals/${callId}/offer`));
    const data = snap.val();
    return data ? toSdpDescription(data) : null;
  }

  /**
   * Subscribe to status changes of a specific call.
   * Used by the caller to detect when the callee answers / rejects / ends.
   */
  subscribeToCallStatus(callId, onStatus) {
    const statusRef = ref(rtdb, `calls/${callId}/status`);
    const cb = (snapshot) => {
      const status = snapshot.val();
      if (status) onStatus(status);
    };
    onValue(statusRef, cb);
    const unsubscribe = () => off(statusRef, 'value', cb);
    this._listenerCleanups.push(unsubscribe);
    return unsubscribe;
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

  async updateCallStatus(callId, status) {
    await set(ref(rtdb, `calls/${callId}/status`), status);
  }

  async endCall(callId) {
    await set(ref(rtdb, `calls/${callId}/endedAt`), serverTimestamp());
    await set(ref(rtdb, `calls/${callId}/status`), 'ended');
  }

  async rejectCall(callId) {
    await set(ref(rtdb, `calls/${callId}/status`), 'rejected');
    await set(ref(rtdb, `calls/${callId}/endedAt`), serverTimestamp());
  }

  async cleanSignals(callId) {
    await set(ref(rtdb, `signals/${callId}`), null);
  }

  unsubscribeAll() {
    this._listenerCleanups.forEach((fn) => {
      try {
        if (fn) fn();
      } catch (e) {
        // ignore
      }
    });
    this._listenerCleanups = [];
  }
}

export default FirebaseSignaling;
