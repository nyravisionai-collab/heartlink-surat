/**
 * Phase 03: Permission Manager
 * Handles microphone and camera permission requests and state tracking.
 */

export const PermissionStatus = {
  PROMPT: 'prompt',
  GRANTED: 'granted',
  DENIED: 'denied',
  UNSUPPORTED: 'unsupported',
};

export class PermissionManager {
  constructor() {
    this.audioPermission = PermissionStatus.PROMPT;
    this.videoPermission = PermissionStatus.PROMPT;
    this._cached = false;
  }

  async requestPermissions(constraints = { audio: true, video: true }) {
    if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
      this.audioPermission = PermissionStatus.UNSUPPORTED;
      this.videoPermission = PermissionStatus.UNSUPPORTED;
      return { audio: false, video: false };
    }

    try {
      const stream = await navigator.mediaDevices.getUserMedia(constraints);
      // Immediately stop the temporary stream after permission check
      stream.getTracks().forEach((track) => track.stop());

      this.audioPermission = constraints.audio !== false ? PermissionStatus.GRANTED : this.audioPermission;
      this.videoPermission = constraints.video !== false ? PermissionStatus.GRANTED : this.videoPermission;

      return {
        audio: this.audioPermission === PermissionStatus.GRANTED,
        video: this.videoPermission === PermissionStatus.GRANTED,
      };
    } catch (err) {
      console.error('Permission request failed:', err);
      const isDenied = err.name === 'NotAllowedError' || err.name === 'PermissionDeniedError';

      if (constraints.audio !== false) {
        this.audioPermission = isDenied ? PermissionStatus.DENIED : this.audioPermission;
      }
      if (constraints.video !== false) {
        this.videoPermission = isDenied ? PermissionStatus.DENIED : this.videoPermission;
      }

      return {
        audio: this.audioPermission === PermissionStatus.GRANTED,
        video: this.videoPermission === PermissionStatus.GRANTED,
      };
    }
  }

  async checkAudioPermission() {
    const result = await this.requestPermissions({ audio: true, video: false });
    return result.audio;
  }

  async checkVideoPermission() {
    const result = await this.requestPermissions({ audio: false, video: true });
    return result.video;
  }

  getAudioStatus() {
    return this.audioPermission;
  }

  getVideoStatus() {
    return this.videoPermission;
  }

  reset() {
    this.audioPermission = PermissionStatus.PROMPT;
    this.videoPermission = PermissionStatus.PROMPT;
    this._cached = false;
  }
}

export default PermissionManager;
